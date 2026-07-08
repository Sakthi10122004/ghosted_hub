import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { CohortsService } from "./cohorts.service";
import type { CohortStatus } from "@prisma/client";

@ApiTags("cohorts")
@Controller("cohorts")
export class CohortsController {
  constructor(private readonly cohortsService: CohortsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new cohort" })
  create(@Body() data: Record<string, unknown>) {
    return this.cohortsService.create(data as never);
  }

  @Get()
  @ApiOperation({ summary: "List cohorts with pagination" })
  @ApiQuery({ name: "page", required: false }) @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "status", required: false })
  findAll(
    @Query("page") page?: number, @Query("limit") limit?: number,
    @Query("status") status?: string,
  ) {
    return this.cohortsService.findAll({ page, limit, status });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get cohort by ID" })
  findOne(@Param("id") id: string) {
    return this.cohortsService.findById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update cohort" })
  update(@Param("id") id: string, @Body() data: Record<string, unknown>) {
    return this.cohortsService.update(id, data);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Transition cohort status (state machine)" })
  transitionStatus(@Param("id") id: string, @Body("status") status: CohortStatus) {
    return this.cohortsService.transitionStatus(id, status);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft delete cohort" })
  remove(@Param("id") id: string) {
    return this.cohortsService.softDelete(id);
  }
}
