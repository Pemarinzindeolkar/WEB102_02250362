const multer = require('multer');
const path = require('path');

// Use memory storage for Supabase upload
const storage = multer.memoryStorage();

// File filter to accept only video and image files
const fileFilter = (req, file, cb) => {
  console.log('Uploading file:', file.fieldname, 'MIME:', file.mimetype, 'Name:', file.originalname);
  
  if (file.fieldname === 'video') {
    // List of allowed video MIME types and extensions
    const allowedVideoMimes = [
      'video/mp4', 
      'video/webm', 
      'video/quicktime', 
      'video/x-msvideo',
      'video/mpeg',
      'video/ogg',
      'application/octet-stream'  // Some systems send this for MP4s
    ];
    
    // Check by MIME type or file extension
    const isAllowedMime = allowedVideoMimes.includes(file.mimetype);
    const hasValidExt = /\.(mp4|webm|mov|avi|mpeg|mpg|mkv)$/i.test(file.originalname);
    
    if (isAllowedMime || hasValidExt) {
      // Force correct MIME type for MP4 files
      if (hasValidExt && file.originalname.match(/\.mp4$/i)) {
        file.mimetype = 'video/mp4';
      }
      cb(null, true);
    } else {
      console.log('Rejected video file:', file.mimetype, file.originalname);
      cb(new Error('Only video files are allowed! (MP4, WebM, MOV, AVI, MPEG)'), false);
    }
  } else if (file.fieldname === 'thumbnail') {
    // Accept image files for thumbnails
    const allowedImageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedImageMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails!'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// Create multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

// Middleware for video + thumbnail upload
const uploadVideoWithThumbnail = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

// Middleware for single video upload
const uploadVideoOnly = upload.single('video');

module.exports = { 
  upload, 
  uploadVideoWithThumbnail, 
  uploadVideoOnly 
};
