import React from 'react';
import { formatDate } from '../../utils/dateUtils.js';

const DashboardEnrollmentsTab = ({ 
  dashboardData, 
  getStatusBadge, 
  canCancelEnrollment, 
  handleCancelEnrollment, 
  cancellingEnrollment 
}) => {
  return (
    <div className="enrollments-content">
      <h2>My Course Enrollments</h2>
      {dashboardData?.recentEnrollments?.length > 0 ? (
        <div className="items-list">
          {dashboardData.recentEnrollments.map(enrollment => (
            <div key={enrollment.id} className="item-card">
              <div className="item-header">
                <h4>{enrollment.course_title}</h4>
                {getStatusBadge(enrollment.status)}
              </div>
              <div className="item-details">
                <p><strong>Course:</strong> {enrollment.course_title}</p>
                <p><strong>Start Date:</strong> {formatDate(enrollment.start_at)}</p>
                <p><strong>Enrolled:</strong> {formatDate(enrollment.created_at)}</p>
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
                {enrollment.status === 'cancelled' && (
                  <div className="enrollment-notice">
                    <small className="text-muted">Enrollment cancelled</small>
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
  );
};

export default DashboardEnrollmentsTab;
