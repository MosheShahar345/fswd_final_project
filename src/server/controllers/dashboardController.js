import { DashboardService } from '../services/dashboardService.js';
import { asyncHandler } from '../middlewares/error.js';
import { NotFoundError } from '../middlewares/error.js';
export class DashboardController {
  static getDashboardData = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    // Fetch all dashboard data in parallel
    const [orders, enrollments, tripBookings, stats] = await Promise.all([
      DashboardService.getUserOrders(userId),
      DashboardService.getUserEnrollments(userId),
      DashboardService.getUserTripBookings(userId),
      DashboardService.getDashboardStats(userId)
    ]);

    const dashboardData = {
      stats,
      recentOrders: orders,
      recentEnrollments: enrollments,
      recentTripBookings: tripBookings
    };

    res.status(200).json(dashboardData);
  });

  static getOrderDetails = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const orderId = parseInt(req.params.orderId);
    
    if (!orderId || isNaN(orderId)) {
      throw new NotFoundError('Order');
    }

    const orderDetails = await DashboardService.getOrderDetails(orderId, userId);
    res.status(200).json(orderDetails);
  });

  static getEnrollmentDetails = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const enrollmentId = parseInt(req.params.enrollmentId);
    
    if (!enrollmentId || isNaN(enrollmentId)) {
      throw new NotFoundError('Enrollment');
    }

    const enrollmentDetails = await DashboardService.getEnrollmentDetails(enrollmentId, userId);
    res.status(200).json(enrollmentDetails);
  });

  static getTripBookingDetails = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const bookingId = parseInt(req.params.bookingId);
    
    if (!bookingId || isNaN(bookingId)) {
      throw new NotFoundError('Trip booking');
    }

    const bookingDetails = await DashboardService.getTripBookingDetails(bookingId, userId);
    res.status(200).json(bookingDetails);
  });

  static getUserStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const stats = await DashboardService.getDashboardStats(userId);
    res.status(200).json(stats);
  });
}
