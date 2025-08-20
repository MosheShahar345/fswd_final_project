import { useCart } from '../contexts/CartContext.jsx';
import { Link } from 'react-router-dom';
import { getProductImage } from '../utils/productImages.js';
import { formatDate, formatDateRange } from '../utils/dateUtils.js';
import './Cart.css';

const Cart = () => {
  const { 
    cart, 
    isOpen, 
    closeCart, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    getCartCount 
  } = useCart();

  const formatPrice = (price) => {
    // Handle undefined, null, or NaN prices
    if (price === undefined || price === null || isNaN(price)) {
      console.warn('Invalid price detected:', price);
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleQuantityChange = (itemId, newQuantity, type = 'product') => {
    if (newQuantity <= 0) {
      removeFromCart(itemId, type);
    } else {
      updateQuantity(itemId, newQuantity, type);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={closeCart}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Shopping Cart ({getCartCount()})</h2>
          <button onClick={closeCart} className="cart-close">×</button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some products to get started!</p>
            <Link to="/shop" className="btn btn-primary" onClick={closeCart}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => {
                if (item.type === 'course') {
                  return (
                    <div key={`course-${item.id}`} className="cart-item cart-course-item">
                      <div className="cart-item-image">
                        <div className="course-icon">🎓</div>
                        <div className="cart-item-price">{formatPrice(item.coursePrice)}</div>
                      </div>
                      
                      <div className="cart-item-details">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <p className="cart-item-brand">Course Enrollment</p>
                        <p className="cart-item-session">Session: {formatDate(item.sessionDate)}</p>
                      </div>

                      <div className="cart-item-controls">
                        <button 
                          onClick={() => removeFromCart(item.id, 'course')}
                          className="remove-btn"
                          aria-label="Remove course"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="cart-item-total">
                        {formatPrice(item.coursePrice)}
                      </div>
                    </div>
                  );
                }

                if (item.type === 'trip') {
                  return (
                    <div key={`trip-${item.id}`} className="cart-item cart-trip-item">
                      <div className="cart-item-image">
                        <div className="trip-icon">🏕️</div>
                        <div className="cart-item-price">{formatPrice(item.price)}</div>
                      </div>
                      
                      <div className="cart-item-details">
                        <h4 className="cart-item-name">{item.title}</h4>
                        <p className="cart-item-brand">Trip Booking</p>
                        <p className="cart-item-location">📍 {item.location}</p>
                        <p className="cart-item-dates">
                          {formatDateRange(item.start_date, item.end_date)}
                        </p>
                      </div>

                      <div className="cart-item-controls">
                        <button 
                          onClick={() => removeFromCart(item.id, 'trip')}
                          className="remove-btn"
                          aria-label="Remove trip"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="cart-item-total">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  );
                }

                // Product item
                const placeholderImage = getProductImage(item);
                const primaryImage = item.images?.find(img => img.is_primary) || item.images?.[0];
                const imageUrl = primaryImage ? primaryImage.url : placeholderImage.url;
                
                return (
                  <div key={`product-${item.id}`} className="cart-item">
                    <div className="cart-item-image">
                      <img src={imageUrl} alt={item.name} />
                      <div className="cart-item-price">{formatPrice(item.price)}</div>
                    </div>
                    
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-brand">{item.brand}</p>
                    </div>

                    <div className="cart-item-controls">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1, 'product')}
                          className="quantity-btn"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1, 'product')}
                          className="quantity-btn"
                          disabled={item.qty_on_hand !== undefined && item.quantity >= item.qty_on_hand}
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.id, 'product')}
                        className="remove-btn"
                        aria-label="Remove item"
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="cart-item-total">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-footer">
              <div className="cart-summary">
                <div className="cart-total">
                  <span>Total:</span>
                  <span className="total-amount">{formatPrice(getCartTotal())}</span>
                </div>
                
                <div className="cart-actions">
                  <Link to="/shop" className="btn btn-outline" onClick={closeCart}>
                    Continue Shopping
                  </Link>
                  <Link to="/checkout" className="btn btn-primary" onClick={closeCart}>
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
