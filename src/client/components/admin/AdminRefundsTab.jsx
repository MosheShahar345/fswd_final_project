import React from 'react';
import { formatDate } from '../../utils/dateUtils.js';

const AdminRefundsTab = ({ 
  adminData, 
  getStatusBadge, 
  formatCurrency, 
  handleRefundAction, 
  actionLoading 
}) => {
  if (!adminData?.allRefunds?.length) {
    return (
      <div className="refunds-content">
        <h2>Refund Management</h2>
        <p className="no-items">No refunds found.</p>
      </div>
    );
  }

  return (
    <div className="refunds-content">
      <h2>Refund Management</h2>
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
    </div>
  );
};

export default AdminRefundsTab;
