import { Link } from 'react-router-dom';
import './CheckoutSuccess.css';

const CheckoutSuccess = () => {
  return (
    <div className="checkout-success">
      <div className="success-container">
        <div className="success-content">
          <div className="success-icon">✅</div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your order has been successfully placed.</p>
          
          <div className="order-details">
            <h2>Order Details</h2>
            <div className="order-info">
              <div className="info-row">
                <span>Order Number:</span>
                <span>#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
              <div className="info-row">
                <span>Order Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <span>Estimated Delivery:</span>
                <span>{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
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
