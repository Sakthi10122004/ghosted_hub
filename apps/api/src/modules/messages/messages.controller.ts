import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("messages")
@Controller("projects/:projectId/messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: "Send a message in a project" })
  create(
    @Param("projectId") projectId: string,
    @Body() data: { content: string },
    @CurrentUser() user: any
  ) {
    return this.messagesService.create(projectId, user.id, data);
  }

  @Get()
  @ApiOperation({ summary: "Get project messages" })
  findAll(
    @Param("projectId") projectId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    return this.messagesService.findAll(projectId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 50);
  }
}
