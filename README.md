# Wanderlust

Wanderlust is an Airbnb-inspired CRUD web application built with scalability and production-readiness in mind. It includes features and architecture choices aimed at making the project more robust, efficient, and extensible.

## Features

* Airbnb-style property listing and management
* CRUD operations for core application data
* MVC-style project structure
* Redis caching integration
* Nginx integration for better request handling and deployment flow
* Jest-based testing support
* Cloud and deployment configuration
* usinf testing # Tech Stack

* Node.js
* Express.js
* MongoDB
* Redis
* Nginx
* Jest
* EJS / server-side rendering
* HTML, CSS, JavaScript

## Project Structure

* `controllers/` – request handling logic
* `models/` – database schemas and models
* `routes/` – application routes
* `views/` – UI templates
* `public/` – static assets
* `utils/` – helper functions
* `tests/` – test files
* `uploads/` – uploaded media

## Installation

```bash
git clone https://github.com/priyankparikh-byte/wanderlust-main.git
cd wanderlust-main
npm install
```

## Environment Setup

Create a `.env` file in the root directory and add your environment variables, such as:

```env
PORT=3000
MONGO_URL=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Running the Project

```bash
npm start
```

For development:

```bash
npm run dev
```

## Testing

```bash
npm test
```

## Deployment Notes

This project is prepared with scalability in mind and includes Redis and Nginx integration to support better performance and deployment practices.

## Future Improvements

* Add advanced search and filtering
* Improve authentication and authorization
* Add booking workflow enhancements
* Expand test coverage
* Improve UI responsiveness and accessibility

## License

Add your preferred license here.

