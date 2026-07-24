import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DeploymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async findAll() {
    const deployments = await this.prisma.deploymentInstance.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { data: deployments };
  }

  async create(data: Prisma.DeploymentInstanceCreateInput, user: any) {
    const deployment = await this.prisma.deploymentInstance.create({ data });
    
    await this.auditService.createLog({
      action: 'deployment.create',
      entityType: 'DeploymentInstance',
      entityId: deployment.id,
      actorId: user?.id,
      metadata: { serialNumber: deployment.serialNumber, cname: deployment.cname }
    });

    return deployment;
  }

  async update(id: string, data: Prisma.DeploymentInstanceUpdateInput, user: any) {
    const deployment = await this.prisma.deploymentInstance.findUnique({ where: { id } });
    if (!deployment) throw new NotFoundException('Deployment not found');

    const updated = await this.prisma.deploymentInstance.update({
      where: { id },
      data
    });

    await this.auditService.createLog({
      action: 'deployment.update',
      entityType: 'DeploymentInstance',
      entityId: id,
      actorId: user?.id,
      metadata: { fields: Object.keys(data) }
    });

    return updated;
  }
}
