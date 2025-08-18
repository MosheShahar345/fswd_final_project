# Adventure Gear Shop - Full Stack Application

A complete adventure gear e-commerce platform with trip bookings, courses, and role-based dashboards.

## Features

### Frontend (React)
- **Home Page**: Hero section, announcements ticker, highlight strips
- **Shop**: Product browsing with filters, search, and sorting
- **Activities**: Trips and courses with booking/enrollment
- **Dashboard**: Role-based dashboards (Member, Instructor, Manager, Admin)
- **Authentication**: Login/Register with JWT
- **Shopping Cart**: Add/remove items, quantity management

### Backend (Node.js + Express)
- **RESTful API**: Complete CRUD operations
- **Authentication**: JWT-based auth with role-based access control
- **Database**: SQLite with comprehensive schema
- **Real-time**: Socket.IO for live updates
- **Security**: Rate limiting, CORS, input validation

## Tech Stack

- **Frontend**: React 19, React Router, Context API
- **Backend**: Node.js, Express, SQLite
- **Authentication**: JWT, bcrypt
- **Real-time**: Socket.IO
- **Validation**: Zod
- **Styling**: CSS3 with modern design

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
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Manager/Admin)
- `PATCH /api/products/:id` - Update product (Manager/Admin)
- `GET /api/products/categories` - Get categories
- `GET /api/products/brands` - Get brands

## Database Schema

The application includes a comprehensive SQLite database with tables for:
- Users (with roles: member, instructor, manager, admin)
- Products and inventory
- Orders and cart items
- Trips and bookings
- Courses and enrollments
- Messages and notifications
- Audit logs

## Project Structure

```
src/
├── client/                 # React frontend
│   ├── components/         # Reusable components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   └── App.jsx            # Main app component
├── server/                # Node.js backend
│   ├── controllers/       # HTTP controllers
│   ├── middlewares/       # Express middlewares
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── validators/        # Input validation
│   ├── infra/             # Database & infrastructure
│   └── app.js             # Express app
└── main.jsx               # React entry point
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
```

## Deployment

### Backend Deployment
1. Set environment variables
2. Run `npm run build`
3. Start with `npm start`

### Frontend Deployment
1. Run `npm run build`
2. Deploy the `dist` folder to your hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
