import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  manage_projects:    { admin: true, organizer: true, student: false },
  submit_reviews:     { admin: true, organizer: true, student: true },
  approve_reviews:    { admin: true, organizer: true, student: false },
  upload_files:       { admin: true, organizer: true, student: true },
  manage_users:       { admin: true, organizer: false, student: false },
  view_deployments:   { admin: true, organizer: false, student: false },
  platform_settings:  { admin: true, organizer: false, student: false },
};

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

  async getPermissions(): Promise<Record<string, Record<string, boolean>>> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'ROLE_PERMISSIONS' },
    });

    if (!setting) {
      return DEFAULT_PERMISSIONS;
    }

    try {
      const stored = JSON.parse(setting.value) as Record<string, Record<string, boolean>>;
      // Merge with defaults to pick up any new permissions added later
      const merged: Record<string, Record<string, boolean>> = {};
      for (const [perm, roles] of Object.entries(DEFAULT_PERMISSIONS)) {
        merged[perm] = {
          admin: true, // Admin always has all permissions
          organizer: stored[perm]?.organizer ?? roles.organizer,
          student: stored[perm]?.student ?? roles.student,
        };
      }
      return merged;
    } catch {
      return DEFAULT_PERMISSIONS;
    }
  }

  async updatePermissions(data: Record<string, Record<string, boolean>>) {
    // Enforce admin always has all permissions
    const sanitized: Record<string, Record<string, boolean>> = {};
    for (const [perm, roles] of Object.entries(data)) {
      sanitized[perm] = {
        admin: true,
        organizer: roles.organizer ?? false,
        student: roles.student ?? false,
      };
    }

    await this.prisma.systemSetting.upsert({
      where: { key: 'ROLE_PERMISSIONS' },
      update: { value: JSON.stringify(sanitized) },
      create: { key: 'ROLE_PERMISSIONS', value: JSON.stringify(sanitized), isSecret: false },
    });

    return { success: true };
  }
}
