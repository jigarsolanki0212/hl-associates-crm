import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { EmailService } from '@/server/services/EmailService';
import { AuditService } from '@/server/services/AuditService';
import { AuditAction, AuditEntityType, EmailCategory } from '@prisma/client';

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { recipient, subject, message, entityType = 'MANUAL', entityId = user.id, category = 'FOLLOW_UP' } = body;

    if (!recipient || !subject || !message) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Recipient, subject, and message are required' } },
        { status: 400 }
      );
    }

    const emailCategory = (EmailCategory as Record<string, EmailCategory>)[category] || EmailCategory.FOLLOW_UP;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #041627; }
          .card { background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto; overflow: hidden; }
          .header { background-color: #041627; padding: 20px 24px; text-align: left; }
          .header h1 { color: #ffffff; margin: 0; font-size: 18px; font-weight: 800; }
          .content { padding: 28px 24px; line-height: 1.6; font-size: 14px; color: #334155; }
          .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>HL Associates</h1>
          </div>
          <div class="content">
            <div style="white-space: pre-wrap;">${message}</div>
            <p style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
              Best regards,<br>
              <strong>${user.fullName}</strong><br>
              <span style="color: #64748b; font-size: 12px;">HL Associates Regulatory Compliance Suite</span>
            </p>
          </div>
          <div class="footer">
            HL Associates • 602, 603 & 606 Rashmi Growth Hub, Odhav to Vastral Road, S.P. Ring Road, Odhav, Ahmedabad, Gujarat 382415
          </div>
        </div>
      </body>
      </html>
    `;

    const sendResult = await EmailService.send({
      category: emailCategory,
      entityType,
      entityId,
      recipient,
      subject,
      template: 'DIRECT_COMPOSE',
      htmlBody,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        { success: false, error: { code: 'DISPATCH_FAILED', message: sendResult.message } },
        { status: 400 }
      );
    }

    await AuditService.log({
      userId: user.id,
      action: AuditAction.INQUIRY_UPDATED,
      entityType: AuditEntityType.INQUIRY,
      entityId,
      description: `Direct email sent to ${recipient}: "${subject}"`,
    });

    return NextResponse.json({
      success: true,
      data: { message: `Email dispatched to ${recipient}`, eventId: sendResult.eventId },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error sending email';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 500 });
  }
}
