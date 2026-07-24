import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { DeploymentsService } from './deployments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
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

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Create a new deployment (Admin only)' })
  create(@Body() data: any, @CurrentUser() user: any) {
    return this.deploymentsService.create(data, user);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZER)
  @ApiOperation({ summary: 'Update a deployment (Admin only)' })
  update(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.deploymentsService.update(id, data, user);
  }
}
