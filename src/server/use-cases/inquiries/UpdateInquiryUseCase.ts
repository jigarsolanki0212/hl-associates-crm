import { db } from '@/db/client';
import { AuditService } from '@/server/services/AuditService';
import { AuditAction, AuditEntityType, InquirySource, InquiryStatus } from '@prisma/client';

export class UpdateInquiryUseCase {
  static async execute(
    inquiryId: string,
    updates: Partial<{
      companyName: string;
      contactName: string;
      contactTitle: string;
      email: string;
      phone: string;
      source: InquirySource;
      sourceDetail: string;
      serviceId: string;
      serviceScope: string;
      remarks: string;
      assignedToId: string;
    }>,
    currentUserId?: string
  ) {
    const existing = await db.inquiry.findUnique({ where: { id: inquiryId } });
    if (!existing) throw new Error('Inquiry not found');

    const updated = await db.inquiry.update({
      where: { id: inquiryId },
      data: updates,
      include: { service: true, assignedTo: true },
    });

    await AuditService.log({
      userId: currentUserId,
      action: AuditAction.INQUIRY_UPDATED,
      entityType: AuditEntityType.INQUIRY,
      entityId: inquiryId,
      inquiryId,
      beforeState: existing,
      afterState: updated,
      description: `Inquiry ${existing.inquiryNumber} details updated`,
    });

    return updated;
  }

  static async accept(inquiryId: string, currentUserId?: string, reason?: string) {
    const existing = await db.inquiry.findUnique({ where: { id: inquiryId } });
    if (!existing) throw new Error('Inquiry not found');

    if (existing.status === InquiryStatus.CONVERTED) {
      throw new Error('Cannot accept an already converted inquiry');
    }

    const updated = await db.inquiry.update({
      where: { id: inquiryId },
      data: { status: InquiryStatus.ACCEPTED },
      include: { service: true, assignedTo: true },
    });

    await AuditService.log({
      userId: currentUserId,
      action: AuditAction.INQUIRY_ACCEPTED,
      entityType: AuditEntityType.INQUIRY,
      entityId: inquiryId,
      inquiryId,
      beforeState: { status: existing.status },
      afterState: { status: InquiryStatus.ACCEPTED, reason },
      description: `Inquiry ${existing.inquiryNumber} marked as ACCEPTED${reason ? ` (${reason})` : ''}`,
    });

    return updated;
  }

  static async markLost(inquiryId: string, currentUserId?: string, reason?: string) {
    const existing = await db.inquiry.findUnique({ where: { id: inquiryId } });
    if (!existing) throw new Error('Inquiry not found');

    if (existing.status === InquiryStatus.CONVERTED) {
      throw new Error('Cannot mark a converted inquiry as lost');
    }

    const updated = await db.inquiry.update({
      where: { id: inquiryId },
      data: { status: InquiryStatus.LOST },
      include: { service: true, assignedTo: true },
    });

    await AuditService.log({
      userId: currentUserId,
      action: AuditAction.INQUIRY_LOST,
      entityType: AuditEntityType.INQUIRY,
      entityId: inquiryId,
      inquiryId,
      beforeState: { status: existing.status },
      afterState: { status: InquiryStatus.LOST, reason },
      description: `Inquiry ${existing.inquiryNumber} marked as LOST. Reason: ${reason || 'Not specified'}`,
    });

    return updated;
  }

  static async reopen(inquiryId: string, currentUserId?: string, reason?: string) {
    const existing = await db.inquiry.findUnique({ where: { id: inquiryId } });
    if (!existing) throw new Error('Inquiry not found');

    if (existing.status !== InquiryStatus.LOST) {
      throw new Error('Only LOST inquiries can be reopened');
    }

    const updated = await db.inquiry.update({
      where: { id: inquiryId },
      data: { status: InquiryStatus.REOPENED },
      include: { service: true, assignedTo: true },
    });

    await AuditService.log({
      userId: currentUserId,
      action: AuditAction.INQUIRY_REOPENED,
      entityType: AuditEntityType.INQUIRY,
      entityId: inquiryId,
      inquiryId,
      beforeState: { status: existing.status },
      afterState: { status: InquiryStatus.REOPENED, reason },
      description: `Inquiry ${existing.inquiryNumber} REOPENED. Reason: ${reason || 'Client re-engaged'}`,
    });

    return updated;
  }
}
