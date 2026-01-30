import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { Sparkles, ArrowRight, ChevronDown, Clock, ShieldCheck, MapPin, Smartphone, Zap, Utensils, Bike, Gift, TrendingUp, Search, Heart, Star, ChefHat, Flame, Coffee, Pizza } from 'lucide-react';

// Floating Food Component
const FloatingFood = ({ delay, x, emoji, size, duration }) => (
    <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{
            y: ['0vh', '100vh'],
            opacity: [0, 1, 1, 0],
            rotate: [0, 360]
        }}
        transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
            ease: "linear"
        }}
        style={{ left: `${x}%`, fontSize: size }}
        className="absolute top-0 pointer-events-none z-0 opacity-60"
    >
        {emoji}
    </motion.div>
);

const LandingPage = () => {
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const [activeSlide, setActiveSlide] = useState(0);

    // Parallax & Fade Effects
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const heroY = useTransform(scrollY, [0, 400], [0, 100]);
    const scaleText = useTransform(scrollY, [0, 300], [1, 1.1]);

    const slides = [
        { id: 1, title: "Signature Burgers", sub: "Hand-crafted quality", img: "🍔", color: "from-orange-500 to-amber-500", rating: "4.9" },
        { id: 2, title: "Artisan Pasta", sub: "Authentic Italian recipes", img: "🍝", color: "from-red-500 to-rose-600", rating: "4.8" },
        { id: 3, title: "Fresh Bowls", sub: "Organic & Energizing", img: "🥗", color: "from-green-500 to-emerald-600", rating: "4.9" },
        { id: 4, title: "Sushi Platter", sub: "Pacific Freshness", img: "🍣", color: "from-blue-500 to-indigo-600", rating: "5.0" },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    // Food Rain Configuration - Reduced count
    const foodItems = [
        { emoji: "🍔", x: 10, delay: 0, size: 40, duration: 25 }, // Slower duration
        { emoji: "🍕", x: 25, delay: 5, size: 30, duration: 20 },
        { emoji: "🍟", x: 75, delay: 2, size: 35, duration: 28 },
        { emoji: "🍩", x: 90, delay: 6, size: 50, duration: 24 },
        { emoji: "🥑", x: 50, delay: 10, size: 30, duration: 30 },
    ];

    return (
        <div className="bg-[#050505] min-h-screen font-sans overflow-x-hidden text-white selection:bg-orange-500/30 relative">

            {/* --- FLOATING BACKGROUND ANIMATION --- */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {foodItems.map((item, i) => (
                    <FloatingFood key={i} {...item} />
                ))}
            </div>

            {/* ==================== 1. APPETIZING HERO ==================== */}
            <div className="relative min-h-[95vh] flex items-center justify-center overflow-hidden px-4 md:px-10">
                {/* Dynamic Backgrounds - Optimized: No layout shift or heavy repaints */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    {/* Static gradient blobs that move slowly via transform */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-orange-600/20 blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] rounded-full bg-purple-900/20 blur-[100px]"
                    />
                </div>

                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                    {/* Text Content */}
                    <motion.div
                        style={{ opacity: heroOpacity, y: heroY }}
                        className="space-y-8 text-center lg:text-left will-change-transform" // Optimized
                    >
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "auto" }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 backdrop-blur-md overflow-hidden whitespace-nowrap"
                        >
                            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                            <span className="text-sm font-bold text-orange-200 uppercase tracking-wider">Premium Delivery Service</span>
                        </motion.div>

                        <motion.h1
                            style={{ scale: scaleText }}
                            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]"
                        >
                            FUTURE <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 animate-gradient-x">
                                FLAVORS.
                            </span>
                        </motion.h1>
                        <p className="text-xl text-gray-300 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
                            Experience the convergence of culinary art and logistics technology.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(234,88,12,0.5)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className="px-12 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold text-xl flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center gap-2">Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-10 py-5 bg-white/5 border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-colors backdrop-blur-md flex items-center gap-2"
                            >
                                <Smartphone className="w-5 h-5" /> Download App
                            </motion.button>
                        </div>

                        {/* Live Feed Pill */}
                        <div className="pt-8 flex justify-center lg:justify-start">
                            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full bg-gray-700 border-2 border-black overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="user" />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white">1,240+ Orders</p>
                                    <p className="text-xs text-green-400">placed in the last hour</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 3D Floating Food Display */}
                    <div className="relative h-[600px] flex items-center justify-center perspective-1000">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSlide}
                                initial={{ opacity: 0, rotateX: -20, y: 100 }}
                                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                                exit={{ opacity: 0, rotateX: 20, y: -100 }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                className="absolute text-center w-full max-w-lg"
                            >
                                {/* Glowing Aura */}
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r ${slides[activeSlide].color} blur-[120px] opacity-40 rounded-full animate-pulse`}></div>

                                {/* Main Food Item */}
                                <motion.div
                                    animate={{
                                        y: [0, -30, 0],
                                        rotateZ: [0, 5, -5, 0]
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative z-20 text-[200px] md:text-[240px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    {slides[activeSlide].img}
                                </motion.div>

                                {/* Floating Ingredients / Particles */}
                                {[...Array(3)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute text-4xl"
                                        animate={{
                                            y: [0, -100, 0],
                                            x: [0, (i - 1) * 50, 0],
                                            opacity: [0, 1, 0]
                                        }}
                                        transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                                        style={{ top: '50%', left: '50%' }}
                                    >
                                        ✨
                                    </motion.div>
                                ))}

                                {/* Glass Card Info */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="absolute -right-8 bottom-0 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] shadow-2xl text-left max-w-[200px]"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-md">NEW</div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            <span className="font-bold text-sm">{slides[activeSlide].rating}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black leading-none mb-1">{slides[activeSlide].title}</h3>
                                    <p className="text-xs text-gray-300 mb-3">{slides[activeSlide].sub}</p>
                                    <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-white w-[80%]"></div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Trending right now</p>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ==================== 2. INFINITE MARQUEE (New Item) ==================== */}
            <div className="py-10 bg-black/50 border-y border-white/5 overflow-hidden">
                <div className="flex gap-16 animate-marquee whitespace-nowrap">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-500 uppercase italic">
                            <span>Fresh Delivery</span>
                            <span className="text-orange-500 not-italic">⚡</span>
                            <span>24/7 Service</span>
                            <span className="text-orange-500 not-italic">⚡</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ==================== 3. CATEGORY GRID (More Items) ==================== */}
            <div className="py-24 max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <h2 className="text-4xl font-black">Explore <span className="text-orange-500">Divisions</span></h2>
                    <button className="text-gray-400 hover:text-white flex items-center gap-2">View All <ArrowRight className="w-4 h-4" /></button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { name: "Gourmet", icon: ChefHat, color: "bg-purple-500" },
                        { name: "Fast Food", icon: Pizza, color: "bg-orange-500" },
                        { name: "Coffee", icon: Coffee, color: "bg-amber-700" },
                        { name: "Healthy", icon: Heart, color: "bg-green-500" },
                    ].map((cat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="h-40 relative rounded-3xl overflow-hidden group cursor-pointer bg-white/5 border border-white/5"
                        >
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${cat.color} blur-[40px] opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                                <cat.icon className="w-10 h-10 mb-4 text-gray-200 group-hover:text-white group-hover:scale-110 transition-all" />
                                <h3 className="text-xl font-bold group-hover:text-orange-400 transition-colors">{cat.name}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ==================== 4. INTELLIGENT DISCOVERY ==================== */}
            {/* ... (Keeping existing refined content but adding more motion) */}
            <div className="relative py-32 bg-[#050505]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Heart,
                                title: "Smart Cravings",
                                desc: "Algorithms that understand if you're in the mood for spicy or sweet.",
                                color: "text-red-400",
                                bg: "bg-red-500/10"
                            },
                            {
                                icon: Sparkles,
                                title: "Visual Menus",
                                desc: "See exactly what you're getting with high-fidelity AR previews (Coming Soon).",
                                color: "text-orange-400",
                                bg: "bg-orange-500/10"
                            },
                            {
                                icon: Zap,
                                title: "Hyper-Speed",
                                desc: "Orchestrated delivery networks ensuring your food never sits cold.",
                                color: "text-yellow-400",
                                bg: "bg-yellow-500/10"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 }}
                                whileHover={{ y: -10, backgroundColor: "rgba(255,255,255,0.08)" }}
                                className="p-8 rounded-[2rem] bg-white/5 border border-white/5 backdrop-blur-sm"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${item.bg} ${item.color} shadow-lg shadow-white/5`}>
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ==================== 5. FOOTER ==================== */}
            <div className="relative py-32 text-center overflow-hidden">
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <motion.h2
                        whileInView={{ scale: [0.9, 1] }}
                        className="text-6xl md:text-9xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-800"
                    >
                        HUNGRY?
                    </motion.h2>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/login')}
                        className="inline-flex items-center justify-center px-12 py-6 bg-orange-500 text-white text-xl font-bold rounded-full hover:bg-orange-600 transition-all shadow-[0_20px_50px_rgba(249,115,22,0.4)]"
                    >
                        Order Now <ArrowRight className="ml-2 w-5 h-5" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
