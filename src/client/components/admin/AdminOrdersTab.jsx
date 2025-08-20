import React from 'react';
import { formatDate } from '../../utils/dateUtils.js';

const AdminOrdersTab = ({ 
  adminData, 
  getStatusBadge, 
  formatCurrency, 
  handleOrderStatusUpdate, 
  actionLoading 
}) => {
  if (!adminData?.allOrders?.length) {
    return (
      <div className="orders-content">
        <h2>Order Management</h2>
        <p className="no-items">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="orders-content">
      <h2>Order Management</h2>
      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Items</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminData.allOrders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>
                  <div>
                    <div>{order.customer_name}</div>
                    <small>{order.customer_email}</small>
                  </div>
                </td>
                <td>{formatCurrency(order.total)}</td>
                <td>{order.item_count}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>{formatDate(order.created_at)}</td>
                <td>
                  {order.status === 'pending' && (
                    <div className="order-actions">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleOrderStatusUpdate(order.id, 'SENT')}
                        disabled={actionLoading[`order-${order.id}`]}
                      >
                        {actionLoading[`order-${order.id}`] ? 'Processing...' : 'Mark as SENT'}
                      </button>
                    </div>
                  )}
                  {order.status === 'paid' && (
                    <div className="order-actions">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleOrderStatusUpdate(order.id, 'SENT')}
                        disabled={actionLoading[`order-${order.id}`]}
                      >
                        {actionLoading[`order-${order.id}`] ? 'Processing...' : 'Mark as SENT'}
                      </button>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleOrderStatusUpdate(order.id, 'shipped')}
                        disabled={actionLoading[`order-${order.id}`]}
                      >
                        {actionLoading[`order-${order.id}`] ? 'Processing...' : 'Mark as Shipped'}
                      </button>
                    </div>
                  )}
                  {order.status === 'shipped' && (
                    <div className="order-actions">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleOrderStatusUpdate(order.id, 'SENT')}
                        disabled={actionLoading[`order-${order.id}`]}
                      >
                        {actionLoading[`order-${order.id}`] ? 'Processing...' : 'Mark as SENT'}
                      </button>
                    </div>
                  )}
                  {order.status === 'SENT' && (
                    <div className="order-actions">
                      {/* No actions available - order is already SENT */}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrdersTab;
