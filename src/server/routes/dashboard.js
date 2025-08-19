import express from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// Get complete dashboard data (stats + recent items)
router.get('/', DashboardController.getDashboardData);

// Get user statistics
router.get('/stats', DashboardController.getUserStats);

// Get order details
router.get('/orders/:orderId', DashboardController.getOrderDetails);

// Get enrollment details
router.get('/enrollments/:enrollmentId', DashboardController.getEnrollmentDetails);

// Get trip booking details
router.get('/trips/:bookingId', DashboardController.getTripBookingDetails);

export default router;
