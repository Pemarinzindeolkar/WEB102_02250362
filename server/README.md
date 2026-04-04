RESTful API Server – Practical README
In this practical, I built a RESTful API server using Node.js and Express. The purpose of this project was to understand how backend systems work by creating APIs that handle users, videos, and comments. I implemented CRUD operations and tested the endpoints using tools like curl and Postman.

Setup Instructions
1. Clone or Download the Project
I first ensured that the project folder was available on my system.

2. Navigate to Server Folder
cd server

3. Install Dependencies
npm install

4. Setup Environment Variables
I created a .env file and added:
PORT=3000
NODE_ENV=development

5. Run the Server
npx nodemon src/app.js
If nodemon was not installed:
npm install nodemon --save-dev

6. Confirm Server is Running

I verified the server by checking this output:
Server running on http://localhost:3000 in development mode
API Testing

I tested the API using curl

Get All Users
curl -X GET http://localhost:3000/api/users
Get All Videos
curl -X GET http://localhost:3000/api/videos
Get User by ID
curl -X GET http://localhost:3000/api/users/1
Get Video by ID
curl -X GET http://localhost:3000/api/videos/1
Get User Videos
curl -X GET http://localhost:3000/api/users/1/videos
Get Video Comments
curl -X GET http://localhost:3000/api/videos/1/comments

Screenshots 
Server Running


Features Implemented
RESTful API structure
CRUD operations:
Users
Videos
Comments
Like and follow
In-memory database
Error handling
Middleware: CORS, Logging, Parsing

Challenges Faced
During this practical, I encountered several problems:
Module not found errors due to missing controller files
Inaccurate file paths and structure
Server not running due to incorrect entry file (index.js instead of app.js)
Curl not working when the server was not running
Environment variables and template literals problems

These were resolved by ensuring accuracy in file structure, debugging the code, and ensuring the server was running before executing the code.


What I Learned
How RESTful APIs Work
How to Structure a Backend Project
How to Handle HTTP Requests and Responses
How to Debug Server-Side Errors
How to Test APIs Using curl and Postman

Conclusion
The practical has helped me gain a better understanding of backend development. I have been able to create a fully functional API server. I have also been able to debug real-world problems. This has helped me gain a deeper understanding of server-side programming and has equipped me with the skills I need to handle more advanced programming tasks.

