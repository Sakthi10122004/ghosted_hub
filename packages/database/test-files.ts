import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const files = await prisma.projectFile.findMany({ select: { name: true, fileUrl: true } });
  console.log(files);
}
main().finally(() => prisma.$disconnect());
