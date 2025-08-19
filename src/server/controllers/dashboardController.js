import { DashboardService } from '../services/dashboardService.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middlewares/error.js';
import { NotFoundError } from '../middlewares/error.js';

export class DashboardController {
  static getDashboardData = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const userId = req.user.id;
    
    try {
      logger.info('Fetching dashboard data', {
        requestId: req.id,
        userId,
        ip: req.ip
      });

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

      const responseTime = Date.now() - startTime;
      logger.info('Dashboard data fetched successfully', {
        requestId: req.id,
        userId,
        responseTime: `${responseTime}ms`,
        data: {
          ordersCount: orders.length,
          enrollmentsCount: enrollments.length,
          tripBookingsCount: tripBookings.length
        }
      });

      res.status(200).json(dashboardData);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to fetch dashboard data', {
        requestId: req.id,
        userId,
        error: error.message,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }
  });

  static getOrderDetails = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const userId = req.user.id;
    const orderId = parseInt(req.params.orderId);
    
    if (!orderId || isNaN(orderId)) {
      throw new NotFoundError('Order');
    }

    try {
      logger.info('Fetching order details', {
        requestId: req.id,
        userId,
        orderId,
        ip: req.ip
      });

      const orderDetails = await DashboardService.getOrderDetails(orderId, userId);

      const responseTime = Date.now() - startTime;
      logger.info('Order details fetched successfully', {
        requestId: req.id,
        userId,
        orderId,
        responseTime: `${responseTime}ms`,
        itemCount: orderDetails.items.length
      });

      res.status(200).json(orderDetails);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to fetch order details', {
        requestId: req.id,
        userId,
        orderId,
        error: error.message,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }
  });

  static getEnrollmentDetails = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const userId = req.user.id;
    const enrollmentId = parseInt(req.params.enrollmentId);
    
    if (!enrollmentId || isNaN(enrollmentId)) {
      throw new NotFoundError('Enrollment');
    }

    try {
      logger.info('Fetching enrollment details', {
        requestId: req.id,
        userId,
        enrollmentId,
        ip: req.ip
      });

      const enrollmentDetails = await DashboardService.getEnrollmentDetails(enrollmentId, userId);

      const responseTime = Date.now() - startTime;
      logger.info('Enrollment details fetched successfully', {
        requestId: req.id,
        userId,
        enrollmentId,
        responseTime: `${responseTime}ms`,
        courseTitle: enrollmentDetails.course_title
      });

      res.status(200).json(enrollmentDetails);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to fetch enrollment details', {
        requestId: req.id,
        userId,
        enrollmentId,
        error: error.message,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }
  });

  static getTripBookingDetails = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const userId = req.user.id;
    const bookingId = parseInt(req.params.bookingId);
    
    if (!bookingId || isNaN(bookingId)) {
      throw new NotFoundError('Trip booking');
    }

    try {
      logger.info('Fetching trip booking details', {
        requestId: req.id,
        userId,
        bookingId,
        ip: req.ip
      });

      const bookingDetails = await DashboardService.getTripBookingDetails(bookingId, userId);

      const responseTime = Date.now() - startTime;
      logger.info('Trip booking details fetched successfully', {
        requestId: req.id,
        userId,
        bookingId,
        responseTime: `${responseTime}ms`,
        tripTitle: bookingDetails.trip_title
      });

      res.status(200).json(bookingDetails);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to fetch trip booking details', {
        requestId: req.id,
        userId,
        bookingId,
        error: error.message,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }
  });

  static getUserStats = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const userId = req.user.id;
    
    try {
      logger.info('Fetching user stats', {
        requestId: req.id,
        userId,
        ip: req.ip
      });

      const stats = await DashboardService.getDashboardStats(userId);

      const responseTime = Date.now() - startTime;
      logger.info('User stats fetched successfully', {
        requestId: req.id,
        userId,
        responseTime: `${responseTime}ms`,
        stats
      });

      res.status(200).json(stats);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to fetch user stats', {
        requestId: req.id,
        userId,
        error: error.message,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }
  });
}
