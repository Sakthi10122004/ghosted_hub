import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(projectId: string, user?: any) {
    const reviews = await this.prisma.review.findMany({
      where: { projectId },
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: reviews };
  }

  async create(projectId: string, data: any) {
    const review = await this.prisma.review.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        category: data.category || "DESIGN",
        status: "SUBMITTED"
      }
    });
    return { data: review };
  }
}
