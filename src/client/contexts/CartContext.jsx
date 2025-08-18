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

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        // Check stock availability
        if (product.qty_on_hand !== undefined && newQuantity > product.qty_on_hand) {
          console.warn(`Cannot add more than ${product.qty_on_hand} units of ${product.name}`);
          return prevCart; // Don't update cart if exceeding stock
        }
        
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // Check stock availability for new items
        if (product.qty_on_hand !== undefined && quantity > product.qty_on_hand) {
          console.warn(`Cannot add more than ${product.qty_on_hand} units of ${product.name}`);
          return prevCart; // Don't add item if exceeding stock
        }
        
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      const item = prevCart.find(item => item.id === productId);
      if (!item) return prevCart;

      // Check stock availability
      if (item.qty_on_hand !== undefined && quantity > item.qty_on_hand) {
        console.warn(`Cannot set quantity higher than ${item.qty_on_hand} for ${item.name}`);
        return prevCart; // Don't update if exceeding stock
      }

      return prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.length;
  };

  const isItemInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const validateCart = () => {
    const errors = [];
    
    cart.forEach(item => {
      if (item.qty_on_hand !== undefined && item.quantity > item.qty_on_hand) {
        errors.push(`${item.name} - Only ${item.qty_on_hand} available, but ${item.quantity} in cart`);
      }
    });
    
    return errors;
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
    openCart,
    closeCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
