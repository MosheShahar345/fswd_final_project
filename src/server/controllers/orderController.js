import { OrderService } from '../services/orderService.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middlewares/error.js';
import { NotFoundError, ValidationError } from '../middlewares/error.js';

export class OrderController {
  static createOrder = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const userId = req.user.id;
    const orderData = req.body;
    

    
    try {
      logger.info('Creating new order', {
        requestId: req.id,
        userId,
        ip: req.ip,
        orderData: {
          total: orderData.total,
          itemCount: orderData.items?.length || 0
        }
      });

      // Validate order data
      const totalItems = (orderData.items?.length || 0) + (orderData.courses?.length || 0);
      if (totalItems === 0) {
        throw new ValidationError('Order must contain at least one item or course');
      }

      if (!orderData.total || orderData.total <= 0) {
        throw new ValidationError('Order total must be greater than 0');
      }

      // Generate payment ID
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      orderData.paymentId = paymentId;

      const result = await OrderService.createOrder(userId, orderData);

      const responseTime = Date.now() - startTime;
      logger.info('Order created successfully', {
        requestId: req.id,
        userId,
        orderId: result.orderId,
        responseTime: `${responseTime}ms`
      });

      res.status(201).json({
        success: true,
        orderId: result.orderId,
        paymentId: paymentId,
        message: 'Order created successfully'
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to create order', {
        requestId: req.id,
        userId,
        error: error.message,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }
  });

  static getOrderById = asyncHandler(async (req, res) => {
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

      const orderDetails = await OrderService.getOrderById(orderId, userId);

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

  static getUserOrders = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const userId = req.user.id;
    
    try {
      logger.info('Fetching user orders', {
        requestId: req.id,
        userId,
        ip: req.ip
      });

      const orders = await OrderService.getUserOrders(userId);

      const responseTime = Date.now() - startTime;
      logger.info('User orders fetched successfully', {
        requestId: req.id,
        userId,
        responseTime: `${responseTime}ms`,
        orderCount: orders.length
      });

      res.status(200).json(orders);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to fetch user orders', {
        requestId: req.id,
        userId,
        error: error.message,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }
  });

  static updateOrderStatus = asyncHandler(async (req, res) => {
    const startTime = Date.now();
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

    try {
      logger.info('Updating order status', {
        requestId: req.id,
        userId,
        orderId,
        status,
        ip: req.ip
      });

      const result = await OrderService.updateOrderStatus(orderId, userId, status);

      const responseTime = Date.now() - startTime;
      logger.info('Order status updated successfully', {
        requestId: req.id,
        userId,
        orderId,
        status,
        responseTime: `${responseTime}ms`
      });

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully'
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to update order status', {
        requestId: req.id,
        userId,
        orderId,
        status,
        error: error.message,
        responseTime: `${responseTime}ms`
      });
      throw error;
    }
  });
}
