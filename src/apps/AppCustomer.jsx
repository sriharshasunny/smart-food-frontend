import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ShopProvider } from '../context/ShopContext';
import ScrollToTop from '../components/ScrollToTop';
import SmoothScroll from '../components/SmoothScroll';
import Layout from '../components/Layout';

const Chatbot = lazy(() => import('../components/Chatbot'));

// Lazy Load Pages
const Home = lazy(() => import('../pages/Home'));
const RestaurantList = lazy(() => import('../pages/RestaurantList'));
const RestaurantDetails = lazy(() => import('../pages/RestaurantDetails'));
const Recommendations = lazy(() => import('../pages/Recommendations'));
const Cart = lazy(() => import('../pages/Cart'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const Login = lazy(() => import('../pages/Login'));
const LandingPage = lazy(() => import('../pages/LandingPage'));
const Settings = lazy(() => import('../pages/Settings'));
const Profile = lazy(() => import('../pages/Profile'));
const Orders = lazy(() => import('../pages/Orders'));
const PaymentSuccess = lazy(() => import('../pages/PaymentSuccess'));
const Invoice = lazy(() => import('../pages/Invoice'));

// Loading Spinner
const Loading = () => (
    <div className="min-h-screen bg-[#020205] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
);

const AppCustomer = () => {
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
                                    {/* Public Landing */}
                                    <Route path="/" element={<LandingPage />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/signup" element={<Login />} />

                                    {/* Protected Routes */}
                                    <Route path="/home" element={<Layout><Home /></Layout>} />
                                    <Route path="/restaurants" element={<Layout><RestaurantList /></Layout>} />
                                    <Route path="/restaurant/:id" element={<Layout><RestaurantDetails /></Layout>} />
                                    <Route path="/recommendations" element={<Layout><Recommendations /></Layout>} />
                                    <Route path="/cart" element={<Layout><Cart /></Layout>} />
                                    <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
                                    <Route path="/orders" element={<Layout><Orders /></Layout>} />
                                    <Route path="/history" element={<Layout><Orders /></Layout>} />
                                    <Route path="/payment-success" element={<PaymentSuccess />} />
                                    <Route path="/settings" element={<Layout><Settings /></Layout>} />
                                    <Route path="/profile" element={<Layout><Profile /></Layout>} />
                                    <Route path="/orders/:orderId/invoice" element={<Invoice />} />
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
};

export default AppCustomer;
