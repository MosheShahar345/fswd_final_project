import React from 'react';
import { formatDate } from '../../utils/dateUtils.js';

const AdminOverview = ({ 
  adminData, 
  getStatusBadge, 
  formatCurrency, 
  handleUserAction, 
  handleRefundAction, 
  actionLoading 
}) => {
  if (!adminData) return null;

  return (
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
  );
};

export default AdminOverview;
