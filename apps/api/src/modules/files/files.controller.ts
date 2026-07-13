import { Controller, Get, UseGuards } from '@nestjs/common';
import { FilesService } from './files.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('files')
@Controller('files')
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all files' })
  findAll() {
    return this.filesService.findAll();
  }
}
