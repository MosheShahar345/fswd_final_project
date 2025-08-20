import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminContentTab = ({ adminData }) => {
  const navigate = useNavigate();

  return (
    <div className="content-content">
      <h2>Content Management</h2>
      <div className="content-sections">
        <div className="content-section">
          <h3>Products</h3>
          <div className="content-stats">
            <div className="stat-item">
              <span className="stat-number">{adminData?.contentStats?.products?.total || 0}</span>
              <span className="stat-label">Total Products</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{adminData?.contentStats?.products?.active || 0}</span>
              <span className="stat-label">Active Products</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/admin/products')}>
            Manage Products
          </button>
        </div>

        <div className="content-section">
          <h3>Courses</h3>
          <div className="content-stats">
            <div className="stat-item">
              <span className="stat-number">{adminData?.contentStats?.courses?.total || 0}</span>
              <span className="stat-label">Total Courses</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{adminData?.contentStats?.courses?.active || 0}</span>
              <span className="stat-label">Active Courses</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/admin/courses')}>
            Manage Courses
          </button>
        </div>

        <div className="content-section">
          <h3>Trips</h3>
          <div className="content-stats">
            <div className="stat-item">
              <span className="stat-number">{adminData?.contentStats?.trips?.total || 0}</span>
              <span className="stat-label">Total Trips</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{adminData?.contentStats?.trips?.active || 0}</span>
              <span className="stat-label">Active Trips</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/admin/trips')}>
            Manage Trips
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminContentTab;
