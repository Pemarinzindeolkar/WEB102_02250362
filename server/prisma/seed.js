const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding process...');

  // Clear existing data if needed (be careful with this in production)
  console.log('Cleaning up existing data...');
  
  await prisma.commentLike.deleteMany({});
  await prisma.videoLike.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.video.deleteMany({});
  await prisma.follow.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned.');
  
  // Create 10 users
  console.log('Creating users...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        username: `user${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        name: `User ${i}`,
        bio: `This is the bio for user ${i}`,
        avatar: `https://i.pravatar.cc/150?u=user${i}@example.com`
      }
    });
    users.push(user);
    console.log(`Created user: ${user.username}`);
  }
  
  // Create 50 videos (5 per user)
  console.log('Creating videos...');
  
  const videos = [];
  for (let userId = 1; userId <= 10; userId++) {
    for (let j = 1; j <= 5; j++) {
      const video = await prisma.video.create({
        data: {
          userId,
          caption: `Video ${j} from user ${userId}`,
          videoUrl: `https://example.com/videos/user${userId}_video${j}.mp4`,
          thumbnailUrl: `https://example.com/thumbnails/user${userId}_video${j}.jpg`,
          audioName: `Original Sound - User ${userId}`,
          views: Math.floor(Math.random() * 10000)
        }
      });
      videos.push(video);
      console.log(`Created video: ${video.id}`);
    }
  }

  // Create 200 comments (roughly 4 per video)
  console.log('Creating comments...');
  
  for (let i = 0; i < 200; i++) {
    const randomVideoIndex = Math.floor(Math.random() * videos.length);
    const randomUserIndex = Math.floor(Math.random() * users.length);
    
    const comment = await prisma.comment.create({
      data: {
        userId: users[randomUserIndex].id,
        videoId: videos[randomVideoIndex].id,
        content: `This is comment ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`
      }
    });
    console.log(`Created comment: ${comment.id}`);
  }

  // Create 300 video likes
  console.log('Creating video likes...');
  
  const videoLikes = [];
  for (let i = 0; i < 300; i++) {
    const randomVideoIndex = Math.floor(Math.random() * videos.length);
    const randomUserIndex = Math.floor(Math.random() * users.length);
    
    const videoId = videos[randomVideoIndex].id;
    const userId = users[randomUserIndex].id;
    
    // Check if this like already exists to avoid unique constraint errors
    const existingLike = videoLikes.find(like => like.userId === userId && like.videoId === videoId);
    
    if (!existingLike) {
      try {
        const like = await prisma.videoLike.create({
          data: {
            userId,
            videoId
          }
        });
        videoLikes.push({ userId, videoId });
        console.log(`Created video like: User ${userId} liked Video ${videoId}`);
      } catch (error) {
        console.log(`Skipping duplicate like: User ${userId} -> Video ${videoId}`);
      }
    }
  }

  // Create 150 comment likes
  console.log('Creating comment likes...');
  
  // First get all comments
  const comments = await prisma.comment.findMany();
  
  for (let i = 0; i < 150; i++) {
    const randomCommentIndex = Math.floor(Math.random() * comments.length);
    const randomUserIndex = Math.floor(Math.random() * users.length);
    
    const commentId = comments[randomCommentIndex].id;
    const userId = users[randomUserIndex].id;
    
    try {
      const like = await prisma.commentLike.create({
        data: {
          userId,
          commentId
        }
      });
      console.log(`Created comment like: User ${userId} liked Comment ${commentId}`);
    } catch (error) {
      console.log(`Skipping duplicate comment like: User ${userId} -> Comment ${commentId}`);
    }
  }

  // Create 40 follows
  console.log('Creating follows...');
  
  for (let i = 0; i < 40; i++) {
    let followerId = Math.floor(Math.random() * 10) + 1;
    let followingId = Math.floor(Math.random() * 10) + 1;
    
    // Avoid self-follows
    while (followerId === followingId) {
      followingId = Math.floor(Math.random() * 10) + 1;
    }
    
    try {
      const follow = await prisma.follow.create({
        data: {
          followerId,
          followingId
        }
      });
      console.log(`Created follow: User ${followerId} follows User ${followingId}`);
    } catch (error) {
      console.log(`Skipping duplicate follow: User ${followerId} -> User ${followingId}`);
    }
  }
  
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });