import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all system settings' })
  async getSettings() {
    const data = await this.settingsService.getSettings();
    return { data };
  }

  @Patch()
  @ApiOperation({ summary: 'Update system settings' })
  async updateSettings(@Body() body: Record<string, string>) {
    await this.settingsService.updateSettings(body);
    return { success: true };
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get role permissions matrix' })
  async getPermissions() {
    const data = await this.settingsService.getPermissions();
    return { data };
  }

  @Patch('permissions')
  @ApiOperation({ summary: 'Update role permissions matrix' })
  async updatePermissions(@Body() body: Record<string, Record<string, boolean>>) {
    await this.settingsService.updatePermissions(body);
    return { success: true };
  }
}
