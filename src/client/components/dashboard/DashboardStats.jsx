import React from 'react';

const DashboardStats = ({ dashboardData }) => {
  if (!dashboardData) return null;

  return (
    <div className="stats-overview">
      <div className="stat-card">
        <div className="stat-icon">📦</div>
        <div className="stat-content">
          <h3>{dashboardData.stats.orders.total}</h3>
          <p>Total Orders</p>
          <small>{dashboardData.stats.orders.completed} completed</small>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📚</div>
        <div className="stat-content">
          <h3>{dashboardData.stats.enrollments.total}</h3>
          <p>Course Enrollments</p>
          <small>{dashboardData.stats.enrollments.active} active</small>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">🎯</div>
        <div className="stat-content">
          <h3>{dashboardData.stats.trips.total}</h3>
          <p>Trip Bookings</p>
          <small>{dashboardData.stats.trips.confirmed} confirmed</small>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
