import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AppGateway } from "../gateway/app.gateway";

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly gateway: AppGateway
  ) {}

  async create(projectId: string, authorId: string, data: { content: string }) {
    // Verify project exists
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException("Project not found");

    const message = await this.prisma.message.create({
      data: {
        projectId,
        authorId,
        content: data.content,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    await this.auditService.createLog({
      action: "message.create",
      entityType: "Message",
      entityId: message.id,
      actorId: authorId,
      metadata: { projectId },
    });

    // Broadcast to connected clients
    this.gateway.emitMessageToProject(projectId, 'message.created', message);

    return message;
  }

  async findAll(projectId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { projectId, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatarUrl: true }
          }
        }
      }),
      this.prisma.message.count({ where: { projectId, deletedAt: null } })
    ]);

    return {
      data: messages,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }
}
