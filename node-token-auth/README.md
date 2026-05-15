# Token-Based Authentication Lab with JWT

A complete implementation of JWT (JSON Web Token) authentication in Node.js, built as part of a web development lab.



## Overview

This project demonstrates **token-based authentication** using JSON Web Tokens (JWT). Unlike traditional session-based authentication, token-based auth is stateless, making it ideal for:

- Scalable applications (multiple servers)
- Mobile apps
- Microservices architectures
- Single Page Applications (SPAs)

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework for REST APIs |
| **JSON Web Token (JWT)** | Token generation & verification |
| **bcryptjs** | Password hashing (one-way encryption) |
| **dotenv** | Environment variable management |
| **Thunder Client** | API testing (VS Code extension) |

---

## Installation & Setup

### 1. Navigate

```bash
cd node-token-auth
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
JWT_SECRET=supersecretkey123
PORT=3000
```

>  **Security Note:** Never commit `.env` to GitHub. Add it to `.gitignore`.

### 4. Start the Server

```bash
node server.js
```

You should see:

```
Server running on http://localhost:3000

Available endpoints:
  POST /auth/register  - Create account
  POST /auth/login     - Login and get token
  GET  /profile        - Protected route (needs token)
```

---

## API Endpoints

### Public Routes (No Token Required)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/auth/register` | Create new user | `{ "email", "password", "name" }` |
| POST | `/auth/login` | Authenticate & get token | `{ "email", "password" }` |
| GET | `/auth/users` | List all registered users | None |

### Protected Routes (Token Required)

| Method | Endpoint | Description | Header |
|--------|----------|-------------|--------|
| GET | `/profile` | Get current user info | `Authorization: Bearer <token>` |

---

## Testing the API

### Using Thunder Client (VS Code Extension)

#### Test 1: Register a New User

```
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "deolakr@test.com",
  "password": "123456",
  "name": "Pema R Deolkar"
}
```

**Expected Response (201 Created):**

```json
{
  "message": "User registered successfully!"
}
```

#### Test 2: Login

```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "deolakr@test.com",
  "password": "123456"
}
```

**Expected Response (200 OK):**

```json
{
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

>  **My token** — eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzdHVkZW50QHRlc3QuY29tIiwiaWF0IjoxNzc4ODI1NTg5LCJleHAiOjE3Nzg5MTE5ODl9.GhQFkvJzn80VvX2DtqDxiwco_t9iJZjQddAVJnQ2yf0

#### Test 3: Access Protected Route (With Token)

```
GET http://localhost:3000/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzdHVkZW50QHRlc3QuY29tIiwiaWF0IjoxNzc4ODI1NTg5LCJleHAiOjE3Nzg5MTE5ODl9.GhQFkvJzn80VvX2DtqDxiwco_t9iJZjQddAVJnQ2yf0
```

**Expected Response (200 OK):**

```json
{
  "message": "Welcome! You accessed a protected route.",
  "user": {
    "id": 1,
    "email": "deolakr@test.com",
    "name": "Pema R Deolkar",
    "iat": 1715000000,
    "exp": 1715086400
  }
}
```

#### Test 4: Access Protected Route (Without Token)

```
GET http://localhost:3000/profile
(No Authorization header)
```

**Expected Response (401 Unauthorized):**

```json
{
  "message": "Access denied. No token provided."
}
```

#### Test 5: Access Protected Route (Invalid Token)

```
GET http://localhost:3000/profile
Authorization: Bearer fake.token.here
```

**Expected Response (403 Forbidden):**

```json
{
  "message": "Invalid or expired token."
}
```

#### Test 6: Get All Users

```
GET http://localhost:3000/auth/users
```

**Expected Response (200 OK):**

```json
[
  {
    "id": 1,
    "email": "deolakr@test.com",
    "name": "Pema R Deolkar"
  }
]
```


---

## Test Results

### All Tests Passed 

| Test | Endpoint | Status | Response |
|------|----------|--------|----------|
| Register | POST `/auth/register` |  201 | `{ message: "User registered successfully!" }` |
| Login | POST `/auth/login` |  200 | Returns valid JWT token |
| Profile (with token) | GET `/profile` |  200 | Returns user info from token |
| Profile (no token) | GET `/profile` |  401 | `{ message: "Access denied..." }` |
| Profile (invalid token) | GET `/profile` |  403 | `{ message: "Invalid or expired token." }` |
| Get all users | GET `/auth/users` |  200 | Returns users array (no passwords) |

### Sample User Data Used

```json
{
  "email": "deolakr@test.com",
  "password": "123456",
  "name": "Pema R Deolkar"
}
```

---

## How JWT Works

A JWT looks like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzdHVkZW50QHRlc3QuY29tIiwiaWF0IjoxNzc4ODI1NTg5LCJleHAiOjE3Nzg5MTE5ODl9.GhQFkvJzn80VvX2DtqDxiwco_t9iJZjQddAVJnQ2yf0
```

### Structure 

| Part | Name | Contains | Example (decoded) |
|------|------|----------|-------------------|
| 1 | Header | Algorithm & token type | `{ "alg": "HS256", "typ": "JWT" }` |
| 2 | Payload | Your data (user info) | `{ "id": 1, "email": "deolakr@test.com", "name": "Pema R Deolkar", "exp": 1715086400 }` |
| 3 | Signature | Proof of authenticity | `HMACSHA256(header + payload, secret)` |

> **Important Security Notes:**
> - The payload is **base64 encoded, NOT encrypted**
> - Anyone can decode and read the payload
> - **Never put sensitive data (passwords, credit cards) in a JWT**
> - The signature proves the token was issued by YOUR server
> - Always use **HTTPS** in production to prevent token interception



---

## Key Security Concepts

### Password Hashing with bcrypt

**Plain text password (never store):**
```
123456
```

**After bcrypt hashing (store this):**
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lLqq
```

**Why bcrypt?**
- One-way function (cannot be reversed)
- Built-in salt prevents rainbow table attacks
- Adaptive algorithm (can be made slower as computers get faster)

### Environment Variables

```env
JWT_SECRET=supersecretkey123
```

- This secret signs all your JWTs
- If compromised, an attacker can forge tokens
- In production, use a long, random string (e.g., from `crypto.randomBytes(64)`)

---

## Running the Project

```bash
# Install dependencies
npm install

# Start the server
node server.js

# For development with auto-restart (install nodemon first)
npm install -g nodemon
nodemon server.js
```
---


