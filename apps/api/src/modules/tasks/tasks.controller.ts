import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import type { TaskStatus, TaskPriority } from "@prisma/client";

@ApiTags("projects/tasks")
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get("projects/:projectId/tasks")
  @ApiOperation({ summary: "Get project tasks" })
  findAll(@Param("projectId") projectId: string) {
    return this.tasksService.findAll(projectId);
  }

  @Post("projects/:projectId/tasks")
  @ApiOperation({ summary: "Create a task" })
  create(
    @Param("projectId") projectId: string,
    @Body() data: { title: string; description?: string; status?: TaskStatus; priority?: TaskPriority; assigneeId?: string },
    @CurrentUser() user: any
  ) {
    return this.tasksService.create(projectId, user.id, data);
  }

  @Patch("tasks/:id")
  @ApiOperation({ summary: "Update a task" })
  update(@Param("id") id: string, @Body() data: any) {
    return this.tasksService.update(id, data);
  }

  @Delete("tasks/:id")
  @ApiOperation({ summary: "Delete a task" })
  remove(@Param("id") id: string) {
    return this.tasksService.remove(id);
  }
}
