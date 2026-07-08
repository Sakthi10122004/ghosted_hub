import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { Prisma, UserRole } from "@prisma/client";

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; cohortId: string; capacity?: number }) {
    return this.prisma.team.create({ data });
  }

  async findAll(params: { page?: number; limit?: number; cohortId?: string }) {
    const { page = 1, limit = 20, cohortId } = params;
    const skip = (page - 1) * limit;
    const where: Prisma.TeamWhereInput = {
      deletedAt: null,
      ...(cohortId && { cohortId }),
    };

    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: {
          members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
          cohort: { select: { id: true, name: true } },
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
        members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
        cohort: { select: { id: true, name: true, status: true } },
        projects: { select: { id: true, name: true, status: true } },
      },
    });
    if (!team) throw new NotFoundException("Team not found");
    return team;
  }

  async addMember(teamId: string, userId: string, role: UserRole = "STUDENT" as UserRole) {
    const team = await this.findById(teamId);
    if (team.members.length >= team.capacity) {
      throw new BadRequestException("Team is at full capacity");
    }
    return this.prisma.teamMember.create({
      data: { teamId, userId, role },
    });
  }

  async removeMember(teamId: string, userId: string) {
    return this.prisma.teamMember.update({
      where: { teamId_userId: { teamId, userId } },
      data: { leftAt: new Date() },
    });
  }

  async update(id: string, data: Prisma.TeamUpdateInput) {
    await this.findById(id);
    return this.prisma.team.update({ where: { id }, data });
  }
}
