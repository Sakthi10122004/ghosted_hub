import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const notifs = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log(JSON.stringify(notifs, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
