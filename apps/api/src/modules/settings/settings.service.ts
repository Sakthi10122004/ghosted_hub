import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.systemSetting.findMany();
    // Return masked settings to frontend so passwords are not exposed
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.isSecret && setting.value ? '********' : setting.value;
      return acc;
    }, {} as Record<string, string>);
  }

  async getSettingRaw(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    return setting?.value || null;
  }

  async updateSettings(data: Record<string, string>) {
    const operations = Object.entries(data).map(async ([key, value]) => {
      // Don't update secret fields if they are sent back as masked
      if (value === '********') return;
      
      const isSecret = key.toLowerCase().includes('password') || key.toLowerCase().includes('secret');
      
      await this.prisma.systemSetting.upsert({
        where: { key },
        update: { value, isSecret },
        create: { key, value, isSecret },
      });
    });

    await Promise.all(operations);
    return { success: true };
  }
}
