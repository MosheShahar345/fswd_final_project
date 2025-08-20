import React from 'react';
import { formatDate, formatDateRange } from '../../utils/dateUtils.js';

const DashboardTripsTab = ({ dashboardData, getStatusBadge, formatCurrency }) => {
  return (
    <div className="trips-content">
      <h2>My Trip Bookings</h2>
      {dashboardData?.recentTripBookings?.length > 0 ? (
        <div className="items-list">
          {dashboardData.recentTripBookings.map(booking => (
            <div key={booking.id} className="item-card">
              <div className="item-header">
                <h4>{booking.trip_title}</h4>
                {getStatusBadge(booking.status)}
              </div>
              <div className="item-details">
                <p><strong>Location:</strong> {booking.location}</p>
                <p><strong>Difficulty:</strong> {booking.difficulty}</p>
                <p><strong>Dates:</strong> {formatDateRange(booking.start_date, booking.end_date)}</p>
                <p><strong>Paid Amount:</strong> {formatCurrency(booking.paid_amount)}</p>
                <p><strong>Booked:</strong> {formatDate(booking.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-items">No trip bookings yet. Explore our adventure trips!</p>
      )}
    </div>
  );
};

export default DashboardTripsTab;
