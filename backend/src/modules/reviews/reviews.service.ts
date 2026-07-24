import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService
  ) {}

  async findAllGlobal(user?: any) {
    if (!user) return { data: [] };

    const userRoles = await this.prisma.userRoleAssignment.findMany({
      where: { userId: user.id }
    });
    
    const isAdmin = userRoles.some(r => r.role === 'SUPER_ADMIN' || r.role === 'ORGANIZER');

    let whereClause: any = {};

    if (!isAdmin) {
      whereClause = {
        project: {
          team: {
            members: {
              some: { userId: user.id }
            }
          }
        }
      };
    }

    const reviews = await this.prisma.review.findMany({
      where: whereClause,
      include: {
        project: { select: { id: true, name: true } },
        cycles: { orderBy: { reviewedAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: reviews };
  }

  async findAll(projectId: string, user?: any) {
    const reviews = await this.prisma.review.findMany({
      where: { projectId },
      include: {
        project: { select: { id: true, name: true } },
        cycles: { orderBy: { reviewedAt: 'desc' } }
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

  async update(projectId: string, id: string, data: any, adminId?: string) {
    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: {
        status: data.status,
      }
    });

    if (data.feedback && adminId) {
      // Add to review cycles for history
      const reviewCycle = await this.prisma.reviewCycle.create({
        data: {
          reviewId: id,
          reviewerId: adminId,
          cycleNumber: 1, // simplified for now
          status: data.status,
          feedback: data.feedback,
          reviewedAt: new Date()
        }
      });
      console.log("CREATED REVIEW CYCLE:", reviewCycle);
    } else {
      console.log("DID NOT CREATE REVIEW CYCLE. adminId:", adminId, "feedback:", data.feedback);
    }

    // Find the project team to notify them
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { team: { include: { members: true } } }
    });

    if (project?.team?.members) {
      for (const member of project.team.members) {
        await this.notifications.createNotification({
          userId: member.userId,
          title: data.status === "APPROVED" ? "Review Approved 🎉" : data.status === "RESUBMITTED" ? "Review Resubmitted 🔄" : "Changes Requested 📝",
          message: data.status === "APPROVED"
            ? `Your review "${updatedReview.title}" has been approved!`
            : data.status === "RESUBMITTED"
            ? `The review "${updatedReview.title}" was successfully resubmitted.`
            : `Feedback on "${updatedReview.title}": ${data.feedback?.substring(0, 50)}...`,
          type: "REVIEW_COMPLETED",
          linkUrl: `/dashboard/projects/${projectId}/reviews`,
        });
      }
    }

    return { data: updatedReview };
  }
}
