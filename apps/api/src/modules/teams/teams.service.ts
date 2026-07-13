import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { Prisma, UserRole } from "@prisma/client";

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; cohortId: string; capacity?: number }) {
    return this.prisma.team.create({ data });
  }

  async findAll(params: { page?: number; limit?: number; cohortId?: string; search?: string }, user?: any) {
    const { page = 1, limit = 20, cohortId, search } = params;
    const skip = (page - 1) * limit;

    let isStudent = false;
    if (user?.id) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { roles: true }
      });
      isStudent = dbUser?.roles?.some(r => r.role === "STUDENT" || r.role === "NONPROFIT_REP") || false;
    }

    const where: Prisma.TeamWhereInput = {
      deletedAt: null,
      ...(cohortId && { cohortId }),
      ...(isStudent && user?.id && {
        members: { some: { userId: user.id } }
      }),
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
    };

    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: {
          members: {
            where: { leftAt: null },
            include: {
              user: {
                select: { id: true, name: true, email: true, avatarUrl: true },
              },
            },
          },
          cohort: { select: { id: true, name: true, status: true } },
          _count: { select: { projects: true, members: true } },
        },
      }),
      this.prisma.team.count({ where }),
    ]);
    return { data: teams, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id, deletedAt: null },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        cohort: { select: { id: true, name: true, status: true } },
        projects: { select: { id: true, name: true, status: true } },
      },
    });
    if (!team) throw new NotFoundException("Team not found");
    return team;
  }

  async addMember(teamId: string, userId: string, role: UserRole = "STUDENT" as UserRole) {
    const team = await this.findById(teamId);
    // Count only active members for capacity check
    const activeMembers = team.members.filter((m) => !m.leftAt);
    if (activeMembers.length >= team.capacity) {
      throw new BadRequestException("Team is at full capacity");
    }
    return this.prisma.teamMember.create({
      data: { teamId, userId, role },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  }

  async removeMember(teamId: string, userId: string) {
    return this.prisma.teamMember.update({
      where: { teamId_userId: { teamId, userId } },
      data: { leftAt: new Date() },
    });
  }

  async setMemberRole(teamId: string, userId: string, role: UserRole) {
    // If promoting to TEAM_LEAD (captain), demote any existing captain first
    if (role === ("TEAM_LEAD" as UserRole)) {
      await this.prisma.teamMember.updateMany({
        where: {
          teamId,
          role: "TEAM_LEAD" as UserRole,
          leftAt: null,
        },
        data: { role: "STUDENT" as UserRole },
      });
    }

    return this.prisma.teamMember.update({
      where: { teamId_userId: { teamId, userId } },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  }

  async update(id: string, data: Prisma.TeamUpdateInput) {
    await this.findById(id);
    return this.prisma.team.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    await this.findById(id);
    return this.prisma.team.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
