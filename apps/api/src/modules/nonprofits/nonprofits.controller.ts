import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { NonprofitsService } from "./nonprofits.service";

@ApiTags("nonprofits")
@Controller("nonprofits")
export class NonprofitsController {
  constructor(private readonly nonprofitsService: NonprofitsService) {}

  @Post()
  @ApiOperation({ summary: "Register a new nonprofit" })
  create(@Body() data: Record<string, unknown>) {
    return this.nonprofitsService.create(data as never);
  }

  @Get()
  @ApiOperation({ summary: "List nonprofits" })
  @ApiQuery({ name: "page", required: false }) @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "search", required: false })
  findAll(
    @Query("page") page?: number, 
    @Query("limit") limit?: number, 
    @Query("search") search?: string,
    @CurrentUser() user?: any
  ) {
    return this.nonprofitsService.findAll({ page, limit, search }, user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get nonprofit by ID" })
  findOne(@Param("id") id: string) { return this.nonprofitsService.findById(id); }

  @Patch(":id")
  @ApiOperation({ summary: "Update nonprofit" })
  update(@Param("id") id: string, @Body() data: Record<string, unknown>) {
    return this.nonprofitsService.update(id, data);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft delete nonprofit" })
  remove(@Param("id") id: string) { return this.nonprofitsService.softDelete(id); }
}
