import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

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
      return { data: file };
    } catch (e) {
      console.error("Failed to link file to project", e);
      throw e;
    }
  }


}
