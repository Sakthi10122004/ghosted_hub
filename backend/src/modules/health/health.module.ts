// Health check module — no auth required
import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
