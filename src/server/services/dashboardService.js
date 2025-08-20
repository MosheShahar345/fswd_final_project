import { getDb } from '../infra/db.js';
import { logger } from '../utils/logger.js';

export class DashboardService {
  static async getUserOrders(userId) {
    const startTime = Date.now();
    const db = await getDb();
    
    try {
      const orders = await db.all(`
        SELECT 
          o.id,
          o.total,
          o.status,
          o.created_at,
          (COUNT(oi.id) + (
            SELECT COUNT(*) 
            FROM enrollments e 
            WHERE e.order_id = o.id
            AND e.status = 'enrolled'
          ) + (
            SELECT COUNT(*) 
            FROM trip_bookings tb 
            WHERE tb.order_id = o.id
            AND tb.status = 'confirmed'
          )) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 10
      `, [userId]);

      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'user_orders', duration, true);
      
      return orders;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'user_orders', duration, false, error);
      throw new Error('Failed to fetch user orders');
    }
  }

  static async getUserEnrollments(userId) {
    const startTime = Date.now();
    const db = await getDb();
    
    try {
      const enrollments = await db.all(`
        SELECT 
          e.id,
          e.status,
          e.created_at,
          c.title as course_title,
          c.subtitle as course_subtitle,
          cs.start_at,
          cs.start_at as session_start,
          cs.capacity,
          COUNT(e2.id) as enrolled_count
        FROM enrollments e
        JOIN course_sessions cs ON e.session_id = cs.id
        JOIN courses c ON cs.course_id = c.id
        LEFT JOIN enrollments e2 ON cs.id = e2.session_id AND e2.status = 'enrolled'
        WHERE e.user_id = ?
        GROUP BY e.id
        ORDER BY cs.start_at ASC
        LIMIT 5
      `, [userId]);

      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'user_enrollments', duration, true);
      
      return enrollments;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'user_enrollments', duration, false, error);
      throw new Error('Failed to fetch user enrollments');
    }
  }

  static async getUserTripBookings(userId) {
    const startTime = Date.now();
    const db = await getDb();
    
    try {
      const bookings = await db.all(`
        SELECT 
          tb.id,
          tb.status,
          tb.paid_amount,
          tb.created_at,
          t.title as trip_title,
          t.location,
          t.start_date,
          t.end_date,
          t.difficulty,
          t.seats_total,
          t.seats_taken
        FROM trip_bookings tb
        JOIN trips t ON tb.trip_id = t.id
        WHERE tb.user_id = ?
        ORDER BY t.start_date DESC
        LIMIT 10
      `, [userId]);

      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'user_trip_bookings', duration, true);
      
      return bookings;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'user_trip_bookings', duration, false, error);
      throw new Error('Failed to fetch user trip bookings');
    }
  }

  static async getDashboardStats(userId) {
    const startTime = Date.now();
    const db = await getDb();
    
    try {
      // Get order stats
      const orderStats = await db.get(`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders
        FROM orders 
        WHERE user_id = ?
      `, [userId]);

      // Get enrollment stats
      const enrollmentStats = await db.get(`
        SELECT 
          COUNT(*) as total_enrollments,
          COUNT(CASE WHEN e.status = 'enrolled' THEN 1 END) as active_enrollments
        FROM enrollments e
        WHERE e.user_id = ?
      `, [userId]);

      // Get trip booking stats
      const tripStats = await db.get(`
        SELECT 
          COUNT(*) as total_bookings,
          COUNT(CASE WHEN tb.status = 'confirmed' THEN 1 END) as confirmed_bookings
        FROM trip_bookings tb
        WHERE tb.user_id = ?
      `, [userId]);

      const stats = {
        orders: {
          total: orderStats?.total_orders || 0,
          completed: orderStats?.completed_orders || 0
        },
        enrollments: {
          total: enrollmentStats?.total_enrollments || 0,
          active: enrollmentStats?.active_enrollments || 0
        },
        trips: {
          total: tripStats?.total_bookings || 0,
          confirmed: tripStats?.confirmed_bookings || 0
        }
      };

      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'dashboard_stats', duration, true);
      
      return stats;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'dashboard_stats', duration, false, error);
      throw new Error('Failed to fetch dashboard stats');
    }
  }

  static async getOrderDetails(orderId, userId) {
    const startTime = Date.now();
    const db = await getDb();
    
    try {
      const order = await db.get(`
        SELECT 
          o.id,
          o.total,
          o.status,
          o.created_at,
          o.payment_id
        FROM orders o
        WHERE o.id = ? AND o.user_id = ?
      `, [orderId, userId]);

      if (!order) {
        throw new Error('Order not found');
      }

      const orderItems = await db.all(`
        SELECT 
          oi.id,
          oi.qty,
          oi.price,
          p.name as product_name,
          p.brand,
          p.category
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [orderId]);

      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'order_details', duration, true);
      
      return {
        order,
        items: orderItems
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'order_details', duration, false, error);
      throw error;
    }
  }

  static async getEnrollmentDetails(enrollmentId, userId) {
    const startTime = Date.now();
    const db = await getDb();
    
    try {
      const enrollment = await db.get(`
        SELECT 
          e.id,
          e.status,
          e.created_at,
          c.title as course_title,
          c.subtitle as course_subtitle,
          c.level as course_level,
          c.price as course_price,
          c.description as course_description,
          c.duration,
          c.prerequisites,
          c.max_depth,
          cs.start_at as session_start
        FROM enrollments e
        JOIN course_sessions cs ON e.session_id = cs.id
        JOIN courses c ON cs.course_id = c.id
        WHERE e.id = ? AND e.user_id = ?
      `, [enrollmentId, userId]);

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'enrollment_details', duration, true);
      
      return enrollment;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'enrollment_details', duration, false, error);
      throw error;
    }
  }

  static async getTripBookingDetails(bookingId, userId) {
    const startTime = Date.now();
    const db = await getDb();
    
    try {
      const booking = await db.get(`
        SELECT 
          tb.id,
          tb.status,
          tb.paid_amount,
          tb.created_at,
          t.title as trip_title,
          t.location,
          t.start_date,
          t.end_date,
          t.difficulty,
          t.price as trip_price,
          t.description as trip_description,
          t.seats_total,
          t.seats_taken
        FROM trip_bookings tb
        JOIN trips t ON tb.trip_id = t.id
        WHERE tb.id = ? AND tb.user_id = ?
      `, [bookingId, userId]);

      if (!booking) {
        throw new Error('Trip booking not found');
      }

      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'trip_booking_details', duration, true);
      
      return booking;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logDbOperation('SELECT', 'trip_booking_details', duration, false, error);
      throw error;
    }
  }
}
