# Lab Tutorial: Token-Based Authentication in Node.js using JWT

**Course:** Web Development / Backend Systems  
**Prerequisites:** Basic JavaScript, Node.js installed on your machine  
**Tools Needed:** VS Code, Node.js, Thunder Client (VS Code extension) or Postman  
**Estimated Time:** 60–90 minutes

---

## What You Will Learn

- What token-based authentication is and why it's used
- How JWT (JSON Web Token) works
- How to build a Register + Login + Protected Route system in Node.js
- How to test APIs using Thunder Client or Postman

---

## Part 1: Background — How Does Token Auth Work?

### The Old Way: Sessions
In traditional auth, the server **remembers** you by storing your session in its memory. This doesn't scale well when you have millions of users or multiple servers.

### The Modern Way: Tokens (JWT)
Instead of the server remembering you, it gives you a **signed token** after login. You carry that token and show it every time you want to access something private. The server doesn't need to remember anything — it just checks if the token signature is valid.

### The Flow

```
┌─────────┐                          ┌─────────┐
│ Client  │                          │ Server  │
└─────────┘                          └─────────┘
     │                                    │
     │  POST /register (email+password)   │
     │ ─────────────────────────────────► │  Hash password, save user
     │  { message: "Registered!" }        │
     │ ◄───────────────────────────────── │
     │                                    │
     │  POST /login (email+password)      │
     │ ─────────────────────────────────► │  Check password hash
     │  { token: "eyJhbG..." }            │  Sign JWT, send it back
     │ ◄───────────────────────────────── │
     │                                    │
     │  GET /profile                      │
     │  Authorization: Bearer eyJhbG...   │
     │ ─────────────────────────────────► │  Verify token signature
     │  { user: { id, email } }           │  Decode & return data
     │ ◄───────────────────────────────── │
```

### What Is a JWT?

A JWT looks like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIn0.abc123
```

It has **3 parts** separated by dots:

```
HEADER . PAYLOAD . SIGNATURE
```

| Part | Contains | Example (decoded) |
|------|----------|-------------------|
| Header | Algorithm type | `{ "alg": "HS256", "typ": "JWT" }` |
| Payload | Your data | `{ "id": 1, "email": "test@test.com", "exp": ... }` |
| Signature | Proof it wasn't tampered with | Hash of header + payload + secret |

> **Key insight:** The payload is only **base64 encoded**, not encrypted. Anyone can read it. The signature just proves the server created it. **Never put passwords in a JWT.**

---

## Part 2: Project Setup

### Step 1 — Create the Project Folder

Open your terminal in VS Code (`Ctrl + `` ` ``) and run:

```bash
mkdir node-token-auth
cd node-token-auth
```

### Step 2 — Initialize Node.js Project

```bash
npm init -y
```

### Step 3 — Install Dependencies

```bash
npm install express jsonwebtoken bcryptjs dotenv
```

**What each package does:**

| Package | Purpose |
|---------|---------|
| `express` | Creates our HTTP server and routes |
| `jsonwebtoken` | Signs and verifies JWT tokens |
| `bcryptjs` | Hashes passwords so we never store them as plain text |
| `dotenv` | Loads secret keys from a `.env` file |

### Step 4 — Install Thunder Client (if not already installed)

In VS Code, go to the Extensions panel (`Ctrl+Shift+X`) and search for **Thunder Client**. Install it. You'll use it to test your API.

---

## Part 3: Write the Code

Create the following folder structure manually or using the terminal:

```
node-token-auth/
├── server.js
├── .env
├── routes/
│   ├── auth.js
│   └── protected.js
└── middleware/
    └── verifyToken.js
```

```bash
mkdir routes middleware
```

---

### File 1: `.env`

Create a file named `.env` in the root folder and paste:

```
JWT_SECRET=supersecretkey123
PORT=3000
```

> This file holds your secret key. In real projects, **never commit this file to GitHub**. Add `.env` to your `.gitignore`.

---

### File 2: `server.js`

```js
require('dotenv').config();
const express = require('express');

const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');

const app = express();
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/', protectedRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('\nAvailable endpoints:');
  console.log('  POST /auth/register  - Create account');
  console.log('  POST /auth/login     - Login and get token');
  console.log('  GET  /profile        - Protected route (needs token)');
});
```

---

### File 3: `middleware/verifyToken.js`

```js
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  // Token comes in the header as:  Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // grab the part after "Bearer "

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to the request
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = verifyToken;
```

> **How middleware works:** When a request comes in for a protected route, it first passes through `verifyToken`. If the token is valid, `next()` is called and the request continues. If not, we stop it here with an error.

---

### File 4: `routes/auth.js`

```js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// In-memory user store (no database needed for this demo)
const users = [];

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  // Hash the password before storing it (never store plain text!)
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: users.length + 1,
    email,
    password: hashedPassword,
  };
  users.push(newUser);

  res.status(201).json({ message: 'User registered successfully!' });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Find user by email
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  // Compare the provided password with the stored hash
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  // Create a JWT token with user info as the payload
  const token = jwt.sign(
    { id: user.id, email: user.email },  // payload
    process.env.JWT_SECRET,              // secret key
    { expiresIn: '1d' }                  // token expires in 1 day
  );

  res.json({ message: 'Login successful!', token });
});

module.exports = router;
```

---

### File 5: `routes/protected.js`

```js
const express = require('express');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// GET /profile  —  protected: only accessible with a valid token
router.get('/profile', verifyToken, (req, res) => {
  // req.user was set by the verifyToken middleware after decoding the JWT
  res.json({
    message: 'Welcome! You accessed a protected route.',
    user: req.user,
  });
});

module.exports = router;
```

---

## Part 4: Run the Server

In your terminal:

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

Leave this terminal running. Open a new terminal tab for any other commands.

---

## Part 5: Test with Thunder Client (or Postman)

Open Thunder Client from the VS Code sidebar (the lightning bolt icon).

---

### Test 1 — Register a User

| Field | Value |
|-------|-------|
| Method | `POST` |
| URL | `http://localhost:3000/auth/register` |
| Body (JSON) | `{ "email": "student@test.com", "password": "123456" }` |

**Steps in Thunder Client:**
1. Click **New Request**
2. Set method to `POST`
3. Enter the URL
4. Click the **Body** tab → select **JSON**
5. Paste the JSON body
6. Click **Send**

**Expected Response (201):**
```json
{
  "message": "User registered successfully!"
}
```

---

### Test 2 — Login

| Field | Value |
|-------|-------|
| Method | `POST` |
| URL | `http://localhost:3000/auth/login` |
| Body (JSON) | `{ "email": "student@test.com", "password": "123456" }` |

**Expected Response (200):**
```json
{
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> **Important:** Copy the entire token value. You will use it in the next step.

---

### Test 3 — Access Protected Route (with token)

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:3000/profile` |
| Header | `Authorization: Bearer <paste your token here>` |

**Steps in Thunder Client:**
1. Click **New Request**
2. Set method to `GET`
3. Enter the URL
4. Click the **Headers** tab
5. Add a header: Key = `Authorization`, Value = `Bearer eyJhbG...` (your token)
6. Click **Send**

**Expected Response (200):**
```json
{
  "message": "Welcome! You accessed a protected route.",
  "user": {
    "id": 1,
    "email": "student@test.com",
    "iat": 1715000000,
    "exp": 1715086400
  }
}
```

---

### Test 4 — Access Without Token (should fail)

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:3000/profile` |
| Header | *(none)* |

**Expected Response (401):**
```json
{
  "message": "Access denied. No token provided."
}
```

---

### Test 5 — Access With a Fake Token (should fail)

| Field | Value |
|-------|-------|
| Method | `GET` |
| URL | `http://localhost:3000/profile` |
| Header | `Authorization: Bearer thisisafaketoken` |

**Expected Response (403):**
```json
{
  "message": "Invalid or expired token."
}
```

---

## Part 6: Understanding the Results

| HTTP Status | Meaning | When it happens |
|-------------|---------|-----------------|
| `201` | Created | User registered successfully |
| `200` | OK | Login or profile access succeeded |
| `400` | Bad Request | Missing email or password in the body |
| `401` | Unauthorized | Wrong credentials or no token |
| `403` | Forbidden | Token is invalid or expired |
| `409` | Conflict | Email already registered |

### Why 401 vs 403?
- **401** means "I don't know who you are" (not authenticated)
- **403** means "I know who you are, but you're not allowed" (not authorized)

### Why do we hash passwords?

Try printing `users` in your `auth.js` after registering — the password looks like:

```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lLqq
```

Even if someone steals your database, they cannot reverse this to get the original password. bcrypt is a **one-way function**.

---

## Bonus: Decode Your Token

Visit [https://jwt.io](https://jwt.io) in your browser. Paste your token in the **Encoded** box on the left. You will see your payload decoded on the right — notice it shows your `email`, `id`, `iat` (issued at), and `exp` (expiry time).

This proves that the payload is **readable by anyone** — the token is not secret, only the signature is. Sensitive data should never go in a JWT.

---

## Homework Question

**Question:**

Right now, the `/profile` route returns only the data that was put into the JWT at login time (`id` and `email`).

Imagine the user updates their name after logging in. The old token still has the old name — the profile won't reflect the change until the user logs in again.

**Your Task:**

1. Add a `name` field to the register endpoint (accept `name` in the request body alongside `email` and `password` and store it in the user object).
2. Add a `GET /users` route (no token needed) that returns the list of all registered users, showing only their `id`, `email`, and `name` — **not** their password.
3. Test all your changes in Thunder Client and take a screenshot of each working response.

**Hint:** The user list is the `users` array in `routes/auth.js`. Think about how to share it with a new route file, or put the new route in the same file.

**Submit:** Your updated code files + screenshots of the 5 original tests still passing + the 2 new tests (register with name, GET /users).

---

*Good luck! If your server crashes, check the terminal for the error message — Node.js is very descriptive about what went wrong.*