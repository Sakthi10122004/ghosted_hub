import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import * as nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import { UserRole } from '@prisma/client';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  async getFirstUser() {
    return this.prisma.user.findFirst();
  }

  async createAndSendInvitation(data: { email: string; name: string; role: UserRole }, invitedById: string) {
    const { email, role, name } = data;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      throw new BadRequestException('A user with this email already exists.');
    }

    // Get SMTP settings
    const user = await this.settingsService.getSettingRaw('SMTP_USER');
    const pass = await this.settingsService.getSettingRaw('SMTP_PASSWORD');

    if (!user || !pass) {
      throw new InternalServerErrorException('SMTP configuration is missing. Please configure it in settings.');
    }

    // Generate token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

    // Create invitation in DB
    const invitation = await this.prisma.invitation.create({
      data: {
        email,
        role,
        token,
        expiresAt,
        invitedById,
      },
    });

    // Send email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
      });

      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?invite=${token}&email=${encodeURIComponent(email)}&role=${role}&name=${encodeURIComponent(name)}`;

      await transporter.sendMail({
        from: `"Ghosted Platform" <${user}>`,
        to: email,
        subject: 'You have been invited to join Ghosted!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
            <h2 style="color: #2C2245;">Welcome to Ghosted!</h2>
            <p>Hi ${name},</p>
            <p>You have been invited to join the Ghosted platform as a <strong>${role.replace('_', ' ')}</strong>.</p>
            <p>Click the button below to set up your account and get started:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" style="background-color: #FA8A60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
            </div>
            <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size: 12px; word-break: break-all; color: #818CF8;"><a href="${inviteUrl}">${inviteUrl}</a></p>
            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999;">This invitation will expire in 7 days.</p>
          </div>
        `,
      });

      return { success: true, message: 'Invitation sent successfully.' };
    } catch (error) {
      console.error('Error sending email:', error);
      // Clean up invitation if email fails
      await this.prisma.invitation.delete({ where: { id: invitation.id } });
      throw new InternalServerErrorException('Failed to send invitation email. Please check SMTP configuration.');
    }
  }
}
