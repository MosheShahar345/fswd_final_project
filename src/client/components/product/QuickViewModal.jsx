import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductImage } from '../../utils/productImages.js';
import './QuickViewModal.css';

const QuickViewModal = ({ product, isOpen, onClose, onAddToCart }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

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

  const handleAddToCart = () => {
    onAddToCart(product, 1);
    onClose();
  };

  return (
    <div className="quick-view-overlay" onClick={onClose}>
      <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
        <button className="quick-view-close" onClick={onClose}>
          ×
        </button>
        
        <div className="quick-view-content">
          <div className="quick-view-image">
            <img 
              src={placeholderImage.url} 
              alt={placeholderImage.alt} 
            />
          </div>
          
          <div className="quick-view-details">
            <div className="quick-view-header">
              <h2>{product.name}</h2>
              <span className="brand">{product.brand}</span>
            </div>
            
            <div className="quick-view-price">
              {formatPrice(product.price)}
            </div>
            
            {stockStatus && (
              <div className={`stock-badge ${stockStatus.class}`}>
                {stockStatus.text}
              </div>
            )}
            
            {product.category && (
              <div className="quick-view-category">
                <span className="category-tag">{product.category}</span>
              </div>
            )}
            
            {product.description && (
              <div className="quick-view-description">
                <h4>Description</h4>
                <p>{product.description}</p>
              </div>
            )}
            
            <div className="quick-view-actions">
              <button 
                className="btn btn-primary btn-large"
                onClick={handleAddToCart}
                disabled={product.qty_on_hand === 0}
              >
                {product.qty_on_hand === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              
              <Link 
                to={`/shop/product/${product.id}`}
                className="btn btn-outline btn-large"
                onClick={onClose}
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
