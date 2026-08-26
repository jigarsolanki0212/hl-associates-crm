import { NextResponse } from 'next/server';
import { db } from '@/db/client';
import { getSession } from '@/lib/auth/session';
import { calculateExpiryDate } from '@/lib/dates/expiryCalculator';
import { AuditService } from '@/server/services/AuditService';
import { NotificationService } from '@/server/services/NotificationService';
import { AuditAction, AuditEntityType, ClientServiceStatus, RenewalStage, RenewalStatus, ValidityUnit } from '@prisma/client';
import { subDays } from 'date-fns';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  try {
    const client = await db.client.findUnique({
      where: { id: params.id },
    });

    if (!client) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Client not found' } }, { status: 404 });
    }

    const body = await request.json();
    const {
      serviceId,
      serviceNameSnapshot,
      startDate: inputStartDate,
      durationMonths = 12,
      fee = 0,
      serviceScope,
      remarks,
    } = body;

    let resolvedServiceName = serviceNameSnapshot;
    let resolvedServiceCode = 'REG-SRV';

    if (serviceId) {
      const serviceRecord = await db.service.findUnique({ where: { id: serviceId } });
      if (serviceRecord) {
        resolvedServiceName = serviceRecord.name;
        resolvedServiceCode = serviceRecord.code || 'REG-SRV';
      }
    }

    if (!resolvedServiceName) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Service name or Service ID is required' } },
        { status: 400 }
      );
    }

    const startDate = inputStartDate ? new Date(inputStartDate) : new Date();
    const expiryDate = calculateExpiryDate(startDate, Number(durationMonths), 'MONTHS');

    // Create the ClientService record for this client
    const newService = await db.clientService.create({
      data: {
        clientId: client.id,
        serviceId: serviceId || null,
        serviceNameSnapshot: resolvedServiceName,
        serviceCodeSnapshot: resolvedServiceCode,
        scopeSnapshot: serviceScope || remarks || null,
        status: ClientServiceStatus.ACTIVE,
        startDate,
        expiryDate,
        durationValue: Number(durationMonths),
        durationUnit: ValidityUnit.MONTHS,
        fee: Number(fee),
        currency: 'INR',
      },
    });

    // Schedule automated renewal milestones (60d, 30d, 7d, 0d)
    const stages = [
      { stage: RenewalStage.SIXTY_DAYS, daysBefore: 60 },
      { stage: RenewalStage.THIRTY_DAYS, daysBefore: 30 },
      { stage: RenewalStage.SEVEN_DAYS, daysBefore: 7 },
      { stage: RenewalStage.EXPIRY_DAY, daysBefore: 0 },
    ];

    for (const item of stages) {
      await db.renewal.create({
        data: {
          clientServiceId: newService.id,
          stage: item.stage,
          scheduledDate: subDays(expiryDate, item.daysBefore),
          status: RenewalStatus.PENDING,
        },
      });
    }

    // Audit log
    await AuditService.log({
      userId: user.id,
      action: AuditAction.CLIENT_SERVICE_CREATED,
      entityType: AuditEntityType.CLIENT_SERVICE,
      entityId: newService.id,
      description: `New regulatory service engagement activated: "${resolvedServiceName}" for ${client.companyName} (Valid until ${expiryDate.toISOString().slice(0, 10)})`,
    });

    // Notification
    if (client.assignedToId) {
      await NotificationService.send({
        userId: client.assignedToId,
        title: 'New Service Engagement Added',
        message: `"${resolvedServiceName}" engagement activated for ${client.companyName}.`,
        link: `/clients/${client.id}`,
        type: 'SUCCESS',
        entityType: 'CLIENT',
        entityId: client.id,
      });
    }

    return NextResponse.json({ success: true, data: newService }, { status: 201 });
  } catch (error: unknown) {
    console.error('Add client service error:', error);
    const message = error instanceof Error ? error.message : 'Failed to add service engagement';
    return NextResponse.json({ success: false, error: { code: 'ERROR', message } }, { status: 400 });
  }
}
