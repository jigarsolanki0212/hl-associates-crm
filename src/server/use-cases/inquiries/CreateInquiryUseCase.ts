import { db } from '@/db/client';
import { getNextSequenceNumber } from '@/lib/sequences/sequenceGenerator';
import { AuditService } from '@/server/services/AuditService';
import { NotificationService } from '@/server/services/NotificationService';
import { AuditAction, AuditEntityType, InquirySource, InquiryStatus } from '@prisma/client';

export interface CreateInquiryInput {
  companyName: string;
  contactName: string;
  contactTitle?: string;
  email: string;
  phone?: string;
  source?: InquirySource;
  sourceDetail?: string;
  serviceId?: string;
  serviceIds?: string[];
  serviceScope?: string;
  remarks?: string;
  assignedToId?: string;
}

export class CreateInquiryUseCase {
  static async execute(input: CreateInquiryInput, currentUserId?: string) {
    const inquiryNumber = await getNextSequenceNumber('INQUIRY');

    let resolvedServiceId = input.serviceId || null;
    let resolvedServiceScope = input.serviceScope || null;

    if (input.serviceIds && input.serviceIds.length > 0) {
      resolvedServiceId = input.serviceIds[0];
      const services = await db.service.findMany({
        where: { id: { in: input.serviceIds } },
        select: { name: true },
      });
      const names = services.map((s) => s.name).join(', ');
      if (names) {
        resolvedServiceScope = input.serviceScope ? `${names} • ${input.serviceScope}` : names;
      }
    }

    const inquiry = await db.inquiry.create({
      data: {
        inquiryNumber,
        companyName: input.companyName.trim(),
        contactName: input.contactName.trim(),
        contactTitle: input.contactTitle?.trim() || null,
        email: input.email.toLowerCase().trim(),
        phone: input.phone?.trim() || null,
        source: input.source || InquirySource.ORGANIC,
        sourceDetail: input.sourceDetail || null,
        status: InquiryStatus.NEW,
        serviceId: resolvedServiceId,
        serviceScope: resolvedServiceScope,
        remarks: input.remarks || null,
        assignedToId: input.assignedToId || null,
      },
      include: {
        service: true,
        assignedTo: true,
      },
    });

    // 1. Audit Log
    await AuditService.log({
      userId: currentUserId,
      action: AuditAction.INQUIRY_CREATED,
      entityType: AuditEntityType.INQUIRY,
      entityId: inquiry.id,
      inquiryId: inquiry.id,
      afterState: inquiry,
      description: `Inquiry ${inquiry.inquiryNumber} created for ${inquiry.companyName}`,
    });

    // 2. Notification if assigned
    if (inquiry.assignedToId) {
      await NotificationService.send({
        userId: inquiry.assignedToId,
        title: 'New Inquiry Assigned',
        message: `You have been assigned inquiry ${inquiry.inquiryNumber} (${inquiry.companyName}).`,
        link: `/inquiries/${inquiry.id}`,
        type: 'INFO',
        entityType: 'INQUIRY',
        entityId: inquiry.id,
      });
    }

    return inquiry;
  }
}
