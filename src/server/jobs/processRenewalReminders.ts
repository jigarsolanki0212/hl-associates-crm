import { db } from '@/db/client';
import { EmailService } from '@/server/services/EmailService';
import { NotificationService } from '@/server/services/NotificationService';
import { AuditService } from '@/server/services/AuditService';
import { getDaysRemaining } from '@/lib/dates/expiryCalculator';
import { formatFriendlyDate } from '@/lib/dates/timezone';
import {
  AuditAction,
  AuditEntityType,
  RenewalStage,
  RenewalStatus,
} from '@prisma/client';

export async function processRenewalReminders(): Promise<{
  scannedCount: number;
  remindersSent: number;
  errors: string[];
}> {
  console.log('[Job: processRenewalReminders] Starting automated renewal reminder scan...');

  const activeServices = await db.clientService.findMany({
    where: {
      status: { in: ['ACTIVE', 'EXPIRING_SOON'] },
    },
    include: {
      client: true,
      renewals: true,
    },
  });

  let remindersSent = 0;
  const errors: string[] = [];

  for (const cs of activeServices) {
    try {
      const daysLeft = getDaysRemaining(cs.expiryDate, new Date(), 'Asia/Kolkata');

      // Determine applicable milestone stage
      let targetStage: RenewalStage | null = null;
      if (daysLeft <= 0) {
        targetStage = RenewalStage.EXPIRY_DAY;
      } else if (daysLeft <= 7) {
        targetStage = RenewalStage.SEVEN_DAYS;
      } else if (daysLeft <= 30) {
        targetStage = RenewalStage.THIRTY_DAYS;
      } else if (daysLeft <= 60) {
        targetStage = RenewalStage.SIXTY_DAYS;
      }

      if (!targetStage) continue;

      // Check if reminder already sent for this stage
      const existingRenewal = cs.renewals.find((r) => r.stage === targetStage);
      if (existingRenewal && existingRenewal.status === RenewalStatus.REMINDER_SENT) {
        // Idempotency: Already processed
        continue;
      }

      // Dispatch Email
      const emailResult = await EmailService.sendRenewalEmail({
        clientServiceId: cs.id,
        clientName: cs.client.companyName,
        serviceName: cs.serviceNameSnapshot,
        daysRemaining: Math.max(0, daysLeft),
        recipientEmail: cs.client.email,
        expiryDateFormatted: formatFriendlyDate(cs.expiryDate),
      });

      if (emailResult.success) {
        // Upsert renewal record
        await db.renewal.upsert({
          where: {
            clientServiceId_stage: {
              clientServiceId: cs.id,
              stage: targetStage,
            },
          },
          update: {
            status: RenewalStatus.REMINDER_SENT,
            sentAt: new Date(),
            notes: `Automated ${targetStage} reminder email sent to ${cs.client.email}`,
          },
          create: {
            clientServiceId: cs.id,
            stage: targetStage,
            scheduledDate: new Date(),
            status: RenewalStatus.REMINDER_SENT,
            sentAt: new Date(),
            notes: `Automated ${targetStage} reminder email sent to ${cs.client.email}`,
          },
        });

        // Audit Log
        await AuditService.log({
          action: AuditAction.RENEWAL_REMINDER_SENT,
          entityType: AuditEntityType.RENEWAL,
          entityId: cs.id,
          clientId: cs.clientId,
          description: `Automated ${targetStage} renewal reminder sent to ${cs.client.companyName} (${cs.serviceNameSnapshot})`,
        });

        // Notification to assigned rep
        if (cs.client.assignedToId) {
          await NotificationService.send({
            userId: cs.client.assignedToId,
            title: `Renewal Reminder Sent (${daysLeft}d left)`,
            message: `Automated reminder dispatched for ${cs.client.companyName} (${cs.serviceNameSnapshot}).`,
            link: `/clients/${cs.clientId}`,
            type: daysLeft <= 15 ? 'URGENT' : 'WARNING',
            entityType: 'RENEWAL',
            entityId: cs.id,
          });
        }

        remindersSent++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Service ${cs.id} (${cs.serviceNameSnapshot}): ${msg}`);
    }
  }

  console.log(`[Job: processRenewalReminders] Finished. Scanned ${activeServices.length}, sent ${remindersSent} reminders.`);
  return {
    scannedCount: activeServices.length,
    remindersSent,
    errors,
  };
}
