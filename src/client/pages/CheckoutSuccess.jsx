import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { formatDate } from '../utils/dateUtils.js';
import './CheckoutSuccess.css';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId && user) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderId, user]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrderDetails(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    // Handle invalid amounts
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
      return '$0.00';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(amount));
  };



  if (loading) {
    return (
      <div className="checkout-success">
        <div className="success-container">
          <div className="success-content">
            <div className="loading">Loading order details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-success">
        <div className="success-container">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase. Your order has been successfully placed.</p>
            <p className="error-message">{error}</p>
            
            <div className="success-actions">
              <Link to="/shop" className="btn btn-primary">
                Continue Shopping
              </Link>
              <Link to="/dashboard" className="btn btn-outline">
                View Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-success">
      <div className="success-container">
        <div className="success-content">
          <div className="success-icon">✅</div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your order has been successfully placed.</p>
          
          {orderDetails && (
            <div className="order-details">
              <h2>Order Details</h2>
              <div className="order-info">
                <div className="info-row">
                  <span>Order Number:</span>
                  <span>#{orderDetails.order.id}</span>
                </div>
                <div className="info-row">
                  <span>Order Date:</span>
                  <span>{formatDate(orderDetails.order.created_at)}</span>
                </div>
                <div className="info-row">
                  <span>Order Total:</span>
                  <span>{formatCurrency(orderDetails.order.total)}</span>
                </div>
                <div className="info-row">
                  <span>Order Status:</span>
                  <span className={`status-badge status-${orderDetails.order.status}`}>
                    {orderDetails.order.status.charAt(0).toUpperCase() + orderDetails.order.status.slice(1)}
                  </span>
                </div>
                                  <div className="info-row">
                    <span>Items:</span>
                    <span>{orderDetails.items.length + (orderDetails.courses?.length || 0) + (orderDetails.trips?.length || 0)} item(s)</span>
                  </div>
                <div className="info-row">
                  <span>Estimated Delivery:</span>
                  <span>{formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}</span>
                </div>
              </div>
              
                             {(orderDetails.items.length > 0 || orderDetails.courses?.length > 0 || orderDetails.trips?.length > 0) && (
                <div className="order-items">
                  <h3>Order Items</h3>
                  <div className="items-list">
                    {orderDetails.items.map((item, index) => (
                      <div key={`product-${index}`} className="item-row">
                        <span>{item.product_name}</span>
                        <span>{item.qty} x {formatCurrency(item.price)}</span>
                      </div>
                    ))}
                                         {orderDetails.courses?.map((course, index) => (
                       <div key={`course-${index}`} className="item-row course-item">
                         <span>🎓 {course.course_name} - {course.course_level}</span>
                         <span>1 x {formatCurrency(course.course_price)}</span>
                       </div>
                     ))}
                     {orderDetails.trips?.map((trip, index) => (
                       <div key={`trip-${index}`} className="item-row trip-item">
                         <span>🏕️ {trip.trip_title} - {trip.location}</span>
                         <span>1 x {formatCurrency(trip.paid_amount)}</span>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="success-actions">
            <Link to="/shop" className="btn btn-primary">
              Continue Shopping
            </Link>
            <Link to="/dashboard" className="btn btn-outline">
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
