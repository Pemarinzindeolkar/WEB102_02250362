// scripts/cleanup.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Delete fake videos
  const deleted = await prisma.video.deleteMany({
    where: {
      videoUrl: {
        contains: 'example.com'
      }
    }
  });
  console.log(`Deleted ${deleted.count} fake videos`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());