import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("activity")
@Controller("activity")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ORGANIZER, UserRole.STUDENT, UserRole.NONPROFIT_REP, UserRole.MENTOR, UserRole.TEAM_LEAD)
export class ActivityController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: "Get activity feed for the dashboard" })
  async getActivityFeed(@CurrentUser() user: any) {
    return this.auditService.getActivityFeed(user);
  }
}
