import { db } from '@/db/client';
import { NotificationType, Prisma } from '@prisma/client';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  link?: string;
  type?: NotificationType;
  entityType?: string;
  entityId?: string;
  tx?: Prisma.TransactionClient;
}

export class NotificationService {
  static async send(params: CreateNotificationParams): Promise<void> {
    const client = params.tx || db;

    try {
      await client.notification.create({
        data: {
          userId: params.userId,
          title: params.title,
          message: params.message,
          link: params.link,
          type: params.type || 'INFO',
          entityType: params.entityType,
          entityId: params.entityId,
        },
      });
    } catch (err) {
      console.error('Failed to create notification:', err);
    }
  }

  static async notifyAdmins(params: Omit<CreateNotificationParams, 'userId'>): Promise<void> {
    const admins = await db.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true },
    });

    for (const admin of admins) {
      await this.send({ ...params, userId: admin.id });
    }
  }
}
