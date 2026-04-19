TikTok-style REST API
Project Overview
The project is a RESTful API for a TikTok-like application that I built using Node.js and Express to facilitate backend and frontend interaction for resources such as videos, users, and comments. This project enables CRUD operations, follows MVC (Model-View-Controller) architecture, and uses proper HTTP methods (GET, POST, PUT, DELETE) with appropriate status codes. The API is designed to support features like liking videos, following users, and retrieving video comments. Mock data stored in memory is used instead of a real database.

Technology Stack
Runtime: Node.js

Framework: Express.js

Middleware: CORS (cross-origin resource sharing), Morgan (HTTP request logging), Body-parser (JSON parsing), Dotenv (environment variables)

Development Tool: Nodemon (auto-restart during development)

Testing Tools: Postman, curl

Language: JavaScript

Setup Instructions
Create a new directory and initialize the project

bash
mkdir -p server
cd server
npm init -y
Install required dependencies

bash
npm install express cors morgan body-parser dotenv
npm install --save-dev nodemon
Create the project folder structure

bash
mkdir -p src/controllers src/routes src/models src/middleware src/utils
touch src/app.js src/server.js .env
Configure environment variables – Create a .env file with:

text
PORT=3000
NODE_ENV=development
Set up app.js – Configure Express, middleware, and route mounting.

Create the server entry point (src/server.js or src/index.js) – Load environment variables, import the app, and start listening on the defined port.

Update package.json scripts

json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js"
}
Start the development server

bash
npm run dev
Test the API using Postman or curl at http://localhost:3000

Application Structure
Project Directories (MVC pattern):
src/models/ – Contains in-memory data structures (e.g., index.js with arrays for videos, users, comments, likes, followers)

src/controllers/ – Business logic for handling requests (videoController.js, userController.js, commentController.js)

src/routes/ – Defines API endpoints and links them to controllers (video.js, user.js, comment.js)

src/middleware/ – Custom middleware (if any)

src/utils/ – Utility functions

src/app.js – Express app configuration

src/server.js – Server entry point

Key Files:
models/index.js – Mock data arrays for videos, users, comments, likes, and followers

videoController.js – Functions for video CRUD, getting video comments, likes/unlikes

userController.js – Functions for user CRUD, getting user videos, followers/following

commentController.js – Functions for comment CRUD, liking/unliking comments

Route files – Map HTTP methods and URL paths to controller functions

Key Features Implemented
RESTful API Endpoints:
Videos Resource:

GET /api/videos – Get all videos

GET /api/videos/:id – Get video by ID

POST /api/videos – Create a new video

PUT /api/videos/:id – Update a video

DELETE /api/videos/:id – Delete a video

GET /api/videos/:id/comments – Get comments for a video

GET /api/videos/:id/likes – Get likes for a video

POST /api/videos/:id/likes – Like a video

DELETE /api/videos/:id/likes – Unlike a video

Users Resource:

GET /api/users – Get all users

GET /api/users/:id – Get user by ID

POST /api/users – Create a new user

PUT /api/users/:id – Update a user

DELETE /api/users/:id – Delete a user

GET /api/users/:id/videos – Get videos posted by a user

GET /api/users/:id/followers – Get followers of a user

POST /api/users/:id/followers – Follow a user

DELETE /api/users/:id/followers – Unfollow a user

Comments Resource:

GET /api/comments – Get all comments

GET /api/comments/:id – Get comment by ID

POST /api/comments – Create a new comment

PUT /api/comments/:id – Update a comment

DELETE /api/comments/:id – Delete a comment

POST /api/comments/:id/likes – Like a comment

DELETE /api/comments/:id/likes – Unlike a comment

HTTP Methods and Status Codes:
Appropriate methods (GET, POST, PUT, DELETE) are used for each operation

Status codes such as 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found), and 500 (Internal Server Error) are returned

Middleware Configuration:
CORS – Allows cross-origin requests from frontend applications

Morgan – Logs HTTP request details to the console

Body-parser – Parses incoming JSON request bodies

Dotenv – Manages environment variables

MVC Architecture:
Models – In-memory data structures acting as the data layer

Controllers – Contain business logic for each resource

Routes – Define URL patterns and delegate to controllers

Testing with Postman
The API was tested using Postman with the following endpoints:

Endpoint	Method	Description
http://localhost:3000/api/users	: GET	Retrieve all users
http://localhost:3000/api/videos :	GET	Retrieve all videos
http://localhost:3000/api/users/1 :	GET	Retrieve user with ID 1
http://localhost:3000/api/videos/1 :    GET	Retrieve video with ID 1
http://localhost:3000/api/users/1/videos : GET	Retrieve videos by user ID 1
http://localhost:3000/api/videos/1/comments :	GET	Retrieve comments for video ID 1
All endpoints returned expected JSON responses with correct status codes.

Challenges Encountered and Solutions
During the development of this TikTok-style REST API, I encountered several challenges that I had to work through. One of the main problems was understanding how routes, controllers, and models should relate to each other, especially when trying to set up the MVC architecture from scratch. I overcame this by carefully studying the MVC pattern and ensuring that each layer had a single responsibility: models held data, controllers handled business logic, and routes defined URL mappings. Another difficulty was debugging bugs associated with incorrect routing and endpoints, such as 404 errors or wrong controller functions being called. I resolved these by systematically checking each route definition, ensuring the HTTP methods matched, and using console logging and Postman to isolate the issues. Handling request and response data efficiently also proved challenging, particularly when passing dynamic parameters like IDs to the application. I learned to use req.params correctly and validated input data before processing. Lastly, setting environment variables and making sure the server ran perfectly with nodemon was problematic at first because of incorrect file paths and missing .env loading. I fixed this by ensuring that dotenv.config() was called at the very top of the entry file and that the .env file was placed in the root directory. Through constant testing, reading documentation, and troubleshooting errors, I managed to work past all these issues and gain deeper insight into backend development.

Important Notes
No real database is used; all data is stored in-memory using JavaScript arrays in models/index.js. Data resets when the server restarts.

The API follows RESTful conventions with resource-based URLs and proper HTTP methods.

CORS is enabled to allow the API to be consumed by frontend applications running on different origins.

The server runs on port 3000 by default (configurable via .env).

The MVC architecture makes the code modular, maintainable, and scalable.

All endpoints return JSON responses.

What I Learned
This practical enabled me to gain useful practical skills in designing and developing a RESTful API with Node.js and Express.js. Through this implementation, I comprehended how the backend is designed and how client applications interact with the server via defined APIs. The use of the MVC pattern gave me insight into how to organize code for better separation of concerns. I implemented multiple API endpoints for different resources including users, videos, and comments, using the relevant HTTP methods to perform CRUD operations. I also applied what I learned about configuring different middleware, including CORS, Morgan, and Body-parser. Finally, testing with Postman and curl helped me become better at debugging and validating API responses. This practical has been highly effective in increasing my knowledge about server-side development, RESTful APIs, and application architecture in general.