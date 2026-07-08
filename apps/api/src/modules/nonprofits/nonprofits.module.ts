import { Module } from "@nestjs/common";
import { NonprofitsService } from "./nonprofits.service";
import { NonprofitsController } from "./nonprofits.controller";

@Module({
  controllers: [NonprofitsController],
  providers: [NonprofitsService],
  exports: [NonprofitsService],
})
export class NonprofitsModule {}
