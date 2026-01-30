import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MapPin, Sparkles, ShoppingBag, Heart, User, Settings, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const canvasRef = React.useRef(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.offsetWidth;
                canvas.height = canvas.parentElement.offsetHeight;
            }
        };
        resize();
        window.addEventListener('resize', resize);

        const stars = Array.from({ length: 100 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 0.5 + 0.1,
            opacity: Math.random()
        }));

        const render = () => {
            ctx.fillStyle = '#050510'; // Deep space black
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();

                star.y += star.speed;
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }
            });
            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.div
                className={`fixed top-0 left-0 h-full w-[280px] z-[70] transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 md:sticky md:top-0 md:h-screen md:w-[280px] shrink-0`}
            >
                <div className="h-full w-full relative overflow-hidden md:rounded-tr-[2.5rem] shadow-2xl sidebar-container group bg-[#050510] md:bg-transparent">

                    {/* SPACE BACKGROUND CANVAS - Visible on All Screens now */}
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col p-6">
                        {/* Logo Area */}
                        <div className="flex items-center justify-between mb-10 px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                                    <span className="text-xl">🍔</span>
                                </div>
                                <h1 className="text-2xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight">
                                    SmartFood
                                </h1>
                            </div>

                            {/* Close Button (Mobile Only) */}
                            <button
                                onClick={toggleSidebar}
                                className="md:hidden p-2 text-gray-400 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 space-y-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => window.innerWidth < 768 && toggleSidebar()}
                                    className={`relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group/item overflow-hidden ${location.pathname === item.path
                                        ? 'text-white shadow-lg shadow-orange-500/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {/* Active Indicator Background */}
                                    {location.pathname === item.path && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-red-600/90"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    <item.icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${location.pathname === item.path ? 'scale-110 text-white' : 'group-hover/item:scale-110'}`} strokeWidth={2} />
                                    <span className="font-bold relative z-10 tracking-wide text-sm">{item.label}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Footer */}
                        <div className="pt-6 border-t border-white/10 space-y-4">
                            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all font-bold text-sm group/settings">
                                <Settings className="w-5 h-5 group-hover/settings:rotate-90 transition-transform" />
                                Settings
                            </button>

                            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/20">
                                        PRO
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-xs font-bold">Premium Plan</p>
                                        <p className="text-gray-400 text-[10px]">Expires in 12 days</p>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="w-full bg-white text-black py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-sm">
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;
