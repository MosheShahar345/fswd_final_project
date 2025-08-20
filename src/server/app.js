import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import courseRoutes from './routes/courses.js';
import monitoringRoutes from './routes/monitoring.js';
import dashboardRoutes from './routes/dashboard.js';
import orderRoutes from './routes/orders.js';
import tripRoutes from './routes/trips.js';
import refundRoutes from './routes/refunds.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';
import { errorHandler, notFound } from './middlewares/error.js';
const app = express();
// Request ID middleware
app.use((req, res, next) => {
req.id = uuidv4();
res.setHeader('X-Request-ID', req.id);
next();
});
// Security middleware
app.use(helmet({
contentSecurityPolicy: {
directives: {
defaultSrc: ["'self'"],
styleSrc: ["'self'", "'unsafe-inline'"],
scriptSrc: ["'self'"],
imgSrc: ["'self'", "data:", "https:", "http://localhost:3000"],
},
},
crossOriginEmbedderPolicy: false
}));
// Rate limiting with enhanced logging
const limiter = rateLimit({
windowMs: 15 * 60 * 1000, // 15 minutes
max: 100, // limit each IP to 100 requests per windowMs
message: {
error: {
message: 'Too many requests from this IP, please try again later.',
statusCode: 429,
timestamp: new Date().toISOString()
}
},
standardHeaders: true,
legacyHeaders: false,
handler: (req, res) => {
console.warn(`Rate limit exceeded for IP: ${req.ip}`);
res.status(429).json({
error: {
message: 'Too many requests from this IP, please try again later.',
statusCode: 429,
timestamp: new Date().toISOString()
}
});
}
});
app.use('/api/', limiter);
// CORS
app.use(cors({
origin: process.env.FRONTEND_URL || 'http://localhost:5173',
credentials: true,
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));
// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Static file serving for uploads with CORS headers
app.use('/uploads', (req, res, next) => {
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Methods', 'GET');
res.header('Access-Control-Allow-Headers', 'Content-Type');
res.header('Cross-Origin-Resource-Policy', 'cross-origin');
next();
}, express.static('public/uploads'));
// Basic request logging (console only)
app.use((req, res, next) => {
console.log(`${req.method} ${req.url}`);
next();
});
// Health check
app.get('/health', (req, res) => {
const healthData = {
status: 'OK',
timestamp: new Date().toISOString(),
uptime: process.uptime(),
memory: process.memoryUsage(),
environment: process.env.NODE_ENV || 'development'
};
res.json(healthData);
});
// API routes with logging
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
// 404 handler
app.use('*', notFound);
// Error handler
app.use(errorHandler);
// Graceful shutdown
process.on('SIGTERM', () => {
console.log('SIGTERM received, shutting down gracefully');
});
process.on('SIGINT', () => {
console.log('SIGINT received, shutting down gracefully');
});
// Unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
// Uncaught exception
process.on('uncaughtException', (error) => {
console.error('Uncaught Exception:', error.message);
console.error(error.stack);
process.exit(1);
});
export default app;
