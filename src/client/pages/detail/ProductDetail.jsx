import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { getProductImage } from '../../utils/productImages.js';
import ProductBreadcrumb from '../../components/product-detail/ProductBreadcrumb.jsx';
import ProductImages from '../../components/product-detail/ProductImages.jsx';
import ProductInfo from '../../components/product-detail/ProductInfo.jsx';
import LoadingState from '../../components/product-detail/LoadingState.jsx';
import ErrorState from '../../components/product-detail/ErrorState.jsx';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useNotification();
  
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
      try {
        addToCart(product, quantity);
        showSuccess(`${product.name} added to cart!`);
      } catch (error) {
        showError(`Failed to add ${product.name} to cart: ${error.message}`);
      }
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
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} navigate={navigate} />;
  }

  if (!product) {
    return <ErrorState error="The product you're looking for doesn't exist." navigate={navigate} />;
  }

  const stockStatus = getStockStatus();
  const placeholderImage = getProductImage(product);
  const images = product.images?.length > 0 ? product.images : [placeholderImage];

  return (
    <div className="product-detail product-detail">
      <div className="product-detail-container">
        <ProductBreadcrumb product={product} />
        
        <div className="product-detail-content">
          <ProductImages 
            images={images}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            product={product}
            stockStatus={stockStatus}
          />
          
          <ProductInfo 
            product={product}
            formatPrice={formatPrice}
            quantity={quantity}
            handleQuantityChange={handleQuantityChange}
            handleAddToCart={handleAddToCart}
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
