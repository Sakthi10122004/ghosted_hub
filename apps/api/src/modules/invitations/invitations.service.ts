import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
    private readonly auditService: AuditService
  ) {}

  async getFirstUser() {
    return this.prisma.user.findFirst();
  }

  async getPendingInvitations() {
    const invites = await this.prisma.invitation.findMany({
      where: { accepted: false },
      orderBy: { createdAt: 'desc' }
    });
    return { data: invites };
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
        invitedBy: {
          connect: { id: invitedById }
        }
      },
    });

    await this.auditService.createLog({
      action: "user.invited",
      entityType: "Invitation",
      entityId: invitation.id,
      actorId: invitedById,
      metadata: { email, role },
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

      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite?token=${token}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;
      
      const inviter = await this.prisma.user.findUnique({
        where: { id: invitedById },
        select: { name: true }
      });
      const inviterName = inviter?.name || 'A team member';
      const expiryDate = expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      await transporter.sendMail({
        from: `"Ghosted Platform" <${user}>`,
        to: email,
        subject: 'You have been invited to join Ghosted!',
        html: `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>You're invited to Ghosted</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,500&family=Inter:wght@400;600;700&family=IBM+Plex+Mono:wght@500&display=swap');

  body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { -ms-interpolation-mode:bicubic; border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
  body { margin:0; padding:0; width:100%; background-color:#EDEBE4; }
  .serif { font-family:'Fraunces', Georgia, 'Times New Roman', serif; }
  .sans  { font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  .mono  { font-family:'IBM Plex Mono', 'SFMono-Regular', Consolas, 'Courier New', monospace; }

  @media screen and (max-width:600px){
    .email-container{ width:100% !important; }
    .fluid-padding{ padding-left:20px !important; padding-right:20px !important; }
    .stack{ display:block !important; width:100% !important; text-align:center !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#EDEBE4;">
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#EDEBE4;">
    You've been invited to join a Project on Ghosted — accept to get started with your team.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EDEBE4;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:#F5F3EE; border-radius:16px; overflow:hidden; border:1px solid #E4E1D8;">
          <tr>
            <td class="fluid-padding" style="padding:28px 40px 0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:32px; height:32px; background-color:#0E6B5C; border-radius:8px; text-align:center; vertical-align:middle;" class="sans">
                    <span style="color:#F5F3EE; font-size:15px; font-weight:700; line-height:32px;">G</span>
                  </td>
                  <td style="padding-left:10px; vertical-align:middle;" class="serif">
                    <span style="font-size:17px; font-weight:500; color:#16151A;">Ghosted</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0 40px;">
              <div style="border-top:1px solid #E4E1D8; font-size:1px; line-height:1px;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td class="fluid-padding" style="padding:32px 40px 0 40px;" class="mono">
              <span class="mono" style="font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#6F6D63; font-weight:500;">You're invited</span>
            </td>
          </tr>
          <tr>
            <td class="fluid-padding serif" style="padding:8px 40px 0 40px; font-style:italic; font-weight:500; font-size:28px; line-height:1.3; color:#16151A;">
              Join Ghosted
            </td>
          </tr>
          <tr>
            <td class="fluid-padding sans" style="padding:16px 40px 0 40px; font-size:15px; line-height:1.6; color:#3C3A42;">
              Hi <strong>${name}</strong>,<br><br>
              <strong>${inviterName}</strong> invited you to join Ghosted as a <strong>${role.replace('_', ' ')}</strong>. Once you accept, you'll get access to the platform's projects, files, and teams.
            </td>
          </tr>
          <tr>
            <td class="fluid-padding" style="padding:28px 40px 0 40px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${inviteUrl}" style="height:46px;v-text-anchor:middle;width:220px;" arcsize="18%" strokecolor="#0E6B5C" fillcolor="#0E6B5C">
              <w:anchorlock/>
              <center style="color:#F5F3EE;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Accept Invite</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-- -->
              <a href="${inviteUrl}" target="_blank" class="sans" style="background-color:#0E6B5C; border-radius:9px; color:#F5F3EE; display:inline-block; font-size:14px; font-weight:600; line-height:1; padding:15px 26px; text-decoration:none; mso-hide:all;">
                Accept Invite →
              </a>
              <!--<![endif]-->
            </td>
          </tr>
          <tr>
            <td class="fluid-padding" style="padding:20px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="mono stack" style="font-size:12px; color:#8B8779;">
                    Invite token: <span style="color:#0A4F44; font-weight:500;">${token.substring(0,8)}...</span>
                  </td>
                  <td class="mono stack" align="right" style="font-size:12px; color:#8B8779;">
                    Expires ${expiryDate}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="fluid-padding sans" style="padding:20px 40px 0 40px; font-size:12.5px; line-height:1.6; color:#8B8779;">
              Button not working? Paste this link into your browser:<br>
              <a href="${inviteUrl}" style="color:#0E6B5C; word-break:break-all;">${inviteUrl}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <div style="border-top:1px solid #E4E1D8; font-size:1px; line-height:1px;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td class="fluid-padding sans" style="padding:20px 40px 32px 40px; font-size:12px; line-height:1.6; color:#8B8779;">
              This invite was sent to ${email} by ${inviterName} via Ghosted.
              If you weren't expecting this, you can safely ignore this email — the invite will expire on its own.
              <br><br>
              <span style="color:#B0AC9C;">Ghosted · Program Management Platform</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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

  async acceptInvitation(data: { token: string; password: string; name: string }) {
    const { token, password, name } = data;

    // Find the invitation by token
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new BadRequestException('Invalid invitation token.');
    }

    if (invitation.accepted) {
      throw new BadRequestException('This invitation has already been accepted.');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('This invitation has expired. Please request a new one.');
    }

    // Check if a user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new BadRequestException('An account with this email already exists.');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create the user, account, role assignment, and mark invitation accepted — all in one transaction
    const user = await this.prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          email: invitation.email,
          name: name || 'New User',
          emailVerified: true,
        },
      });

      // Create the credential account (for better-auth)
      await tx.account.create({
        data: {
          userId: newUser.id,
          accountId: newUser.id,
          providerId: 'credential',
          password: passwordHash,
        },
      });

      // Assign the invited role
      await tx.userRoleAssignment.create({
        data: {
          userId: newUser.id,
          role: invitation.role,
        },
      });

      // Mark the invitation as accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { accepted: true },
      });

      return newUser;
    });

    await this.auditService.createLog({
      action: 'user.invite_accepted',
      entityType: 'User',
      entityId: user.id,
      actorId: user.id,
      metadata: { email: invitation.email, role: invitation.role },
    });

    return { success: true, email: user.email };
  }

  async revokeInvitation(id: string) {
    await this.prisma.invitation.delete({
      where: { id }
    });
    return { success: true, message: 'Invitation revoked successfully.' };
  }
}
