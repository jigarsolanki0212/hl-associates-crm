import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { calculateExpiryDate } from '@/lib/dates/expiryCalculator';
import { AuditService } from '@/server/services/AuditService';
import { AuditAction, AuditEntityType, ClientServiceStatus, RenewalStage, RenewalStatus, ValidityUnit } from '@prisma/client';
import { subDays } from 'date-fns';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const durationMonths = body.durationMonths || 12;

    const existingService = await db.clientService.findUnique({
      where: { id: params.id },
      include: { client: true },
    });

    if (!existingService) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Client service not found' } }, { status: 404 });
    }

    const currentExpiry = new Date(existingService.expiryDate);
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    const newExpiry = calculateExpiryDate(baseDate, durationMonths, ValidityUnit.MONTHS, 'Asia/Kolkata');

    const updated = await db.$transaction(async (tx) => {
      // 1. Update Client Service
      const cs = await tx.clientService.update({
        where: { id: params.id },
        data: {
          expiryDate: newExpiry,
          status: ClientServiceStatus.ACTIVE,
          fee: body.fee ? Number(body.fee) : existingService.fee,
        },
      });

      // 2. Schedule new renewal milestones
      const stages: { stage: RenewalStage; daysBefore: number }[] = [
        { stage: RenewalStage.SIXTY_DAYS, daysBefore: 60 },
        { stage: RenewalStage.THIRTY_DAYS, daysBefore: 30 },
        { stage: RenewalStage.SEVEN_DAYS, daysBefore: 7 },
        { stage: RenewalStage.EXPIRY_DAY, daysBefore: 0 },
      ];

      for (const item of stages) {
        const scheduledDate = subDays(newExpiry, item.daysBefore);
        await tx.renewal.upsert({
          where: {
            clientServiceId_stage: {
              clientServiceId: cs.id,
              stage: item.stage,
            },
          },
          update: {
            scheduledDate,
            status: RenewalStatus.PENDING,
            sentAt: null,
          },
          create: {
            clientServiceId: cs.id,
            stage: item.stage,
            scheduledDate,
            status: RenewalStatus.PENDING,
          },
        });
      }

      // 3. Log Audit
      await AuditService.log({
        userId: user.id,
        action: AuditAction.CLIENT_SERVICE_RENEWED,
        entityType: AuditEntityType.CLIENT_SERVICE,
        entityId: cs.id,
        clientId: existingService.clientId,
        beforeState: { expiryDate: existingService.expiryDate, status: existingService.status },
        afterState: { expiryDate: cs.expiryDate, status: cs.status },
        description: `Service ${existingService.serviceNameSnapshot} renewed for ${existingService.client.companyName} until ${newExpiry.toISOString().slice(0, 10)}`,
        tx,
      });

      return cs;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Renewal execution failed';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
