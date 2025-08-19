import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // Clear corrupted cart data
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, quantity = 1, type = 'product') => {
    setCart(prevCart => {
      // For course enrollments, we need to check if already enrolled
      if (type === 'course') {
        const existingEnrollment = prevCart.find(cartItem => 
          cartItem.type === 'course' && 
          cartItem.courseId === item.courseId && 
          cartItem.sessionId === item.sessionId
        );
        
        if (existingEnrollment) {
          console.warn('Already enrolled in this course session');
          return prevCart;
        }
        
        return [...prevCart, { ...item, type, quantity: 1 }];
      }
      
      // For products, use existing logic
      const existingItem = prevCart.find(cartItem => 
        cartItem.type === 'product' && cartItem.id === item.id
      );
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        // Check stock availability
        if (item.qty_on_hand !== undefined && newQuantity > item.qty_on_hand) {
          console.warn(`Cannot add more than ${item.qty_on_hand} units of ${item.name}`);
          return prevCart; // Don't update cart if exceeding stock
        }
        
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      } else {
        // Check stock availability for new items
        if (item.qty_on_hand !== undefined && quantity > item.qty_on_hand) {
          console.warn(`Cannot add more than ${item.qty_on_hand} units of ${item.name}`);
          return prevCart; // Don't add item if exceeding stock
        }
        
        return [...prevCart, { ...item, type, quantity }];
      }
    });
  };

  const removeFromCart = (itemId, type = 'product') => {
    setCart(prevCart => prevCart.filter(item => !(item.type === type && item.id === itemId)));
  };

  const updateQuantity = (itemId, quantity, type = 'product') => {
    if (quantity <= 0) {
      removeFromCart(itemId, type);
      return;
    }

    setCart(prevCart => {
      const item = prevCart.find(cartItem => cartItem.type === type && cartItem.id === itemId);
      if (!item) return prevCart;

      // For courses, quantity is always 1
      if (type === 'course') {
        return prevCart;
      }

      // Check stock availability for products
      if (item.qty_on_hand !== undefined && quantity > item.qty_on_hand) {
        console.warn(`Cannot set quantity higher than ${item.qty_on_hand} for ${item.name}`);
        return prevCart; // Don't update if exceeding stock
      }

      return prevCart.map(cartItem =>
        cartItem.type === type && cartItem.id === itemId ? { ...cartItem, quantity } : cartItem
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      if (item.type === 'course') {
        const coursePrice = parseFloat(item.coursePrice) || 0;
        return total + coursePrice;
      }
      const price = parseFloat(item.price) || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => {
      if (item.type === 'course') {
        return count + 1; // Courses count as 1 each
      }
      return count + item.quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.length;
  };

  const isItemInCart = (itemId, type = 'product') => {
    return cart.some(item => item.type === type && item.id === itemId);
  };

  const getItemQuantity = (itemId, type = 'product') => {
    const item = cart.find(item => item.type === type && item.id === itemId);
    return item ? item.quantity : 0;
  };

  const validateCart = () => {
    const errors = [];
    
    cart.forEach(item => {
      if (item.type === 'product' && item.qty_on_hand !== undefined && item.quantity > item.qty_on_hand) {
        errors.push(`${item.name} - Only ${item.qty_on_hand} available, but ${item.quantity} in cart`);
      }
    });
    
    return errors;
  };

  const getCartProducts = () => {
    return cart.filter(item => item.type === 'product');
  };

  const getCartCourses = () => {
    return cart.filter(item => item.type === 'course');
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const value = {
    cart,
    isOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getCartItemCount,
    isItemInCart,
    getItemQuantity,
    validateCart,
    getCartProducts,
    getCartCourses,
    openCart,
    closeCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
