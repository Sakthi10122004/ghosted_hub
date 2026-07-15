import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async createLog(data: {
    action: string;
    entityType: string;
    entityId: string;
    actorId?: string;
    metadata?: any;
    ipAddress?: string;
  }) {
    // Non-blocking fire-and-forget logic for audit logs
    this.prisma.auditLog
      .create({
        data: {
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          userId: data.actorId,
          metadata: data.metadata || {},
          ipAddress: data.ipAddress,
        },
      })
      .catch((err: any) => {
        this.logger.error(`Failed to create audit log: ${err.message}`);
      });
  }

  async findAll(limit: number = 50) {
    return this.prisma.auditLog.findMany({
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
  }

  async getActivityFeed(user: any) {
    const isAdmin = user.roles?.some((r: any) => r.role === "SUPER_ADMIN" || r.role === "ORGANIZER");
    
    // Filter out noisy events like auth.login
    const filter = {
      action: { notIn: ["auth.login", "auth.logout", "file.downloaded"] },
      ...(isAdmin ? {} : { userId: user.id })
    };

    const logs = await this.prisma.auditLog.findMany({
      where: filter,
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    return { data: logs };
  }
}
