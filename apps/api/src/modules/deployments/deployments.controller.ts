import { Controller, Get, UseGuards } from '@nestjs/common';
import { DeploymentsService } from './deployments.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('deployments')
@Controller('deployments')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class DeploymentsController {
  constructor(private readonly deploymentsService: DeploymentsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Get all deployments (Admin only)' })
  findAll() {
    return this.deploymentsService.findAll();
  }
}
