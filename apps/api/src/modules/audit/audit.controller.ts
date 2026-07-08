import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@ApiTags("audit")
@Controller("audit")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: "Get all audit logs (Admin only)" })
  async getAuditLogs(@Query('limit') limit = 50) {
    const logs = await this.auditService.findAll(limit);
    return { data: logs };
  }
}
