import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { DeliverablesService } from "./deliverables.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import type { DeliverableType } from "@prisma/client";

@ApiTags("projects/deliverables")
@Controller()
export class DeliverablesController {
  constructor(private readonly deliverablesService: DeliverablesService) {}

  @Get("projects/:projectId/deliverables")
  @ApiOperation({ summary: "Get project deliverables" })
  findAll(@Param("projectId") projectId: string) {
    return this.deliverablesService.findAll(projectId);
  }

  @Post("projects/:projectId/deliverables")
  @ApiOperation({ summary: "Create a new deliverable entry" })
  create(
    @Param("projectId") projectId: string,
    @Body() data: { name: string; type: DeliverableType; description?: string }
  ) {
    return this.deliverablesService.create(projectId, data);
  }

  @Post("deliverables/:id/versions")
  @ApiOperation({ summary: "Submit a new version of a deliverable" })
  addVersion(
    @Param("id") id: string,
    @Body() data: { fileUrl: string; fileSize?: number },
    @CurrentUser() user: any
  ) {
    return this.deliverablesService.addVersion(id, user.id, data);
  }
}
