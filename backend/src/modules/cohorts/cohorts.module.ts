import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { CohortsService } from "./cohorts.service";
import { CohortsController } from "./cohorts.controller";

@Module({
  imports: [AuditModule],
  controllers: [CohortsController],
  providers: [CohortsService],
  exports: [CohortsService],
})
export class CohortsModule {}
