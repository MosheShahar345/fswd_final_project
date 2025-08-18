import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import Navbar from './components/Navbar.jsx';
import Cart from './components/Cart.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Activities from './pages/Activities.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Checkout from './pages/Checkout.jsx';
import CheckoutSuccess from './pages/CheckoutSuccess.jsx';
import Auth from './pages/Auth.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import TripDetail from './pages/TripDetail.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
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
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/auth" element={<Auth />} />
              </Routes>
            </main>
            <Cart />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
