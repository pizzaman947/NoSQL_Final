# PC Store Management System

A comprehensive e-commerce platform for managing and selling computer hardware products. Built with Node.js, Express, and MongoDB, this application provides both customer-facing catalog functionality and administrative tools for inventory and order management.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [User Interface](#user-interface)
- [Security](#security)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment Considerations](#deployment-considerations)
- [Future Enhancements](#future-enhancements)
- [License](#license)

## Overview

The PC Store Management System is a full-stack web application designed to streamline the process of selling computer hardware online. It addresses the needs of both customers and administrators through distinct interfaces. Customers can browse products, filter by category, view detailed specifications, read and submit reviews, and place orders. Administrators have access to advanced features including inventory management, order processing, and revenue analytics.

The application leverages MongoDB's document-oriented structure to efficiently handle complex product specifications and nested review data. Authentication and authorization are implemented using JSON Web Tokens, ensuring secure access to protected resources.

## Features

### Customer Features

**Product Browsing and Filtering**
- View complete product catalog with pagination-ready structure
- Filter products by category (Gaming, Office)
- Sort products by price in descending order
- Real-time stock availability display

**Product Details and Reviews**
- Comprehensive product specifications (CPU, GPU, RAM, SSD)
- User-generated reviews with ratings and comments
- Submit product reviews (authenticated users only)
- Review submission timestamps

**Order Management**
- Single-click order placement
- Automatic stock decrement upon order
- Order confirmation feedback
- Authenticated user order tracking

### Administrative Features

**Inventory Management**
- Add new products with complete specifications
- Delete products from inventory
- View current stock levels
- Category-based product organization

**Order Processing**
- View all customer orders with details
- Update order status (Processing, Shipped, Delivered)
- View customer information per order
- Chronological order listing

**Analytics and Reporting**
- Revenue aggregation by product category
- Real-time statistics dashboard
- Order volume tracking
- Customer purchase patterns

### Authentication and Security

- User registration with encrypted passwords
- Secure login system with JWT tokens
- Role-based access control (customer, admin)
- Protected API endpoints
- Token-based session management

## Technology Stack

**Backend**
- Node.js - JavaScript runtime environment
- Express.js 5.2.1 - Web application framework
- MongoDB - NoSQL document database
- Mongoose 9.1.5 - MongoDB object modeling

**Security and Authentication**
- JSON Web Tokens (jsonwebtoken 9.0.3) - Token-based authentication
- bcryptjs 3.0.3 - Password hashing and verification
- CORS 2.8.6 - Cross-origin resource sharing

**Frontend**
- Vanilla JavaScript - Client-side logic
- Bootstrap 5.3.0 - UI framework and components
- HTML5 - Markup structure
- CSS3 - Styling (via Bootstrap)

**Development Tools**
- dotenv 17.2.3 - Environment variable management
- npm - Package management

## Architecture

The application follows a classic three-tier architecture:

### Presentation Layer
The frontend is built with vanilla JavaScript and Bootstrap, providing a responsive single-page application experience. Navigation between different views (catalog, login, register, admin panel) is handled client-side without full page reloads. The UI communicates with the backend exclusively through RESTful API calls.

### Application Layer
Express.js handles HTTP requests and implements business logic. Middleware functions manage authentication and authorization. Routes are organized by resource type (auth, products, orders, stats). The server validates incoming data, processes requests, and returns appropriate responses.

### Data Layer
MongoDB stores all application data in three primary collections: products, users, and orders. Mongoose provides schema validation, type casting, and query building capabilities. The database uses indexing strategies to optimize query performance for common access patterns.

### Request Flow

1. Client initiates request from browser
2. Express server receives and routes request
3. Authentication middleware validates JWT token (if required)
4. Authorization middleware checks user role (if required)
5. Route handler processes business logic
6. Mongoose interacts with MongoDB
7. Response sent back to client
8. Client updates UI based on response

## Database Schema

### Product Collection

The Product schema represents computer hardware items available for sale.

```javascript
{
  model_name: String (required),
  category: String (indexed),
  price: Number (required),
  stock: Number (default: 0),
  specs: {
    cpu: String,
    gpu: String,
    ram: String,
    ssd: String
  },
  reviews: [{
    user: String,
    rating: Number,
    comment: String,
    date: Date (default: Date.now)
  }]
}
```

**Indexes**
- Single field index on `category` for filtered queries
- Compound index on `category` (ascending) and `price` (descending) for optimized category browsing with price sorting

**Design Rationale**
- Embedded `specs` object allows flexible specification storage without rigid schema constraints
- Embedded `reviews` array provides efficient read operations as reviews are always fetched with products
- Review denormalization is acceptable as review updates are infrequent

### User Collection

The User schema manages authentication and authorization.

```javascript
{
  full_name: String,
  email: String (unique, required),
  password: String (required, hashed),
  role: String (default: 'customer')
}
```

**Constraints**
- Unique constraint on `email` prevents duplicate accounts
- Passwords are hashed using bcrypt with salt rounds before storage

**Security Considerations**
- Passwords never transmitted or stored in plain text
- Email uniqueness enforced at database level
- Role field enables extensible authorization system

### Order Collection

The Order schema tracks customer purchases and order lifecycle.

```javascript
{
  order_date: Date (default: Date.now),
  status: String (default: 'Processing'),
  total_amount: Number,
  customer_id: ObjectId (ref: 'User'),
  items: [{
    product_id: ObjectId (ref: 'Product'),
    quantity: Number
  }]
}
```

**Relationships**
- `customer_id` references User collection (one-to-many relationship)
- `product_id` in items array references Product collection
- Population used to fetch related user and product data efficiently

**Status Values**
- Processing - Initial state when order is created
- Shipped - Order has been dispatched
- Delivered - Order successfully completed

## Installation

### Prerequisites

Ensure the following software is installed on your system:

- Node.js (version 14.x or higher)
- npm (version 6.x or higher)
- MongoDB (version 4.x or higher) or MongoDB Atlas account
- Git (for cloning repository)

### Step-by-Step Installation

**Clone the Repository**

```bash
git clone <repository-url>
cd NoSQL_Final
```

**Install Dependencies**

```bash
npm install
```

This will install all required packages:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- path

**Database Setup**

Option A: Local MongoDB Installation
```bash
# Start MongoDB service
mongod --dbpath /path/to/data/directory
```

Option B: MongoDB Atlas (Cloud)
1. Create account at mongodb.com/atlas
2. Create new cluster
3. Configure network access (whitelist IP)
4. Create database user
5. Get connection string

**Environment Configuration**

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/pcstore
JWT_SECRET=your_secure_random_secret_key_here
PORT=3000
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pcstore
JWT_SECRET=your_secure_random_secret_key_here
PORT=3000
```

**Start the Application**

```bash
npm start
```

The server will start on the configured port (default: 3000).

**Access the Application**

Open your browser and navigate to:
```
http://localhost:3000
```

## Configuration

### Environment Variables

**MONGODB_URI**
- Description: MongoDB connection string
- Format: `mongodb://host:port/database` or Atlas URI
- Example: `mongodb://localhost:27017/pcstore`
- Required: Yes

**JWT_SECRET**
- Description: Secret key for signing JWT tokens
- Format: String (minimum 32 characters recommended)
- Example: `a8f5f167f44f4964e6c998dee827110c`
- Required: Yes
- Security: Never commit this value to version control

**PORT**
- Description: Server port number
- Format: Integer
- Example: `3000`
- Required: Yes
- Default: None (must be explicitly set)

### Database Connection Options

The application connects to MongoDB using Mongoose with default options. For production environments, consider adding connection options:

```javascript
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### CORS Configuration

Currently configured to allow all origins. For production, restrict to specific domains:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

## API Documentation

### Authentication Endpoints

**Register New User**

```http
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Product Endpoints

**Get All Products**

```http
GET /api/products
```

Optional query parameter:
- `cat` - Filter by category (e.g., `?cat=Gaming`)

Response:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "model_name": "Gaming PC Pro",
    "category": "Gaming",
    "price": 250000,
    "stock": 15,
    "specs": {
      "cpu": "Intel i9-13900K",
      "gpu": "RTX 4080",
      "ram": "32GB DDR5",
      "ssd": "1TB NVMe"
    },
    "reviews": []
  }
]
```

**Create Product (Admin Only)**

```http
POST /api/products
Content-Type: application/json
x-auth-token: <jwt-token>

{
  "model_name": "Gaming PC Pro",
  "category": "Gaming",
  "price": 250000,
  "stock": 15,
  "specs": {
    "cpu": "Intel i9-13900K",
    "gpu": "RTX 4080",
    "ram": "32GB DDR5",
    "ssd": "1TB NVMe"
  }
}
```

**Delete Product (Admin Only)**

```http
DELETE /api/products/:id
x-auth-token: <jwt-token>
```

**Add Product Review (Authenticated)**

```http
PUT /api/products/:id/review
Content-Type: application/json
x-auth-token: <jwt-token>

{
  "rating": 5,
  "comment": "Excellent performance!"
}
```

### Order Endpoints

**Create Order (Authenticated)**

```http
POST /api/orders
Content-Type: application/json
x-auth-token: <jwt-token>

{
  "total_amount": 250000,
  "items": [
    {
      "product_id": "507f1f77bcf86cd799439011",
      "quantity": 1
    }
  ]
}
```

**Get All Orders (Admin Only)**

```http
GET /api/orders
x-auth-token: <jwt-token>
```

Response includes populated customer and product details.

**Update Order Status (Admin Only)**

```http
PUT /api/orders/:id
Content-Type: application/json
x-auth-token: <jwt-token>

{
  "status": "Shipped"
}
```

### Analytics Endpoints

**Get Revenue Statistics (Admin Only)**

```http
GET /api/stats/revenue
x-auth-token: <jwt-token>
```

Response:
```json
[
  {
    "_id": "Gaming",
    "total": 1500000
  },
  {
    "_id": "Office",
    "total": 800000
  }
]
```

### Error Responses

The API returns standard HTTP status codes:

- `200` - Success
- `400` - Bad request (validation error, invalid credentials)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `500` - Internal server error

Error response format:
```json
"Error message string"
```

## User Interface

### Navigation

The application uses a single-page architecture with client-side routing. The navigation bar adapts based on authentication status and user role.

**Unauthenticated Users**
- Catalog (default view)
- Register button
- Login button

**Authenticated Customers**
- Catalog
- Logout button

**Authenticated Administrators**
- Catalog
- Admin Panel
- Logout button

### Catalog Page

The main shopping interface displays products in a responsive grid layout.

**Features**
- Category filter dropdown (All Categories, Gaming, Office)
- Product cards with model name, price, and stock quantity
- Details button (opens modal with full specifications and reviews)
- Order button (places order for authenticated users)

**Product Details Modal**
- Complete technical specifications
- User reviews with ratings and comments
- Review submission form (authenticated users only)
- Rating input (1-5 scale)
- Comment textarea

### Authentication Pages

**Register Page**
- Full name input field
- Email input field
- Password input field
- Sign Up button

**Login Page**
- Email input field
- Password input field
- Sign In button

Both pages use centered card layout for focused user experience.

### Admin Dashboard

Comprehensive management interface divided into sections.

**Statistics Panel**
- Revenue breakdown by category
- Real-time data updates
- Formatted currency display (KZT)

**Add Product Form**
- Model name input
- Category dropdown selector
- Price input (numeric)
- Stock quantity input
- Specification fields (CPU, GPU, RAM, SSD)
- Save Product button

**Inventory Table**
- Columns: Model, Price, Stock, Action
- Delete button per product
- Compact display for many items

**Orders Management Table**
- Columns: Date, Customer, Product, Status, Action
- Customer name display (populated from User collection)
- Product names display (multiple items shown)
- Status badge with visual indication
- Status update dropdown (Processing, Shipped, Delivered)
- Chronological sorting (newest first)

## Security

### Authentication Implementation

**Password Security**
- Passwords hashed using bcrypt with auto-generated salt
- Salt rounds: 10 (default bcrypt configuration)
- Plain text passwords never stored or logged
- Password comparison uses constant-time algorithm

**JWT Token Structure**
- Payload contains: user ID, role, and full name
- Signed with secret key from environment variable
- No expiration set (consider adding for production)
- Token stored in browser localStorage

**Token Transmission**
- Sent via custom header: `x-auth-token`
- Not included in URL parameters
- HTTPS recommended for production transmission

### Authorization System

**Middleware Functions**

1. Authentication Middleware (`auth`)
   - Validates JWT token presence
   - Verifies token signature
   - Extracts user information
   - Attaches user object to request

2. Admin Authorization Middleware (`isAdmin`)
   - Checks user role from token payload
   - Requires `role: 'admin'`
   - Returns 403 Forbidden if non-admin

**Protected Routes**
- Product creation: Admin only
- Product deletion: Admin only
- Order viewing (all): Admin only
- Order status update: Admin only
- Revenue statistics: Admin only
- Review submission: Authenticated users
- Order placement: Authenticated users

### Vulnerability Considerations

**Current Implementation**
- No rate limiting (vulnerable to brute force)
- No token expiration (compromised tokens valid indefinitely)
- No password strength requirements
- No CSRF protection
- No input sanitization for XSS prevention
- CORS allows all origins

**Production Recommendations**
1. Implement token expiration and refresh mechanism
2. Add rate limiting middleware (express-rate-limit)
3. Enforce password complexity requirements
4. Sanitize user inputs (express-validator)
5. Restrict CORS to specific domains
6. Use HTTPS in production
7. Implement CSRF tokens for state-changing operations
8. Add security headers (helmet middleware)
9. Implement account lockout after failed login attempts
10. Add logging and monitoring for security events

## Usage Guide

### Customer Workflow

**Getting Started**
1. Open application in browser
2. Click Register button
3. Enter full name, email, and password
4. Click Sign Up
5. Automatic redirect to catalog

**Browsing Products**
1. View all products on catalog page
2. Use category filter to narrow selection
3. Click Details button to view specifications
4. Read existing customer reviews
5. Close modal or continue shopping

**Placing an Order**
1. Ensure logged in (Login required alert if not)
2. Find desired product in catalog
3. Click Order button
4. Confirmation alert displays
5. Stock automatically decrements
6. Order appears in admin order management

**Submitting a Review**
1. Open product details modal
2. Scroll to review section
3. Enter rating (1-5)
4. Write comment
5. Click Post button
6. Review immediately visible on product

### Administrator Workflow

**Accessing Admin Panel**
1. Login with admin role account
2. Admin Panel button appears in navigation
3. Click to open dashboard

**Adding Products**
1. Navigate to Admin Panel
2. Locate Add New Product form
3. Enter model name
4. Select category from dropdown
5. Input price and stock quantity
6. Fill specification fields (CPU, GPU, RAM, SSD)
7. Click Save Product
8. Product appears in inventory table

**Managing Inventory**
1. View inventory table in Admin Panel
2. Locate product to remove
3. Click X button in Action column
4. Product immediately removed from database
5. Customers can no longer view or order item

**Processing Orders**
1. View Orders Management table
2. Review order details (date, customer, items)
3. Locate status dropdown in Action column
4. Select new status (Shipped or Delivered)
5. Status updates immediately
6. Customer sees updated status

**Viewing Analytics**
1. Statistics display at top of Admin Panel
2. Revenue shown per category
3. Updates automatically when viewing page
4. Use data to inform inventory decisions

### Creating First Admin User

The application does not include automatic admin user creation. Manually create an admin user:

**Method 1: Database Direct Insert**
```javascript
// Connect to MongoDB directly
use pcstore;

// Insert admin user with hashed password
db.users.insertOne({
  full_name: "Admin User",
  email: "admin@pcstore.com",
  password: "$2a$10$...", // Generate using bcrypt
  role: "admin"
});
```

**Method 2: Register and Update**
1. Register normal user through application
2. Connect to database
3. Update user role:
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
);
```

## Project Structure

```
NoSQL_Final/
├── models/
│   └── schemas.js          # Mongoose schema definitions
├── public/
│   ├── index.html          # Single-page application markup
│   └── script.js           # Client-side JavaScript logic
├── .env                    # Environment configuration (not tracked)
├── package.json            # Project dependencies and scripts
├── README.md               # Project documentation
└── server.js               # Express server and API routes
```

### File Descriptions

**server.js**
Main application entry point containing:
- Express server configuration
- MongoDB connection setup
- Schema definitions (duplicated from models/schemas.js)
- Authentication and authorization middleware
- API route handlers
- Server initialization

**models/schemas.js**
Centralized schema definitions for:
- Product schema with indexes
- User schema with constraints
- Order schema with references
- Model exports for reuse

Note: Current implementation defines schemas in both files. Consider importing from models/schemas.js in server.js to maintain single source of truth.

**public/index.html**
HTML structure including:
- Navigation bar with conditional rendering
- Page sections (register, login, catalog, admin)
- Bootstrap modal for product details
- External resource links (Bootstrap CDN)

**public/script.js**
Client-side application logic:
- API communication functions
- Page navigation and view management
- Authentication state management
- DOM manipulation for dynamic content
- Event handlers for user interactions

**package.json**
Project configuration:
- Dependency declarations
- npm scripts (start, test)
- Project metadata
- CommonJS module system specification

## Development

### Local Development Setup

**Running in Development Mode**

```bash
npm start
```

For automatic server restart on file changes, install nodemon:

```bash
npm install --save-dev nodemon
```

Update package.json:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

Run development server:
```bash
npm run dev
```

### Testing the Application

**Manual Testing Checklist**

Authentication:
- [ ] Register new user account
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout and verify token removal
- [ ] Access protected routes without token

Product Management:
- [ ] View all products in catalog
- [ ] Filter products by category
- [ ] Add new product as admin
- [ ] Delete product as admin
- [ ] View product details and reviews

Order Processing:
- [ ] Place order as authenticated user
- [ ] Verify stock decrement
- [ ] View orders as admin
- [ ] Update order status
- [ ] Verify customer information population

### Database Management

**Viewing Database Contents**

Using MongoDB Shell:
```bash
mongo
use pcstore
db.products.find().pretty()
db.users.find().pretty()
db.orders.find().pretty()
```

Using MongoDB Compass:
1. Connect to MongoDB instance
2. Select pcstore database
3. Browse collections visually

**Seeding Initial Data**

Create seed script for initial products:

```javascript
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const products = [
  {
    model_name: "Gaming PC Pro",
    category: "Gaming",
    price: 250000,
    stock: 10,
    specs: {
      cpu: "Intel i9-13900K",
      gpu: "RTX 4080",
      ram: "32GB DDR5",
      ssd: "1TB NVMe"
    }
  },
  // Add more products...
];

async function seed() {
  await mongoose.connection.db.dropDatabase();
  await Product.insertMany(products);
  console.log('Database seeded');
  process.exit(0);
}

seed();
```

### Code Style and Best Practices

**JavaScript Conventions**
- Use async/await for asynchronous operations
- Handle errors appropriately with try-catch
- Use const/let instead of var
- Use template literals for string concatenation
- Follow RESTful API naming conventions

**MongoDB Best Practices**
- Create indexes for frequently queried fields
- Use lean() for read-only queries to improve performance
- Implement proper error handling for database operations
- Use transactions for operations requiring atomicity

## Deployment Considerations

### Production Environment Setup

**Environment Variables**
- Never commit .env file to version control
- Use environment variable management service
- Rotate JWT secret regularly
- Use strong, randomly generated secrets

**MongoDB Atlas Configuration**
- Enable IP whitelisting for security
- Configure backup schedules
- Monitor database performance metrics
- Set up alerts for anomalies

**Server Hosting Options**
- Heroku (easy deployment, automatic scaling)
- DigitalOcean (VPS with full control)
- AWS EC2 (enterprise-grade infrastructure)
- Vercel/Netlify (frontend), MongoDB Atlas (backend)

### Performance Optimization

**Database Optimization**
- Implement database connection pooling
- Add indexes for common query patterns
- Use projection to limit returned fields
- Implement pagination for large result sets

**Application Optimization**
- Enable compression middleware (compression package)
- Implement caching for frequently accessed data
- Minimize payload sizes
- Use CDN for static assets

**Frontend Optimization**
- Minify JavaScript and CSS
- Implement lazy loading for images
- Use browser caching headers
- Bundle and compress assets

### Monitoring and Logging

**Application Monitoring**
- Implement structured logging (winston, morgan)
- Track error rates and response times
- Monitor database query performance
- Set up uptime monitoring

**Security Monitoring**
- Log authentication attempts
- Track failed login attempts per IP
- Monitor for suspicious patterns
- Implement alerting for security events

## Future Enhancements

### Feature Additions

**Customer Features**
- Shopping cart functionality
- Order history for customers
- Wishlist functionality
- Product comparison tool
- Advanced search with filters
- Product recommendations
- Email notifications for order status

**Administrative Features**
- Sales analytics dashboard with charts
- Inventory low-stock alerts
- Bulk product import/export
- Customer management interface
- Discount and promotion management
- Detailed reporting system

**Payment Integration**
- Payment gateway integration (Stripe, PayPal)
- Multiple payment method support
- Invoice generation
- Refund processing

**Enhanced User Experience**
- Image upload for products
- Product image gallery
- Mobile-responsive improvements
- Dark mode theme
- Multi-language support
- Accessibility improvements



