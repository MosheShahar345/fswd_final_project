import { OrderService } from '../services/orderService.js';
import { asyncHandler } from '../middlewares/error.js';
import { NotFoundError, ValidationError } from '../middlewares/error.js';

export class OrderController {
  static createOrder = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const orderData = req.body;
    
    // Validate order data
    const totalItems = (orderData.items?.length || 0) + (orderData.courses?.length || 0) + (orderData.trips?.length || 0);
    if (totalItems === 0) {
      throw new ValidationError('Order must contain at least one item, course, or trip');
    }

    if (!orderData.total || orderData.total <= 0) {
      throw new ValidationError('Order total must be greater than 0');
    }

    // Generate payment ID
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    orderData.paymentId = paymentId;

    const result = await OrderService.createOrder(userId, orderData);

    res.status(201).json({
      success: true,
      orderId: result.orderId,
      paymentId: paymentId,
      message: 'Order created successfully'
    });
  });

  static getOrderById = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const orderId = parseInt(req.params.orderId);
    
    if (!orderId || isNaN(orderId)) {
      throw new NotFoundError('Order');
    }

    const orderDetails = await OrderService.getOrderById(orderId, userId);
    res.status(200).json(orderDetails);
  });

  static getUserOrders = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const orders = await OrderService.getUserOrders(userId);
    res.status(200).json(orders);
  });

  static updateOrderStatus = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const orderId = parseInt(req.params.orderId);
    const { status } = req.body;
    
    if (!orderId || isNaN(orderId)) {
      throw new NotFoundError('Order');
    }

    if (!status) {
      throw new ValidationError('Status is required');
    }

    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid order status');
    }

    const result = await OrderService.updateOrderStatus(orderId, userId, status);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully'
    });
  });
}
