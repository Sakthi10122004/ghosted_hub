import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const reviews = await prisma.review.findMany({
      include: {
        project: { select: { id: true, name: true } },
        cycles: { orderBy: { reviewedAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' },
    });
  console.log(JSON.stringify(reviews, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
