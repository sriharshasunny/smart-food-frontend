import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Heart, ShoppingBag, Clock, Settings, Zap, X, LogOut, MapPin, Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/home', icon: Home, label: 'Home' },
        { path: '/restaurants', icon: MapPin, label: 'Restaurants' },
        { path: '/recommendations', icon: Sparkles, label: 'AI Picks' },
        { path: '/orders', icon: ShoppingBag, label: 'Orders' },
        { path: '/wishlist', icon: Heart, label: 'Wishlist' },
        { path: '/profile', icon: User, label: 'Profile' },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleSidebar}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.div
                className={`fixed top-0 left-0 h-full w-[280px] z-[60] transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } shrink-0`}
            >
                <div className="h-full w-full relative overflow-hidden rounded-tr-[2.5rem] shadow-2xl flex flex-col bg-white">

                    {/* Header with Gradient Border */}
                    <div className="relative rounded-tr-[2.5rem] shrink-0">
                        {/* Gradient Border */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 p-[1.5px] rounded-tr-[2.5rem]">
                            <div className="h-full w-full bg-white rounded-tr-[calc(2.5rem-1.5px)]"></div>
                        </div>

                        <div className="relative p-6 flex items-center justify-between">
                            <div className="flex items-center gap-2 group">
                                <div className="p-1.5 bg-gradient-to-tr from-orange-500 to-red-500 rounded-lg shadow-md shadow-orange-500/30">
                                    <Zap className="w-5 h-5 text-white fill-current" />
                                </div>
                                <span className="text-xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    SmartFood
                                </span>
                            </div>
                            <button
                                onClick={toggleSidebar}
                                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all active:scale-90"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1 no-scrollbar">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    onClick={toggleSidebar}
                                    className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
                                >
                                    {/* Liquid Background Animation */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active-pill"
                                            className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-500/30"
                                            transition={{
                                                type: "spring",
                                                stiffness: 350,
                                                damping: 30,
                                                mass: 0.8
                                            }}
                                        />
                                    )}

                                    {/* Icon and Label */}
                                    <div className="relative flex items-center gap-4 w-full">
                                        <Icon
                                            className={`w-5 h-5 transition-colors ${isActive
                                                ? 'text-white'
                                                : 'text-gray-400 group-hover:text-orange-500'
                                                }`}
                                        />
                                        <span
                                            className={`font-bold tracking-wide text-sm transition-colors ${isActive
                                                ? 'text-white'
                                                : 'text-gray-600 group-hover:text-gray-900'
                                                }`}
                                        >
                                            {item.label}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        {/* Premium Member Card */}
                        <div className="relative mb-4 overflow-hidden rounded-2xl">
                            {/* Gradient Border */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500 p-[2px] rounded-2xl">
                                <div className="h-full w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-[calc(1rem-2px)]"></div>
                            </div>

                            <div className="relative p-4 text-white">
                                <p className="text-sm font-bold mb-1">Premium Member</p>
                                <p className="text-xs opacity-70">Free delivery on all orders</p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg w-full transition-all text-xs font-bold group"
                        >
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Log Out
                        </button>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;
