import { Module } from "@nestjs/common";
import { DeliverablesController } from "./deliverables.controller";
import { DeliverablesService } from "./deliverables.service";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [DeliverablesController],
  providers: [DeliverablesService],
  exports: [DeliverablesService],
})
export class DeliverablesModule {}
