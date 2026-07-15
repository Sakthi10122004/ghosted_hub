import { Module, Global } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { AuditController } from "./audit.controller";
import { ActivityController } from "./activity.controller";

@Global()
@Module({
  controllers: [AuditController, ActivityController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
