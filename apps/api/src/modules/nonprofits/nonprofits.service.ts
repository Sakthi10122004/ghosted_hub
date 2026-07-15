import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class NonprofitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async create(data: Prisma.NonprofitCreateInput, actorId?: string) {
    const nonprofit = await this.prisma.nonprofit.create({ data });
    await this.auditService.createLog({
      action: "nonprofit.create",
      entityType: "Nonprofit",
      entityId: nonprofit.id,
      actorId,
      metadata: { name: nonprofit.name },
    });
    return nonprofit;
  }

  async findAll(params: { page?: number; limit?: number; search?: string }, user?: any) {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const isStudent = user?.roles?.some((r: any) => r.role === "STUDENT") || user?.role === "student" || user?.role === "STUDENT";

    const where: Prisma.NonprofitWhereInput = {
      deletedAt: null,
      ...(isStudent && user?.id && {
        projects: { some: { team: { members: { some: { userId: user.id } } } } }
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [nonprofits, total] = await Promise.all([
      this.prisma.nonprofit.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: {
          contacts: { include: { user: { select: { id: true, name: true, email: true } } } },
          _count: { select: { projects: true, cohorts: true } },
        },
      }),
      this.prisma.nonprofit.count({ where }),
    ]);

    return { data: nonprofits, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const nonprofit = await this.prisma.nonprofit.findUnique({
      where: { id, deletedAt: null },
      include: {
        contacts: { include: { user: { select: { id: true, name: true, email: true } } } },
        documents: true,
        projects: { select: { id: true, name: true, status: true } },
      },
    });
    if (!nonprofit) throw new NotFoundException("Nonprofit not found");
    return nonprofit;
  }

  async update(id: string, data: Prisma.NonprofitUpdateInput, actorId?: string) {
    await this.findById(id);
    const updated = await this.prisma.nonprofit.update({ where: { id }, data });
    await this.auditService.createLog({
      action: "nonprofit.update",
      entityType: "Nonprofit",
      entityId: id,
      actorId,
      metadata: { updatedFields: Object.keys(data) },
    });
    return updated;
  }

  async softDelete(id: string, actorId?: string) {
    const nonprofit = await this.findById(id);
    const deleted = await this.prisma.nonprofit.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.auditService.createLog({
      action: "nonprofit.delete",
      entityType: "Nonprofit",
      entityId: id,
      actorId,
      metadata: { name: nonprofit.name },
    });
    return deleted;
  }
}
