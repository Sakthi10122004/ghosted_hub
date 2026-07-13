import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class DiscoveryService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProjectId(projectId: string) {
    const discovery = await this.prisma.discovery.findUnique({
      where: { projectId },
    });
    if (!discovery) {
      // Auto-create if missing for some reason
      return this.prisma.discovery.create({ data: { projectId } });
    }
    return discovery;
  }

  async update(projectId: string, data: any) {
    const discovery = await this.prisma.discovery.findUnique({ where: { projectId } });
    
    if (!discovery) {
      return this.prisma.discovery.create({
        data: {
          projectId,
          ...data
        }
      });
    }

    return this.prisma.discovery.update({
      where: { projectId },
      data,
    });
  }
}
