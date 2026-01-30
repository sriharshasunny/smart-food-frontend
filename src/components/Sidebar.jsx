import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MapPin, Sparkles, ShoppingBag, Heart, User, Settings, LogOut } from 'lucide-react';
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.div
                className={`fixed top-0 left-0 h-full w-[280px] z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 md:sticky md:top-0 md:h-screen md:w-[280px] shrink-0`}
            >
                <div className="h-full w-full relative overflow-hidden md:rounded-tr-[2.5rem] shadow-2xl sidebar-container group bg-white md:bg-transparent">

                    {/* SPACE BACKGROUND CANVAS */}
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" />
                    {/* Mobile White Background fallback */}
                    <div className="absolute inset-0 bg-white md:hidden" />

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col p-6">
                        {/* Logo Area */}
                        <div className="flex items-center gap-3 mb-10 px-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <span className="text-xl">🍔</span>
                            </div>
                            <h1 className="text-2xl font-black md:text-white bg-clip-text text-transparent md:bg-none bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">
                                SmartFood
                            </h1>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 space-y-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => window.innerWidth < 768 && toggleSidebar()}
                                    className={`relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group/item overflow-hidden ${location.pathname === item.path
                                        ? 'md:text-white text-gray-900 shadow-lg md:shadow-orange-500/20 shadow-orange-500/10'
                                        : 'md:text-gray-400 text-gray-500 hover:text-orange-500 md:hover:text-white md:hover:bg-white/5'
                                        }`}
                                >
                                    {/* Active Indicator Background */}
                                    {location.pathname === item.path && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 md:bg-gradient-to-r md:from-orange-600/90 md:to-red-600/90 bg-orange-50"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    <item.icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${location.pathname === item.path ? 'scale-110 text-orange-600 md:text-white' : 'group-hover/item:scale-110'}`} strokeWidth={2} />
                                    <span className="font-bold relative z-10 tracking-wide text-sm">{item.label}</span>
                                </Link>
                            ))}
                        </nav>

                        {/* Footer */}
                        <div className="pt-6 md:border-t md:border-white/10 border-t border-gray-100 space-y-4">
                            <button className="w-full flex items-center gap-3 px-4 py-3 md:text-gray-400 text-gray-500 hover:text-orange-500 md:hover:text-white md:hover:bg-white/5 rounded-xl transition-all font-bold text-sm group/settings">
                                <Settings className="w-5 h-5 group-hover/settings:rotate-90 transition-transform" />
                                Settings
                            </button>

                            <div className="md:bg-gradient-to-br md:from-white/10 md:to-white/5 bg-gray-50 rounded-2xl p-4 md:border md:border-white/10 border border-gray-100 backdrop-blur-md">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/20">
                                        PRO
                                    </div>
                                    <div className="flex-1">
                                        <p className="md:text-white text-gray-900 text-xs font-bold">Premium Plan</p>
                                        <p className="md:text-gray-400 text-gray-500 text-[10px]">Expires in 12 days</p>
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
