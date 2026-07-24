import { Controller, Get, Post, Patch, Body, UseGuards, Param } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('projects/reviews')
@Controller()
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('reviews')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZER, UserRole.STUDENT, UserRole.NONPROFIT_REP, UserRole.MENTOR, UserRole.TEAM_LEAD)
  @ApiOperation({ summary: 'Get all reviews (scoped by user role)' })
  findAllGlobal(@CurrentUser() user?: any) {
    return this.reviewsService.findAllGlobal(user);
  }

  @Get('projects/:projectId/reviews')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZER, UserRole.STUDENT, UserRole.NONPROFIT_REP, UserRole.MENTOR, UserRole.TEAM_LEAD)
  @ApiOperation({ summary: 'Get all reviews for a project' })
  findAll(@Param("projectId") projectId: string, @CurrentUser() user?: any) {
    return this.reviewsService.findAll(projectId, user);
  }

  @Post('projects/:projectId/reviews')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZER, UserRole.STUDENT, UserRole.NONPROFIT_REP, UserRole.MENTOR, UserRole.TEAM_LEAD)
  @ApiOperation({ summary: 'Create a review for a project' })
  create(@Param("projectId") projectId: string, @Body() data: any) {
    return this.reviewsService.create(projectId, data);
  }

  @Patch('projects/:projectId/reviews/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZER, UserRole.MENTOR, UserRole.TEAM_LEAD, UserRole.STUDENT)
  @ApiOperation({ summary: 'Update a review (Admin & Student Resubmission)' })
  update(@Param("projectId") projectId: string, @Param("id") id: string, @Body() data: any, @CurrentUser() user?: any) {
    return this.reviewsService.update(projectId, id, data, user?.id);
  }
}
