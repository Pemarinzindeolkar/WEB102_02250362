const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding process...');

  // Clear existing data in correct order (respecting foreign keys)
  console.log('Cleaning up existing data...');
  
  await prisma.comment.deleteMany({});
  await prisma.like.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.video.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned.');
  
  // Create users
  console.log('Creating users...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = [];
  
  // Create first user (pema/deolkar)
  const user1 = await prisma.user.create({
    data: {
      username: 'prdeolkar',
      email: 'deolkar@gmail.com',
      password: hashedPassword,
      avatar: null
    }
  });
  users.push(user1);
  console.log(`Created user: ${user1.username}`);
  
  // Create second user (test user with your token)
  const user2 = await prisma.user.create({
    data: {
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      avatar: null
    }
  });
  users.push(user2);
  console.log(`Created user: ${user2.username}`);
  
  // Create 8 more users
  for (let i = 3; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        username: `user${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        avatar: `https://i.pravatar.cc/150?u=user${i}`
      }
    });
    users.push(user);
    console.log(`Created user: ${user.username}`);
  }
  
  // Create videos
  console.log('Creating videos...');
  
  const videos = [];
  
  // Add your existing videos
  const video1 = await prisma.video.create({
    data: {
      title: 'Who knows - Daniel #music #life #fun',
      url: '/uploads/videos/1776753933765-979360774.mp4',
      userId: user1.id
    }
  });
  videos.push(video1);
  
  const video2 = await prisma.video.create({
    data: {
      title: 'Daniel',
      url: '/uploads/videos/1776755061621-929038363.mp4',
      userId: user1.id
    }
  });
  videos.push(video2);
  
  // Create additional videos
  for (let i = 1; i <= 10; i++) {
    for (let j = 1; j <= 3; j++) {
      const video = await prisma.video.create({
        data: {
          title: `Video ${j} from ${users[i-1].username}`,
          url: `/uploads/videos/sample-video-${i}-${j}.mp4`,
          userId: users[i-1].id
        }
      });
      videos.push(video);
      console.log(`Created video: ${video.id} - ${video.title}`);
    }
  }

  // Create comments
  console.log('Creating comments...');
  
  const commentTexts = [
    'Great video! 🔥',
    'Awesome content!',
    'Thanks for sharing!',
    'This is amazing!',
    'Keep up the good work!',
    'Love this! ❤️',
    'So creative!',
    'Best video ever!',
    'Really enjoyed this!',
    'Fantastic! 👏'
  ];
  
  for (let i = 0; i < 100; i++) {
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomText = commentTexts[Math.floor(Math.random() * commentTexts.length)];
    
    const comment = await prisma.comment.create({
      data: {
        content: randomText,
        userId: randomUser.id,
        videoId: randomVideo.id
      }
    });
    console.log(`Created comment: ${comment.id}`);
  }

  // Create likes
  console.log('Creating likes...');
  
  const likeCombinations = new Set();
  
  for (let i = 0; i < 200; i++) {
    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const key = `${randomUser.id}-${randomVideo.id}`;
    
    if (!likeCombinations.has(key)) {
      likeCombinations.add(key);
      try {
        await prisma.like.create({
          data: {
            userId: randomUser.id,
            videoId: randomVideo.id
          }
        });
        console.log(`Created like: User ${randomUser.id} -> Video ${randomVideo.id}`);
      } catch (error) {
        // Skip duplicates
      }
    }
  }

  // Create follows
  console.log('Creating follows...');
  
  const followCombinations = new Set();
  
  for (let i = 0; i < 50; i++) {
    let followerId = users[Math.floor(Math.random() * users.length)].id;
    let followingId = users[Math.floor(Math.random() * users.length)].id;
    
    // Avoid self-follows
    while (followerId === followingId) {
      followingId = users[Math.floor(Math.random() * users.length)].id;
    }
    
    const key = `${followerId}-${followingId}`;
    
    if (!followCombinations.has(key)) {
      followCombinations.add(key);
      try {
        await prisma.follow.create({
          data: {
            followerId,
            followingId
          }
        });
        console.log(`Created follow: ${followerId} -> ${followingId}`);
      } catch (error) {
        // Skip duplicates
      }
    }
  }
  
  console.log('Seeding completed successfully!');
  console.log(`Created ${await prisma.user.count()} users`);
  console.log(`Created ${await prisma.video.count()} videos`);
  console.log(`Created ${await prisma.comment.count()} comments`);
  console.log(`Created ${await prisma.like.count()} likes`);
  console.log(`Created ${await prisma.follow.count()} follows`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });