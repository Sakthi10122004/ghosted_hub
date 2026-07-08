import { Controller, Get, Post, Patch, Param, Body, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { TeamsService } from "./teams.service";
import type { UserRole } from "@prisma/client";

@ApiTags("teams")
@Controller("teams")
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new team" })
  create(@Body() data: { name: string; cohortId: string; capacity?: number }) {
    return this.teamsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: "List teams" })
  @ApiQuery({ name: "cohortId", required: false })
  findAll(@Query("page") page?: number, @Query("limit") limit?: number, @Query("cohortId") cohortId?: string) {
    return this.teamsService.findAll({ page, limit, cohortId });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get team by ID" })
  findOne(@Param("id") id: string) { return this.teamsService.findById(id); }

  @Patch(":id")
  @ApiOperation({ summary: "Update team" })
  update(@Param("id") id: string, @Body() data: Record<string, unknown>) {
    return this.teamsService.update(id, data);
  }

  @Post(":id/members")
  @ApiOperation({ summary: "Add member to team" })
  addMember(@Param("id") id: string, @Body() data: { userId: string; role?: UserRole }) {
    return this.teamsService.addMember(id, data.userId, data.role);
  }

  @Patch(":id/members/:userId/remove")
  @ApiOperation({ summary: "Remove member from team" })
  removeMember(@Param("id") id: string, @Param("userId") userId: string) {
    return this.teamsService.removeMember(id, userId);
  }
}
