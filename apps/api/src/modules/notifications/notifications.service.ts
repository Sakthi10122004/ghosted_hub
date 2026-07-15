import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
  ) {}

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    linkUrl?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.linkUrl,
      },
    });

    // We can emit directly to the user if we track user sockets, 
    // but for now we can broadcast an event that the client filters, 
    // or set up user-specific rooms in the gateway.
    // Assuming the user joins a room with their userId:
    this.gateway.server.to(`user_${data.userId}`).emit('notification', notification);

    // TODO: Send email based on notification type

    return notification;
  }

  async getUserNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { data: notifications };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
    return { data: notification };
  }
}
