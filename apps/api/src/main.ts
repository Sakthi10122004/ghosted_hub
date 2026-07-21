// ─────────────────────────────────────────────────────────────────
// Ghosted Hub — API Entry Point
// ─────────────────────────────────────────────────────────────────

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug"],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT") || configService.get<number>("API_PORT", 4000);
  const corsOrigin = configService.get<string>(
    "API_CORS_ORIGIN",
    "http://localhost:3000",
  );

  // ── Security ───────────────────────────────────────────────
  app.use(helmet());
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // ── Global Prefix ──────────────────────────────────────────
  app.setGlobalPrefix("api/v1", {
    exclude: ["health"],
  });

  // ── Validation ─────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Exception Filter ──────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Swagger / OpenAPI ──────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Ghosted Hub API")
    .setDescription(
      "The operating system for the Ghosted program — REST API Documentation",
    )
    .setVersion("0.1.0")
    .addBearerAuth()
    .addTag("auth", "Authentication & session management")
    .addTag("users", "User profile management")
    .addTag("cohorts", "Cohort lifecycle management")
    .addTag("nonprofits", "Nonprofit organization management")
    .addTag("students", "Student profile management")
    .addTag("teams", "Team management")
    .addTag("projects", "Project lifecycle management")
    .addTag("tasks", "Task / Kanban management")
    .addTag("reviews", "Review cycle management")
    .addTag("deliverables", "Deliverable versioning")
    .addTag("health", "Health checks")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "none",
      filter: true,
    },
  });

  await app.listen(port);
  console.log(`\n🚀 Ghosted Hub API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs\n`);
}

bootstrap();
