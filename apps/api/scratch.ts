import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const letters = await prisma.coverLetter.findMany({
      include: {
        job: { select: { title: true, company: true } }
      }
    });
    console.log("Success:", letters.length);
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
