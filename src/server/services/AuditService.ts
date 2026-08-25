import { db } from '@/db/client';
import { AuditAction, AuditEntityType, Prisma } from '@prisma/client';

export interface LogAuditParams {
  userId?: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  inquiryId?: string;
  clientId?: string;
  beforeState?: unknown;
  afterState?: unknown;
  description: string;
  tx?: Prisma.TransactionClient;
}

export class AuditService {
  static async log(params: LogAuditParams): Promise<void> {
    const client = params.tx || db;

    try {
      await client.activityLog.create({
        data: {
          userId: params.userId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          inquiryId: params.inquiryId,
          clientId: params.clientId,
          beforeState: params.beforeState ? (params.beforeState as Prisma.InputJsonValue) : undefined,
          afterState: params.afterState ? (params.afterState as Prisma.InputJsonValue) : undefined,
          description: params.description,
        },
      });
    } catch (err) {
      console.error('Failed to write immutable audit log:', err);
    }
  }
}
