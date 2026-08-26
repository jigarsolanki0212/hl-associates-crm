import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { EmailService } from '@/server/services/EmailService';
import { EmailCategory } from '@prisma/client';

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin role required' } },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { recipient, host, port, user: smtpUser, pass, from } = body;

    if (!recipient) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Recipient email is required' } },
        { status: 400 }
      );
    }

    let customConfig = undefined;
    if (host && smtpUser && pass) {
      customConfig = {
        host,
        port: Number(port) || 587,
        user: smtpUser,
        pass,
        from: from || smtpUser,
        secure: Number(port) === 465,
      };
    }

    // 1. Verify connection
    const testResult = await EmailService.testConnection(customConfig);
    if (!testResult.success) {
      return NextResponse.json(
        { success: false, error: { code: 'SMTP_TEST_FAILED', message: testResult.message } },
        { status: 400 }
      );
    }

    // 2. Dispatch a real test email
    const sendResult = await EmailService.send({
      category: EmailCategory.PROFORMA,
      entityType: 'TEST',
      entityId: user.id,
      recipient,
      subject: 'HL Associates CRM - SMTP Email Delivery Verification',
      template: 'SYSTEM_TEST',
      htmlBody: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; color: #041627; }
            .box { background: white; padding: 32px; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 540px; margin: auto; }
            .badge { background: #dcfce7; color: #15803d; font-weight: 700; padding: 4px 10px; border-radius: 9999px; font-size: 12px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="box">
            <span class="badge">✓ Connected Successfully</span>
            <h2 style="margin-top: 12px; color: #041627;">Real Email Dispatch Active</h2>
            <p>Congratulations! Your HL Associates CRM is now connected to your real email server.</p>
            <p>You can now send formal proposals, proforma invoices, milestone renewal notices, and client follow-ups directly to anyone from the CRM.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #64748b; margin: 0;">Sent by HL Associates CRM system verification.</p>
          </div>
        </body>
        </html>
      `,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        { success: false, error: { code: 'DISPATCH_FAILED', message: sendResult.message } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: `Test email successfully sent to ${recipient}!` },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error testing email';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 500 });
  }
}
