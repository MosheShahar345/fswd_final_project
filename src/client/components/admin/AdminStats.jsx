import React from 'react';

const AdminStats = ({ adminData, formatCurrency }) => {
  if (!adminData) return null;

  return (
    <div className="admin-stats">
      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-content">
          <h3>{adminData.stats.users.total}</h3>
          <p>Total Users</p>
          <small>{adminData.stats.users.active} active</small>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <div className="stat-content">
          <h3>{formatCurrency(adminData.stats.revenue.total)}</h3>
          <p>Total Revenue</p>
          <small>{formatCurrency(adminData.stats.revenue.monthly)} this month</small>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📦</div>
        <div className="stat-content">
          <h3>{adminData.stats.orders.total}</h3>
          <p>Total Orders</p>
          <small>{adminData.stats.orders.pending} pending</small>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">🎯</div>
        <div className="stat-content">
          <h3>{adminData.stats.activities.total}</h3>
          <p>Active Activities</p>
          <small>{adminData.stats.activities.courses} courses, {adminData.stats.activities.trips} trips</small>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
