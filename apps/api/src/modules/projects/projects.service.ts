import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import type { Prisma, ProjectStatus } from "@prisma/client";
import { SettingsService } from "../settings/settings.service";
import * as nodemailer from "nodemailer";

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly settingsService: SettingsService
  ) {}

  /** Create a project — typically called by the pairing engine */
  async create(data: {
    name: string;
    cohortId: string;
    nonprofitId: string;
    teamId?: string;
    description?: string;
  }) {
    const project = await this.prisma.project.create({
      data: {
        ...data,
        // Auto-create discovery workspace
        discovery: { create: {} },
      },
      include: { cohort: true, nonprofit: true, team: true },
    });

    // Record in timeline
    await this.prisma.timelineEvent.create({
      data: {
        projectId: project.id,
        title: "Project Created",
        description: `Project "${project.name}" was created and linked to ${project.nonprofit.name}.`,
      },
    });

    await this.auditService.createLog({
      action: 'project.create',
      entityType: 'Project',
      entityId: project.id,
      metadata: { name: project.name, cohortId: project.cohortId }
    });

    return project;
  }

  async findAll(params: {
    page?: number; limit?: number; cohortId?: string;
    status?: string; search?: string;
  }, user?: any) {
    const { page = 1, limit = 20, cohortId, status, search } = params;
    const skip = (page - 1) * limit;

    let isStudent = false;
    let isNpoRep = false;
    let npoIds: string[] = [];

    if (user?.id) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { roles: true, nonprofitRep: true }
      });
      isStudent = dbUser?.roles?.some(r => r.role === "STUDENT") || false;
      isNpoRep = dbUser?.roles?.some(r => r.role === "NONPROFIT_REP") || false;
      if (isNpoRep && dbUser?.nonprofitRep) {
        npoIds = dbUser.nonprofitRep.map(n => n.nonprofitId);
      }
    }

    const accessOr: Prisma.ProjectWhereInput[] = [];
    if (isStudent && user?.id) accessOr.push({ team: { members: { some: { userId: user.id } } } });
    if (isNpoRep && npoIds.length > 0) accessOr.push({ nonprofitId: { in: npoIds } });

    const searchOr: Prisma.ProjectWhereInput[] = search ? [
      { name: { contains: search, mode: "insensitive" } },
      { nonprofit: { name: { contains: search, mode: "insensitive" } } },
    ] : [];

    const where: Prisma.ProjectWhereInput = {
      deletedAt: null,
      ...(cohortId && { cohortId }),
      ...(status && { status: status as ProjectStatus }),
      ...(accessOr.length > 0 && { OR: accessOr }),
    };

    if (searchOr.length > 0) {
      where.AND = [{ OR: searchOr }];
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: {
          cohort: { select: { id: true, name: true } },
          team: { 
            select: { 
              id: true, 
              name: true,
              members: {
                include: {
                  user: { select: { id: true, name: true, avatarUrl: true } }
                }
              }
            } 
          },
          nonprofit: { select: { id: true, name: true, logoUrl: true } },
          _count: {
            select: {
              tasks: true, reviews: true, deliverables: true,
              files: true, messages: true, meetings: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { data: projects, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, user?: any) {
    let isStudent = false;
    let isNpoRep = false;
    let npoIds: string[] = [];

    if (user?.id) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { roles: true, nonprofitRep: true }
      });
      isStudent = dbUser?.roles?.some(r => r.role === "STUDENT") || false;
      isNpoRep = dbUser?.roles?.some(r => r.role === "NONPROFIT_REP") || false;
      if (isNpoRep && dbUser?.nonprofitRep) {
        npoIds = dbUser.nonprofitRep.map(n => n.nonprofitId);
      }
    }

    const accessOr: Prisma.ProjectWhereInput[] = [];
    if (isStudent && user?.id) accessOr.push({ team: { members: { some: { userId: user.id } } } });
    if (isNpoRep && npoIds.length > 0) accessOr.push({ nonprofitId: { in: npoIds } });

    const where: Prisma.ProjectWhereInput = { 
      id, 
      deletedAt: null,
      ...(accessOr.length > 0 && { OR: accessOr }),
    };

    const project = await this.prisma.project.findFirst({
      where,
      include: {
        cohort: { select: { id: true, name: true, status: true } },
        team: {
          include: {
            members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
          },
        },
        nonprofit: true,
        discovery: true,
        deployment: true,
        milestones: { orderBy: { dueDate: "asc" } },
        _count: {
          select: { tasks: true, reviews: true, deliverables: true, files: true, messages: true },
        },
      },
    });
    if (!project) throw new NotFoundException("Project not found");
    return project;
  }

  async update(id: string, data: Prisma.ProjectUpdateInput) {
    const existingProject = await this.findById(id); // Access check happens here if we passed user, but updates are admin only via roles guard usually
    const updated = await this.prisma.project.update({ where: { id }, data });

    if (updated.teamId && updated.teamId !== existingProject.teamId) {
      this.sendMappingEmails(id).catch(err => console.error("Failed to send mapping emails:", err));
    }

    return updated;
  }

  async updateStatus(id: string, status: ProjectStatus) {
    const project = await this.findById(id); // Admin only action
    const updated = await this.prisma.project.update({
      where: { id }, data: { status },
    });
    await this.prisma.timelineEvent.create({
      data: {
        projectId: id,
        title: "Status Changed",
        description: `Project status changed from ${project.status} to ${status}.`,
        metadata: { from: project.status, to: status },
      },
    });

    await this.auditService.createLog({
      action: 'project.status_change',
      entityType: 'Project',
      entityId: id,
      metadata: { from: project.status, to: status }
    });

    return updated;
  }

  async remove(id: string) {
    await this.findById(id); 
    const deleted = await this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.auditService.createLog({
      action: 'project.delete',
      entityType: 'Project',
      entityId: id,
      metadata: { name: deleted.name }
    });

    return { success: true, message: "Project deleted successfully" };
  }

  /** Get project timeline */
  async getTimeline(projectId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.timelineEvent.findMany({
        where: { projectId }, skip, take: limit, orderBy: { occurredAt: "desc" },
      }),
      this.prisma.timelineEvent.count({ where: { projectId } }),
    ]);

    return { data: events, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  private async sendMappingEmails(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          include: {
            members: { include: { user: true } }
          }
        },
        nonprofit: {
          include: {
            contacts: { include: { user: true } }
          }
        }
      }
    });

    if (!project || !project.team || !project.nonprofit) return;

    const user = await this.settingsService.getSettingRaw("SMTP_USER");
    const pass = await this.settingsService.getSettingRaw("SMTP_PASSWORD");

    if (!user || !pass) {
      console.warn("SMTP configuration missing. Skipping mapping emails.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    // Collect all emails
    const studentEmails = project.team.members.map(m => m.user.email).filter(Boolean);
    const npoEmails = project.nonprofit.contacts.map(c => c.user.email).filter(Boolean);

    // Send to students
    if (studentEmails.length > 0) {
      await transporter.sendMail({
        from: `"Ghosted Platform" <${user}>`,
        to: studentEmails.join(","),
        subject: "You've been mapped to a Nonprofit Project!",
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Great news!</h2>
            <p>Your team <strong>${project.team.name}</strong> has been assigned to a project for <strong>${project.nonprofit.name}</strong>.</p>
            <p>Log in to Ghosted to view the project details and say hello to your new nonprofit partner.</p>
          </div>
        `
      });
    }

    // Send to NPOs
    if (npoEmails.length > 0) {
      await transporter.sendMail({
        from: `"Ghosted Platform" <${user}>`,
        to: npoEmails.join(","),
        subject: "A Student Team has been mapped to your Project!",
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Great news!</h2>
            <p>The student team <strong>${project.team.name}</strong> has been mapped to your project <strong>${project.name}</strong>.</p>
            <p>Log in to Ghosted to meet your new student group and collaborate on the project.</p>
          </div>
        `
      });
    }
  }
}
