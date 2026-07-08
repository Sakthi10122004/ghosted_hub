import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { Prisma } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }) {
    const { page = 1, limit = 20, search, role } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(role && {
        roles: { some: { role: role as Prisma.EnumUserRoleFilter["equals"] } },
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          roles: { select: { role: true, cohortId: true } },
          studentProfile: { select: { university: true, skills: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        roles: true,
        studentProfile: true,
        teamMemberships: {
          include: { team: { select: { id: true, name: true } } },
        },
      },
    });

    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    await this.findById(id); // Ensure exists
    return this.prisma.user.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
