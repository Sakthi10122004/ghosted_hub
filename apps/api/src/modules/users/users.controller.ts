import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "List all users with pagination and filters" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "role", required: false, type: String })
  findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string,
    @Query("role") role?: string,
  ) {
    return this.usersService.findAll({ page, limit, search, role });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  findOne(@Param("id") id: string) {
    return this.usersService.findById(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update user profile" })
  update(@Param("id") id: string, @Body() data: Record<string, unknown>) {
    return this.usersService.update(id, data);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft delete a user" })
  remove(@Param("id") id: string) {
    return this.usersService.softDelete(id);
  }
}
