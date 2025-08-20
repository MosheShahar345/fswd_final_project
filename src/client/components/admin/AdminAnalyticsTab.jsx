import React from 'react';

const AdminAnalyticsTab = ({ adminData, formatCurrency }) => {
  return (
    <div className="analytics-content">
      <h2>Analytics & Reports</h2>
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Revenue Analytics</h3>
          <div className="analytics-data">
            <div className="data-item">
              <span className="data-label">Total Revenue:</span>
              <span className="data-value">{formatCurrency(adminData?.analytics?.revenue?.total || 0)}</span>
            </div>
            <div className="data-item">
              <span className="data-label">This Month:</span>
              <span className="data-value">{formatCurrency(adminData?.analytics?.revenue?.monthly || 0)}</span>
            </div>
            <div className="data-item">
              <span className="data-label">This Week:</span>
              <span className="data-value">{formatCurrency(adminData?.analytics?.revenue?.weekly || 0)}</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>User Analytics</h3>
          <div className="analytics-data">
            <div className="data-item">
              <span className="data-label">Total Users:</span>
              <span className="data-value">{adminData?.analytics?.users?.total || 0}</span>
            </div>
            <div className="data-item">
              <span className="data-label">New This Month:</span>
              <span className="data-value">{adminData?.analytics?.users?.newThisMonth || 0}</span>
            </div>
            <div className="data-item">
              <span className="data-label">Active Users:</span>
              <span className="data-value">{adminData?.analytics?.users?.active || 0}</span>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Activity Analytics</h3>
          <div className="analytics-data">
            <div className="data-item">
              <span className="data-label">Total Orders:</span>
              <span className="data-value">{adminData?.analytics?.orders?.total || 0}</span>
            </div>
            <div className="data-item">
              <span className="data-label">Course Enrollments:</span>
              <span className="data-value">{adminData?.analytics?.enrollments?.total || 0}</span>
            </div>
            <div className="data-item">
              <span className="data-label">Trip Bookings:</span>
              <span className="data-value">{adminData?.analytics?.bookings?.total || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsTab;
