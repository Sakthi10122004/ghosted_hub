import { Controller, Get, Post, Patch, Param, Body, Query } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { ProjectsService } from "./projects.service";
import type { ProjectStatus } from "@prisma/client";

@ApiTags("projects")
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new project (usually via pairing)" })
  create(@Body() data: { name: string; cohortId: string; nonprofitId: string; teamId?: string; description?: string }) {
    return this.projectsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: "List projects with filters" })
  @ApiQuery({ name: "cohortId", required: false }) @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "search", required: false })
  findAll(
    @Query("page") page?: number, @Query("limit") limit?: number,
    @Query("cohortId") cohortId?: string, @Query("status") status?: string,
    @Query("search") search?: string,
    @CurrentUser() user?: any,
  ) {
    return this.projectsService.findAll({ page, limit, cohortId, status, search }, user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get project by ID (full workspace)" })
  findOne(@Param("id") id: string, @CurrentUser() user?: any) { return this.projectsService.findById(id, user); }

  @Patch(":id")
  @ApiOperation({ summary: "Update project" })
  update(@Param("id") id: string, @Body() data: Record<string, unknown>) {
    return this.projectsService.update(id, data);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update project status" })
  updateStatus(@Param("id") id: string, @Body("status") status: ProjectStatus) {
    return this.projectsService.updateStatus(id, status);
  }

  @Get(":id/timeline")
  @ApiOperation({ summary: "Get project timeline" })
  getTimeline(@Param("id") id: string, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.projectsService.getTimeline(id, { page, limit });
  }
}
