# RESTful API Server with Supabase Cloud Storage

## Project Overview

In this practical, I extended my TikTok-style RESTful API server by migrating from local file storage to Supabase Cloud Storage. The purpose was to overcome the limitations of local storage — such as disk space constraints, scaling issues, reliability risks, and lack of CDN support — by implementing a scalable, secure, and efficient cloud-based file storage solution for videos and thumbnails.

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Storage Service | Supabase Storage |
| Database | PostgreSQL (via Supabase) |
| ORM | Prisma |
| Middleware | CORS, Morgan, Body-parser |
| Development Tool | Nodemon |
| Testing Tools | curl, Postman |
| Language | JavaScript |

---

## Setup Instructions

### 1. Clone or Download the Project

```bash
cd TikTok_Server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Supabase SDK

```bash
npm install @supabase/supabase-js
```

### 4. Setup Environment Variables

Create a `.env` file and add:

```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_PUBLIC_KEY=your-anon-public-key
SUPABASE_STORAGE_URL=https://your-project-id.supabase.co/storage/v1
```

> You can find these values in your Supabase dashboard under **Settings > API**.

### 5. Update Prisma Schema

Add storage path fields to your `schema.prisma`:

```prisma
model Video {
  id           Int     @id @default(autoincrement())
  title        String
  url          String
  thumbnailUrl String?
  storagePath  String?
  userId       Int
  user         User    @relation(fields: [userId], references: [id])
  likes        Like[]
  comments     Comment[]

  @@map("videos")
}
```

### 6. Run Prisma Migrations

```bash
npx prisma migrate dev --name add_storage_fields
```

### 7. Run the Server

```bash
npx nodemon src/app.js
```

---

## Supabase Storage Configuration

### Step 1: Create Supabase Project

- Log in to supabase.com
- Click **New Project** and name it (e.g., "tiktok")
- Set a strong database password
- Select a region close to your audience

### Step 2: Create Storage Buckets

In the Supabase dashboard:

- Navigate to **Storage**
- Create a public bucket named `videos`
- Create another public bucket named `thumbnails`

### Step 3: Set Storage Policies

**For videos bucket:**
- Upload policy: Authenticated users can upload videos
- View policy: Public users can view videos (anon + authenticated)

**For thumbnails bucket:**
- Same policies as videos bucket

---

## Backend Implementation

### Create Supabase Client

**File:** `src/lib/supabase.js`

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = supabase;
```

### Create Storage Service

**File:** `src/services/storageService.js`

This service handles:
- Uploading videos to Supabase
- Uploading thumbnails
- Deleting files from storage
- Generating public URLs

### Update Video Controller

Modified `createVideo` and `deleteVideo` to:
- Upload files directly to Supabase Storage
- Store file URLs and paths in the database
- Remove local file handling logic

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/videos` | Get all videos |
| GET | `/api/videos/:id` | Get video by ID |
| GET | `/api/users/:id/videos` | Get videos by a specific user |
| GET | `/api/videos/:id/comments` | Get comments for a specific video |
| POST | `/api/users` | Create a new user |
| POST | `/api/videos` | Create a new video (uploads to Supabase) |
| POST | `/api/comments` | Add a comment |
| PUT | `/api/users/:id` | Update a user |
| PUT | `/api/videos/:id` | Update a video |
| DELETE | `/api/users/:id` | Delete a user |
| DELETE | `/api/videos/:id` | Delete a video (removes from Supabase) |

---

## Migration Script for Existing Videos

If you had existing videos stored locally, I created a migration script:

**File:** `scripts/migrateVideosToSupabase.js`

This script:
- Reads local video files from the `uploads/` directory
- Uploads each video to Supabase Storage
- Updates the database with new cloud URLs
- Optionally removes local files after successful migration

### Run the migration

```bash
node scripts/migrateVideosToSupabase.js
```

---

## API Testing

### Upload a Video (via Supabase Direct Upload)

```bash
curl -X POST http://localhost:3000/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Cloud Video",
    "videoUrl": "https://your-project.supabase.co/storage/v1/object/public/videos/video123.mp4",
    "thumbnailUrl": "https://your-project.supabase.co/storage/v1/object/public/thumbnails/thumb123.jpg",
    "userId": 1
  }'
```

### Get All Videos

```bash
curl -X GET http://localhost:3000/api/videos
```

### Delete a Video

```bash
curl -X DELETE http://localhost:3000/api/videos/1
```

---

## Screenshots

### Server Running with Supabase Integration
*(Insert screenshot of server running successfully)*

### Supabase Storage Buckets
*(Insert screenshot of videos and thumbnails buckets in Supabase dashboard)*

### Video Serving via CDN
*(Insert screenshot showing video loaded from Supabase URL)*

---

## Features Implemented

| Feature | Status |
|---------|--------|
| RESTful API structure | ✅ |
| Supabase Storage integration | ✅ |
| Public and private storage buckets | ✅ |
| Storage access policies for security | ✅ |
| Direct file uploads from backend | ✅ |
| CDN-based video delivery | ✅ |
| Database storage of cloud file paths | ✅ |
| Migration script for existing local videos | ✅ |
| CRUD operations for videos with cloud cleanup | ✅ |
| Environment variable configuration | ✅ |
| Error handling for storage operations | ✅ |

---

## Challenges Faced

### Challenge 1: Supabase Client Configuration
**Issue:** Missing or incorrect environment variables caused authentication failures.  
**Solution:** Verified all Supabase credentials in `.env` and ensured the service role key was used for backend operations.

### Challenge 2: Storage Policy Errors
**Issue:** Videos uploaded successfully but could not be viewed publicly.  
**Solution:** Added proper storage policies for SELECT operations targeting `anon` and `authenticated` roles.

### Challenge 3: File Path Mismatches
**Issue:** Supabase returned different URL formats than expected.  
**Solution:** Used the public URL generator from Supabase SDK and stored both the full URL and storage path in the database.

### Challenge 4: Migration Script Failures
**Issue:** Local videos failed to upload during migration due to file size limits.  
**Solution:** Implemented chunked uploads and increased timeout settings for large video files.

### Challenge 5: CORS Issues with Direct Frontend Uploads
**Issue:** Frontend could not upload directly to Supabase due to CORS.  
**Solution:** Configured CORS policies in Supabase dashboard under Storage settings.

These were resolved by debugging storage policies, verifying environment variables, and properly structuring file upload logic.

---

## What I Learned

- How cloud storage differs from local storage for web applications
- How to integrate Supabase Storage with an existing Node.js API
- How to configure storage buckets and access policies
- How to migrate existing local files to cloud storage
- The importance of CDN for video delivery performance
- How to securely manage service role and public API keys
- Best practices for storing and serving user-uploaded content

---

## Conclusion

This practical helped me understand the limitations of local storage and the benefits of migrating to a cloud-based solution like Supabase Storage. I successfully integrated Supabase into my TikTok-style API server, enabling scalable, reliable, and CDN-optimized video storage. The migration script ensured a smooth transition for existing data, and the storage policies provided fine-grained access control. This experience has equipped me with practical skills for handling real-world file storage challenges in backend development.

---

