import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { Prisma, ProjectStatus } from "@prisma/client";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create a project — typically called by the pairing engine */
  async create(data: {
    name: string;
    cohortId: string;
    nonprofitId: string;
    teamId?: string;
    description?: string;
  }) {
    const project = await this.prisma.project.create({
      data: {
        ...data,
        // Auto-create discovery workspace
        discovery: { create: {} },
      },
      include: { cohort: true, nonprofit: true, team: true },
    });

    // Record in timeline
    await this.prisma.timelineEvent.create({
      data: {
        projectId: project.id,
        title: "Project Created",
        description: `Project "${project.name}" was created and linked to ${project.nonprofit.name}.`,
      },
    });

    return project;
  }

  async findAll(params: {
    page?: number; limit?: number; cohortId?: string;
    status?: string; search?: string;
  }) {
    const { page = 1, limit = 20, cohortId, status, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      deletedAt: null,
      ...(cohortId && { cohortId }),
      ...(status && { status: status as ProjectStatus }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { nonprofit: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: {
          cohort: { select: { id: true, name: true } },
          team: { 
            select: { 
              id: true, 
              name: true,
              members: {
                include: {
                  user: { select: { id: true, name: true, avatarUrl: true } }
                }
              }
            } 
          },
          nonprofit: { select: { id: true, name: true, logoUrl: true } },
          _count: {
            select: {
              tasks: true, reviews: true, deliverables: true,
              files: true, messages: true, meetings: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data: projects, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id, deletedAt: null },
      include: {
        cohort: { select: { id: true, name: true, status: true } },
        team: {
          include: {
            members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
          },
        },
        nonprofit: true,
        discovery: true,
        deployment: true,
        milestones: { orderBy: { dueDate: "asc" } },
        _count: {
          select: { tasks: true, reviews: true, deliverables: true, files: true, messages: true },
        },
      },
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  async update(id: string, data: Prisma.ProjectUpdateInput) {
    await this.findById(id);
    return this.prisma.project.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: ProjectStatus) {
    const project = await this.findById(id);
    const updated = await this.prisma.project.update({
      where: { id }, data: { status },
    });
    await this.prisma.timelineEvent.create({
      data: {
        projectId: id,
        title: "Status Changed",
        description: `Project status changed from ${project.status} to ${status}.`,
        metadata: { from: project.status, to: status },
      },
    });
    return updated;
  }

  /** Get project timeline */
  async getTimeline(projectId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.timelineEvent.findMany({
        where: { projectId }, skip, take: limit, orderBy: { occurredAt: "desc" },
      }),
      this.prisma.timelineEvent.count({ where: { projectId } }),
    ]);

    return { data: events, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
