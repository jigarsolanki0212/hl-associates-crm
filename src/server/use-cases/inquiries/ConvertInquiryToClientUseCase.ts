import { db } from '@/db/client';
import { getNextSequenceNumber } from '@/lib/sequences/sequenceGenerator';
import { calculateExpiryDate } from '@/lib/dates/expiryCalculator';
import { AuditService } from '@/server/services/AuditService';
import { NotificationService } from '@/server/services/NotificationService';
import {
  AuditAction,
  AuditEntityType,
  ClientServiceStatus,
  ClientStatus,
  InquiryStatus,
  RenewalStage,
  RenewalStatus,
  ValidityUnit,
} from '@prisma/client';
import { subDays } from 'date-fns';

export interface ConvertInquiryInput {
  inquiryId: string;
  startDate?: Date | string;
  durationValue?: number;
  durationUnit?: ValidityUnit;
  customFee?: number;
  currency?: string;
  certificateNumber?: string;
}

export class ConvertInquiryToClientUseCase {
  static async execute(input: ConvertInquiryInput, currentUserId?: string) {
    return await db.$transaction(async (tx) => {
      // 1. Validate Inquiry
      const inquiry = await tx.inquiry.findUnique({
        where: { id: input.inquiryId },
        include: { service: true },
      });

      if (!inquiry) {
        throw new Error('Inquiry not found');
      }

      if (inquiry.status === InquiryStatus.CONVERTED) {
        throw new Error(`Inquiry ${inquiry.inquiryNumber} is already converted to a client`);
      }

      // 2. Check or Create Client
      let client = await tx.client.findFirst({
        where: {
          OR: [
            { email: { equals: inquiry.email, mode: 'insensitive' } },
            { companyName: { equals: inquiry.companyName, mode: 'insensitive' } },
          ],
        },
      });

      if (!client) {
        const clientNumber = await getNextSequenceNumber('CLIENT', tx);
        client = await tx.client.create({
          data: {
            clientNumber,
            companyName: inquiry.companyName,
            contactName: inquiry.contactName,
            contactTitle: inquiry.contactTitle,
            email: inquiry.email,
            phone: inquiry.phone,
            status: ClientStatus.ACTIVE,
            assignedToId: inquiry.assignedToId,
          },
        });
      }

      // 3. Service metadata & commercial snapshot
      const service = inquiry.service;
      const serviceNameSnapshot = service?.name || 'Regulatory Compliance Engagement';
      const serviceCodeSnapshot = service?.code || 'SRV-CUSTOM';
      const scopeSnapshot = inquiry.serviceScope || service?.description || 'Regulatory consultation and licensing';

      const durationValue = input.durationValue || service?.defaultDuration || 12;
      const durationUnit = input.durationUnit || service?.durationUnit || ValidityUnit.MONTHS;
      const startDate = input.startDate ? new Date(input.startDate) : new Date();
      const fee = input.customFee || Number(service?.suggestedPriceMin) || 150000;
      const currency = input.currency || 'INR';

      // 4. Calculate dynamic expiry date
      const expiryDate = calculateExpiryDate(startDate, durationValue, durationUnit, 'Asia/Kolkata');

      // 5. Create ClientService
      const clientService = await tx.clientService.create({
        data: {
          clientId: client.id,
          serviceId: service?.id || null,
          serviceNameSnapshot,
          serviceCodeSnapshot,
          scopeSnapshot,
          certificateNumber: input.certificateNumber || null,
          startDate,
          durationValue,
          durationUnit,
          expiryDate,
          status: ClientServiceStatus.ACTIVE,
          fee,
          currency,
        },
      });

      // 6. Schedule Renewal Milestones
      const stages: { stage: RenewalStage; daysBefore: number }[] = [
        { stage: RenewalStage.SIXTY_DAYS, daysBefore: 60 },
        { stage: RenewalStage.THIRTY_DAYS, daysBefore: 30 },
        { stage: RenewalStage.SEVEN_DAYS, daysBefore: 7 },
        { stage: RenewalStage.EXPIRY_DAY, daysBefore: 0 },
      ];

      for (const item of stages) {
        const scheduledDate = subDays(expiryDate, item.daysBefore);
        await tx.renewal.create({
          data: {
            clientServiceId: clientService.id,
            stage: item.stage,
            scheduledDate,
            status: RenewalStatus.PENDING,
            notes: `Auto-scheduled ${item.daysBefore}-day reminder for ${serviceNameSnapshot}`,
          },
        });
      }

      // 7. Update Inquiry to CONVERTED
      const updatedInquiry = await tx.inquiry.update({
        where: { id: inquiry.id },
        data: {
          status: InquiryStatus.CONVERTED,
          convertedClientId: client.id,
        },
      });

      // 8. Log Audit Record
      await AuditService.log({
        userId: currentUserId,
        action: AuditAction.CLIENT_CONVERTED,
        entityType: AuditEntityType.INQUIRY,
        entityId: inquiry.id,
        inquiryId: inquiry.id,
        clientId: client.id,
        beforeState: { status: inquiry.status },
        afterState: { status: InquiryStatus.CONVERTED, clientId: client.id, clientServiceId: clientService.id },
        description: `Inquiry ${inquiry.inquiryNumber} successfully converted to Client ${client.clientNumber} (${client.companyName}) with service ${serviceNameSnapshot}`,
        tx,
      });

      // 9. Notification
      if (client.assignedToId) {
        await NotificationService.send({
          userId: client.assignedToId,
          title: 'Client Converted',
          message: `Inquiry ${inquiry.inquiryNumber} was successfully converted to Client ${client.companyName}.`,
          link: `/clients/${client.id}`,
          type: 'SUCCESS',
          entityType: 'CLIENT',
          entityId: client.id,
          tx,
        });
      }

      return {
        client,
        clientService,
        inquiry: updatedInquiry,
      };
    });
  }
}
