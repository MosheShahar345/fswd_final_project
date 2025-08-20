import React from 'react';
import { formatDate } from '../../utils/dateUtils.js';

const DashboardOrdersTab = ({ dashboardData, getStatusBadge, formatCurrency }) => {
  return (
    <div className="orders-content">
      <h2>My Orders</h2>
      {dashboardData?.recentOrders?.length > 0 ? (
        <div className="items-list">
          {dashboardData.recentOrders.map(order => (
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
  );
};

export default DashboardOrdersTab;
