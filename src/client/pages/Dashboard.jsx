import { useAuth } from '../contexts/AuthContext.jsx';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name}!</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">📦</div>
            <h3>My Orders</h3>
            <p>Track your recent purchases</p>
            <div className="card-action">
              <button className="btn btn-primary">View Orders</button>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🎯</div>
            <h3>My Bookings</h3>
            <p>Manage your trip bookings</p>
            <div className="card-action">
              <button className="btn btn-primary">View Bookings</button>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📚</div>
            <h3>My Courses</h3>
            <p>Track your course enrollments</p>
            <div className="card-action">
              <button className="btn btn-primary">View Courses</button>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">💬</div>
            <h3>Messages</h3>
            <p>Check your inbox</p>
            <div className="card-action">
              <button className="btn btn-primary">View Messages</button>
            </div>
          </div>

          {user.role === 'instructor' && (
            <>
              <div className="dashboard-card">
                <div className="card-icon">📅</div>
                <h3>My Sessions</h3>
                <p>Manage your teaching schedule</p>
                <div className="card-action">
                  <button className="btn btn-primary">View Sessions</button>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">👥</div>
                <h3>Student Rosters</h3>
                <p>View your class rosters</p>
                <div className="card-action">
                  <button className="btn btn-primary">View Rosters</button>
                </div>
              </div>
            </>
          )}

          {user.role === 'manager' && (
            <>
              <div className="dashboard-card">
                <div className="card-icon">🏪</div>
                <h3>Inventory</h3>
                <p>Manage product inventory</p>
                <div className="card-action">
                  <button className="btn btn-primary">View Inventory</button>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">📊</div>
                <h3>Orders</h3>
                <p>Process and fulfill orders</p>
                <div className="card-action">
                  <button className="btn btn-primary">View Orders</button>
                </div>
              </div>
            </>
          )}

          {user.role === 'admin' && (
            <>
              <div className="dashboard-card">
                <div className="card-icon">👥</div>
                <h3>Users & Roles</h3>
                <p>Manage user accounts</p>
                <div className="card-action">
                  <button className="btn btn-primary">Manage Users</button>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">⚙️</div>
                <h3>Settings</h3>
                <p>System configuration</p>
                <div className="card-action">
                  <button className="btn btn-primary">View Settings</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
