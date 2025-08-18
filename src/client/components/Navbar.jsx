import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount, openCart } = useCart();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🏔️ Adventure Gear
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
            Shop
          </Link>
          <Link 
            to="/activities" 
            className={`nav-link ${isActive('/activities') ? 'active' : ''}`}
          >
            Activities
          </Link>
          {isAuthenticated && (
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
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
              <span className="user-name">Hi, {user?.name}</span>
              <button onClick={logout} className="btn btn-outline">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 