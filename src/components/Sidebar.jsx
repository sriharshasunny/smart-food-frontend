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
                <div className={`h-full w-full relative overflow-hidden rounded-tr-2xl shadow-2xl flex flex-col ${location.pathname === '/recommendations' ? 'bg-[#0a0a14]/90 backdrop-blur-3xl border-r border-white/5' : 'bg-white'}`}>

                    {/* Header with HUD Border */}
                    <div className="relative shrink-0">
                        {/* HUD Border Segment */}
                        <div className={`absolute bottom-0 left-0 right-0 h-px ${location.pathname === '/recommendations' ? 'bg-white/10' : 'bg-gray-100'}`} />
                        
                        <div className="relative p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3 group">
                                <div className={`p-2 rounded-sm shadow-lg ${location.pathname === '/recommendations' ? 'bg-themeAccent-500/20 border border-themeAccent-500/30' : 'bg-gradient-to-tr from-orange-500 to-red-500'}`}>
                                    <Zap className={`w-5 h-5 ${location.pathname === '/recommendations' ? 'text-themeAccent-400' : 'text-white'} fill-current`} />
                                </div>
                                <span className={`text-xl font-black uppercase tracking-tighter ${location.pathname === '/recommendations' ? 'text-white' : 'text-gray-900'}`}>
                                    SmartFood
                                </span>
                            </div>
                            <button
                                onClick={toggleSidebar}
                                className={`p-2 rounded-full transition-all active:scale-90 ${location.pathname === '/recommendations' ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}
                            >
                                <X className="w-6 h-6" strokeWidth={1} />
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
                                    {/* HUD Active Indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active-hud"
                                            className={`absolute inset-0 rounded-sm border-l-2 ${location.pathname === '/recommendations' 
                                                ? 'bg-themeAccent-500/10 border-themeAccent-500 shadow-[inset_10px_0_20px_rgba(34,211,238,0.05)]' 
                                                : 'bg-orange-500/10 border-orange-500'}`}
                                            transition={{
                                                type: "spring",
                                                stiffness: 400,
                                                damping: 30
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

                    {/* Footer - Strategic Info */}
                    <div className={`p-5 border-t ${location.pathname === '/recommendations' ? 'border-white/5 bg-transparent' : 'border-gray-100 bg-gray-50/50'}`}>
                        {/* Premium Member Card - HUD Style */}
                        <div className="relative mb-6 overflow-hidden">
                            <div className={`absolute inset-0 opacity-20 ${location.pathname === '/recommendations' ? 'bg-themeAccent-500' : 'bg-gradient-to-br from-orange-400 to-red-500'}`} />
                            <div className={`relative p-4 border ${location.pathname === '/recommendations' ? 'border-themeAccent-500/30 bg-[#0a0a14]' : 'border-gray-200 bg-white shadow-sm'} rounded-sm`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${location.pathname === '/recommendations' ? 'bg-themeAccent-400' : 'bg-orange-500'}`} />
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${location.pathname === '/recommendations' ? 'text-white' : 'text-gray-900'}`}>Premium Tier</p>
                                </div>
                                <p className="text-[9px] font-bold opacity-50 uppercase tracking-tighter">unlimited logistics active</p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-sm w-full transition-all text-[10px] font-black uppercase tracking-widest group ${location.pathname === '/recommendations' ? 'text-white/30 hover:text-red-400 hover:bg-white/5' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`}
                        >
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1} />
                            Terminate Session
                        </button>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;
