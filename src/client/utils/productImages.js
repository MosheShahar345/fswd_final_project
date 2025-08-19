// Diving equipment images for different product categories
export const getProductImage = (product) => {
  const category = product.category?.toLowerCase();
  const brand = product.brand?.toLowerCase();
  
  // Define image mappings based on diving equipment categories and brands
  const imageMap = {
    'buoyancy control devices': {
      'scubapro': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'mares': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'cressi': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'
    },
    'regulators': {
      'scubapro': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'mares': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'apeks': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'
    },
    'wetsuits': {
      'scubapro': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'mares': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'bare': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'
    },
    'tanks': {
      'luxfer': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'catalina': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'
    },
    'fins': {
      'scubapro': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'mares': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'cressi': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'
    },
    'masks': {
      'scubapro': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'mares': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'cressi': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'
    },
    'snorkels': {
      'scubapro': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'mares': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'cressi': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'
    },
    'dive computers': {
      'suunto': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'mares': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'cressi': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'
    },
    'accessories': {
      'scubapro': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'mares': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'cressi': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'
    },
    'weight systems': {
      'scubapro': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'mares': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'
    },
    'training equipment': {
      'scubapro': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'mares': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'
    }
  };

  // Get category images
  const categoryImages = imageMap[category] || imageMap['buoyancy control devices'];
  
  // Get brand-specific image or default
  const imageUrl = categoryImages[brand] || categoryImages.default;
  
  return {
    url: imageUrl,
    alt: `${product.name} - ${product.brand}`
  };
};

// Diving equipment category icons for the shop
export const getCategoryIcon = (category) => {
  const icons = {
    'buoyancy control devices': '🦺',
    'regulators': '🫧',
    'wetsuits': '👕',
    'tanks': '🛢️',
    'fins': '🐠',
    'masks': '🥽',
    'snorkels': '🌊',
    'dive computers': '⌚',
    'accessories': '🔧',
    'weight systems': '⚖️',
    'training equipment': '📚'
  };
  
  return icons[category?.toLowerCase()] || '🤿';
};

// Price formatting utility
export const formatPrice = (price) => {
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
