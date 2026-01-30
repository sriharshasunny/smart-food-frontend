import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Heart, ShoppingBag, Clock, Settings, Zap, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        { icon: Home, label: 'Home', path: '/home' },
        { icon: Compass, label: 'Restaurants', path: '/restaurants' },
        { icon: Zap, label: 'AI Picks', path: '/recommendations' },
        { icon: Heart, label: 'Wishlist', path: '/wishlist' },
        { icon: Clock, label: 'History', path: '/history' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    />

                    {/* Sidebar Drawer */}
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-0 h-full w-[260px] bg-white shadow-2xl z-50 overflow-hidden flex flex-col font-sans rounded-r-[2rem]"
                    >
                        {/* Header with Gradient Border */}
                        <div className="relative rounded-tr-[2rem]">
                            {/* Gradient Border */}
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 animate-gradient-x p-[1.5px] rounded-tr-[2rem]">
                                <div className="h-full w-full bg-white rounded-tr-[calc(2rem-1.5px)]"></div>
                            </div>

                            <div className="relative p-6 flex items-center justify-between">
                                <Link to="/home" className="flex items-center gap-2 group">
                                    <div className="p-1.5 bg-gradient-to-tr from-orange-500 to-red-500 rounded-lg shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform">
                                        <Zap className="w-4 h-4 text-white fill-current" />
                                    </div>
                                    <span className="text-xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                        SmartFood
                                    </span>
                                </Link>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all active:scale-90"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Menu with Liquid Animation */}
                        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1 no-scrollbar">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        onClick={() => window.innerWidth < 1024 && onClose()}
                                        className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
                                    >
                                        {/* Apple-style Liquid Background Animation */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-active-pill"
                                                className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg shadow-orange-500/30"
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
                                                className={`font-bold tracking-wide transition-colors ${isActive
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
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-br-[2rem]">
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
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
