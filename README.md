# Adventure Gear Shop - Full Stack Application

A complete adventure gear e-commerce platform with trip bookings, diving courses, and comprehensive admin management.

## Features

### Frontend (React)
- **Home Page**: Animated particles, hero section, announcements ticker, highlight strips, CTA sections
- **Shop**: Product browsing with filters, search, sorting, and quick view modals
- **Activities**: Adventure trips and diving certification courses with booking/enrollment
- **Dashboard**: Role-based dashboards with statistics, order tracking, and enrollment management
- **Admin Panel**: Comprehensive admin dashboard with user management, analytics, and system controls
- **Authentication**: Login/Register with JWT and profile management
- **Shopping Cart**: Persistent cart with add/remove items, quantity management, and checkout flow
- **Profile Settings**: User profile management with image uploads and address management

### Backend (Node.js + Express)
- **RESTful API**: Complete CRUD operations with comprehensive error handling
- **Authentication**: JWT-based auth with role-based access control (member/admin)
- **Database**: SQLite with comprehensive schema and audit logging
- **Security**: Rate limiting, CORS, helmet security headers, input validation
- **File Uploads**: Profile picture and image upload handling
- **Logging**: Comprehensive request/error logging with winston
- **Admin Features**: User management, refund processing, order management, system analytics

## Tech Stack

- **Frontend**: React 19, React Router 7, Context API
- **Backend**: Node.js, Express 4, SQLite3
- **Authentication**: JWT, bcryptjs
- **File Handling**: Multer for uploads
- **Validation**: Zod schema validation
- **Security**: Helmet, CORS, express-rate-limit
- **Styling**: CSS3 with modern responsive design
- **Database**: SQLite with foreign key constraints

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Initialize the database**
```bash
npm run db:init
```

3. **Start the development servers**

For backend only:
```bash
npm run dev:server
```

For frontend only:
```bash
npm run dev
```

For both (recommended):
```bash
npm run dev:full
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## Demo Credentials

### Admin User
- Email: `admin@adventuregear.com`
- Password: `admin123`

### Member User  
- Email: `member@adventuregear.com`
- Password: `user123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token

### Products
- `GET /api/products` - List products (with filters, search, pagination)
- `GET /api/products/:id` - Get product details
- `GET /api/products/categories` - Get all product categories
- `GET /api/products/brands` - Get all product brands
- `GET /api/products/stats` - Get product statistics
- `POST /api/products` - Create product (Admin only)
- `PATCH /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:orderId` - Get specific order details
- `PATCH /api/orders/:orderId/status` - Update order status

### Courses
- `GET /api/courses` - List all diving courses
- `GET /api/courses/calendar` - Get courses with sessions
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/enroll` - Enroll in course session
- `GET /api/courses/enrollments` - Get user enrollments
- `DELETE /api/courses/enrollments/:id` - Cancel enrollment
- `POST /api/courses` - Create course (Admin only)
- `PATCH /api/courses/:id` - Update course (Admin only)
- `DELETE /api/courses/:id` - Delete course (Admin only)

### Trips
- `GET /api/trips` - List all adventure trips
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips/:id/book` - Book a trip
- `POST /api/trips` - Create trip (Admin only)
- `PATCH /api/trips/:id` - Update trip (Admin only)
- `DELETE /api/trips/:id` - Delete trip (Admin only)

### Dashboard
- `GET /api/dashboard` - Get user dashboard data
- `GET /api/dashboard/stats` - Get user statistics

### Profile
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update user profile
- `POST /api/profile/upload` - Upload profile picture

### Refunds
- `GET /api/refunds/user` - Get user's refunds
- `GET /api/refunds/all` - Get all refunds (Admin only)
- `PATCH /api/refunds/:id/status` - Update refund status (Admin only)

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/analytics` - System analytics
- `PATCH /api/admin/users/:userId/status` - Update user status
- `PATCH /api/admin/users/:userId/role` - Update user role
- `PATCH /api/admin/users/:userId/activate` - Activate user
- `PATCH /api/admin/users/:userId/suspend` - Suspend user
- `PATCH /api/admin/refunds/:refundId/approve` - Approve refund
- `PATCH /api/admin/refunds/:refundId/reject` - Reject refund
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/orders/:orderId/status` - Update order status
- `GET /api/admin/system/stats` - System statistics
- `POST /api/admin/system/backup` - Backup database
- `POST /api/admin/system/clear-cache` - Clear system cache

### Monitoring
- `GET /health` - Health check endpoint

## Database Schema

The application includes a comprehensive SQLite database with the following tables:

### Core Tables
- **users**: User accounts with roles (member, admin), status tracking, and profile data
- **addresses**: User shipping/billing addresses with default address support
- **products**: Adventure gear products with categories, brands, and pricing
- **product_images**: Product image management with primary image designation
- **inventory**: Stock management with SKU tracking and threshold alerts
- **price_history**: Historical pricing data for products

### E-commerce Tables
- **carts**: User shopping carts
- **cart_items**: Items in shopping carts with pricing at time of addition
- **orders**: Order management with status tracking (pending, paid, shipped, delivered, etc.)
- **order_items**: Individual items within orders

### Activities Tables
- **trips**: Adventure trips with location, dates, capacity, difficulty levels
- **trip_bookings**: Trip reservations with status and payment tracking
- **courses**: Diving certification courses (Open Water, Advanced, Master Diver, Divemaster)
- **course_sessions**: Scheduled course sessions with capacity management
- **enrollments**: Course enrollments with status tracking

### Administrative Tables
- **refunds**: Refund requests and processing for course cancellations
- **messages**: Internal messaging system between users
- **notifications**: System notifications for users
- **audit_logs**: Complete audit trail of all system actions

### Key Features
- Foreign key constraints ensure data integrity
- Status enums for consistent state management
- Audit logging for administrative actions
- Automatic timestamps for tracking record history

## Project Structure

```
fswd_final_project/
├── src/
│   ├── client/                    # React frontend
│   │   ├── components/           # Organized by feature
│   │   │   ├── activities/       # Trip and course components
│   │   │   ├── admin/           # Admin dashboard components
│   │   │   ├── admin-products/  # Product management components
│   │   │   ├── calendar/        # Course calendar components
│   │   │   ├── cart/            # Shopping cart components
│   │   │   ├── checkout/        # Checkout flow components
│   │   │   ├── common/          # Shared components (Notification, ProfileSettings)
│   │   │   ├── dashboard/       # User dashboard components
│   │   │   ├── home/            # Homepage components
│   │   │   ├── layout/          # Layout components (Navbar, Footer)
│   │   │   ├── product/         # Product display components
│   │   │   ├── product-detail/  # Product detail page components
│   │   │   └── shop/            # Shop page components
│   │   ├── contexts/            # React contexts (Auth, Cart, Notification)
│   │   ├── pages/               # Page components organized by section
│   │   │   ├── admin/           # Admin pages
│   │   │   ├── auth/            # Authentication pages
│   │   │   ├── detail/          # Detail pages (Product, Course, Trip)
│   │   │   └── main/            # Main application pages
│   │   ├── utils/               # Utility functions
│   │   └── App.jsx              # Main app component
│   ├── server/                  # Node.js backend
│   │   ├── controllers/         # HTTP request handlers
│   │   ├── middlewares/         # Express middlewares (auth, error, logging)
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Business logic layer
│   │   ├── validators/          # Zod schema validators
│   │   ├── infra/               # Database setup and migrations
│   │   ├── utils/               # Server utilities (logger)
│   │   ├── app.js               # Express app configuration
│   │   └── server.js            # Server entry point
│   └── main.jsx                 # React entry point
├── public/                      # Static assets
│   └── uploads/                 # User uploaded files
├── database.sqlite              # SQLite database file
└── package.json                 # Dependencies and scripts
```

## Development

### Adding New Features

1. **Backend**: Add routes, controllers, and services
2. **Frontend**: Create components and pages
3. **Database**: Update schema if needed
4. **Testing**: Test API endpoints and UI flows

### Environment Variables

Create a `.env` file in the root directory:
```env
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

### Sample Data

The database initialization includes:
- **Admin User**: `admin@adventuregear.com` / `admin123`
- **Member User**: `member@adventuregear.com` / `user123`
- **3 Sample Products**: Backpack, Trekking Poles, Tent
- **2 Adventure Trips**: Rocky Mountain Adventure, Coastal Kayaking
- **4 Diving Courses**: Open Water, Advanced Open Water, Master Diver, Divemaster
- **Course Sessions**: Pre-scheduled sessions for each course
- **Sample Orders and Enrollments**: For testing dashboard functionality

## Key Features Highlights

### User Experience
- **Responsive Design**: Fully responsive across all device sizes
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Real-time Updates**: Live cart updates and notifications
- **Progressive Enhancement**: Works without JavaScript for core functionality

### Administrative Features
- **User Management**: Suspend/activate users, change roles
- **Analytics Dashboard**: Comprehensive system statistics and insights
- **Refund Processing**: Complete refund workflow for course cancellations
- **Order Management**: Full order lifecycle tracking and updates
- **System Health**: Monitoring endpoints and comprehensive logging

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Fine-grained permission system
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Comprehensive validation using Zod schemas
- **Security Headers**: Helmet middleware for security best practices
- **Audit Logging**: Complete audit trail of all administrative actions

### Performance Features
- **Optimized Database**: Efficient SQLite queries with proper indexing
- **Caching Strategy**: Strategic caching for frequently accessed data
- **Error Handling**: Comprehensive error handling and logging
- **Request Logging**: Detailed request/response logging for debugging

## Deployment

### Production Setup
1. Set production environment variables
2. Initialize database: `npm run db:init`
3. Build frontend: `npm run build`
4. Start server: `npm run dev:server`

### Development
- Frontend: `npm run dev` (Vite dev server on port 5173)
- Backend: `npm run dev:server` (Express server on port 3000)
- Full stack: `npm run dev:full` (Both servers concurrently)

## Architecture Notes

This is a full-stack application built with modern web technologies:
- **Frontend**: React 19 with functional components and hooks
- **State Management**: React Context API for global state
- **Routing**: React Router 7 for client-side navigation
- **Backend**: RESTful API built with Express.js
- **Database**: SQLite for development with proper migrations
- **Authentication**: JWT tokens with refresh token support
- **File Uploads**: Multer for handling profile pictures and images

## License

This project is for educational purposes and demonstrates full-stack web development capabilities.
