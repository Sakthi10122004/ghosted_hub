import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { TaskStatus, TaskPriority } from "@prisma/client";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(projectId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { data: tasks };
  }

  async create(projectId: string, userId: string, data: { title: string; description?: string; status?: TaskStatus; priority?: TaskPriority; assigneeId?: string }) {
    const task = await this.prisma.task.create({
      data: {
        projectId,
        creatorId: userId,
        title: data.title,
        description: data.description,
        status: data.status || "BACKLOG",
        priority: data.priority || "MEDIUM",
        assigneeId: data.assigneeId,
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
      }
    });
    return { data: task };
  }

  async update(id: string, data: any) {
    const task = await this.prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
      }
    });
    return { data: task };
  }

  async remove(id: string) {
    await this.prisma.task.delete({ where: { id } });
    return { success: true };
  }
}
