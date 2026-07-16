import { Controller, Get, Post, Body, UseGuards, Param, Delete } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FilesService } from './files.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('projects/files')
@Controller()
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('files')
  @ApiOperation({ summary: 'Get all files across projects' })
  findAllGlobal(@CurrentUser() user?: any) {
    return this.filesService.findAllGlobal(user);
  }

  @Get('projects/:projectId/files')
  @ApiOperation({ summary: 'Get all files for project' })
  findAll(@Param("projectId") projectId: string, @CurrentUser() user?: any) {
    return this.filesService.findAll(projectId, user);
  }

  @Post('files')
  @ApiOperation({ summary: 'Simulate uploading a file globally' })
  createGlobal(@Body() data: any, @CurrentUser() user: any) {
    if (!data.projectId) throw new Error("projectId is required");
    return this.filesService.uploadFile(data.projectId, data, user);
  }

  @Post('projects/:projectId/files')
  @ApiOperation({ summary: 'Simulate uploading a file' })
  create(@Param("projectId") projectId: string, @Body() data: any, @CurrentUser() user: any) {
    return this.filesService.uploadFile(projectId, data, user);
  }

  @Delete('files/:id')
  @ApiOperation({ summary: 'Delete a file' })
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.filesService.deleteFile(id, user);
  }
}
