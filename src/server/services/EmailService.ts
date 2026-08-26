import { db } from '@/db/client';
import { EmailCategory, EmailStatus } from '@prisma/client';
import { decryptString } from '@/lib/crypto/encryption';
import nodemailer from 'nodemailer';

export interface SendEmailOptions {
  category: EmailCategory;
  entityType: string;
  entityId: string;
  proformaId?: string;
  recipient: string;
  subject: string;
  template: string;
  htmlBody: string;
  attachments?: {
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }[];
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from?: string;
  secure?: boolean;
}

export class EmailService {
  /**
   * Resolves SMTP configuration from DB settings or process.env
   */
  static async getSmtpConfig(): Promise<SmtpConfig | null> {
    try {
      // 1. Check CompanySettings in PostgreSQL
      const settings = await db.companySettings.findUnique({
        where: { id: 'default' },
        select: { smtpEncryptedConfig: true, isSmtpConfigured: true, email: true, companyName: true },
      });

      if (settings?.smtpEncryptedConfig) {
        try {
          const decrypted = decryptString(settings.smtpEncryptedConfig);
          const parsed = JSON.parse(decrypted);
          if (parsed.host && parsed.user && parsed.pass) {
            return {
              host: parsed.host,
              port: Number(parsed.port) || 587,
              user: parsed.user,
              pass: parsed.pass,
              from: parsed.from || settings.email || `"${settings.companyName || 'HL Associates'}" <${parsed.user}>`,
              secure: Number(parsed.port) === 465,
            };
          }
        } catch (decErr) {
          console.error('[EmailService] Failed to decrypt DB SMTP config:', decErr);
        }
      }

      // 2. Fallback to Environment Variables
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const port = Number(process.env.SMTP_PORT) || 587;
        return {
          host: process.env.SMTP_HOST,
          port,
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
          from: process.env.SMTP_FROM || process.env.EMAIL_FROM || `"HL Associates" <${process.env.SMTP_USER}>`,
          secure: port === 465,
        };
      }

      return null;
    } catch (err) {
      console.error('[EmailService] Error retrieving SMTP config:', err);
      return null;
    }
  }

  /**
   * Tests SMTP connection with given credentials or current config
   */
  static async testConnection(customConfig?: SmtpConfig): Promise<{ success: boolean; message: string }> {
    const config = customConfig || (await this.getSmtpConfig());
    if (!config) {
      return {
        success: false,
        message: 'No SMTP configuration found. Please enter host, port, username, and password.',
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure ?? config.port === 465,
        auth: {
          user: config.user,
          pass: config.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.verify();
      return { success: true, message: 'SMTP connection verified successfully!' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown SMTP verification error';
      return { success: false, message: `SMTP connection failed: ${msg}` };
    }
  }

  /**
   * Main dispatch method
   */
  static async send(options: SendEmailOptions): Promise<{ success: boolean; eventId: string; message?: string }> {
    // 1. Create EmailEvent in QUEUED state
    const event = await db.emailEvent.create({
      data: {
        category: options.category,
        entityType: options.entityType,
        entityId: options.entityId,
        proformaId: options.proformaId,
        recipient: options.recipient,
        subject: options.subject,
        template: options.template,
        status: EmailStatus.QUEUED,
      },
    });

    try {
      const smtpConfig = await this.getSmtpConfig();

      if (smtpConfig) {
        // Real SMTP Delivery via Nodemailer
        console.log(`[EmailService] Sending LIVE email via SMTP (${smtpConfig.host}:${smtpConfig.port}) to ${options.recipient}`);

        const transporter = nodemailer.createTransport({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure ?? smtpConfig.port === 465,
          auth: {
            user: smtpConfig.user,
            pass: smtpConfig.pass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        const fromAddress = smtpConfig.from || smtpConfig.user;

        const info = await transporter.sendMail({
          from: fromAddress,
          to: options.recipient,
          subject: options.subject,
          html: options.htmlBody,
          attachments: options.attachments,
        });

        console.log(`[EmailService] Message delivered successfully! MessageID: ${info.messageId}`);

        // Update event to SENT
        await db.emailEvent.update({
          where: { id: event.id },
          data: {
            status: EmailStatus.SENT,
            sentAt: new Date(),
          },
        });

        return { success: true, eventId: event.id, message: `Email delivered to ${options.recipient}` };
      } else {
        // Fallback: Simulated Mock Mode (when SMTP is not yet configured)
        console.log(`[EmailService] [Mock Mode - No SMTP configured] Logged ${options.category} email to ${options.recipient}: "${options.subject}"`);

        await db.emailEvent.update({
          where: { id: event.id },
          data: {
            status: EmailStatus.SENT,
            sentAt: new Date(),
          },
        });

        return { success: true, eventId: event.id, message: 'Logged in mock mode (SMTP not yet configured in settings).' };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown email dispatch error';
      console.error('[EmailService] Dispatch failed:', errorMessage);

      await db.emailEvent.update({
        where: { id: event.id },
        data: {
          status: EmailStatus.FAILED,
          failureReason: errorMessage,
        },
      });

      return { success: false, eventId: event.id, message: errorMessage };
    }
  }

  static async sendProformaEmail(params: {
    proformaId: string;
    proformaNumber: string;
    recipientEmail: string;
    companyName: string;
    totalAmountFormatted: string;
    pdfDownloadUrl?: string;
  }): Promise<{ success: boolean; eventId: string; message?: string }> {
    return this.send({
      category: EmailCategory.PROFORMA,
      entityType: 'PROFORMA',
      entityId: params.proformaId,
      proformaId: params.proformaId,
      recipient: params.recipientEmail,
      subject: `HL Associates - Formal Proforma Proposal ${params.proformaNumber} for ${params.companyName}`,
      template: 'PROFORMA_PROPOSAL',
      htmlBody: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #041627; }
            .card { background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto; overflow: hidden; }
            .header { background-color: #041627; padding: 24px; text-align: left; }
            .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
            .header p { color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; }
            .content { padding: 32px 24px; line-height: 1.6; font-size: 14px; color: #334155; }
            .summary-box { background-color: #f1f5f9; border-left: 4px solid #0040e0; padding: 16px; margin: 20px 0; border-radius: 4px; }
            .summary-title { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
            .summary-val { font-size: 18px; font-weight: 800; color: #0f172a; }
            .btn { display: inline-block; background-color: #0040e0; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px; }
            .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>HL Associates</h1>
              <p>Enterprise Regulatory Compliance & Certification</p>
            </div>
            <div class="content">
              <p>Dear <strong>${params.companyName}</strong> Team,</p>
              <p>Thank you for considering HL Associates for your regulatory compliance requirements. Please find our formal proforma invoice and technical engagement scope below:</p>
              
              <div class="summary-box">
                <div class="summary-title">Proforma Reference</div>
                <div class="summary-val">${params.proformaNumber}</div>
                <div style="margin-top: 8px;" class="summary-title">Total Proposal Value</div>
                <div class="summary-val" style="color: #0040e0;">${params.totalAmountFormatted}</div>
              </div>

              <p>Our regulatory team is prepared to initiate your compliance roadmap upon acceptance. You can review the complete line items and regulatory milestones directly in your client portal.</p>
              
              ${
                params.pdfDownloadUrl
                  ? `<p><a href="${params.pdfDownloadUrl}" class="btn">View & Download Proforma Invoice PDF</a></p>`
                  : ''
              }

              <p style="margin-top: 24px;">If you have any questions or require scope adjustments, please reply directly to this email.</p>
              
              <p style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                Warm regards,<br>
                <strong>HL Associates Compliance Operations</strong><br>
                <span style="color: #64748b; font-size: 12px;">Regulatory Affairs & Quality Systems Division</span>
              </p>
            </div>
            <div class="footer">
              HL Associates • Suite 400, Regulatory Tower, BKC, Mumbai 400051<br>
              This is a confidential regulatory proposal generated by HL Associates CRM.
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  static async sendRenewalEmail(params: {
    clientServiceId: string;
    clientName: string;
    serviceName: string;
    daysRemaining: number;
    recipientEmail: string;
    expiryDateFormatted: string;
  }): Promise<{ success: boolean; eventId: string; message?: string }> {
    const isUrgent = params.daysRemaining <= 15;
    const bannerColor = isUrgent ? '#dc2626' : '#d97706';

    return this.send({
      category: EmailCategory.RENEWAL,
      entityType: 'CLIENT_SERVICE',
      entityId: params.clientServiceId,
      recipient: params.recipientEmail,
      subject: `${isUrgent ? 'URGENT: ' : ''}Regulatory Compliance Renewal Notice for ${params.serviceName} (${params.clientName})`,
      template: 'RENEWAL_MILESTONE_REMINDER',
      htmlBody: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #041627; }
            .card { background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto; overflow: hidden; }
            .header { background-color: #041627; padding: 24px; text-align: left; }
            .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; }
            .header p { color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; }
            .content { padding: 32px 24px; line-height: 1.6; font-size: 14px; color: #334155; }
            .alert-box { background-color: #fef2f2; border-left: 4px solid ${bannerColor}; padding: 16px; margin: 20px 0; border-radius: 4px; }
            .alert-title { font-size: 12px; font-weight: 700; color: ${bannerColor}; text-transform: uppercase; }
            .alert-val { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 4px; }
            .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>HL Associates</h1>
              <p>Compliance Lifecycle & License Renewal Management</p>
            </div>
            <div class="content">
              <p>Dear <strong>${params.clientName}</strong> Team,</p>
              <p>This is an automated regulatory compliance alert regarding your active certification engagement:</p>
              
              <div class="alert-box">
                <div class="alert-title">Service Engagement</div>
                <div class="alert-val">${params.serviceName}</div>
                <div style="margin-top: 8px;" class="alert-title">Scheduled Expiry Date</div>
                <div class="alert-val">${params.expiryDateFormatted} (${params.daysRemaining > 0 ? `${params.daysRemaining} days remaining` : 'EXPIRED'})</div>
              </div>

              <p>To ensure uninterrupted regulatory validity and avoid audit non-compliances with certification authorities, please coordinate with your assigned compliance officer to renew this engagement.</p>

              <p style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                Warm regards,<br>
                <strong>HL Associates Compliance Operations</strong><br>
                <span style="color: #64748b; font-size: 12px;">Regulatory Lifecycle Management</span>
              </p>
            </div>
            <div class="footer">
              HL Associates • Suite 400, Regulatory Tower, BKC, Mumbai 400051
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }
}
