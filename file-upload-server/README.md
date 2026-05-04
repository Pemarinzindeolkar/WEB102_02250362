# File Upload Server

## Project Overview

The project is a backend file upload server that I built using Node.js, Express.js, and Multer to create secure and efficient RESTful API endpoints for handling file upload operations. This project enables users to upload files through a frontend application, with server-side validation including file type checking (JPEG, PNG, PDF only), file size limitation (maximum 5MB), unique filename generation to prevent conflicts, and proper error handling. The server stores uploaded files locally and serves them as static content, with CORS configured to allow communication between the frontend (port 3000) and backend (port 8000).

---

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **File Upload Middleware:** Multer
- **Middleware:** CORS (cross-origin resource sharing), Morgan (HTTP request logging), Dotenv (environment variables)
- **Language:** JavaScript

---

## Setup Instructions

### 1. Create the backend server directory

```bash
mkdir file-upload-server
cd file-upload-server
```

### 2. Initialize the Node.js project

```bash
npm init -y
```

### 3. Install required dependencies

```bash
npm install express cors multer morgan dotenv
```

### 4. Create the basic server structure

```bash
touch server.js
mkdir uploads
mkdir middleware
touch middleware/upload.js
touch .env
```

### 5. Configure the .env file

```env
PORT=8000
FRONTEND_URL=http://localhost:3000
```

### 6. Start the server

```bash
node server.js
```

### 7. Test the API

Send a POST request to **http://localhost:8000/api/upload** with a file field named `file`

---

## Application Structure

### Project Directories and Files:

| File/Directory | Description |
|----------------|-------------|
| `server.js` | Main server entry point with Express configuration, middleware setup, and API route definition |
| `middleware/upload.js` | Multer configuration for storage, file filtering, and size limits |
| `uploads/` | Directory where uploaded files are stored locally |
| `.env` | Environment variables for port and frontend URL |

---

## Key Configuration in upload.js

### Storage Configuration:
- **Destination:** `uploads/` directory
- **Filename:** Unique name using timestamp prefix (`Date.now() + originalname`) to prevent conflicts

### File Filter:
- **Allowed MIME types:** `image/jpeg`, `image/png`, `application/pdf`
- Rejects other file types with an error message

### Size Limit:
- **Maximum file size:** 5MB (5 × 1024 × 1024 bytes)

---

## Key Features Implemented

### File Upload Endpoint
**POST /api/upload**

- Accepts a single file with field name `file`
- Uses `upload.single('file')` middleware from Multer
- Returns success response with file metadata including:
  - `message` – Success confirmation
  - `filename` – Generated unique filename
  - `originalName` – Original file name from user
  - `mimetype` – File MIME type
  - `size` – File size in bytes
  - `url` – Access URL (`/uploads/filename`)

### Error Handling Middleware
Specialized error handling catches Multer-specific errors:

| Error | Status | Message |
|-------|--------|---------|
| `LIMIT_FILE_SIZE` | 413 | "File too large. Maximum size is 5MB." |
| Other Multer errors | 400 | Error message from Multer |
| General server errors | 500 | Internal server error |

### CORS Configuration
CORS is configured to allow communication between frontend and backend:

- Origin set from environment variable (`FRONTEND_URL` defaults to `http://localhost:3000`)
- Allowed methods: `GET`, `POST`
- Allowed headers: `Content-Type`

### Static File Serving
Express serves static files from the uploads directory using:

```javascript
app.use('/uploads', express.static('uploads'))
```

This allows uploaded files to be accessed via URLs like `http://localhost:8000/uploads/filename.jpg`

---

## Testing Results

| File Type | Result |
|-----------|--------|
| JPEG images | Uploaded successfully ✅ |
| PNG images | Uploaded successfully ✅ |
| PDF files | Uploaded successfully ✅ |
| Files larger than 5MB | Rejected with error message ❌ |
| Invalid file types (.exe, .txt) | Rejected by file filter ❌ |

---

## Challenges Encountered and Solutions

During the development of this file upload server, I faced several challenges that I had to work through.

### Challenge 1: Multer Storage Path Configuration
**Issue:** Files were not being uploaded to the proper directory due to incorrectly configured paths.  
**Solution:** I resolved this by carefully setting the destination path in the disk storage configuration and ensuring the uploads directory existed before the server started.

### Challenge 2: File Type Validation
**Issue:** Initially, the file filter did not prevent unwanted file types from being uploaded.  
**Solution:** I fixed this by implementing a proper `fileFilter` function that checks the mimetype of incoming files and only allows `image/jpeg`, `image/png`, and `application/pdf`, while rejecting others with a clear error message.

### Challenge 3: Handling Multer-Specific Errors
**Issue:** Multer errors like `LIMIT_FILE_SIZE` were not being caught properly.  
**Solution:** I created a dedicated error-handling middleware that checks the error instance and returns appropriate HTTP status codes (413 for file too large).

### Challenge 4: CORS Configuration
**Issue:** The frontend running on port 3000 could not communicate with the backend on port 8000.  
**Solution:** I configured CORS by setting the origin option to read from the `.env` file, allowing cross-origin requests from the frontend.

Through debugging and systematic testing, I managed to overcome all these difficulties and develop a reliable back-end file upload system.

---

## Important Notes

- The server stores uploaded files locally in the `uploads` directory. Ensure this directory exists before starting the server.
- File names are prefixed with a timestamp (`Date.now()`) to prevent duplicate filename conflicts.
- Only JPEG, PNG, and PDF files up to 5MB are accepted. All other file types and sizes are rejected with meaningful error messages.
- CORS is configured to allow requests only from `http://localhost:3000` by default (configurable via `.env`).
- The frontend application (Next.js) must be running on port 3000 to test the complete system.
- Uploaded files are served statically and can be accessed via `/uploads/filename` URLs.

---

## What I Learned

In this project, I successfully created a backend file upload feature using Node.js and Express.js by implementing an endpoint at `/api/upload`. I learned how to:

- Use Multer middleware to process `multipart/form-data` requests
- Save uploaded files to a specific directory
- Rename files to ensure no duplicates override one another
- Implement server-side file validation to allow only specific file types (JPEG, PNG, and PDF)
- Enforce a 5MB size limit on file uploads
- Configure CORS for cross-origin communication
- Create specialized error-handling middleware for Multer errors
- Serve static files using Express

Despite the difficulties involved, debugging and testing enabled me to develop a reliable back-end system. This project helped me learn more about managing files on the server side, configuring middleware, and implementing secure file uploads using Node.js.

