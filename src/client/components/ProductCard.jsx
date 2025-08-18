import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    onAddToCart(product, 1);
  };

  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];

  return (
    <Link to={`/shop/product/${product.id}`} className="product-card">
      <div className="product-image">
        {primaryImage ? (
          <img src={primaryImage.url} alt={primaryImage.alt || product.name} />
        ) : (
          <div className="product-placeholder">📦</div>
        )}
        <div className="product-overlay">
          <button 
            onClick={handleAddToCart}
            className="btn btn-primary add-to-cart-btn"
          >
            Add to Cart
          </button>
        </div>
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-brand">{product.brand}</p>
        <div className="product-meta">
          <span className="product-price">${product.price}</span>
          {product.qty_on_hand !== undefined && (
            <span className={`product-stock ${product.qty_on_hand > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.qty_on_hand > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
