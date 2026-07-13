import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { DeliverableType, DeliverableStatus } from "@prisma/client";

@Injectable()
export class DeliverablesService {
  constructor(private readonly prisma: PrismaService) {}

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

    return { data: version };
  }
}
