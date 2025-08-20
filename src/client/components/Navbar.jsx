import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount, openCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/dashboard?tab=profile');
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            🌊 Ocean Adventures
          </Link>

          <div className="navbar-nav">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              className={`nav-link ${isActive('/shop') ? 'active' : ''}`}
            >
              Diving Gear
            </Link>
            <Link 
              to="/activities" 
              className={`nav-link ${isActive('/activities') ? 'active' : ''}`}
            >
              Courses & Trips
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="navbar-actions">
            <button 
              onClick={openCart}
              className="cart-button"
              aria-label="Shopping cart"
            >
              🛒 <span className="cart-count">{getCartCount()}</span>
            </button>

            {isAuthenticated ? (
              <div className="user-menu">
                <div className="user-info">
                  {user?.profilePicture ? (
                    <img
                      src={`http://localhost:3000/uploads/profiles/${user.profilePicture}`}
                      alt="Profile"
                      className="profile-picture clickable"
                      onClick={handleProfileClick}
                    />
                  ) : (
                    <div 
                      className="profile-placeholder clickable"
                      onClick={handleProfileClick}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="user-name">Hi, {user?.name}</span>
                </div>
                <button onClick={handleLogout} className="btn btn-outline">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn btn-primary">
                Login
              </Link>
            )}

            <button 
              className="mobile-menu-button"
              onClick={handleMobileMenuToggle}
              aria-label="Toggle mobile menu"
            >
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={handleMobileMenuClose}
      />

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Menu</span>
          <button 
            className="mobile-menu-close"
            onClick={handleMobileMenuClose}
            aria-label="Close mobile menu"
          >
            ✕
          </button>
        </div>
        
        <div className="mobile-nav">
          <Link 
            to="/" 
            className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={handleMobileMenuClose}
          >
            🏠 Home
          </Link>
          <Link 
            to="/shop" 
            className={`mobile-nav-link ${isActive('/shop') ? 'active' : ''}`}
            onClick={handleMobileMenuClose}
          >
            🛍️ Diving Gear
          </Link>
          <Link 
            to="/activities" 
            className={`mobile-nav-link ${isActive('/activities') ? 'active' : ''}`}
            onClick={handleMobileMenuClose}
          >
            🎓 Courses & Trips
          </Link>
          {isAuthenticated && (
            <>
              <Link 
                to="/dashboard" 
                className={`mobile-nav-link ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}
                onClick={handleMobileMenuClose}
              >
                📊 Dashboard
              </Link>
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className={`mobile-nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                  onClick={handleMobileMenuClose}
                >
                  ⚙️ Admin Panel
                </Link>
              )}
              <Link 
                to="/dashboard?tab=profile" 
                className="mobile-nav-link"
                onClick={handleMobileMenuClose}
              >
                👤 Profile Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="mobile-nav-link"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  width: '100%', 
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                🚪 Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <Link 
              to="/auth" 
              className="mobile-nav-link"
              onClick={handleMobileMenuClose}
            >
              🔐 Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar; 