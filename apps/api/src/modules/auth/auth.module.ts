import { Global, Module } from '@nestjs/common';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { betterAuth } from 'better-auth';
import { PrismaClient } from '@prisma/client';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:4000/api/auth',
  trustedOrigins: process.env.API_CORS_ORIGIN ? [process.env.API_CORS_ORIGIN] : ['http://localhost:3000'],
  databaseHooks: {
    session: {
      create: {
        after: async (session: any) => {
          try {
            await prisma.auditLog.create({
              data: {
                action: "auth.login",
                entityType: "Session",
                entityId: session.id || "unknown",
                userId: session.userId,
                metadata: { ipAddress: session.ipAddress, userAgent: session.userAgent },
              }
            });
          } catch (err) {
            console.error("Failed to log auth.login", err);
          }
        }
      },
      delete: {
        after: async (session: any) => {
          try {
            await prisma.auditLog.create({
              data: {
                action: "auth.logout",
                entityType: "Session",
                entityId: session.id || "unknown",
                userId: session.userId,
                metadata: {},
              }
            });
          } catch (err) {
            console.error("Failed to log auth.logout", err);
          }
        }
      }
    }
  }
});

@Global()
@Module({
  imports: [
    BetterAuthModule.forRoot({
      auth: auth,
    }),
  ],
  exports: [BetterAuthModule],
})
export class AuthModule {}
