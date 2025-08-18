import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { getProductImage } from '../utils/productImages.js';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/api/products/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error('Failed to load product');
      }
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      addToCart(product, quantity);
      // You could add a toast notification here
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= (product?.qty_on_hand || 999)) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStockStatus = () => {
    if (!product || product.qty_on_hand === undefined) return null;
    if (product.qty_on_hand > 10) return { text: 'In Stock', class: 'in-stock' };
    if (product.qty_on_hand > 0) return { text: 'Low Stock', class: 'low-stock' };
    return { text: 'Out of Stock', class: 'out-of-stock' };
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="spinner"></div>
        <span>Loading product...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-error">
        <h2>Product Not Found</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/shop')} className="btn btn-primary">
          Back to Shop
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/shop')} className="btn btn-primary">
          Back to Shop
        </button>
      </div>
    );
  }

  const stockStatus = getStockStatus();
  const placeholderImage = getProductImage(product);
  const images = product.images?.length > 0 ? product.images : [placeholderImage];
  const currentImage = images[selectedImage];

  return (
    <div className="product-detail product-detail">
      <div className="product-detail-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/shop">Shop</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/shop?category=${product.category}`}>{product.category}</Link>
              <span>/</span>
            </>
          )}
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-content">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              <img 
                src={currentImage.url} 
                alt={currentImage.alt || product.name} 
              />
              {stockStatus && (
                <div className={`stock-badge ${stockStatus.class}`}>
                  {stockStatus.text}
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="image-thumbnails">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={image.url} 
                      alt={image.alt || `${product.name} ${index + 1}`} 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
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
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
