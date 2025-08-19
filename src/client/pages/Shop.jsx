import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import QuickViewModal from '../components/QuickViewModal.jsx';
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
    const timer = setTimeout(() => {
      fetchAllProducts();
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
    addToCart(product, quantity);
    // Show a brief success message (you could add a toast notification here)
  };

  return (
    <div className="shop shop-page">
      <div className="shop-header">
        <h1>Shop Gear</h1>
        <p>Find the perfect equipment for your next adventure</p>
        {stats && (
          <div className="shop-stats">
            <span>{stats.total_products} Products</span>
            <span>{stats.categories} Categories</span>
            <span>{stats.brands} Brands</span>
            <span>${stats.min_price} - ${stats.max_price}</span>
          </div>
        )}
      </div>

      <div className="shop-layout">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="btn btn-outline btn-sm">
                Clear All
              </button>
            )}
          </div>

          {/* Active Filters */}
          {activeFilters > 0 && (
            <div className="active-filters">
              {Object.entries(filters).map(([key, value]) => {
                if (value && key !== 'sort' && key !== 'order' && value !== 'asc') {
                  return (
                    <span key={key} className="filter-tag">
                      {getFilterLabel(key, value)}
                      <button 
                        onClick={() => removeFilter(key)}
                        className="filter-remove"
                      >
                        ×
                      </button>
                    </span>
                  );
                }
                return null;
              })}
            </div>
          )}

          {/* Search */}
          <div className="filter-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search products..."
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="filter-group">
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Brands */}
          <div className="filter-group">
            <label className="form-label">Brand</label>
            <select
              className="form-input"
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status */}
          <div className="filter-group">
            <label className="form-label">Stock Status</label>
            <select
              className="form-input"
              value={filters.inStock}
              onChange={(e) => handleFilterChange('inStock', e.target.value)}
            >
              <option value="">All Items</option>
              <option value="true">In Stock</option>
              <option value="false">Out of Stock</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <label className="form-label">Price Range</label>
            <div className="price-inputs">
              <input
                type="number"
                className="form-input"
                placeholder="Min"
                value={filters.min}
                onChange={(e) => handleFilterChange('min', e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                className="form-input"
                placeholder="Max"
                value={filters.max}
                onChange={(e) => handleFilterChange('max', e.target.value)}
              />
            </div>
          </div>

          {/* Sort */}
          <div className="filter-group">
            <label className="form-label">Sort By</label>
            <select
              className="form-input"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="created_at">Newest</option>
              <option value="brand">Brand</option>
              <option value="category">Category</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="filter-group">
            <label className="form-label">Sort Order</label>
            <select
              className="form-input"
              value={filters.order}
              onChange={(e) => handleFilterChange('order', e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="products-section">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <span>Loading products...</span>
            </div>
          ) : error ? (
            <div className="error">
              <p>{error}</p>
              <button onClick={fetchAllProducts} className="btn btn-primary">
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="products-header">
                <h2>{allProducts.length} Products</h2>
                {activeFilters > 0 && (
                  <span className="filter-count">
                    {activeFilters} filter{activeFilters !== 1 ? 's' : ''} active
                  </span>
                )}
                <span className="displayed-count">
                  Showing {displayedProducts.length} of {allProducts.length}
                </span>
              </div>
              
              {displayedProducts.length === 0 ? (
                <div className="no-products">
                  <div className="no-products-icon">🔍</div>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or search terms.</p>
                  <button onClick={clearFilters} className="btn btn-primary">
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="products-grid">
                    {displayedProducts.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onQuickView={handleQuickView}
                      />
                    ))}
                  </div>

                  {/* Infinite Scroll Loading Indicator */}
                  {hasMore && (
                    <div ref={loadingRef} className="infinite-scroll-loader">
                      {loadingMore ? (
                        <div className="loading-more">
                          <div className="spinner"></div>
                          <span>Loading more products...</span>
                        </div>
                      ) : (
                        <div className="scroll-hint">
                          <span>Scroll down to load more products</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* End of results */}
                  {!hasMore && allProducts.length > 0 && (
                    <div className="end-of-results">
                      <span>You've reached the end of the results</span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Quick View Modal */}
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
