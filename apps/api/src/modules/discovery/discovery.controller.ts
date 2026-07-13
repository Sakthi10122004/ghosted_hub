import { Controller, Get, Patch, Body, Param } from "@nestjs/common";
import { DiscoveryService } from "./discovery.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("projects/discovery")
@Controller("projects/:projectId/discovery")
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get()
  @ApiOperation({ summary: "Get project discovery/requirements" })
  findOne(@Param("projectId") projectId: string) {
    return this.discoveryService.findByProjectId(projectId);
  }

  @Patch()
  @ApiOperation({ summary: "Update project discovery/requirements" })
  update(
    @Param("projectId") projectId: string,
    @Body() data: any
  ) {
    return this.discoveryService.update(projectId, data);
  }
}
