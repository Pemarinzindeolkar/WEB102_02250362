# RESTful API Server with PostgreSQL and Prisma ORM

## Project Overview

In this practical, I transformed the TikTok application into a fully-fledged database by integrating the application with PostgreSQL using Prisma ORM, while also introducing a secure user authentication feature. The purpose was to migrate from in-memory data models to persistent database storage, implement authentication with password encryption, and update the RESTful API endpoints to use the database.

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL (ACID-compliant, open-source relational database) |
| ORM | Prisma ORM |
| Authentication | bcrypt, JSON Web Token (JWT) |
| Middleware | CORS, Morgan, Body-parser |
| Development Tool | Nodemon |
| Testing Tools | Postman |
| Language | JavaScript |

---

## Aim and Objectives

### Aim

To transform the TikTok application into a fully-fledged database by integrating the application with PostgreSQL using Prisma ORM, while also introducing a secure user authentication feature.

### Objectives

- Establish the PostgreSQL database and set up configurations for the TikTok clone application
- Install and set up Prisma ORM
- Generate and migrate a database schema from the current in-memory data schemas
- Implement password hashing using bcrypt and JWT for user authentication
- Make updates on RESTful APIs by making use of Prisma Client in User, Video, and Comment controller modules
- Create a seed file to load sample data into the database
- Testing protected routes and database integration through Postman

---

## Setup Instructions

### Part 1: Setting Up PostgreSQL Database

#### Step 1: Open PostgreSQL Command Line Interface

```bash
sudo -u postgres psql
```

#### Step 2: Create Database

```sql
CREATE DATABASE tiktok_db;
```

#### Step 3: Create User for Application

```sql
CREATE USER tiktok_user WITH ENCRYPTED PASSWORD 'your_password';
```

#### Step 4: Grant Privileges

```sql
GRANT ALL PRIVILEGES ON DATABASE tiktok_db TO tiktok_user;
```

#### Step 5: Exit PostgreSQL

```sql
\q
```

### Part 2: Setting Up Prisma ORM

#### Step 1: Navigate to Server Folder

```bash
cd server
```

#### Step 2: Install Prisma Dependencies

```bash
npm install @prisma/client
npm install prisma --save-dev
```

#### Step 3: Initialize Prisma

```bash
npx prisma init
```

#### Step 4: Configure Environment Variables

Edit the `.env` file with the database connection string:

```env
DATABASE_URL="postgresql://tiktok_user:your_password@localhost:5432/tiktok_db?schema=public"
```

#### Step 5: Define Prisma Schema

Replace the contents of `prisma/schema.prisma` with the TikTok data model schema.

#### Step 6: Install Additional Packages

```bash
npm install bcrypt jsonwebtoken
```

### Part 3: Creating the Database Schema with Prisma

#### Step 1: Run Migration

```bash
npx prisma migrate dev --name init
```

This command:
- Creates SQL migration files in the `prisma/migrations` directory
- Applies the migration to your database
- Generates the Prisma Client

#### Step 2: Create Prisma Client Instance

Create a new file at `src/lib/prisma.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;
```

#### Step 3: Create Authentication Middleware

Create a new file at `src/middleware/auth.js` for JWT verification.

### Part 4: Update Controllers to Use Prisma

I updated `userController.js`, `videoController.js`, and `commentController.js` to replace in-memory operations with Prisma queries, including password hashing and JWT generation.

**Key concepts implemented:**
- Password hashing using bcrypt
- JWT token generation for authentication
- Database queries using Prisma Client
- Complex queries with relationships
- Transactions for operations that affect multiple tables
- Prisma's count and aggregation features

### Part 5: Update Routes and Environment Variables

#### Step 1: Apply Authentication Middleware

I applied the authentication middleware to protected routes.

#### Step 2: Configure Environment Variables

```env
# Server settings
PORT=8000
NODE_ENV=development

# Database settings
DATABASE_URL="postgresql://tiktok_user:your_password@localhost:5432/tiktok_db?schema=public"

# JWT settings
JWT_SECRET=yourverylongandsecurerandomsecret
JWT_EXPIRE=30d
```

---

## API Endpoints Summary

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/users/register` | Register a new user | No |
| POST | `/api/users/login` | Login user | No |
| GET | `/api/users` | Get all users | No |
| GET | `/api/users/:id` | Get user by ID | No |
| GET | `/api/videos` | Get all videos | No |
| GET | `/api/videos/:id` | Get video by ID | No |
| GET | `/api/users/:id/videos` | Get videos by a specific user | No |
| GET | `/api/videos/:id/comments` | Get comments for a specific video | No |
| POST | `/api/videos` | Create a new video | Yes |
| POST | `/api/comments` | Add a comment | Yes |
| POST | `/api/likes` | Like a video or comment | Yes |
| POST | `/api/follows` | Follow a user | Yes |
| PUT | `/api/users/:id` | Update a user | Yes |
| PUT | `/api/videos/:id` | Update a video | Yes |
| DELETE | `/api/users/:id` | Delete a user | Yes |
| DELETE | `/api/videos/:id` | Delete a video | Yes |

---

## Testing Database Integration

### Step 1: Start the Server

```bash
npm run dev
```

**Output:**
```
Server running on port http://localhost:8000 in development mode
```

### Step 2: Test Registration, Login, Like, and Comment

I used Postman to test:
- Registration
- Login
- Like functionality
- Comment functionality

### Step 3: Test Protected Routes

I used the token from login to test protected routes:
- Create a video (protected route)
- Like a video (protected route)
- Post a comment (protected route)

---

## Creating Test Data (Seed Script)

### Step 1: Create a Seed File

I created `prisma/seed.js` with logic to insert:
- 10 users
- 50 videos (5 per user)
- 200 comments
- 300 video likes
- 150 comment likes
- 40 follow relationships

### Step 2: Add Script to package.json

```json
"scripts": {
  "dev": "nodemon src/index.js",
  "start": "node src/index.js",
  "seed": "node prisma/seed.js"
}
```

### Step 3: Run the Seed Script

```bash
npm run seed
```

### Step 4: Retest Using Postman

After running the seed script, I retested using Postman to verify data persistence.

---

## Postman Verification

### Registration Test
- **Endpoint:** `POST /api/users/register`
- **Response:** 200 OK, User created successfully

### Login Test
- **Endpoint:** `POST /api/users/login`
- **Response:** 200 OK with JWT token returned

### Like Video Test
- **Endpoint:** `POST /api/likes`
- **Response:** 200 OK, 69 ms, 280 B Response

```json
{
  "liked": true
}
```

---

## Screenshots

### Server Running
*(Insert screenshot of server running on http://localhost:8000 in development mode)*

### Postman Testing - Registration
*(Insert screenshot of registration test in Postman)*

### Postman Testing - Login
*(Insert screenshot of login test with token response)*

### Postman Testing - Like Video
*(Insert screenshot showing 200 OK and "liked": true response)*

### Postman Testing - Protected Route
*(Insert screenshot of creating a video with Bearer token)*

---

## Key Concepts Learned

### Database Schema Design
- Tables represent entities like users, videos, comments
- Relationships connect tables (one-to-many, many-to-many)
- Foreign Keys maintain data integrity

### Object-Relational Mapping (ORM)
- Maps database tables to programming objects
- Simplifies database operations with type safety
- Reduces boilerplate SQL code
- Handles database migrations

### Authentication and Security
- **Password Hashing:** Never store plain-text passwords (bcrypt with one-way function)
- **JWT Tokens:** Secure, stateless authentication
- **Protected Routes:** Middleware to secure endpoints

### Prisma Specific Features
- **Model Definitions:** Define data structure in schema.prisma
- **Migrations:** Version control for database schema
- **Relationships:** Define connections between models
- **Transactions:** Ensure data consistency across operations

---

## Challenges Faced

During this practical, I encountered several problems:

### Challenge 1: Database Connection Issues
**Issue:** The `DATABASE_URL` in `.env` was not formatted correctly.  
**Solution:** I verified the connection string format: `postgresql://username:password@localhost:5432/database_name?schema=public`

### Challenge 2: Prisma Migration Errors
**Issue:** Migration failed due to existing tables or schema issues.  
**Solution:** I resolved the migration issues by ensuring the `schema.prisma` file correctly defined all models and relationships.

### Challenge 3: Seed Script Module Resolution
**Issue:** There was a problem with running the seed script through `npm run seed` command due to module resolution.  
**Solution:** I had to fix my `seed.js` file as well as set up paths properly in the `package.json` file.

### Challenge 4: JWT Secret Missing
**Issue:** Authentication failed because `JWT_SECRET` was not set in `.env`.  
**Solution:** I added a strong random secret to the `.env` file.

### Challenge 5: Protected Routes Not Working
**Issue:** The authentication middleware was not applied to routes correctly.  
**Solution:** I verified that the `protect` middleware was added to the route definitions for protected endpoints.

These were resolved by checking environment variables, ensuring proper middleware ordering, and fixing module paths for the seed script.

---

## What I Learned

- How to set up PostgreSQL database for a Node.js application
- How to configure and use Prisma ORM with type safety and auto-completion
- How to create and run database migrations
- How to implement authentication with bcrypt (hashing with random salt)
- How to use JWT for stateless authentication
- How to protect routes using middleware
- How to create and run seed scripts for test data
- How to perform complex database queries with Prisma
- How to use transactions for data consistency across multiple tables
- How to test APIs using Postman

---
