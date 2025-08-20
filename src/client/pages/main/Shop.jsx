import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import ShopHeader from '../../components/shop/ShopHeader.jsx';
import FiltersSidebar from '../../components/shop/FiltersSidebar.jsx';
import ProductsSection from '../../components/shop/ProductsSection.jsx';
import QuickViewModal from '../../components/product/QuickViewModal.jsx';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [displayedProducts, setDisplayedProducts] = useState([]); // Currently displayed products
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useNotification();
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const observerRef = useRef();
  const loadingRef = useRef();

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || '',
    min: searchParams.get('min') || '',
    max: searchParams.get('max') || '',
    sort: searchParams.get('sort') || 'name',
    order: searchParams.get('order') || 'asc',
    inStock: searchParams.get('inStock') || ''
  });

  const [activeFilters, setActiveFilters] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        const response = await fetch(`http://localhost:3000/api/products?${params}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const productsData = data.products || data;
        setAllProducts(productsData);
        setDisplayedProducts(productsData.slice(0, 10));
        setHasMore(productsData.length > 10);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    // Count active filters
    const count = Object.values(filters).filter(value => 
      value && value !== 'name' && value !== 'asc' && value !== '1'
    ).length;
    setActiveFilters(count);
  }, [filters]);

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchStats();
  }, []);

  // Update displayed products when allProducts changes
  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * 10;
    setDisplayedProducts(allProducts.slice(startIndex, endIndex));
    setHasMore(endIndex < allProducts.length);
  }, [allProducts, currentPage]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore]);

  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`http://localhost:3000/api/products?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const productsData = data.products || data;
      setAllProducts(productsData);
      setDisplayedProducts(productsData.slice(0, 10));
      setHasMore(productsData.length > 10);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setCurrentPage(prev => prev + 1);
    setLoadingMore(false);
  }, [loadingMore, hasMore]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products/brands');
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== '1' && v !== 'asc') newSearchParams.set(k, v);
    });
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    const newFilters = {
      q: '',
      brand: '',
      category: '',
      min: '',
      max: '',
      sort: 'name',
      order: 'asc',
      inStock: ''
    };
    setFilters(newFilters);
    setSearchParams({});
  };

  const removeFilter = (key) => {
    const newFilters = { ...filters, [key]: '' };
    if (key === 'sort') newFilters.sort = 'name';
    if (key === 'order') newFilters.order = 'asc';
    setFilters(newFilters);
    
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== '1' && v !== 'asc') newSearchParams.set(k, v);
    });
    setSearchParams(newSearchParams);
  };

  const getFilterLabel = (key, value) => {
    switch (key) {
      case 'q': return `Search: "${value}"`;
      case 'brand': return `Brand: ${value}`;
      case 'category': return `Category: ${value}`;
      case 'min': return `Min Price: $${value}`;
      case 'max': return `Max Price: $${value}`;
      case 'sort': return `Sort: ${value}`;
      case 'order': return `Order: ${value}`;
      case 'inStock': return `Stock: ${value === 'true' ? 'In Stock' : 'Out of Stock'}`;
      default: return value;
    }
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  const handleAddToCart = (product, quantity) => {
    try {
      addToCart(product, quantity);
      showSuccess(`${product.name} added to cart!`);
    } catch (error) {
      showError(`Failed to add ${product.name} to cart: ${error.message}`);
    }
  };

  return (
    <div className="shop shop-page">
      <ShopHeader stats={stats} />

      <div className="shop-layout">
        <FiltersSidebar 
          filters={filters}
          categories={categories}
          brands={brands}
          activeFilters={activeFilters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          removeFilter={removeFilter}
          getFilterLabel={getFilterLabel}
        />

        <ProductsSection 
          loading={loading}
          error={error}
          allProducts={allProducts}
          displayedProducts={displayedProducts}
          activeFilters={activeFilters}
          fetchAllProducts={fetchAllProducts}
          clearFilters={clearFilters}
          handleAddToCart={handleAddToCart}
          handleQuickView={handleQuickView}
          hasMore={hasMore}
          loadingMore={loadingMore}
          loadingRef={loadingRef}
        />
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default Shop;
