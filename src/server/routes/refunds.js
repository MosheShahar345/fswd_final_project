import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { 
  getUserRefunds, 
  getAllRefunds, 
  updateRefundStatus, 
  getRefundStats 
} from '../controllers/refundController.js';

const router = express.Router();

// Get user's refunds
router.get('/user', authenticateToken, getUserRefunds);

// Get all refunds (admin only)
router.get('/all', authenticateToken, getAllRefunds);

// Get refund statistics (admin only)
router.get('/stats', authenticateToken, getRefundStats);

// Update refund status (admin only)
router.patch('/:refundId/status', authenticateToken, updateRefundStatus);

export default router;
