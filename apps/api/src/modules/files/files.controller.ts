import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FilesService } from './files.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('projects/files')
@Controller()
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('projects/:projectId/files')
  @ApiOperation({ summary: 'Get all files for project' })
  findAll(@Param("projectId") projectId: string, @CurrentUser() user?: any) {
    return this.filesService.findAll(projectId, user);
  }

  @Post('projects/:projectId/files')
  @ApiOperation({ summary: 'Simulate uploading a file' })
  create(@Param("projectId") projectId: string, @Body() data: any, @CurrentUser() user: any) {
    return this.filesService.uploadFile(projectId, data, user);
  }
}
