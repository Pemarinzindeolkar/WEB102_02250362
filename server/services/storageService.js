const supabase = require('../lib/supabase');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Generate a unique file name to avoid collisions
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  return `${timestamp}-${randomString}${extension}`;
};

// Upload a file to Supabase Storage
const uploadFile = async (bucketName, filePath, fileData) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileData, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Create a public URL for the file
    const fileUrl = getPublicUrl(bucketName, filePath);

    return { data, fileUrl };
  } catch (error) {
    console.error(`Error uploading file to ${bucketName}:`, error);
    throw error;
  }
};

// Get a public URL for a file
const getPublicUrl = (bucketName, filePath) => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
};

// Remove a file from storage
const removeFile = async (bucketName, filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error removing file from ${bucketName}:`, error);
    throw error;
  }
};

// Upload a local file to Supabase
const uploadLocalFile = async (bucketName, localFilePath, remoteFilePath) => {
      try {
    console.log("DEBUG: called upload local file")
    const fileBuffer = fs.readFileSync(localFilePath);
    console.log("DEBUG: read video into buffer: ", fileBuffer)
          
    console.log(`Attempting to upload to bucket: ${bucketName}, path: ${localFilePath}`);
    
    // Check connection to Supabase
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucketName);
    
    if (bucketError) {
      console.error('Error connecting to bucket:', bucketError);
      throw new Error(`Bucket connection error: ${bucketError.message}`);
    } 

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(remoteFilePath, fileBuffer, {
        contentType: getMimeType(localFilePath),
        cacheControl: '3600',
        upsert: false
      });
    
    console.log("[DEBUG] data after supabase upload:", data)

      if (error) {
          console.log("Error uploading to Supabe")
          console.log("Error:", error)

          console.log('\nthrowing err')
          throw error      
      } else {
          console.log("[DEBUG] Data is: ", data)
    }
    
    // Create a public URL for the file
    const fileUrl = getPublicUrl(bucketName, remoteFilePath);
    console.log("[DEBUG]: Public URL:", fileUrl)

    return { data, fileUrl };
  } catch (error) {
   // Check if the error response is HTML
    if (error.message && error.message.includes('<!DOCTYPE')) {
      console.error('Received HTML response instead of JSON. Likely authentication or service issue.');
      // Log the first 200 characters to see what type of HTML is being returned
      console.error('Error preview:', error.message);
    }
    
    console.error(`Error uploading file to ${bucketName}:`, error);
    throw error;
  }
};

// Get the MIME type based on file extension
const getMimeType = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime'
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
};

module.exports = {
  uploadFile,
  getPublicUrl,
  removeFile,
  uploadLocalFile,
  generateUniqueFileName
};