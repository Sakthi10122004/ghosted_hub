import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const cycles = await prisma.reviewCycle.findMany();
  console.log(JSON.stringify(cycles, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
