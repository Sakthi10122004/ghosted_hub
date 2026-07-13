import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";

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

  async update(id: string, data: any) {
    await this.findById(id); // Ensure exists

    const { role, ...userData } = data;

    if (role) {
      // Update the user's global role (where cohortId is null)
      await this.prisma.userRoleAssignment.deleteMany({
        where: { userId: id, cohortId: null },
      });
      await this.prisma.userRoleAssignment.create({
        data: { userId: id, role: role },
      });
    }

    if (Object.keys(userData).length > 0) {
      return this.prisma.user.update({ where: { id }, data: userData });
    }

    return this.findById(id);
  }

  async softDelete(id: string) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async resetPassword(id: string, newPassword: string) {
    const user = await this.findById(id);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Check if account exists
    const account = await this.prisma.account.findFirst({
      where: { userId: id }
    });

    if (account) {
      return this.prisma.account.update({
        where: { id: account.id },
        data: { password: passwordHash },
      });
    } else {
      // Create a local account if none exists (for better-auth)
      return this.prisma.account.create({
        data: {
          userId: id,
          accountId: id,
          providerId: "credential",
          password: passwordHash,
        }
      });
    }
  }
}
