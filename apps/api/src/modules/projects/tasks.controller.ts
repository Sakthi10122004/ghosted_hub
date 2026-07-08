import { Controller, Get, Post, Patch, Param, Body, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { TasksService } from "./tasks.service";

@ApiTags("tasks")
@Controller("projects/:projectId/tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: "Create a task in a project" })
  create(
    @Param("projectId") projectId: string,
    @Body() data: { title: string; description?: string; priority?: string; assigneeId?: string; dueDate?: string },
  ) {
    // TODO: Replace hardcoded creatorId with CurrentUser when auth is wired
    return this.tasksService.create(projectId, { ...data, creatorId: "system" } as never);
  }

  @Get()
  @ApiOperation({ summary: "List tasks for a project (Kanban view)" })
  @ApiQuery({ name: "status", required: false }) @ApiQuery({ name: "assigneeId", required: false })
  @ApiQuery({ name: "priority", required: false })
  findAll(
    @Param("projectId") projectId: string,
    @Query("status") status?: string, @Query("assigneeId") assigneeId?: string,
    @Query("priority") priority?: string,
  ) {
    return this.tasksService.findByProject(projectId, { status, assigneeId, priority });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get task by ID" })
  findOne(@Param("id") id: string) { return this.tasksService.findById(id); }

  @Patch(":id")
  @ApiOperation({ summary: "Update task (status, assignee, etc.)" })
  update(@Param("id") id: string, @Body() data: Record<string, unknown>) {
    return this.tasksService.update(id, data);
  }

  @Post(":id/comments")
  @ApiOperation({ summary: "Add comment to task" })
  addComment(@Param("id") id: string, @Body() data: { authorId: string; content: string }) {
    return this.tasksService.addComment(id, data.authorId, data.content);
  }
}
