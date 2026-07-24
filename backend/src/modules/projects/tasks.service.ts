import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { Prisma, TaskStatus, TaskPriority } from "@prisma/client";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, data: {
    title: string; description?: string; priority?: TaskPriority;
    assigneeId?: string; dueDate?: string; creatorId: string;
  }) {
    // Auto-calculate position (append to column)
    const maxPosition = await this.prisma.task.aggregate({
      where: { projectId, status: "BACKLOG" },
      _max: { position: true },
    });

    return this.prisma.task.create({
      data: {
        ...data,
        projectId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        position: (maxPosition._max.position ?? -1) + 1,
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        creator: { select: { id: true, name: true } },
        _count: { select: { comments: true, attachments: true } },
      },
    });
  }

  async findByProject(projectId: string, params: {
    status?: string; assigneeId?: string; priority?: string;
  }) {
    const { status, assigneeId, priority } = params;
    const where: Prisma.TaskWhereInput = {
      projectId,
      ...(status && { status: status as TaskStatus }),
      ...(assigneeId && { assigneeId }),
      ...(priority && { priority: priority as TaskPriority }),
    };

    return this.prisma.task.findMany({
      where, orderBy: [{ status: "asc" }, { position: "asc" }],
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { comments: true, attachments: true } },
      },
    });
  }

  async findById(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        creator: { select: { id: true, name: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        },
        attachments: true,
      },
    });
    if (!task) throw new NotFoundException("Task not found");
    return task;
  }

  async update(id: string, data: Prisma.TaskUpdateInput) {
    await this.findById(id);
    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...data,
        ...(data.status === "COMPLETED" ? { completedAt: new Date() } : {}),
      },
    });
    return updated;
  }

  async addComment(taskId: string, authorId: string, content: string) {
    await this.findById(taskId);
    return this.prisma.taskComment.create({
      data: { taskId, authorId, content },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }
}
