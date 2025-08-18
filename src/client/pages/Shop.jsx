import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`http://localhost:3000/api/products?${params}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products/brands');
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
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

  return (
    <div className="shop">
      <div className="shop-header">
        <h1>Shop Gear</h1>
        <p>Find the perfect equipment for your next adventure</p>
      </div>

      <div className="shop-layout">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            <button onClick={clearFilters} className="btn btn-outline">
              Clear All
            </button>
          </div>

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
          ) : (
            <>
              <div className="products-header">
                <h2>{products.length} Products</h2>
              </div>
              
              {products.length === 0 ? (
                <div className="no-products">
                  <p>No products found matching your criteria.</p>
                  <button onClick={clearFilters} className="btn btn-primary">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="products-grid">
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
