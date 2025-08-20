import React from 'react';
import { formatDate } from '../../utils/dateUtils.js';

const AdminUsersTab = ({ 
  adminData, 
  getStatusBadge, 
  handleUserAction, 
  actionLoading 
}) => {
  if (!adminData?.allUsers?.length) {
    return (
      <div className="users-content">
        <h2>User Management</h2>
        <p className="no-items">No users found.</p>
      </div>
    );
  }

  return (
    <div className="users-content">
      <h2>User Management</h2>
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
    </div>
  );
};

export default AdminUsersTab;
