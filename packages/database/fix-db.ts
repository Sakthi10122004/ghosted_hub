import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.projectFile.deleteMany({
    where: {
      fileUrl: {
        startsWith: 'blob:http'
      }
    }
  });
  console.log("Deleted old broken blob files.");
}
main().finally(() => prisma.$disconnect());
