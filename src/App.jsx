import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import RestaurantList from './pages/RestaurantList';
import Recommendations from './pages/Recommendations';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import ComingSoon from './pages/ComingSoon';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Settings from './pages/Settings';
import RestaurantDetails from './pages/RestaurantDetails';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import PaymentSuccess from './pages/PaymentSuccess';
import Invoice from './pages/Invoice';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ShopProvider } from './context/ShopContext';
import Chatbot from './components/Chatbot';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ShopProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Landing Page Route (No Layout) */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Login />} />

              {/* Protected App Routes (Wrapped in Layout) */}
              <Route path="/home" element={<Layout><Home /></Layout>} />
              <Route path="/restaurants" element={<Layout><RestaurantList /></Layout>} />
              <Route path="/restaurant/:id" element={<Layout><RestaurantDetails /></Layout>} />
              <Route path="/recommendations" element={<Layout><Recommendations /></Layout>} />
              <Route path="/cart" element={<Layout><Cart /></Layout>} />
              <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
              <Route path="/orders" element={<Layout><Orders /></Layout>} />
              {/* Alias for Orders */}
              <Route path="/history" element={<Layout><Orders /></Layout>} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/orders/:orderId/invoice" element={<Invoice />} />
            </Routes>
            <Chatbot />
          </Router>
        </ShopProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
