import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowDown, MapPin, Zap, Truck, ShieldCheck, Utensils, Smartphone, Star, Clock } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const scrollToContent = () => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    };

    const ScrollReveal = ({ children, delay = 0 }) => (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );

    return (
        <div className="min-h-screen text-gray-900 font-sans overflow-x-hidden bg-gray-50 selection:bg-orange-500 selection:text-white">

            {/* NAVBAR */}
            <nav className="fixed w-full z-50 top-4 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
                            <div className="bg-orange-500 p-1.5 rounded-lg">
                                <Utensils className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-black text-xl tracking-tight text-gray-900">FoodVerse</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/login')} className="hidden sm:block px-5 py-2 text-sm font-bold hover:text-orange-500 text-gray-600 transition-colors">
                                Log In
                            </button>
                            <button onClick={() => navigate('/signup')} className="px-6 py-2.5 bg-gray-900 text-white text-sm font-black rounded-full hover:bg-orange-500 transition-colors shadow-md">
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col w-full">

                {/* HERO SECTION */}
                <section className="min-h-screen flex flex-col justify-center px-6 max-w-7xl mx-auto w-full pt-20">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center h-full">

                        {/* Text Content */}
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 order-2 lg:order-1 z-10">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-[11px] font-black uppercase tracking-widest mb-6 shadow-sm">
                                    <Zap className="w-3.5 h-3.5 fill-current" /> Lightning Fast Delivery
                                </div>
                                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-gray-900 drop-shadow-sm">
                                    Cravings satisfied,<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                                        faster than ever.
                                    </span>
                                </h1>
                                <p className="text-lg md:text-xl text-gray-500 max-w-md mx-auto lg:mx-0 leading-relaxed mb-8 font-medium">
                                    The best local restaurants and global cuisines, delivered right to your door with real-time tracking.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
                                    <button onClick={() => navigate('/home')} className="px-8 py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 hover:-translate-y-1 transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 min-w-[180px]">
                                        Explore Menu <ChevronRight className="w-5 h-5" />
                                    </button>
                                    <button onClick={scrollToContent} className="px-8 py-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 min-w-[180px]">
                                        How it works <ArrowDown className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Image Graphic - CSS Floating Animation */}
                        <div className="relative h-[40vh] min-h-[400px] lg:h-[600px] w-full order-1 lg:order-2 flex items-center justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="relative w-full max-w-lg aspect-square"
                            >
                                {/* Decorative Blobs */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-rose-400 rounded-full blur-3xl opacity-20 animate-pulse" />

                                {/* Floating Image Container */}
                                <div className="absolute inset-0 flex items-center justify-center animate-[float_6s_ease-in-out_infinite]">
                                    <img
                                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1080&auto=format&fit=crop"
                                        alt="Delicious Food"
                                        className="w-[85%] h-[85%] object-cover rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-8 border-white"
                                    />

                                    {/* Floating Badges */}
                                    <div className="absolute -right-4 top-1/4 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-3 animate-[float_4s_ease-in-out_infinite_reverse]">
                                        <div className="bg-green-100 p-2 rounded-full"><Clock className="w-5 h-5 text-green-600" /></div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Delivery</p>
                                            <p className="text-sm font-black text-gray-900">Under 30m</p>
                                        </div>
                                    </div>

                                    <div className="absolute -left-4 bottom-1/4 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-3 animate-[float_5s_ease-in-out_infinite]">
                                        <div className="bg-yellow-100 p-2 rounded-full"><Star className="w-5 h-5 text-yellow-600" /></div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Rating</p>
                                            <p className="text-sm font-black text-gray-900">4.9 / 5.0</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* SCROLLING INFO */}
                <div id="about" className="relative w-full bg-white pt-24 pb-32 border-t border-gray-100">
                    <section className="px-6 max-w-7xl mx-auto space-y-32">

                        {/* FEATURES GRID */}
                        <div>
                            <ScrollReveal>
                                <div className="text-center mb-16">
                                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight text-gray-900">Why Choose FoodVerse?</h2>
                                    <p className="text-gray-500 max-w-2xl mx-auto font-medium">We blend cutting-edge technology with the finest culinary experiences.</p>
                                </div>
                            </ScrollReveal>
                            <div className="grid md:grid-cols-3 gap-6">
                                {[
                                    { title: "Hyper-Local", desc: "Discover hidden gems in your neighborhood.", icon: <MapPin className="w-8 h-8 text-rose-500" /> },
                                    { title: "Lightning Fast", desc: "Optimized routing ensures piping hot food.", icon: <Zap className="w-8 h-8 text-yellow-500" /> },
                                    { title: "Live Tracking", desc: "Watch your order travel in real-time.", icon: <Truck className="w-8 h-8 text-blue-500" /> },
                                    { title: "Secure Payments", desc: "Encrypted transactions for peace of mind.", icon: <ShieldCheck className="w-8 h-8 text-green-500" /> },
                                    { title: "Endless Choices", desc: "Thousands of restaurants to explore.", icon: <Utensils className="w-8 h-8 text-purple-500" /> },
                                    { title: "Easy App", desc: "Order with a single tap on your phone.", icon: <Smartphone className="w-8 h-8 text-orange-500" /> }
                                ].map((item, i) => (
                                    <ScrollReveal key={i} delay={i * 0.05}>
                                        <div className="group p-8 rounded-[2rem] bg-gray-50 border border-gray-100 hover:border-orange-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/10 hover:bg-white text-center h-full">
                                            <div className="mb-6 inline-block p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">{item.icon}</div>
                                            <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                                            <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>

                        {/* STATS */}
                        <ScrollReveal>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-gray-100 bg-gray-50 rounded-[3rem]">
                                {[
                                    { label: "Delivery Partners", val: "12k+" },
                                    { label: "Restaurants", val: "500+" },
                                    { label: "Avg Delivery", val: "24 min" },
                                    { label: "Happy Customers", val: "2M+" }
                                ].map((stat, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-3xl md:text-5xl font-black text-gray-900 mb-2">{stat.val}</div>
                                        <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>

                    </section>
                </div>

                {/* FOOTER CTA */}
                <div className="bg-gray-900 text-white py-20 px-6 text-center">
                    <ScrollReveal>
                        <h2 className="text-3xl md:text-5xl font-black mb-6">Ready to order?</h2>
                        <p className="text-gray-400 mb-10 max-w-xl mx-auto">Join thousands of others who are enjoying faster, fresher deliveries every day.</p>
                        <button onClick={() => navigate('/home')} className="px-10 py-4 bg-orange-500 text-white font-black rounded-full hover:bg-orange-600 hover:scale-105 transition-all shadow-xl shadow-orange-500/20">
                            Get Started Now
                        </button>
                    </ScrollReveal>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
