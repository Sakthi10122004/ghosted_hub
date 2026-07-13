import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./common/prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { UsersModule } from "./modules/users/users.module";
import { CohortsModule } from "./modules/cohorts/cohorts.module";
import { NonprofitsModule } from "./modules/nonprofits/nonprofits.module";
import { TeamsModule } from "./modules/teams/teams.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ReviewsModule } from './modules/reviews/reviews.module';
import { FilesModule } from './modules/files/files.module';
import { DeploymentsModule } from './modules/deployments/deployments.module';
import { MessagesModule } from './modules/messages/messages.module';
import { SettingsModule } from './modules/settings/settings.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { DeliverablesModule } from './modules/deliverables/deliverables.module';

@Module({
  imports: [
    // Global config — reads .env from monorepo root
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../../.env"],
    }),

    // Core infrastructure
    PrismaModule,

    // Feature modules
    AuthModule,
    HealthModule,
    UsersModule,
    CohortsModule,
    NonprofitsModule,
    TeamsModule,
    ProjectsModule,
    AuditModule,
    ReviewsModule,
    FilesModule,
    DeploymentsModule,
    MessagesModule,
    SettingsModule,
    InvitationsModule,
    DiscoveryModule,
    TasksModule,
    DeliverablesModule,
  ],
})
export class AppModule {}
