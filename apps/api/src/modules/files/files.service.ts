import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async findAllGlobal(user?: any) {
    // If not super admin, we could filter by user's projects. For now, fetch all files to simulate global view.
    const files = await this.prisma.projectFile.findMany({
      include: {
        project: { select: { id: true, name: true } },
        uploadedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: files };
  }

  async findAll(projectId: string, user?: any) {
    // For this implementation, fetch all files scoped to the project
    const files = await this.prisma.projectFile.findMany({
      where: { projectId },
      include: {
        project: { select: { id: true, name: true } },
        uploadedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: files };
  }

  async uploadFile(projectId: string, data: any, user: any) {
    try {
      const file = await this.prisma.projectFile.create({
        data: {
          name: data.name,
          fileUrl: data.fileUrl || `https://dummyimage.com/600x400/000/fff&text=${data.name}`,
          category: data.category || 'OTHER',
          fileSize: data.fileSize || 1024,
          projectId: projectId,
          uploadedById: user.id,
        },
      });

      await this.auditService.createLog({
        action: 'file.upload',
        entityType: 'ProjectFile',
        entityId: file.id,
        actorId: user.id,
        metadata: { name: file.name, projectId },
      });

      return { data: file };
    } catch (e) {
      console.error("Failed to link file to project", e);
      throw e;
    }
  }

  async deleteFile(id: string, user: any) {
    try {
      const file = await this.prisma.projectFile.findUnique({ where: { id } });
      if (!file) {
        throw new Error("File not found");
      }
      
      await this.prisma.projectFile.delete({
        where: { id },
      });

      await this.auditService.createLog({
        action: 'file.delete',
        entityType: 'ProjectFile',
        entityId: id,
        actorId: user.id,
        metadata: { name: file.name, projectId: file.projectId },
      });

      return { success: true };
    } catch (e) {
      console.error("Failed to delete file", e);
      throw e;
    }
  }

}
