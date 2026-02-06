import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Lazy Load
const RestaurantLogin = lazy(() => import('../pages/RestaurantLogin'));
const RestaurantDashboard = lazy(() => import('../pages/RestaurantDashboard'));

// Loading Spinner
const Loading = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
);

const AppRestaurant = () => {
    return (
        <Router>
            <Suspense fallback={<Loading />}>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<RestaurantLogin />} />
                    <Route path="/dashboard" element={<RestaurantDashboard />} />
                    {/* Legacy redirects in case of old bookmarks */}
                    <Route path="/restaurant/login" element={<Navigate to="/login" replace />} />
                    <Route path="/restaurant/dashboard" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Suspense>
        </Router>
    );
};

export default AppRestaurant;
