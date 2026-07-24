import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@thallesp/nestjs-better-auth';
import { InvitationsService } from './invitations.service';
import { UserRole } from '@prisma/client';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Get all pending invitations' })
  async getPendingInvitations() {
    return this.invitationsService.getPendingInvitations();
  }

  @Post()
  @ApiOperation({ summary: 'Send an invitation to a new user' })
  async createInvitation(@Body() body: { email: string; name: string; role: string }) {
    // For MVP, find any user to act as the inviter to satisfy foreign key constraints.
    // In production, we'd extract this from JWT.
    const inviter = await this.invitationsService.getFirstUser();
    const hardcodedAdminId = inviter?.id || 'admin-placeholder-id';
    
    // Map string role to UserRole enum
    const roleMapping: Record<string, UserRole> = {
      admin: UserRole.SUPER_ADMIN,
      event_manager: UserRole.ORGANIZER,
      student: UserRole.STUDENT,
      npo: UserRole.NONPROFIT_REP,
    };
    
    const role = roleMapping[body.role] || UserRole.STUDENT;
    
    return this.invitationsService.createAndSendInvitation(
      { email: body.email, name: body.name, role },
      hardcodedAdminId
    );
  }

  @Public()
  @Post('accept')
  @ApiOperation({ summary: 'Accept an invitation and set a password' })
  async acceptInvitation(@Body() body: { token: string; password: string; name: string }) {
    return this.invitationsService.acceptInvitation({
      token: body.token,
      password: body.password,
      name: body.name,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke an invitation' })
  async revokeInvitation(@Param('id') id: string) {
    return this.invitationsService.revokeInvitation(id);
  }
}
