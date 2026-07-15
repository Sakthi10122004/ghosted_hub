import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('notifications')
@Controller('notifications')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZER, UserRole.STUDENT, UserRole.NONPROFIT_REP, UserRole.MENTOR, UserRole.TEAM_LEAD)
  @ApiOperation({ summary: 'Get current user notifications' })
  getUserNotifications(@CurrentUser() user: any) {
    return this.notificationsService.getUserNotifications(user.id);
  }

  @Patch(':id/read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZER, UserRole.STUDENT, UserRole.NONPROFIT_REP, UserRole.MENTOR, UserRole.TEAM_LEAD)
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(id, user.id);
  }
}
