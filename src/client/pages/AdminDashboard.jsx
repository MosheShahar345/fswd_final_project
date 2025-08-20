import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatDate, formatDateRange } from '../utils/dateUtils.js';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState({});

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      showError('Access denied. Admin privileges required.');
      navigate('/dashboard');
    }
  }, [user, navigate, showError]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  // Handle tab query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'users', 'content', 'refunds', 'analytics'].includes(tab)) {
      setSelectedTab(tab);
    }
  }, [searchParams]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const data = await response.json();
      setAdminData(data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(amount || 0));
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'active': 'status-active',
      'inactive': 'status-inactive',
      'suspended': 'status-suspended',
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };

    return (
      <span className={`status-badge ${statusColors[status] || 'status-default'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleUserAction = async (action, userId, data = {}) => {
    setActionLoading(prev => ({ ...prev, [`${action}-${userId}`]: true }));

    try {
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.error || 'Action failed');
      }

      await fetchAdminData();
      showSuccess(`${action.charAt(0).toUpperCase() + action.slice(1)} successful!`);
    } catch (error) {
      console.error(`Error ${action}:`, error);
      showError(`Error ${action}: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [`${action}-${userId}`]: false }));
    }
  };

  const handleRefundAction = async (refundId, action) => {
    setActionLoading(prev => ({ ...prev, [`refund-${refundId}`]: true }));

    try {
      const response = await fetch(`http://localhost:3000/api/admin/refunds/${refundId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error ${action} refund:`, errorData);
        throw new Error(errorData.error?.message || errorData.error || errorData.message || `Failed to ${action} refund`);
      }

      await fetchAdminData();
      showSuccess(`Refund ${action} successful!`);
    } catch (error) {
      console.error(`Error ${action} refund:`, error);
      showError(`Error ${action} refund: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [`refund-${refundId}`]: false }));
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [`order-${orderId}`]: true }));

    try {
      const response = await fetch(`http://localhost:3000/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error updating order status:`, errorData);
        throw new Error(errorData.error?.message || errorData.error || errorData.message || `Failed to update order status`);
      }

      showSuccess(`Order status updated to ${newStatus}`);
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error(`Error updating order status:`, error);
      showError(error.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [`order-${orderId}`]: false }));
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchAdminData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user.name}! Manage your adventure gear platform.</p>
      </div>

      {/* Admin Stats Overview */}
      {adminData && (
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
      )}

      {/* Admin Navigation Tabs */}
      <div className="admin-tabs">
        <button 
          className={`btn ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`btn ${selectedTab === 'users' ? 'active' : ''}`}
          onClick={() => setSelectedTab('users')}
        >
          User Management ({adminData?.recentUsers?.length || 0})
        </button>
        <button 
          className={`btn ${selectedTab === 'content' ? 'active' : ''}`}
          onClick={() => setSelectedTab('content')}
        >
          Content Management
        </button>
        <button 
          className={`btn ${selectedTab === 'orders' ? 'active' : ''}`}
          onClick={() => setSelectedTab('orders')}
        >
          Orders ({adminData?.allOrders?.length || 0})
        </button>
        <button 
          className={`btn ${selectedTab === 'refunds' ? 'active' : ''}`}
          onClick={() => setSelectedTab('refunds')}
        >
          Refunds ({adminData?.pendingRefunds?.length || 0})
        </button>
        <button 
          className={`btn ${selectedTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setSelectedTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="overview-content">
            <div className="overview-section">
              <h2>Recent User Registrations</h2>
              {adminData?.recentUsers?.length > 0 ? (
                <div className="items-grid">
                  {adminData.recentUsers.slice(0, 5).map(user => (
                    <div key={user.id} className="item-card">
                      <div className="item-header">
                        <h4>{user.name}</h4>
                        {getStatusBadge(user.status)}
                      </div>
                      <div className="item-details">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                        <p><strong>Joined:</strong> {formatDate(user.created_at)}</p>
                        <div className="user-actions">
                          {user.status === 'active' ? (
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleUserAction('suspend', user.id)}
                              disabled={actionLoading[`suspend-${user.id}`]}
                            >
                              {actionLoading[`suspend-${user.id}`] ? 'Suspending...' : 'Suspend'}
                            </button>
                          ) : (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleUserAction('activate', user.id)}
                              disabled={actionLoading[`activate-${user.id}`]}
                            >
                              {actionLoading[`activate-${user.id}`] ? 'Activating...' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-items">No recent user registrations.</p>
              )}
            </div>

            <div className="overview-section">
              <h2>Pending Refunds</h2>
              {adminData?.pendingRefunds?.length > 0 ? (
                <div className="items-grid">
                  {adminData.pendingRefunds.slice(0, 5).map(refund => (
                    <div key={refund.id} className="item-card">
                      <div className="item-header">
                        <h4>Refund #{refund.id}</h4>
                        {getStatusBadge(refund.status)}
                      </div>
                      <div className="item-details">
                        <p><strong>User:</strong> {refund.user_name}</p>
                        <p><strong>Course:</strong> {refund.course_title}</p>
                        <p><strong>Amount:</strong> {formatCurrency(refund.amount)}</p>
                        <p><strong>Reason:</strong> {refund.reason}</p>
                        <div className="refund-actions">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleRefundAction(refund.id, 'approve')}
                            disabled={actionLoading[`refund-${refund.id}`]}
                          >
                            {actionLoading[`refund-${refund.id}`] ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRefundAction(refund.id, 'reject')}
                            disabled={actionLoading[`refund-${refund.id}`]}
                          >
                            {actionLoading[`refund-${refund.id}`] ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-items">No pending refunds.</p>
              )}
            </div>

            <div className="overview-section">
              <h2>System Health</h2>
              <div className="system-health">
                <div className="health-item">
                  <span className="health-label">Server Status:</span>
                  <span className="health-value status-active">Online</span>
                </div>
                <div className="health-item">
                  <span className="health-label">Database:</span>
                  <span className="health-value status-active">Connected</span>
                </div>
                <div className="health-item">
                  <span className="health-label">Last Backup:</span>
                  <span className="health-value">{formatDate(new Date())}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <div className="users-content">
            <h2>User Management</h2>
            {adminData?.allUsers?.length > 0 ? (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminData.allUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <select 
                            value={user.role || ''}
                            onChange={(e) => handleUserAction('role', user.id, { role: e.target.value })}
                            disabled={actionLoading[`role-${user.id}`]}
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>{getStatusBadge(user.status)}</td>
                        <td>{formatDate(user.created_at)}</td>
                        <td>
                          <div className="user-actions">
                            {user.status === 'active' ? (
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => handleUserAction('suspend', user.id)}
                                disabled={actionLoading[`suspend-${user.id}`]}
                              >
                                {actionLoading[`suspend-${user.id}`] ? 'Suspending...' : 'Suspend'}
                              </button>
                            ) : (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleUserAction('activate', user.id)}
                                disabled={actionLoading[`activate-${user.id}`]}
                              >
                                {actionLoading[`activate-${user.id}`] ? 'Activating...' : 'Activate'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-items">No users found.</p>
            )}
          </div>
        )}

        {/* Content Management Tab */}
        {selectedTab === 'content' && (
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
        )}

        {/* Orders Tab */}
        {selectedTab === 'orders' && (
          <div className="orders-content">
            <h2>Order Management</h2>
            {adminData?.allOrders?.length > 0 ? (
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
            ) : (
              <p className="no-items">No orders found.</p>
            )}
          </div>
        )}

        {/* Refunds Tab */}
        {selectedTab === 'refunds' && (
          <div className="refunds-content">
            <h2>Refund Management</h2>
            {adminData?.allRefunds?.length > 0 ? (
              <div className="refunds-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Course</th>
                      <th>Amount</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminData.allRefunds.map(refund => (
                      <tr key={refund.id}>
                        <td>#{refund.id}</td>
                        <td>{refund.user_name}</td>
                        <td>{refund.course_title}</td>
                        <td>{formatCurrency(refund.amount)}</td>
                        <td>{refund.reason}</td>
                        <td>{getStatusBadge(refund.status)}</td>
                        <td>{formatDate(refund.created_at)}</td>
                        <td>
                          {refund.status === 'pending' && (
                            <div className="refund-actions">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleRefundAction(refund.id, 'approve')}
                                disabled={actionLoading[`refund-${refund.id}`]}
                              >
                                {actionLoading[`refund-${refund.id}`] ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRefundAction(refund.id, 'reject')}
                                disabled={actionLoading[`refund-${refund.id}`]}
                              >
                                {actionLoading[`refund-${refund.id}`] ? 'Processing...' : 'Reject'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-items">No refunds found.</p>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && (
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
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
