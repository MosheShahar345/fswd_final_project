import React from 'react';
import { formatDate, formatDateRange } from '../../utils/dateUtils.js';

const OrderSummary = ({ 
  products, 
  courses, 
  trips, 
  formatPrice, 
  subtotal, 
  shipping, 
  total,
  isProcessing,
  handleSubmit 
}) => {
  return (
    <div className="checkout-summary">
      <h2>Order Summary</h2>
      
      {/* Products Section */}
      {products.length > 0 && (
        <div className="summary-section">
          <h3>Products</h3>
          <div className="cart-items">
            {products.map((item) => (
              <div key={`product-${item.id}`} className="cart-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>Qty: {item.quantity}</p>
                </div>
                <div className="item-price">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses Section */}
      {courses.length > 0 && (
        <div className="summary-section">
          <h3>Course Enrollments</h3>
          <div className="cart-items">
            {courses.map((item) => (
              <div key={`course-${item.id}`} className="cart-item course-item">
                <div className="item-info">
                  <h4>🎓 {item.name}</h4>
                  <p>Session: {formatDate(item.sessionDate)}</p>
                </div>
                <div className="item-price">
                  {formatPrice(item.coursePrice)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trips Section */}
      {trips.length > 0 && (
        <div className="summary-section">
          <h3>Trip Bookings</h3>
          <div className="cart-items">
            {trips.map((item) => (
              <div key={`trip-${item.id}`} className="cart-item trip-item">
                <div className="item-info">
                  <h4>🏕️ {item.title}</h4>
                  <p>📍 {item.location}</p>
                  <p>📅 {formatDateRange(item.start_date, item.end_date)}</p>
                </div>
                <div className="item-price">
                  {formatPrice(item.price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="order-total">
        <div className="total-row">
          <span>Subtotal:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="total-row">
          <span>Shipping:</span>
          <span>{formatPrice(shipping)}</span>
        </div>
        <div className="total-row total">
          <span>Total:</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        className="btn btn-primary checkout-button"
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Complete Order'}
      </button>
    </div>
  );
};

export default OrderSummary;
