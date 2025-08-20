import React from 'react';
import { formatDate, formatDateRange } from '../../utils/dateUtils.js';

const DashboardOverview = ({ 
  dashboardData, 
  getStatusBadge, 
  formatCurrency, 
  canCancelEnrollment, 
  handleCancelEnrollment, 
  cancellingEnrollment 
}) => {
  if (!dashboardData) return null;

  return (
    <div className="overview-content">
      <div className="overview-section">
        <h2>Recent Orders</h2>
        {dashboardData?.recentOrders?.length > 0 ? (
          <div className="items-grid">
            {dashboardData.recentOrders.slice(0, 3).map(order => (
              <div key={order.id} className="item-card">
                <div className="item-header">
                  <h4>Order #{order.id}</h4>
                  {getStatusBadge(order.status)}
                </div>
                <div className="item-details">
                  <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
                  <p><strong>Items:</strong> {order.item_count}</p>
                  <p><strong>Date:</strong> {formatDate(order.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-items">No orders yet. Start shopping to see your orders here!</p>
        )}
      </div>

      <div className="overview-section">
        <h2>Recent Course Enrollments</h2>
        {dashboardData?.recentEnrollments?.length > 0 ? (
          <div className="items-grid">
            {dashboardData.recentEnrollments.slice(0, 3).map(enrollment => (
              <div key={enrollment.id} className="item-card">
                <div className="item-header">
                  <h4>{enrollment.course_title}</h4>
                  {getStatusBadge(enrollment.status)}
                </div>
                <div className="item-details">
                  <p><strong>Course:</strong> {enrollment.course_title}</p>
                  <p><strong>Start Date:</strong> {formatDate(enrollment.start_at)}</p>
                  {enrollment.status === 'enrolled' && canCancelEnrollment(enrollment.session_start) && (
                    <div className="enrollment-actions">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelEnrollment(enrollment.id, enrollment.session_start)}
                        disabled={cancellingEnrollment[enrollment.id]}
                      >
                        {cancellingEnrollment[enrollment.id] ? 'Cancelling...' : 'Cancel Enrollment'}
                      </button>
                    </div>
                  )}
                  {enrollment.status === 'enrolled' && !canCancelEnrollment(enrollment.session_start) && (
                    <div className="enrollment-notice">
                      <small className="text-muted">Cannot cancel - course starts within 24 hours</small>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-items">No course enrollments yet. Browse our courses to get started!</p>
        )}
      </div>

      <div className="overview-section">
        <h2>Recent Trip Bookings</h2>
        {dashboardData?.recentTripBookings?.length > 0 ? (
          <div className="items-grid">
            {dashboardData.recentTripBookings.slice(0, 3).map(booking => (
              <div key={booking.id} className="item-card">
                <div className="item-header">
                  <h4>{booking.trip_title}</h4>
                  {getStatusBadge(booking.status)}
                </div>
                <div className="item-details">
                  <p><strong>Location:</strong> {booking.location}</p>
                  <p><strong>Dates:</strong> {formatDateRange(booking.start_date, booking.end_date)}</p>
                  <p><strong>Paid:</strong> {formatCurrency(booking.paid_amount)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-items">No trip bookings yet. Explore our adventure trips!</p>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
