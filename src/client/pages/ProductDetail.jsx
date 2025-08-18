import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext.jsx';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/products/${id}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading product...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error">
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        <div className="product-images">
          <div className="main-image">
            <div className="image-placeholder">📦</div>
          </div>
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="product-brand">{product.brand}</p>
          <div className="product-price">${product.price}</div>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description || 'No description available.'}</p>
          </div>

          <div className="product-specs">
            <h3>Specifications</h3>
            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Category:</span>
                <span className="spec-value">{product.category || 'N/A'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">SKU:</span>
                <span className="spec-value">{product.sku || 'N/A'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Stock:</span>
                <span className={`spec-value ${product.qty_on_hand > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.qty_on_hand > 0 ? `${product.qty_on_hand} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn btn-primary add-to-cart"
              disabled={product.qty_on_hand <= 0}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
