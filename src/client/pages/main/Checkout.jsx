import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import ShippingForm from '../../components/checkout/ShippingForm.jsx';
import PaymentForm from '../../components/checkout/PaymentForm.jsx';
import OrderSummary from '../../components/checkout/OrderSummary.jsx';
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
          <form onSubmit={handleSubmit}>
            <ShippingForm 
              formData={formData} 
              handleInputChange={handleInputChange} 
              errors={errors} 
            />
            
            <PaymentForm 
              formData={formData} 
              handleInputChange={handleInputChange} 
              errors={errors} 
            />
          </form>

          <OrderSummary 
            products={products}
            courses={courses}
            trips={trips}
            formatPrice={formatPrice}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
            isProcessing={isProcessing}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
