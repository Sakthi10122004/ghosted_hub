import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { UserRole } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.id) {
      throw new ForbiddenException("Access denied — unauthenticated");
    }

    // Fetch user roles from database since Better Auth only provides base user
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { roles: true },
    });

    if (!dbUser || !dbUser.roles) {
      throw new ForbiddenException("Access denied — no roles assigned");
    }

    const userRoles: string[] = dbUser.roles.map((r) => r.role);
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied — requires one of: ${requiredRoles.join(", ")}`,
      );
    }

    return true;
  }
}
