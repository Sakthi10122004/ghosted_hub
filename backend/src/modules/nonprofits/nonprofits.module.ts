import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { NonprofitsService } from "./nonprofits.service";
import { NonprofitsController } from "./nonprofits.controller";

@Module({
  imports: [AuditModule],
  controllers: [NonprofitsController],
  providers: [NonprofitsService],
  exports: [NonprofitsService],
})
export class NonprofitsModule {}
