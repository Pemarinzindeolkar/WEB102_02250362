Documentation
In this practical, I developed a RESTful API server using Node.js and Express. The main concept I applied was the structure of a RESTful API, where different HTTP methods such as GET, POST, PUT, and DELETE are used to perform operations on resources like users, videos, and comments.

In addition, I used a modular structure for the project, breaking it down into various components such as routes, controllers, and models. The routes were used for defining API routes, while the controllers were used for implementing business logic for every API call. The models were used as an in-memory database, enabling me to simulate a database without actually using one.

In addition, I used middleware concepts such as logging, parsing JSON data, and CORS support. I also used error handling for scenarios such as data not being available, IDs being invalid, and server errors. Finally, I used environment variables via a file named .env for server port and development mode configuration.

Another concept I used was the relationship between different resources. For instance, users can own videos, and videos can have comments and likes. I used IDs for linking data in various models.

Reflection
Through this practical, I learned how a backend server works and how APIs are structured and implemented. I gained a clear understanding of how HTTP requests and responses function, and how different methods are used to perform CRUD operations.
One of the biggest things that I learned was how to structure a project correctly. Separating my routes, controllers, and models made my code much more readable and easier to understand. I also learned how to effectively test my APIs using tools like curl and Postman, which helped me understand whether my endpoints were functioning correctly or not.

There were a number of challenges that I faced during this practical. One of my biggest challenges was how to handle errors such as missing modules, wrong file paths, and server connection errors. For example, there were instances when the server would not find my controller files or when I tried to run the wrong entry file. These errors taught me the importance of having a proper structure in my projects.

Another challenge that I faced was trying to understand why my server was not responding when using curl. I learned that my server should always be running in one terminal while testing in another. There were also instances when I had to deal with errors concerning my environment variables and template literals in my JavaScript code.

<img src="curl_issue.png" alt="Description of the image">
