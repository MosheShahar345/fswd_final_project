import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import { formatDate, formatDateRange } from '../utils/dateUtils.js';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart, validateCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showError } = useNotification();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [errors, setErrors] = useState({});

  // Get cart breakdown
  const products = cart.filter(item => item.type === 'product');
  const courses = cart.filter(item => item.type === 'course');
  const trips = cart.filter(item => item.type === 'trip');

  if (cart.length === 0) {
    return (
      <div className="checkout">
        <div className="checkout-container">
          <div className="checkout-empty">
            <h1>Your Cart is Empty</h1>
            <p>Add some items, courses, or trips to your cart to continue with checkout.</p>
            <div className="checkout-empty-actions">
              <button 
                onClick={() => navigate('/shop')} 
                className="btn btn-primary"
              >
                Browse Products
              </button>
              <button 
                onClick={() => navigate('/activities')} 
                className="btn btn-outline"
              >
                Browse Activities
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'];
    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Payment validation
    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!formData.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiryDate = 'Please enter expiry date in MM/YY format';
    }

    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check cart validation
    const cartErrors = validateCart();
    if (cartErrors.length > 0) {
      showError('Some items in your cart are no longer available in the requested quantities. Please review your cart.');
      // Navigate to appropriate page based on cart contents
      if (products.length > 0) {
        navigate('/shop');
      } else if (courses.length > 0 || trips.length > 0) {
        navigate('/activities');
      } else {
        navigate('/shop');
      }
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data
      const orderData = {
        total: total,
        items: cart.filter(item => item.type === 'product').map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        courses: cart.filter(item => item.type === 'course').map(item => ({
          courseId: item.courseId,
          sessionId: item.sessionId,
          price: item.coursePrice
        })),
        trips: cart.filter(item => item.type === 'trip').map(item => ({
          tripId: item.id,
          price: item.price
        }))
      };



      // Create order in database
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Checkout error response:', errorData);
        console.error('Error details:', JSON.stringify(errorData, null, 2));
        
        // Extract the most detailed error message available
        let errorMessage = 'Failed to create order';
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.error.details) {
            errorMessage = errorData.error.details;
          }
        } else if (errorData.details) {
          errorMessage = errorData.details;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Clear cart and redirect to success page with order ID
      clearCart();
      navigate(`/checkout/success?orderId=${result.orderId}`);
    } catch (error) {
      console.error('Order processing failed:', error);
      showError(error.message || 'There was an error processing your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price) => {
    // Handle undefined, null, or NaN prices
    if (price === undefined || price === null || isNaN(price)) {
      console.warn('Invalid price detected in checkout:', price);
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const subtotal = getCartTotal();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;
  


  return (
    <div className="checkout">
      <div className="checkout-container">
        <h1>Checkout</h1>
        
        <div className="checkout-layout">
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              <h2>Shipping Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Address *</label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`form-input ${errors.address ? 'error' : ''}`}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`form-input ${errors.city ? 'error' : ''}`}
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input 
                    type="text" 
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`form-input ${errors.state ? 'error' : ''}`}
                  />
                  {errors.state && <span className="error-message">{errors.state}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP Code *</label>
                  <input 
                    type="text" 
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`form-input ${errors.zipCode ? 'error' : ''}`}
                  />
                  {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                </div>
              </div>

              <h2>Payment Information</h2>
              <div className="form-group">
                <label className="form-label">Card Number *</label>
                <input 
                  type="text" 
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  className={`form-input ${errors.cardNumber ? 'error' : ''}`}
                />
                {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Expiry Date *</label>
                  <input 
                    type="text" 
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    className={`form-input ${errors.expiryDate ? 'error' : ''}`}
                  />
                  {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">CVV *</label>
                  <input 
                    type="text" 
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    className={`form-input ${errors.cvv ? 'error' : ''}`}
                  />
                  {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                </div>
              </div>
            </form>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default Checkout;
