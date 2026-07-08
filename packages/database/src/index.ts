// ─────────────────────────────────────────────────────────────────
// Ghosted Hub — Prisma Client Re-export
// ─────────────────────────────────────────────────────────────────
// All apps import the Prisma client from this package:
//   import { prisma, PrismaClient } from "@ghosted/database";
// ─────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

export * from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
