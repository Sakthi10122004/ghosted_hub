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
}
