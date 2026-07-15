import { Module } from "@nestjs/common";
import { SettingsModule } from "../settings/settings.module";
import { ProjectsService } from "./projects.service";
import { ProjectsController } from "./projects.controller";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule, SettingsModule],
  controllers: [ProjectsController, TasksController],
  providers: [ProjectsService, TasksService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
