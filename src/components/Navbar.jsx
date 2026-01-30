import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, User, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { motion } from 'framer-motion';

const Navbar = ({ toggleSidebar }) => {
    const { cartCount } = useShop();
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
            {/* 1. Gradient Border Layer (The "Light") */}
            <div className="absolute inset-0 rounded-b-[1.5rem] bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 animate-gradient-x p-[1.5px] shadow-xl shadow-purple-500/20">
                {/* 2. Inner Background Layer (Solid White) */}
                <div className="h-full w-full bg-white rounded-b-[calc(1.5rem-1.5px)]"></div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 w-full relative z-10">
                {/* Reduced height by ~10px: h-16/20 -> h-[54px] md:h-[70px] */}
                <div className="flex justify-between items-center h-[54px] md:h-[70px] gap-4">

                    {/* LEFT: Toggle, Logo */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-1.5 -ml-2 hover:bg-black/5 rounded-full transition-all active:scale-95"
                        >
                            <Menu className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
                        </button>

                        <Link to="/home" className="flex items-center gap-2.5 group cursor-pointer select-none">
                            <div className="bg-gradient-to-tr from-orange-500 to-red-500 p-1.5 rounded-lg shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                                <ShoppingBag className="w-4.5 h-4.5 text-white" />
                            </div>
                            <span className="text-lg md:text-xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent hidden sm:block tracking-tighter">
                                SmartFood
                            </span>
                        </Link>
                    </div>

                    {/* CENTER: Navigation Links (Desktop) with Liquid Underline */}
                    <div className="hidden lg:flex items-center space-x-2 relative">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative px-6 py-2 group"
                            >
                                {location.pathname === item.path && (
                                    <motion.div
                                        layoutId="navbar-liquid-underline"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-4"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <div className="flex items-center gap-1.5 z-10 relative">
                                    <span className={`text-[11px] font-black uppercase tracking-[0.15em] transition-colors duration-200 ${location.pathname === item.path ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-800'
                                        }`}>
                                        {item.label}
                                    </span>
                                    {item.isBeta && (
                                        <span className="px-1.5 py-[2px] bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] font-bold rounded-full shadow-sm shadow-purple-500/20">
                                            BETA
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Search Bar - Premium/Refined */}
                        <div className="hidden xl:flex items-center relative group">
                            {/* Rainbow Border Container */}
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-full blur-[1px] opacity-70 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 animate-gradient-x" />

                            <div className="relative flex items-center bg-white rounded-full p-[2px]">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors z-10" strokeWidth={1.5} />
                                <input
                                    type="text"
                                    className="w-48 pl-10 pr-4 py-1.5 bg-gray-50 border-none rounded-full text-xs font-semibold focus:bg-white focus:w-60 focus:ring-0 outline-none transition-all duration-300 placeholder:text-gray-400 relative z-10"
                                    placeholder="Search food..."
                                />
                            </div>
                        </div>

                        <Link to="/wishlist" className="relative p-2.5 hover:bg-red-50 rounded-full transition-all group active:scale-95">
                            <Heart className="w-6 h-6 text-gray-600 group-hover:text-red-500 transition-colors" strokeWidth={1.5} />
                        </Link>

                        <Link to="/cart" className="relative p-2.5 hover:bg-orange-50 rounded-full transition-all group active:scale-95">
                            <ShoppingBag className="w-6 h-6 text-gray-600 group-hover:text-orange-600 transition-colors" strokeWidth={1.5} />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>

                        <Link
                            to="/profile"
                            className="flex items-center gap-2.5 pl-1 pr-2 py-1 focus:outline-none hover:bg-gray-50 rounded-full transition-all group"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-700 font-bold text-xs shadow-sm ring-2 ring-white group-hover:ring-orange-100 transition-all hover:shadow-md">
                                <User className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                            <div className="hidden xl:flex flex-col items-start leading-none gap-0.5">
                                <span className="text-xs font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
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
