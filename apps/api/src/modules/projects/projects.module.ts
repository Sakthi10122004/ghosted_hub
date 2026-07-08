import { Module } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { ProjectsController } from "./projects.controller";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  controllers: [ProjectsController, TasksController],
  providers: [ProjectsService, TasksService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
