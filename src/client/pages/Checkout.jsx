import { useCart } from '../contexts/CartContext.jsx';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="checkout">
        <div className="checkout-container">
          <h1>Your Cart is Empty</h1>
          <p>Add some products to your cart to continue with checkout.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="checkout-container">
        <h1>Checkout</h1>
        
        <div className="checkout-layout">
          <div className="checkout-form">
            <h2>Shipping Information</h2>
            <form>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-input" />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Address</label>
                <input type="text" className="form-input" />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input type="text" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP Code</label>
                  <input type="text" className="form-input" />
                </div>
              </div>
            </form>

            <h2>Payment Information</h2>
            <form>
              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input type="text" className="form-input" placeholder="1234 5678 9012 3456" />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input type="text" className="form-input" placeholder="MM/YY" />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input type="text" className="form-input" placeholder="123" />
                </div>
              </div>
            </form>
          </div>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-total">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>$0.00</span>
              </div>
              <div className="total-row total">
                <span>Total:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </div>

            <button className="btn btn-primary checkout-button">
              Complete Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
