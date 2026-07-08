import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { CohortStatus, Prisma } from "@prisma/client";
import { COHORT_STATUS_FLOW } from "@ghosted/shared";

@Injectable()
export class CohortsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CohortCreateInput) {
    return this.prisma.cohort.create({ data });
  }

  async findAll(params: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.CohortWhereInput = {
      deletedAt: null,
      ...(status && { status: status as CohortStatus }),
    };

    const [cohorts, total] = await Promise.all([
      this.prisma.cohort.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { projects: true, teams: true, applications: true } },
        },
      }),
      this.prisma.cohort.count({ where }),
    ]);

    return {
      data: cohorts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id, deletedAt: null },
      include: {
        projects: { select: { id: true, name: true, status: true } },
        teams: { select: { id: true, name: true } },
        _count: { select: { projects: true, teams: true, applications: true, nonprofits: true } },
      },
    });
    if (!cohort) throw new NotFoundException("Cohort not found");
    return cohort;
  }

  async update(id: string, data: Prisma.CohortUpdateInput) {
    await this.findById(id);
    return this.prisma.cohort.update({ where: { id }, data });
  }

  async transitionStatus(id: string, newStatus: CohortStatus) {
    const cohort = await this.findById(id);
    const currentIndex = COHORT_STATUS_FLOW.indexOf(
      cohort.status as (typeof COHORT_STATUS_FLOW)[number],
    );
    const newIndex = COHORT_STATUS_FLOW.indexOf(
      newStatus as (typeof COHORT_STATUS_FLOW)[number],
    );

    if (newIndex < 0) {
      throw new BadRequestException(`Invalid status: ${newStatus}`);
    }
    if (newIndex !== currentIndex + 1 && newStatus !== "ARCHIVED") {
      throw new BadRequestException(
        `Cannot transition from ${cohort.status} to ${newStatus}. Expected: ${COHORT_STATUS_FLOW[currentIndex + 1] ?? "none"}`,
      );
    }

    return this.prisma.cohort.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async softDelete(id: string) {
    await this.findById(id);
    return this.prisma.cohort.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
