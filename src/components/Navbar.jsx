import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, User, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { motion } from 'framer-motion';

const Navbar = ({ toggleSidebar }) => {
    const { cartCount, searchQuery, setSearchQuery } = useShop();
    const location = useLocation();

    // Use Global Auth
    const { user } = useAuth();

    const navItems = [
        { path: '/home', label: 'Home' },
        { path: '/restaurants', label: 'Restaurants' },
        { path: '/recommendations', label: 'AI Picks', isBeta: true }
    ];

    return (
        <nav className="sticky top-0 z-50 transition-all duration-300 rounded-b-[1.5rem] shadow-lg">
            {/* 1. HUD Border Layer */}
            <div className={`absolute inset-0 rounded-b-2xl ${location.pathname === '/recommendations' ? 'bg-white/10' : 'bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 animate-gradient-x'} p-[1px]`}>
                {/* 2. Inner Background Layer */}
                <div className={`h-full w-full ${location.pathname === '/recommendations' ? 'bg-[#0a0a14]/80 backdrop-blur-3xl' : 'bg-white'} rounded-b-[calc(1rem-1px)] shadow-2xl`}></div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 w-full relative z-10">
                {/* Reduced height by ~10px: h-16/20 -> h-[54px] md:h-[70px] */}
                <div className="flex justify-between items-center h-[54px] md:h-[70px] gap-4">

                    {/* LEFT: Toggle, Logo */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={toggleSidebar}
                            className={`p-1.5 -ml-2 rounded-full transition-all active:scale-95 ${location.pathname === '/recommendations' ? 'hover:bg-white/5 text-white/70' : 'hover:bg-black/5 text-gray-700'}`}
                        >
                            <Menu className="w-6 h-6" strokeWidth={1} />
                        </button>

                        <Link to="/home" className="flex items-center gap-3 group cursor-pointer select-none">
                            <div className={`p-2 rounded-sm shadow-lg ${location.pathname === '/recommendations' ? 'bg-themeAccent-500/20 border border-themeAccent-500/30' : 'bg-gradient-to-tr from-orange-500 to-red-500'} group-hover:scale-105 transition-transform duration-300`}>
                                <ShoppingBag className={`w-4 h-4 ${location.pathname === '/recommendations' ? 'text-themeAccent-400' : 'text-white'}`} />
                            </div>
                            {/* Desktop Logo */}
                            <span className={`text-lg md:text-xl font-black uppercase tracking-tighter hidden sm:block ${location.pathname === '/recommendations' ? 'text-white' : 'text-gray-900'}`}>
                                SmartFood
                            </span>
                            {/* Mobile Page Title */}
                            <span className={`text-lg font-black tracking-tight capitalize sm:hidden ${location.pathname === '/recommendations' ? 'text-white' : 'text-gray-800'}`}>
                                {location.pathname === '/home' ? 'Home' : location.pathname.split('/')[1] || 'SmartFood'}
                            </span>
                        </Link>
                    </div>

                    {/* CENTER: Navigation Links (Desktop) with HUD Underline */}
                    <div className="hidden lg:flex items-center space-x-1 relative">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative px-5 py-2 group"
                            >
                                {location.pathname === item.path && (
                                    <motion.div
                                        layoutId="navbar-hud-underline"
                                        className={`absolute bottom-0 left-4 right-4 h-[2px] rounded-full ${location.pathname === '/recommendations' ? 'bg-themeAccent-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-orange-500'}`}
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <div className="flex items-center gap-2 z-10 relative">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${location.pathname === item.path 
                                        ? (location.pathname === '/recommendations' ? 'text-white' : 'text-gray-900') 
                                        : (location.pathname === '/recommendations' ? 'text-white/40 group-hover:text-white' : 'text-gray-400 group-hover:text-gray-800')
                                        }`}>
                                        {item.label}
                                    </span>
                                    {item.isBeta && (
                                        <span className={`px-1.5 py-[1px] text-[8px] font-black rounded-sm border ${location.pathname === '/recommendations' ? 'border-themeAccent-500/40 text-themeAccent-400 bg-themeAccent-500/5' : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm shadow-purple-500/20'}`}>
                                            BETA
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Search Bar - Strategic HUD */}
                        <div className="hidden xl:flex items-center relative group">
                            {location.pathname !== '/recommendations' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-full blur-[1px] opacity-70 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 animate-gradient-x" />
                            )}
                            <div className={`relative flex items-center rounded-full p-[1px] ${location.pathname === '/recommendations' ? 'bg-white/10 border border-white/5' : 'bg-white'}`}>
                                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors z-10 ${location.pathname === '/recommendations' ? 'text-white/30 group-focus-within:text-themeAccent-400' : 'text-gray-400 group-focus-within:text-orange-500'}`} strokeWidth={1} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-40 pl-10 pr-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest focus:w-56 focus:ring-0 outline-none transition-all duration-500 placeholder:text-gray-500 relative z-10 ${location.pathname === '/recommendations' ? 'bg-transparent text-white' : 'bg-gray-50 text-gray-900 focus:bg-white'}`}
                                    placeholder="Execute search..."
                                />
                            </div>
                        </div>

                        <Link to="/wishlist" className={`relative p-2.5 rounded-full transition-all group active:scale-95 ${location.pathname === '/recommendations' ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-red-50 text-gray-600 hover:text-red-500'}`}>
                            <Heart className="w-5 h-5" strokeWidth={1} />
                        </Link>

                        <Link to="/cart" className={`relative p-2.5 rounded-full transition-all group active:scale-95 ${location.pathname === '/recommendations' ? 'hover:bg-white/5 text-white/40 hover:text-white' : 'hover:bg-orange-50 text-gray-600 hover:text-orange-600'}`}>
                            <ShoppingBag className="w-5 h-5" strokeWidth={1} />
                            {cartCount > 0 && (
                                <span className={`absolute top-1.5 right-1.5 w-3.5 h-3.5 text-[8px] font-black rounded-sm flex items-center justify-center shadow-md ${location.pathname === '/recommendations' ? 'bg-themeAccent-500 text-black' : 'bg-red-500 text-white ring-2 ring-white'}`}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>

                        <Link
                            to="/profile"
                            className={`flex items-center gap-2.5 pl-1 pr-2 py-1 focus:outline-none rounded-full transition-all group ${location.pathname === '/recommendations' ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                        >
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${location.pathname === '/recommendations' ? 'bg-white/5 text-white border border-white/10' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 shadow-sm ring-2 ring-white group-hover:ring-orange-100'}`}>
                                <User className="w-5 h-5" strokeWidth={1} />
                            </div>
                            <div className="hidden xl:flex flex-col items-start leading-none gap-0.5">
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${location.pathname === '/recommendations' ? 'text-white/60 group-hover:text-white' : 'text-gray-900 group-hover:text-orange-600'}`}>
                                    {user?.name?.split(' ')[0] || 'Profile'}
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
