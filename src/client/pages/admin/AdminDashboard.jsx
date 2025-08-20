import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminStats from '../../components/admin/AdminStats.jsx';
import AdminTabs from '../../components/admin/AdminTabs.jsx';
import AdminOverview from '../../components/admin/AdminOverview.jsx';
import AdminUsersTab from '../../components/admin/AdminUsersTab.jsx';
import AdminContentTab from '../../components/admin/AdminContentTab.jsx';
import AdminOrdersTab from '../../components/admin/AdminOrdersTab.jsx';
import AdminRefundsTab from '../../components/admin/AdminRefundsTab.jsx';
import AdminAnalyticsTab from '../../components/admin/AdminAnalyticsTab.jsx';
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
      <AdminStats adminData={adminData} formatCurrency={formatCurrency} />

      {/* Admin Navigation Tabs */}
      <AdminTabs 
        selectedTab={selectedTab} 
        setSelectedTab={setSelectedTab} 
        adminData={adminData} 
      />

      {/* Tab Content */}
      <div className="admin-content">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <AdminOverview 
            adminData={adminData}
            getStatusBadge={getStatusBadge}
            formatCurrency={formatCurrency}
            handleUserAction={handleUserAction}
            handleRefundAction={handleRefundAction}
            actionLoading={actionLoading}
          />
        )}

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <AdminUsersTab 
            adminData={adminData}
            getStatusBadge={getStatusBadge}
            handleUserAction={handleUserAction}
            actionLoading={actionLoading}
          />
        )}

        {/* Content Management Tab */}
        {selectedTab === 'content' && (
          <AdminContentTab adminData={adminData} />
        )}

        {/* Orders Tab */}
        {selectedTab === 'orders' && (
          <AdminOrdersTab 
            adminData={adminData}
            getStatusBadge={getStatusBadge}
            formatCurrency={formatCurrency}
            handleOrderStatusUpdate={handleOrderStatusUpdate}
            actionLoading={actionLoading}
          />
        )}

        {/* Refunds Tab */}
        {selectedTab === 'refunds' && (
          <AdminRefundsTab 
            adminData={adminData}
            getStatusBadge={getStatusBadge}
            formatCurrency={formatCurrency}
            handleRefundAction={handleRefundAction}
            actionLoading={actionLoading}
          />
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && (
          <AdminAnalyticsTab 
            adminData={adminData}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
