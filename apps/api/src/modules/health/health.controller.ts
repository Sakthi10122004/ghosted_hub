import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PrismaService } from "../../common/prisma/prisma.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Platform health check" })
  async check() {
    const dbHealthy = await this.prisma
      .$queryRaw`SELECT 1`
      .then(() => true)
      .catch(() => false);

    return {
      status: dbHealthy ? "healthy" : "degraded",
      platform: "Ghosted Hub",
      tagline: "The operating system for the Ghosted program.",
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? "connected" : "disconnected",
      },
    };
  }
}
