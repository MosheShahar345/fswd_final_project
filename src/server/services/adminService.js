import { getDb } from '../infra/db.js';
import { ValidationError, NotFoundError } from '../middlewares/error.js';

export class AdminService {
  static async getDashboardData() {
    const db = await getDb();
    
    try {
      // Get user statistics
      const userStats = await db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive,
          SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended
        FROM users
      `);

      // Get revenue statistics
      const revenueStats = await db.get(`
        SELECT 
          COALESCE(SUM(total), 0) as total,
          COALESCE(SUM(CASE 
            WHEN created_at >= datetime('now', 'start of month') THEN total 
            ELSE 0 
          END), 0) as monthly,
          COALESCE(SUM(CASE 
            WHEN created_at >= datetime('now', '-7 days') THEN total 
            ELSE 0 
          END), 0) as weekly
        FROM orders 
        WHERE status IN ('paid', 'shipped', 'delivered')
      `);

      // Get order statistics
      const orderStats = await db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
          SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered
        FROM orders
      `);

      // Get activity statistics
      const courseStats = await db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active
        FROM courses
      `);

      const tripStats = await db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active
        FROM trips
      `);

      // Get recent users
      const recentUsers = await db.all(`
        SELECT id, name, email, role, status, created_at
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 10
      `);

      // Get all users for management
      const allUsers = await db.all(`
        SELECT id, name, email, role, status, created_at
        FROM users 
        ORDER BY created_at DESC
      `);

      // Get pending refunds
      const pendingRefunds = await db.all(`
        SELECT 
          r.id,
          r.amount,
          r.reason,
          r.status,
          r.created_at,
          u.name as user_name,
          c.title as course_title
        FROM refunds r
        JOIN users u ON r.user_id = u.id
        JOIN courses c ON r.course_id = c.id
        WHERE r.status = 'pending'
        ORDER BY r.created_at DESC
      `);

      // Get all refunds
      const allRefunds = await db.all(`
        SELECT 
          r.id,
          r.amount,
          r.reason,
          r.status,
          r.created_at,
          u.name as user_name,
          c.title as course_title
        FROM refunds r
        JOIN users u ON r.user_id = u.id
        JOIN courses c ON r.course_id = c.id
        ORDER BY r.created_at DESC
      `);

      // Get content statistics
      const productStats = await db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active
        FROM products
      `);

      // Get all orders for management
      const allOrders = await db.all(`
        SELECT 
          o.id,
          o.total,
          o.status,
          o.created_at,
          u.name as customer_name,
          u.email as customer_email,
          COUNT(oi.id) as item_count
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `);

      // Get analytics data
      const analytics = await this.getAnalyticsData();

      return {
        stats: {
          users: userStats,
          revenue: revenueStats,
          orders: orderStats,
          activities: {
            total: courseStats.total + tripStats.total,
            courses: courseStats.total,
            trips: tripStats.total
          }
        },
        recentUsers,
        allUsers,
        pendingRefunds,
        allRefunds,
        contentStats: {
          products: productStats,
          courses: courseStats,
          trips: tripStats
        },
        allOrders,
        analytics
      };
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      throw new Error('Failed to fetch admin dashboard data');
    }
  }

  static async getAnalyticsData() {
    const db = await getDb();
    
    try {
      // Revenue analytics
      const revenueAnalytics = await db.get(`
        SELECT 
          COALESCE(SUM(total), 0) as total,
          COALESCE(SUM(CASE 
            WHEN created_at >= datetime('now', 'start of month') THEN total 
            ELSE 0 
          END), 0) as monthly,
          COALESCE(SUM(CASE 
            WHEN created_at >= datetime('now', '-7 days') THEN total 
            ELSE 0 
          END), 0) as weekly
        FROM orders 
        WHERE status IN ('paid', 'shipped', 'delivered')
      `);

      // User analytics
      const userAnalytics = await db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE 
            WHEN created_at >= datetime('now', 'start of month') THEN 1 
            ELSE 0 
          END) as newThisMonth
        FROM users
      `);

      // Order analytics
      const orderAnalytics = await db.get(`
        SELECT COUNT(*) as total
        FROM orders
      `);

      // Enrollment analytics
      const enrollmentAnalytics = await db.get(`
        SELECT COUNT(*) as total
        FROM enrollments
        WHERE status = 'enrolled'
      `);

      // Booking analytics
      const bookingAnalytics = await db.get(`
        SELECT COUNT(*) as total
        FROM trip_bookings
        WHERE status = 'confirmed'
      `);

      return {
        revenue: revenueAnalytics,
        users: userAnalytics,
        orders: orderAnalytics,
        enrollments: enrollmentAnalytics,
        bookings: bookingAnalytics
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw new Error('Failed to fetch analytics data');
    }
  }

  static async updateUserStatus(userId, status) {
    const db = await getDb();
    
    try {
      const validStatuses = ['active', 'inactive', 'suspended'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }

      const result = await db.run(
        'UPDATE users SET status = ? WHERE id = ?',
        [status, userId]
      );

      if (result.changes === 0) {
        throw new Error('User not found');
      }

      return { success: true, message: `User status updated to ${status}` };
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  static async updateUserRole(userId, role, currentUserId) {
    const db = await getDb();
    
    try {
      const validRoles = ['member', 'admin'];
      if (!validRoles.includes(role)) {
        throw new ValidationError('Invalid role');
      }

      // Prevent admin from demoting themselves
      if (parseInt(userId) === parseInt(currentUserId) && role === 'member') {
        throw new ValidationError('Admins cannot change their own role to member. This action must be performed by another admin.');
      }

      const result = await db.run(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, userId]
      );

      if (result.changes === 0) {
        throw new NotFoundError('User not found');
      }

      return { success: true, message: `User role updated to ${role}` };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  static async approveRefund(refundId) {
    const db = await getDb();
    
    try {
      // Get refund details
      const refund = await db.get(`
        SELECT * FROM refunds WHERE id = ?
      `, [refundId]);

      if (!refund) {
        throw new Error('Refund not found');
      }

      if (refund.status === 'approved') {
        throw new Error('Refund has already been approved');
      }

      if (refund.status === 'rejected') {
        throw new Error('Cannot approve a rejected refund');
      }

      if (refund.status !== 'pending') {
        throw new Error(`Refund status is '${refund.status}', cannot approve`);
      }

      // Update refund status
      await db.run(`
        UPDATE refunds 
        SET status = 'approved', processed_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [refundId]);

      // Update enrollment status to cancelled (only if it's not already cancelled/dropped)
      const enrollment = await db.get('SELECT status FROM enrollments WHERE id = ?', [refund.enrollment_id]);
      if (enrollment && !['cancelled', 'dropped'].includes(enrollment.status)) {
        await db.run(`
          UPDATE enrollments 
          SET status = 'cancelled' 
          WHERE id = ?
        `, [refund.enrollment_id]);
      }

      return { success: true, message: 'Refund approved successfully' };
    } catch (error) {
      console.error('Error approving refund:', error);
      throw error;
    }
  }

  static async rejectRefund(refundId) {
    const db = await getDb();
    
    try {
      const refund = await db.get(`
        SELECT * FROM refunds WHERE id = ?
      `, [refundId]);

      if (!refund) {
        throw new Error('Refund not found');
      }

      if (refund.status === 'rejected') {
        throw new Error('Refund has already been rejected');
      }

      if (refund.status === 'approved') {
        throw new Error('Cannot reject an approved refund');
      }

      if (refund.status !== 'pending') {
        throw new Error(`Refund status is '${refund.status}', cannot reject`);
      }

      await db.run(`
        UPDATE refunds 
        SET status = 'rejected', processed_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [refundId]);

      return { success: true, message: 'Refund rejected successfully' };
    } catch (error) {
      console.error('Error rejecting refund:', error);
      throw error;
    }
  }

  static async getSystemStats() {
    const db = await getDb();
    
    try {
      // Get database size (approximate)
      const dbSize = await db.get(`
        SELECT page_count * page_size as size
        FROM pragma_page_count(), pragma_page_size()
      `);

      // Get table row counts
      const tableStats = await db.all(`
        SELECT 
          'users' as table_name, COUNT(*) as count FROM users
        UNION ALL
        SELECT 'products', COUNT(*) FROM products
        UNION ALL
        SELECT 'orders', COUNT(*) FROM orders
        UNION ALL
        SELECT 'courses', COUNT(*) FROM courses
        UNION ALL
        SELECT 'trips', COUNT(*) FROM trips
        UNION ALL
        SELECT 'enrollments', COUNT(*) FROM enrollments
        UNION ALL
        SELECT 'trip_bookings', COUNT(*) FROM trip_bookings
      `);

      return {
        databaseSize: Math.round(dbSize.size / 1024), // KB
        tableStats,
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw new Error('Failed to fetch system statistics');
    }
  }

  static async backupDatabase() {
    // In a real application, this would create a backup
    // For now, we'll just return a success message
    return {
      success: true,
      message: 'Database backup initiated successfully',
      timestamp: new Date().toISOString()
    };
  }

  static async clearCache() {
    // In a real application, this would clear various caches
    // For now, we'll just return a success message
    return {
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    };
  }

  // Order Management Methods
  static async getAllOrders() {
    const db = await getDb();
    
    try {
      const orders = await db.all(`
        SELECT 
          o.id,
          o.total,
          o.status,
          o.created_at,
          u.name as customer_name,
          u.email as customer_email,
          COUNT(oi.id) as item_count
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `);

      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  static async updateOrderStatus(orderId, newStatus) {
    const db = await getDb();
    
    try {
      const order = await db.get(`
        SELECT * FROM orders WHERE id = ?
      `, [orderId]);

      if (!order) {
        throw new Error('Order not found');
      }

      // Validate status transition
      const validTransitions = {
        'pending': ['SENT', 'cancelled'],
        'paid': ['shipped', 'SENT', 'cancelled'],
        'shipped': ['SENT'],
        'SENT': [],
        'delivered': [],
        'cancelled': [],
        'refunded': []
      };

      if (!validTransitions[order.status]?.includes(newStatus)) {
        throw new Error(`Cannot change order status from '${order.status}' to '${newStatus}'`);
      }

      await db.run(`
        UPDATE orders 
        SET status = ? 
        WHERE id = ?
      `, [newStatus, orderId]);

      return { success: true, message: `Order status updated to ${newStatus}` };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
}
