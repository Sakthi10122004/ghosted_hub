import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const files = await this.prisma.projectFile.findMany({
      include: {
        project: true,
        uploadedBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (files.length === 0) {
      return {
        data: [
          {
            id: 'f1',
            name: 'homepage-hero-v3.png',
            category: 'image',
            fileSize: 2400000,
            createdAt: new Date().toISOString(),
            uploadedBy: { name: 'Jordan Kim' },
            project: { name: 'Riverbend Youth Alliance' },
            version: 3,
            shared: true,
          },
        ],
      };
    }

    return { data: files };
  }
}
