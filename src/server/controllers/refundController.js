import { RefundService } from '../services/refundService.js';

// Get user's refunds
export const getUserRefunds = async (req, res) => {
  try {
    const userId = req.user.id;
    const refunds = await RefundService.getRefundsByUser(userId);
    
    res.json({
      success: true,
      data: refunds,
      count: refunds.length
    });
  } catch (error) {
    console.error('Error fetching user refunds:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get all refunds (admin only)
export const getAllRefunds = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const refunds = await RefundService.getAllRefunds();
    
    res.json({
      success: true,
      data: refunds,
      count: refunds.length
    });
  } catch (error) {
    console.error('Error fetching all refunds:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Update refund status (admin only)
export const updateRefundStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const { refundId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'processed', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: pending, approved, processed, rejected'
      });
    }

    const result = await RefundService.updateRefundStatus(refundId, status, req.user.id);
    
    res.json({
      success: true,
      data: result,
      message: `Refund status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating refund status:', error);
    
    if (error.message === 'Refund not found') {
      return res.status(404).json({
        success: false,
        error: 'Refund not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get refund statistics (admin only)
export const getRefundStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const stats = await RefundService.getRefundStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching refund stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
