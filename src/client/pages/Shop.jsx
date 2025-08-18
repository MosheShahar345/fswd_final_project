import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import QuickViewModal from '../components/QuickViewModal.jsx';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || '',
    min: searchParams.get('min') || '',
    max: searchParams.get('max') || '',
    sort: searchParams.get('sort') || 'name'
  });

  const [activeFilters, setActiveFilters] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    // Count active filters
    const count = Object.values(filters).filter(value => value && value !== 'name').length;
    setActiveFilters(count);
  }, [filters]);

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchStats();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
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
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

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
      if (v) newSearchParams.set(k, v);
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
      sort: 'name'
    };
    setFilters(newFilters);
    setSearchParams({});
  };

  const removeFilter = (key) => {
    const newFilters = { ...filters, [key]: '' };
    setFilters(newFilters);
    
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v);
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
                if (value && key !== 'sort') {
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
              <button onClick={fetchProducts} className="btn btn-primary">
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="products-header">
                <h2>{products.length} Products</h2>
                {activeFilters > 0 && (
                  <span className="filter-count">
                    {activeFilters} filter{activeFilters !== 1 ? 's' : ''} active
                  </span>
                )}
              </div>
              
              {products.length === 0 ? (
                <div className="no-products">
                  <div className="no-products-icon">🔍</div>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or search terms.</p>
                  <button onClick={clearFilters} className="btn btn-primary">
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="products-grid">
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onQuickView={handleQuickView}
                    />
                  ))}
                </div>
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
