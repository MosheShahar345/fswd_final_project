// Placeholder images for different product categories
export const getProductImage = (product) => {
  const category = product.category?.toLowerCase();
  const brand = product.brand?.toLowerCase();
  
  // Define image mappings based on category and brand
  const imageMap = {
    'backpacks': {
      'adventurepro': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      'trailmaster': 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=400&h=400&fit=crop',
      'lightgear': 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
    },
    'hiking': {
      'trailmaster': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop',
      'mountainfoot': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop'
    },
    'camping': {
      'camplife': 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=400&h=400&fit=crop',
      'firegear': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=400&h=400&fit=crop'
    },
    'climbing': {
      'rockpro': 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&h=400&fit=crop'
    },
    'water sports': {
      'wateradventure': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'
    },
    'electronics': {
      'techgear': 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&h=400&fit=crop'
    },
    'clothing': {
      'weathergear': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'
    }
  };

  // Get category images
  const categoryImages = imageMap[category] || imageMap['backpacks'];
  
  // Get brand-specific image or default
  const imageUrl = categoryImages[brand] || categoryImages.default;
  
  return {
    url: imageUrl,
    alt: `${product.name} - ${product.brand}`
  };
};

// Category icons for the shop
export const getCategoryIcon = (category) => {
  const icons = {
    'backpacks': '🎒',
    'hiking': '🥾',
    'camping': '⛺',
    'climbing': '🧗',
    'water sports': '🛶',
    'electronics': '📱',
    'clothing': '👕'
  };
  
  return icons[category?.toLowerCase()] || '📦';
};
