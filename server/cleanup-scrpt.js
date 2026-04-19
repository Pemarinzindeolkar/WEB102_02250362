// cleanup-script.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function cleanupMissingVideos() {
  // Get all videos from database
  const videos = await prisma.video.findMany();
  
  // Check each video and delete if file doesn't exist
  for (const video of videos) {
    const videoPath = path.join(__dirname, video.videoUrl);
    if (!fs.existsSync(videoPath)) {
      console.log(`Deleting video record: ${video.id}, path: ${video.videoUrl}`);
      await prisma.video.delete({ where: { id: video.id } });
    }
  }
  
  console.log('Cleanup complete');
}

cleanupMissingVideos()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());