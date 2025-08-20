import express from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Dashboard and Analytics
router.get('/dashboard', asyncHandler(AdminController.getDashboard));
router.get('/analytics', asyncHandler(AdminController.getAnalytics));

// User Management
router.patch('/users/:userId/status', asyncHandler(AdminController.updateUserStatus));
router.patch('/users/:userId/role', asyncHandler(AdminController.updateUserRole));
router.patch('/users/:userId/activate', asyncHandler(AdminController.activateUser));
router.patch('/users/:userId/suspend', asyncHandler(AdminController.suspendUser));

// Refund Management
router.patch('/refunds/:refundId/approve', asyncHandler(AdminController.approveRefund));
router.patch('/refunds/:refundId/reject', asyncHandler(AdminController.rejectRefund));

// Order Management
router.get('/orders', asyncHandler(AdminController.getAllOrders));
router.patch('/orders/:orderId/status', asyncHandler(AdminController.updateOrderStatus));

// System Management
router.get('/system/stats', asyncHandler(AdminController.getSystemStats));
router.post('/system/backup', asyncHandler(AdminController.backupDatabase));
router.post('/system/clear-cache', asyncHandler(AdminController.clearCache));

export default router;

