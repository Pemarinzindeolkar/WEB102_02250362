# Social Media REST API

## Project Overview

The project is a RESTful API for a social media application that I built using Node.js and Express to demonstrate proper HTTP methods, structured request-response handling, and resource management for entities such as users, posts, comments, likes, and followers. This project enables developers to interact with the API endpoints using GET, POST, PUT/PATCH, and DELETE methods, with appropriate HTTP status codes and content negotiation using MIME types. Mock data is used to represent the data instead of a real database.

---

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Middleware:** Morgan (logging), CORS (cross-origin resource sharing), Helmet (security headers)
- **Development Tool:** Nodemon (auto-restart during development)
- **Testing Tool:** Postman
- **Language:** JavaScript

---

## Setup Instructions

### 1. Create a new directory for the project

```bash
mkdir social-media-api
cd social-media-api
```

### 2. Initialize the Node.js project

```bash
npm init -y
```

### 3. Install required dependencies

```bash
npm install express morgan cors helmet
```

### 4. Install nodemon as a development dependency

```bash
npm install nodemon --save-dev
```

### 5. Create the basic project structure

```bash
mkdir -p controllers routes middleware config utils
touch server.js .env .gitignore
```

### 6. Set up the .env file

```env
PORT=3000
```

### 7. Configure .gitignore

Add `node_modules`, `.env`, `.DS_Store`

### 8. Start the server

```bash
npm run dev
```

### 9. Test the API

Use Postman at **http://localhost:3000**

---

## Application Structure

### Project Directories:

| Directory | Description |
|-----------|-------------|
| `controllers/` | Contains business logic for handling requests (userController.js, postController.js) |
| `routes/` | Defines API endpoint URLs and links them to controllers (users.js, posts.js) |
| `middleware/` | Custom middleware functions (errorHandler.js, formatResponse.js) |
| `config/` | Configuration files |
| `utils/` | Utility files including mockData.js |
| `public/` | Static files like docs.html |

### Key Files:

| File | Description |
|------|-------------|
| `server.js` | Main server entry point with Express configuration and route mounting |
| `mockData.js` | Contains mock data arrays for users, posts, comments, likes, and followers |
| `errorHandler.js` | Centralized error handling middleware |
| `formatResponse.js` | Middleware to standardize API response format |

---

## Key Features Implemented

### RESTful API Endpoints

#### Users Resource:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Retrieve all users |
| GET | `/api/users/:id` | Retrieve a single user by ID |
| POST | `/api/users` | Create a new user |
| PUT | `/api/users/:id` | Update an existing user |
| DELETE | `/api/users/:id` | Delete a user |

#### Posts Resource:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Retrieve all posts |
| GET | `/api/posts/:id` | Retrieve a single post by ID |
| POST | `/api/posts` | Create a new post |
| PUT | `/api/posts/:id` | Update an existing post |
| DELETE | `/api/posts/:id` | Delete a post |

---

### HTTP Methods and Status Codes

Appropriate methods (GET, POST, PUT, DELETE) are used for each operation.

Status codes returned based on request outcome:

| Status Code | Meaning |
|-------------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |

---

### Content Negotiation

The API supports multiple response formats (JSON by default) using MIME types. The `formatResponse.js` middleware standardizes all API responses.

### Error Handling

Centralized error handling middleware catches and processes errors consistently. Custom error responses include appropriate status codes and descriptive messages.

### Middleware Implementation

- **Morgan** for HTTP request logging
- **CORS** to allow cross-origin requests
- **Helmet** for security headers
- Custom `errorHandler` for consistent error responses
- Custom `formatResponse` for standardized API output

### API Documentation

Static files are served using Express's built-in `express.static()` middleware. Documentation includes a table of all endpoints with their HTTP methods, descriptions, and example requests/responses.

---

## Testing with Postman

The API was thoroughly tested using Postman with the following examples:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `http://localhost:3000/api/users` | GET | Retrieve all users |
| `http://localhost:3000/api/users/1` | GET | Retrieve user with ID 1 |
| `http://localhost:3000/api/users` | POST | Create a new user (send JSON body) |

All endpoints returned the expected responses with correct status codes and formatted JSON data.

---

## Challenges Encountered and Solutions

During the development of this Social Media API, I encountered several challenges.

### Challenge 1: Routes Not Functioning
**Issue:** Some routes were not functioning as expected.  
**Solution:** I carefully reviewed the route definitions and ensured that the correct controller functions were properly bound to each endpoint.

### Challenge 2: Mock Data Persistence
**Issue:** The mock data did not persist across requests.  
**Solution:** Since this practical used an in-memory array for mock data, persistence would require a real database, but for the scope of this project, the mock data was sufficient.

### Challenge 3: Inconsistent Error Handling
**Issue:** Error handling was initially inconsistent across the API.  
**Solution:** I created a centralized `errorHandler.js` middleware and applied it globally in the `server.js` file, ensuring uniform error responses.

### Challenge 4: Understanding HTTP Methods
**Issue:** I had difficulty understanding the proper use of GET, POST, PUT, and DELETE methods.  
**Solution:** I studied HTTP method specifications and implemented each method strictly according to REST principles: GET for retrieval, POST for creation, PUT for full updates, and DELETE for removal.

### Challenge 5: Content Negotiation
**Issue:** Content negotiation proved tricky to implement correctly.  
**Solution:** I solved this by implementing a `formatResponse.js` middleware to standardize the response structure and properly handle `Accept` headers.

---

## Important Notes

- No database is used in this practical; all data is stored in-memory using mock data arrays. Data resets when the server restarts.
- The API uses mock data located in `utils/mockData.js` which contains sample users, posts, comments, likes, and followers.
- CORS is enabled to allow the API to be consumed by frontend applications running on different origins.
- The server runs on port 3000 by default (configurable via `.env` file).
- API documentation is available at `http://localhost:3000/docs.html` after starting the server.
- All responses are formatted consistently using the formatResponse middleware, which wraps data in a standard structure.

---

## What I Learned

This project has been an invaluable learning experience for me. Working on a full-fledged back-end system from scratch was daunting at first, but step by step I understood the workings of a RESTful API and the communication between front-end and back-end systems. I learned:

- How to plan and structure a Node.js/Express project with separation of concerns (controllers, routes, middleware, utils)
- How to implement proper HTTP methods and status codes for different operations
- The importance of error handling and response formatting for a professional API
- How middleware functions work and how to create custom middleware for logging, security, and response formatting
- How to test API endpoints using Postman
- That creating an API is not just writing code; it is a matter of planning, thinking ahead, and thinking from the user's point of view

---

## References

- Express.js Documentation: https://expressjs.com
- Node.js Documentation: https://nodejs.org
- Postman: https://postman.com
- REST API Tutorial: https://restfulapi.net
- HTTP Status Codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
