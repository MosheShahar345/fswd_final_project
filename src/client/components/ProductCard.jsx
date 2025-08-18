import { Link } from 'react-router-dom';
import { getProductImage } from '../utils/productImages.js';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart, onQuickView }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    onAddToCart(product, 1);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    onQuickView(product);
  };

  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const placeholderImage = getProductImage(product);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStockStatus = () => {
    if (product.qty_on_hand === undefined) return null;
    if (product.qty_on_hand > 10) return { text: 'In Stock', class: 'in-stock' };
    if (product.qty_on_hand > 0) return { text: 'Low Stock', class: 'low-stock' };
    return { text: 'Out of Stock', class: 'out-of-stock' };
  };

  const stockStatus = getStockStatus();

  return (
    <Link to={`/shop/product/${product.id}`} className="product-card">
      <div className="product-image">
        {primaryImage ? (
          <img src={primaryImage.url} alt={primaryImage.alt || product.name} />
        ) : (
          <img src={placeholderImage.url} alt={placeholderImage.alt} />
        )}
        <div className="product-overlay">
          <div className="product-actions">
            <button 
              onClick={handleAddToCart}
              className="btn btn-primary add-to-cart-btn"
              disabled={product.qty_on_hand === 0}
            >
              {product.qty_on_hand === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button 
              onClick={handleQuickView}
              className="btn btn-outline quick-view-btn"
            >
              Quick View
            </button>
          </div>
        </div>
      </div>
      
      <div className="product-info">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          <span className="product-brand">{product.brand}</span>
        </div>
        
        {product.description && (
          <p className="product-description">
            {product.description.length > 80 
              ? `${product.description.substring(0, 80)}...` 
              : product.description
            }
          </p>
        )}
        
        <div className="product-footer">
          <span className="product-price">{formatPrice(product.price)}</span>
          {stockStatus && (
            <div className={`stock-badge ${stockStatus.class}`}>
              {stockStatus.text}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
