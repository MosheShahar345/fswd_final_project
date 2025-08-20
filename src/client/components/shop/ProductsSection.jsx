import React from 'react';
import ProductCard from '../product/ProductCard.jsx';

const ProductsSection = ({ 
  loading, 
  error, 
  allProducts, 
  displayedProducts, 
  activeFilters, 
  fetchAllProducts, 
  clearFilters, 
  handleAddToCart, 
  handleQuickView, 
  hasMore, 
  loadingMore, 
  loadingRef 
}) => {
  if (loading) {
    return (
      <main className="products-section">
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading products...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="products-section">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchAllProducts} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="products-section">
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
    </main>
  );
};

export default ProductsSection;
