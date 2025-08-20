import { Link } from 'react-router-dom';

const ProductInfo = ({ 
  product, 
  formatPrice, 
  quantity, 
  handleQuantityChange, 
  handleAddToCart,
  navigate 
}) => {
  return (
    <div className="product-info">
      <div className="product-header">
        <h1>{product.name}</h1>
        <p className="brand">{product.brand}</p>
        {product.category && (
          <span className="category-tag">{product.category}</span>
        )}
      </div>

      <div className="product-price">
        {formatPrice(product.price)}
      </div>

      {product.description && (
        <div className="product-description">
          <h3>Description</h3>
          <p>{product.description}</p>
        </div>
      )}

      <div className="product-meta">
        {product.sku && (
          <div className="meta-item">
            <span className="label">SKU:</span>
            <span className="value">{product.sku}</span>
          </div>
        )}
        {product.qty_on_hand !== undefined && (
          <div className="meta-item">
            <span className="label">Availability:</span>
            <span className="value">
              {product.qty_on_hand > 0 
                ? `${product.qty_on_hand} in stock` 
                : 'Out of stock'
              }
            </span>
          </div>
        )}
      </div>

      {/* Add to Cart Section */}
      <div className="add-to-cart-section">
        {product.qty_on_hand > 0 ? (
          <>
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <div className="quantity-controls">
                <button 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="quantity-btn"
                >
                  -
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.qty_on_hand}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="quantity-input"
                />
                <button 
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.qty_on_hand}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="btn btn-primary btn-large add-to-cart-btn"
            >
              Add to Cart
            </button>
          </>
        ) : (
          <div className="out-of-stock-message">
            <p>This product is currently out of stock.</p>
            <button 
              onClick={() => navigate('/shop')}
              className="btn btn-outline"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Related Actions */}
      <div className="product-actions">
        <button 
          onClick={() => navigate('/shop')}
          className="btn btn-outline"
        >
          ← Back to Shop
        </button>
        
        {product.category && (
          <Link 
            to={`/shop?category=${product.category}`}
            className="btn btn-outline"
          >
            View More {product.category}
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;
