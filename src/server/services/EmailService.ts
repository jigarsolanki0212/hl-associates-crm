import { db } from '@/db/client';
import { EmailCategory, EmailStatus } from '@prisma/client';

export interface SendEmailOptions {
  category: EmailCategory;
  entityType: string;
  entityId: string;
  proformaId?: string;
  recipient: string;
  subject: string;
  template: string;
  htmlBody: string;
}

export class EmailService {
  static async send(options: SendEmailOptions): Promise<{ success: boolean; eventId: string }> {
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
      // 2. Perform simulated or SMTP dispatch
      // In development / test environment, mock delivery succeeds and logs event
      console.log(`[EmailService] Dispatching ${options.category} to ${options.recipient}: "${options.subject}"`);

      // Update to SENT
      await db.emailEvent.update({
        where: { id: event.id },
        data: {
          status: EmailStatus.SENT,
          sentAt: new Date(),
        },
      });

      return { success: true, eventId: event.id };
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

      return { success: false, eventId: event.id };
    }
  }

  static async sendProformaEmail(params: {
    proformaId: string;
    proformaNumber: string;
    recipientEmail: string;
    companyName: string;
    totalAmountFormatted: string;
    pdfDownloadUrl?: string;
  }): Promise<{ success: boolean; eventId: string }> {
    return this.send({
      category: EmailCategory.PROFORMA,
      entityType: 'PROFORMA',
      entityId: params.proformaId,
      proformaId: params.proformaId,
      recipient: params.recipientEmail,
      subject: `HL Associates - Formal Proforma Proposal ${params.proformaNumber} for ${params.companyName}`,
      template: 'PROFORMA_PROPOSAL',
      htmlBody: `
        <div style="font-family: Inter, sans-serif; color: #041627; padding: 24px;">
          <h2 style="color: #0040e0;">HL Associates Regulatory Compliance</h2>
          <p>Dear ${params.companyName} Team,</p>
          <p>Please find attached our formal proforma invoice and regulatory compliance proposal <strong>${params.proformaNumber}</strong> amounting to <strong>${params.totalAmountFormatted}</strong>.</p>
          <p>Kindly review the scope and terms. Feel free to contact our compliance team for any clarifications.</p>
          <br/>
          <p>Best regards,<br/><strong>HL Associates Sales & Compliance Operations</strong></p>
        </div>
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
  }): Promise<{ success: boolean; eventId: string }> {
    return this.send({
      category: EmailCategory.RENEWAL,
      entityType: 'CLIENT_SERVICE',
      entityId: params.clientServiceId,
      recipient: params.recipientEmail,
      subject: `Urgent: Regulatory Compliance Renewal Reminder for ${params.serviceName} (${params.clientName})`,
      template: 'RENEWAL_MILESTONE_REMINDER',
      htmlBody: `
        <div style="font-family: Inter, sans-serif; color: #041627; padding: 24px;">
          <h2 style="color: #ba1a1a;">HL Associates - Compliance License Renewal Alert</h2>
          <p>Dear ${params.clientName},</p>
          <p>This is a formal reminder that your regulatory compliance engagement for <strong>${params.serviceName}</strong> is scheduled to expire in <strong>${params.daysRemaining} days</strong> on <strong>${params.expiryDateFormatted}</strong>.</p>
          <p>To avoid audit non-conformities or regulatory suspension, please initiate the renewal documentation at your earliest convenience.</p>
          <br/>
          <p>Best regards,<br/><strong>HL Associates Compliance Operations</strong></p>
        </div>
      `,
    });
  }
}
