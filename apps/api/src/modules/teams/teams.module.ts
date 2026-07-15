import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { TeamsService } from "./teams.service";
import { TeamsController } from "./teams.controller";

@Module({
  imports: [AuditModule],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
