import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { Prisma } from "@prisma/client";

@Injectable()
export class NonprofitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.NonprofitCreateInput) {
    return this.prisma.nonprofit.create({ data });
  }

  async findAll(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.NonprofitWhereInput = {
      deletedAt: null,
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

  async update(id: string, data: Prisma.NonprofitUpdateInput) {
    await this.findById(id);
    return this.prisma.nonprofit.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    await this.findById(id);
    return this.prisma.nonprofit.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
