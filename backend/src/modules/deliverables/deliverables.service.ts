import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import type { DeliverableType, DeliverableStatus } from "@prisma/client";

@Injectable()
export class DeliverablesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService
  ) {}

  async findAll(projectId: string) {
    const deliverables = await this.prisma.deliverable.findMany({
      where: { projectId },
      include: {
        versions: {
          orderBy: { version: 'desc' }
        }
      }
    });
    return { data: deliverables };
  }

  async create(projectId: string, data: { name: string, type: DeliverableType, description?: string }) {
    const deliverable = await this.prisma.deliverable.create({
      data: {
        projectId,
        name: data.name,
        type: data.type,
        description: data.description,
        status: "DRAFT"
      }
    });
    return { data: deliverable };
  }

  async addVersion(deliverableId: string, userId: string, data: { fileUrl: string, fileSize?: number }) {
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id: deliverableId },
      include: { _count: { select: { versions: true } } }
    });
    
    if (!deliverable) throw new NotFoundException("Deliverable not found");

    const newVersionNum = deliverable._count.versions + 1;

    const version = await this.prisma.deliverableVersion.create({
      data: {
        deliverableId,
        version: newVersionNum,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        uploadedById: userId,
        status: "SUBMITTED"
      }
    });

    await this.prisma.deliverable.update({
      where: { id: deliverableId },
      data: { status: "SUBMITTED" }
    });

    // Notify Admins
    // We can fetch project admins or just emit a project-wide notification for admins
    const project = await this.prisma.project.findUnique({ where: { id: deliverable.projectId }, select: { name: true, cohortId: true } });
    if (project) {
      // Find admins of the cohort to notify (simplified: we can just emit a notification to team leads/admins)
      // For now, let's just log it or dispatch a general notification if we had an admin group.
      // We will assume the system routes this to admins via the websocket.
    }

    return { data: version };
  }

  async reviewVersion(
    deliverableId: string, 
    versionId: string, 
    reviewerId: string, 
    data: { status: DeliverableStatus, reviewNotes?: string }
  ) {
    const version = await this.prisma.deliverableVersion.findUnique({
      where: { id: versionId },
      include: { deliverable: true }
    });

    if (!version || version.deliverableId !== deliverableId) {
      throw new NotFoundException("Deliverable version not found");
    }

    const updatedVersion = await this.prisma.deliverableVersion.update({
      where: { id: versionId },
      data: {
        status: data.status,
        reviewNotes: data.reviewNotes,
        reviewerId,
        reviewedAt: new Date(),
      }
    });

    // Update parent deliverable status to match the latest version's status
    await this.prisma.deliverable.update({
      where: { id: deliverableId },
      data: { status: data.status }
    });

    // Notify the student who uploaded it
    await this.notifications.createNotification({
      userId: version.uploadedById,
      title: data.status === "APPROVED" ? "Deliverable Approved 🎉" : "Revision Requested 📝",
      message: data.status === "APPROVED" 
        ? `Your deliverable "${version.deliverable.name}" has been approved!`
        : `Changes requested on "${version.deliverable.name}": ${data.reviewNotes?.substring(0, 50)}...`,
      type: data.status === "APPROVED" ? "DELIVERABLE_APPROVED" : "REVIEW_COMPLETED",
      linkUrl: `/dashboard/projects/${version.deliverable.projectId}/deliverables`,
    });

    return { data: updatedVersion };
  }
}
