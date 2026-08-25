import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { EmailService } from '@/server/services/EmailService';
import { AuditService } from '@/server/services/AuditService';
import { getDaysRemaining } from '@/lib/dates/expiryCalculator';
import { formatFriendlyDate } from '@/lib/dates/timezone';
import { AuditAction, AuditEntityType, RenewalStage, RenewalStatus } from '@prisma/client';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const cs = await db.clientService.findUnique({
      where: { id: params.id },
      include: { client: true },
    });

    if (!cs) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Client service not found' } }, { status: 404 });
    }

    const daysLeft = getDaysRemaining(cs.expiryDate, new Date(), 'Asia/Kolkata');

    const emailResult = await EmailService.sendRenewalEmail({
      clientServiceId: cs.id,
      clientName: cs.client.companyName,
      serviceName: cs.serviceNameSnapshot,
      daysRemaining: Math.max(0, daysLeft),
      recipientEmail: cs.client.email,
      expiryDateFormatted: formatFriendlyDate(cs.expiryDate),
    });

    if (!emailResult.success) {
      return NextResponse.json({ success: false, error: { code: 'EMAIL_FAILED', message: 'Failed to send renewal email' } }, { status: 500 });
    }

    // Record renewal
    await db.renewal.create({
      data: {
        clientServiceId: cs.id,
        stage: daysLeft <= 7 ? RenewalStage.SEVEN_DAYS : daysLeft <= 30 ? RenewalStage.THIRTY_DAYS : RenewalStage.SIXTY_DAYS,
        scheduledDate: new Date(),
        status: RenewalStatus.REMINDER_SENT,
        sentAt: new Date(),
        notes: `Manual renewal reminder sent by ${user.fullName} to ${cs.client.email}`,
      },
    });

    await AuditService.log({
      userId: user.id,
      action: AuditAction.RENEWAL_REMINDER_SENT,
      entityType: AuditEntityType.RENEWAL,
      entityId: cs.id,
      clientId: cs.clientId,
      description: `Manual renewal reminder sent to ${cs.client.companyName} (${cs.serviceNameSnapshot})`,
    });

    return NextResponse.json({ success: true, message: 'Renewal reminder sent successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send renewal reminder';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
