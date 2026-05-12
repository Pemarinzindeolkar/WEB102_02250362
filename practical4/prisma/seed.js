const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data (order matters due to foreign keys)
  await prisma.commentLike.deleteMany();
  await prisma.videoLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.video.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data.');

  // Create 10 test users
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        username: `user${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        name: `Test User ${i}`,
        bio: `I am test user number ${i}`,
        avatar: `https://picsum.photos/seed/user${i}/200`,
      },
    });
    users.push(user);
    console.log(`Created user: ${user.username}`);
  }

  // Create follow relationships only (no fake videos)
  const followPairs = new Set();
  let followCount = 0;
  while (followCount < 40) {
    const follower = users[Math.floor(Math.random() * users.length)];
    const following = users[Math.floor(Math.random() * users.length)];
    const key = `${follower.id}-${following.id}`;
    if (follower.id !== following.id && !followPairs.has(key)) {
      followPairs.add(key);
      await prisma.follow.create({
        data: { followerId: follower.id, followingId: following.id },
      });
      followCount++;
    }
  }
  console.log(`Created ${followCount} follow relationships.`);

  console.log('Seed completed successfully!');
  console.log('');
  console.log('Test accounts created:');
  console.log('  Username: user1 to user10');
  console.log('  Password: password123');
  console.log('  Upload real videos through the app after logging in!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });