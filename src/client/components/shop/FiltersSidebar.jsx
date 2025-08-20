import React from 'react';

const FiltersSidebar = ({ 
  filters, 
  categories, 
  brands, 
  activeFilters, 
  handleFilterChange, 
  clearFilters, 
  removeFilter, 
  getFilterLabel 
}) => {
  return (
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
  );
};

export default FiltersSidebar;
