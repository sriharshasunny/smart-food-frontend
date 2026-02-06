import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ShopProvider } from './context/ShopContext';
const Chatbot = lazy(() => import('./components/Chatbot'));
import ScrollToTop from './components/ScrollToTop';
import SmoothScroll from './components/SmoothScroll';

// Lazy Load Pages for Performance
const Layout = lazy(() => import('./components/Layout'));
const Home = lazy(() => import('./pages/Home'));
const RestaurantList = lazy(() => import('./pages/RestaurantList'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const Cart = lazy(() => import('./pages/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));
const Login = lazy(() => import('./pages/Login'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Settings = lazy(() => import('./pages/Settings'));
const RestaurantDetails = lazy(() => import('./pages/RestaurantDetails'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const Invoice = lazy(() => import('./pages/Invoice'));
const RestaurantLogin = lazy(() => import('./pages/RestaurantLogin'));
const RestaurantDashboard = lazy(() => import('./pages/RestaurantDashboard'));
const AdminRestaurantPanel = lazy(() => import('./pages/AdminRestaurantPanel'));

// Simple Loading Spinner
const Loading = () => (
  <div className="min-h-screen bg-[#020205] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ShopProvider>
          <LazyMotion features={domAnimation}>
            <Router>
              <SmoothScroll />
              <ScrollToTop />
              <Suspense fallback={<Loading />}>
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

                  {/* Restaurant Partner Routes */}
                  <Route path="/restaurant/login" element={<RestaurantLogin />} />
                  <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />

                  {/* Admin Route */}
                  <Route path="/admin/portal" element={<AdminRestaurantPanel />} />
                </Routes>
              </Suspense>
              <Suspense fallback={null}>
                <Chatbot />
              </Suspense>
            </Router>
          </LazyMotion>
        </ShopProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
