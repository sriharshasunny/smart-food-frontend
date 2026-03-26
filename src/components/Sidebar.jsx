import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, Sparkles, ShoppingBag, Heart, User, X, LogOut, Zap, Star, ChevronRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SIDEBAR_CSS = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* Glossy pill reflection */
  .glossy-pill::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 45%;
    background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%);
    border-radius: inherit;
    pointer-events: none;
  }

  /* Refined Item Container */
  .nav-item-container {
    border: 1px solid transparent;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 10;
  }
  .nav-item-container.active-border {
    border-color: rgba(251, 146, 60, 0.25);
  }
  .is-space .nav-item-container.active-border {
    border-color: rgba(34, 211, 238, 0.25);
  }

  /* Subtle Glossy Overlay for each button */
  .glossy-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%, rgba(255,255,255,0.04) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 5;
  }
  .group:hover .glossy-overlay {
    opacity: 1;
  }

  @keyframes pill-glow {
    0%, 100% { box-shadow: 0 4px 20px rgba(249,115,22,0.3), inset 0 1px 0 rgba(255,255,255,0.25); }
    50%       { box-shadow: 0 4px 30px rgba(249,115,22,0.5), inset 0 1px 0 rgba(255,255,255,0.4); }
  }
  @keyframes pill-glow-space {
    0%, 100% { box-shadow: 0 4px 20px rgba(34,211,238,0.2), inset 0 1px 0 rgba(34,211,238,0.2); }
    50%       { box-shadow: 0 4px 30px rgba(34,211,238,0.4), inset 0 1px 0 rgba(34,211,238,0.4); }
  }
  .pill-glow       { animation: pill-glow 2.5s ease-in-out infinite; }
  .pill-glow-space { animation: pill-glow-space 2.5s ease-in-out infinite; }

  @keyframes shimmer-slide {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  .text-shimmer {
    background: linear-gradient(90deg, #111 0%, #111 30%, #f97316 45%, #fbbf24 50%, #f97316 55%, #111 70%, #111 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer-slide 3s linear infinite;
  }
  .text-shimmer-space {
    background: linear-gradient(90deg, #fff 0%, #fff 30%, #22d3ee 45%, #a78bfa 50%, #22d3ee 55%, #fff 70%, #fff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer-slide 3s linear infinite;
  }
`;

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const isSpaceTheme = location.pathname === '/recommendations';

    const menuItems = [
        { path: '/home',            icon: Home,       label: 'Home',        subtitle: 'Explore food & offers'     },
        { path: '/restaurants',     icon: MapPin,      label: 'Restaurants', subtitle: 'Find nearby places'         },
        { path: '/recommendations', icon: Sparkles,    label: 'AI Picks',    subtitle: 'Tailored just for you', isBeta: true },
        { path: '/orders',          icon: ShoppingBag, label: 'My Orders',   subtitle: 'Track & reorder'            },
        { path: '/wishlist',        icon: Heart,       label: 'Wishlist',    subtitle: 'Saved favourites'           },
        { path: '/profile',         icon: User,        label: 'Profile',     subtitle: 'Account & preferences'     },
    ];

    const handleLogout = async () => {
        try { await logout(); navigate('/'); }
        catch (error) { console.error('Logout failed', error); navigate('/'); }
    };

    return (
        <>
            <style>{SIDEBAR_CSS}</style>

            {/* Backdrop - separate so sidebar stays mounted for layoutId */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="sidebar-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={toggleSidebar}
                        className={`fixed inset-0 z-50 ${isSpaceTheme ? 'bg-black/70 backdrop-blur-md' : 'bg-black/40 backdrop-blur-sm'}`}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar — always mounted so layoutId persists across closes */}
            <div
                className={`fixed top-0 left-0 h-full w-[300px] z-[60] transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className={`h-full w-full relative overflow-hidden shadow-2xl flex flex-col min-h-0 rounded-tr-[2rem] transition-colors duration-500
                    ${isSpaceTheme
                        ? 'bg-[#05050f]/97 backdrop-blur-[40px] border-r border-white/10'
                        : 'bg-white'
                    }`}
                >

                    {/* Space accent line on right edge */}
                    {isSpaceTheme && (
                        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent pointer-events-none" />
                    )}

                    {/* ── HEADER ── */}
                    <div className="relative shrink-0">
                        {/* Gradient hero top */}
                        <div className={`relative overflow-hidden rounded-tr-[2rem] ${
                            isSpaceTheme
                                ? 'bg-gradient-to-br from-[#0a0a1f] via-[#0d0d2a] to-[#060612]'
                                : 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-500'
                        }`}>
                            {/* Mesh shine overlay */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
                            {/* Wave bottom */}
                            <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 300 24" preserveAspectRatio="none" style={{ height: 24 }}>
                                <path d="M0,24 C60,8 120,0 180,8 C240,16 270,12 300,4 L300,24Z" fill={isSpaceTheme ? '#05050f' : 'white'} />
                            </svg>

                            <div className="p-5 pt-6 pb-8 flex items-center justify-between relative z-10">
                                <Link to="/home" onClick={toggleSidebar} className="flex items-center gap-3 group">
                                    <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-white/30">
                                        <Zap className="w-5 h-5 text-white fill-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-lg font-black tracking-tight leading-none ${
                                            isSpaceTheme ? 'text-shimmer-space' : 'text-shimmer'
                                        }`}>
                                            SmartFood
                                        </span>
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5 text-white/70">
                                            {isSpaceTheme ? '// ai mode' : 'Delivery Platform'}
                                        </span>
                                    </div>
                                </Link>

                                <button
                                    onClick={toggleSidebar}
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all active:scale-90"
                                >
                                    <X className="w-5 h-5" strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>

                        {/* User greeting strip */}
                        {user && (
                            <div className={`mx-4 mt-3 mb-2 px-4 py-3 rounded-xl flex items-center gap-3 border transition-colors duration-500
                                ${ isSpaceTheme
                                    ? 'bg-white/5 border-white/10'
                                    : 'bg-orange-50/80 border-orange-100'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all duration-500
                                    ${isSpaceTheme
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                        : 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm'}`}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className={`text-xs font-bold truncate ${isSpaceTheme ? 'text-white/90' : 'text-gray-800'}`}>
                                        Hey, {user?.name?.split(' ')[0] || 'there'}! 👋
                                    </span>
                                    <span className={`text-[10px] truncate ${isSpaceTheme ? 'text-white/35' : 'text-gray-400'}`}>
                                        {user?.email || 'Welcome back'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── NAVIGATION ── */}
                    <nav className={`flex-1 overflow-y-auto py-2 px-3 space-y-2 no-scrollbar ${isSpaceTheme ? 'is-space' : ''}`}>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <motion.div
                                    key={item.label}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative"
                                >
                                    <Link
                                        to={item.path}
                                        onClick={toggleSidebar}
                                        className={`relative flex items-center gap-3 px-3 py-3 rounded-xl group overflow-hidden nav-item-container
                                            ${isActive ? 'active-border' : 'border-gray-100/50 hover:border-gray-200'}
                                            ${isSpaceTheme && !isActive ? 'border-white/5 hover:border-white/20' : ''}
                                        `}
                                    >
                                        {/* Glossy Overlay for each button */}
                                        <div className="glossy-overlay" />

                                        {/* Glossy sliding active pill — layoutId works because sidebar stays mounted */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="sidebar-active-pill"
                                                className={`absolute inset-0 rounded-xl glossy-pill ${isSpaceTheme
                                                    ? 'bg-gradient-to-r from-cyan-600/35 to-indigo-700/35 border border-cyan-500/30 pill-glow-space'
                                                    : 'bg-gradient-to-r from-orange-500 to-red-500 pill-glow shadow-lg shadow-orange-500/20'
                                                }`}
                                                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                            />
                                        )}

                                        {/* Hover bg (extra layer for smoothness) */}
                                        {!isActive && (
                                            <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isSpaceTheme ? 'bg-white/5' : 'bg-orange-50/40'}`} />
                                        )}

                                        {/* Icon box */}
                                        <div className={`relative z-10 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300
                                            ${isActive
                                                ? isSpaceTheme ? 'bg-cyan-500/30' : 'bg-white/25 shadow-sm'
                                                : isSpaceTheme ? 'bg-white/5 border border-white/10 group-hover:bg-white/10' : 'bg-gray-50 border border-gray-100 group-hover:bg-white'
                                            }`}>
                                            <Icon className={`w-4.5 h-4.5 transition-all duration-300 ${isActive
                                                ? isSpaceTheme ? 'text-cyan-300' : 'text-white'
                                                : isSpaceTheme ? 'text-white/40 group-hover:text-white/80' : 'text-gray-400 group-hover:text-orange-500'
                                            }`} strokeWidth={isActive ? 2.5 : 1.5} />
                                        </div>

                                        {/* Text */}
                                        <div className="relative z-10 flex flex-col min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[13px] font-bold tracking-tight transition-all duration-300 ${isActive
                                                    ? 'text-white'
                                                    : isSpaceTheme ? 'text-white/60 group-hover:text-white/95' : 'text-gray-600 group-hover:text-gray-950'
                                                }`}>
                                                    {item.label}
                                                </span>
                                                {item.isBeta && (
                                                    <span className={`px-1.5 py-0.5 text-[8px] font-black rounded-full border ${isActive
                                                        ? 'bg-white/20 border-white/30 text-white'
                                                        : 'bg-purple-500/15 border-purple-500/30 text-purple-400'}`}>
                                                        BETA
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-[10px] font-medium truncate transition-all duration-300 ${isActive
                                                ? 'text-white/70'
                                                : isSpaceTheme ? 'text-white/30 group-hover:text-white/50' : 'text-gray-400 group-hover:text-gray-600'
                                            }`}>
                                                {item.subtitle}
                                            </span>
                                        </div>

                                        {/* Active/Arrow indicator */}
                                        <div className="relative z-10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <ChevronRight className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-white/60' : 'text-gray-300'}`} strokeWidth={2.5} />
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </nav>

                    {/* ── FOOTER ── */}
                    <div className={`p-4 shrink-0 border-t transition-colors duration-500 ${isSpaceTheme ? 'border-white/10' : 'border-gray-100'}`}>
                        {/* Logout btn */}
                        <button
                            onClick={handleLogout}
                            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl w-full transition-all text-sm font-bold group
                                ${isSpaceTheme
                                    ? 'text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20'
                                    : 'text-gray-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100'}`}
                        >
                            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={1.5} />
                            Log Out
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Sidebar;
