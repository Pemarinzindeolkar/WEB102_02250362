 // scripts/migrateVideosToSupabase.js
 require('dotenv').config();
 const { PrismaClient } = require('@prisma/client');
 const path = require('path');
 const fs = require('fs');
 const storageService = require('../src/services/storageService');
 const { response } = require('express');

 const prisma = new PrismaClient();
 const UPLOADS_DIR = path.join(__dirname, '../src/uploads');

 async function migrateVideosToSupabase() {
   try {
     console.log('Starting migration of videos to Supabase Storage...');
     
     // Get all videos from the database
     const videos = await prisma.video.findMany();
     console.log(`Found ${videos.length} videos to migrate.`);
     
     for (const video of videos) {
       console.log(`Processing video ID: ${video.id}...`);
       
       // Extract local file paths from URLs
       let videoPath = video.videoUrl;
       let thumbnailPath = video.thumbnailUrl;
       
       // Remove URL prefix if it's a local path
       if (videoPath && videoPath.startsWith('/uploads/')) {
         videoPath = path.join(UPLOADS_DIR, videoPath.replace('/uploads/', ''));
       }
       
       if (thumbnailPath && thumbnailPath.startsWith('/uploads/')) {
         thumbnailPath = path.join(UPLOADS_DIR, thumbnailPath.replace('/uploads/', ''));
       }
       
       // Upload video to Supabase if file exists locally
       let newVideoUrl = video.videoUrl;
       let videoStoragePath = null;

       console.log("[DEBUG] videopath:", videoPath)
       console.log("[DEBUG] fs.existsSync:", fs.existsSync(videoPath))
       console.log('======\n')

       
       if (videoPath && fs.existsSync(videoPath)) {
         const fileName = path.basename(videoPath);
         const remotePath = `user-${video.id}/${fileName}`;
         
         console.log(`Uploading video to Supabase: ${remotePath}`);
         
         const { fileUrl } = await storageService.uploadLocalFile(
           'videos',
           videoPath,
           remotePath
         );
         
         newVideoUrl = fileUrl;
         videoStoragePath = remotePath;
         console.log(`Video uploaded successfully. New URL: ${newVideoUrl}`);
       } else {
         console.log(`Video file not found locally: ${videoPath}`);
       }
       
       // Upload thumbnail to Supabase if file exists locally
       let newThumbnailUrl = video.thumbnailUrl;
       let thumbnailStoragePath = null;
       
       if (thumbnailPath && fs.existsSync(thumbnailPath)) {
         const fileName = path.basename(thumbnailPath);
         const remotePath = `user-${video.userId}/${fileName}`;
         
         console.log(`Uploading thumbnail to Supabase: ${remotePath}`);
         
         const { fileUrl } = await storageService.uploadLocalFile(
           'thumbnails',
           thumbnailPath,
           remotePath
         );

         console.log("[DEBUG]: fileURL", fileUrl)
         
         newThumbnailUrl = fileUrl;
         thumbnailStoragePath = remotePath;
         console.log(`Thumbnail uploaded successfully. New URL: ${newThumbnailUrl}`);
       } else if (thumbnailPath) {
         console.log(`Thumbnail file not found locally: ${thumbnailPath}`);
       }
       
       // Update video record with new URLs and storage paths
       response_prisma = await prisma.video.update({
         where: { id: video.id },
         data: {
           videoUrl: newVideoUrl,
           thumbnailUrl: newThumbnailUrl,
           videoStoragePath,
           thumbnailStoragePath,
         },
       });
       console.log("[DEBUG] response from prisma update", response_prisma)
       console.log(`Updated database record for video ID: ${video.id}`);
     }
     
     console.log('Migration completed successfully.');
   } catch (error) {
     console.error('Error during migration:', error);
   } finally {
     await prisma.$disconnect();
   }
 }

 migrateVideosToSupabase()
   .catch(error => {
     console.error('Migration failed:', error);
     process.exit(1);
   });