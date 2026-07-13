import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const reviews = await this.prisma.review.findMany({
      include: {
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If no reviews, return some mock data to show in UI
    if (reviews.length === 0) {
      return {
        data: [
          {
            id: 'r1',
            title: 'Homepage Design Mockup',
            category: 'Design',
            status: 'Needs Changes',
            project: { name: 'Riverbend Youth Alliance' },
          },
          {
            id: 'r2',
            title: 'About Page Content',
            category: 'Content',
            status: 'Submitted',
            project: { name: 'Harbor Literacy Project' },
          },
        ],
      };
    }

    return { data: reviews };
  }
}
