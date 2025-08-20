import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider, useCart } from './contexts/CartContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Cart from './components/cart/Cart.jsx';
import Footer from './components/layout/Footer.jsx';
import Home from './pages/main/Home.jsx';
import Shop from './pages/main/Shop.jsx';
import Activities from './pages/main/Activities.jsx';
import Dashboard from './pages/main/Dashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminCourses from './pages/admin/AdminCourses.jsx';
import AdminTrips from './pages/admin/AdminTrips.jsx';
import Checkout from './pages/main/Checkout.jsx';
import CheckoutSuccess from './pages/main/CheckoutSuccess.jsx';
import Auth from './pages/auth/Auth.jsx';
import ProductDetail from './pages/detail/ProductDetail.jsx';
import TripDetail from './pages/detail/TripDetail.jsx';
import CourseDetail from './pages/detail/CourseDetail.jsx';
import './App.css';

// Custom component to access both CartContext and useNavigate
function AppContent() {
  const { clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <AuthProvider clearCart={clearCart} navigate={navigate}>
      <NotificationProvider>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/product/:id" element={<ProductDetail />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/activities/trip/:id" element={<TripDetail />} />
              <Route path="/activities/course/:id" element={<CourseDetail />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/trips" element={<AdminTrips />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </main>
          <Cart />
          <Footer />
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <Router>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </Router>
  );
}

export default App;
