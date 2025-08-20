import React from 'react';

const ShopHeader = ({ stats }) => {
  return (
    <div className="shop-header">
      <h1>Diving Equipment</h1>
      <p>Professional diving gear and equipment for all underwater adventures from top brands worldwide</p>
      {stats && (
        <div className="shop-stats">
          <span>{stats.total_products} Products</span>
          <span>{stats.categories} Categories</span>
          <span>{stats.brands} Brands</span>
          <span>${stats.min_price} - ${stats.max_price}</span>
        </div>
      )}
    </div>
  );
};

export default ShopHeader;
