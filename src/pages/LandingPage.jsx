import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, ShieldCheck, Zap } from 'lucide-react';

const ASSETS = {
    // Premium 3D Food Models (Filters applied inline to make them look hyper-realistic)
    burger3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hamburger/3D/hamburger_3d.png",
    pizza3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pizza/3D/pizza_3d.png",
    bowl3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bento%20box/3D/bento_box_3d.png",
    drink3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cup%20with%20straw/3D/cup_with_straw_3d.png",
    // Local Generated Assets
    drone3D: "/drone.png",
    cityBg: "/citybg.png"
};

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen w-full text-white font-sans selection:bg-purple-500 selection:text-white flex flex-col items-center justify-between pb-8 bg-[#000000]">

            {/* THE CYBERPUNK CITYSCAPE BACKGROUND */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Generated City Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-bottom opacity-70 filter contrast-[1.2] saturate-[1.5] mix-blend-screen"
                    style={{ backgroundImage: `url(${ASSETS.cityBg})` }}
                />

                {/* Deep Space Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0d0428]/90 via-transparent to-[#050014]/90" />

                {/* Glowing Nebula Effects */}
                <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] mix-blend-screen" />

                {/* Starfield Layer */}
                <div className="absolute inset-0 opacity-40 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <div className="absolute inset-0 opacity-20 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(circle, #c084fc 2px, transparent 2px)', backgroundSize: '150px 150px', backgroundPosition: '30px 30px' }} />

                {/* Floor glow for the city */}
                <div className="absolute bottom-0 w-full h-[30vh] bg-gradient-to-t from-fuchsia-600/10 to-transparent blur-[50px] mix-blend-screen" />
            </div>

            {/* HEADER TEXT & BUTTONS */}
            <div className="relative z-20 w-full pt-16 md:pt-24 flex flex-col items-center text-center px-6">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                    FoodExpress – <span className="font-normal text-white">Delivery Beyond Limits</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-indigo-200/80 text-lg md:text-xl font-medium tracking-wide mb-10"
                >
                    Fast. Smart. Delivered to Your Doorstep.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-5 pointer-events-auto"
                >
                    <button
                        onClick={() => navigate('/home')}
                        className="px-10 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold tracking-wide shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:shadow-[0_0_50px_rgba(168,85,247,0.8)] border border-indigo-400/30 transition-all hover:scale-105 active:scale-95"
                    >
                        Order Now
                    </button>
                    <button
                        onClick={() => navigate('/home')}
                        className="px-10 py-3 rounded-full bg-[#120038]/60 backdrop-blur-md border-2 border-fuchsia-500/70 text-white font-bold tracking-wide shadow-[0_0_30px_rgba(217,70,239,0.3)] hover:bg-fuchsia-500/20 hover:shadow-[0_0_40px_rgba(217,70,239,0.5)] transition-all hover:scale-105 active:scale-95"
                    >
                        Explore Restaurants
                    </button>
                </motion.div>
            </div>

            {/* CENTRAL REALISTIC DRONE & ORBITING FOOD */}
            <div className="relative w-full max-w-7xl flex-grow flex items-center justify-center my-10 min-h-[40vh] md:min-h-[50vh] pointer-events-none z-20">

                {/* The Realistic AI Drone */}
                <motion.div
                    animate={{ y: [0, -15, 0], rotateZ: [0, 1, -1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-[320px] md:w-[480px]"
                >
                    {/* Dark glow behind the drone to ensure it pops off the background */}
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-[80px] mix-blend-screen scale-[1.5]" />

                    <img
                        src={ASSETS.drone3D}
                        alt="Realistic Sci-Fi Drone"
                        // High contrast + saturate brings out the metallic/neon details of the AI generated image
                        className="relative z-10 w-full h-auto object-contain filter contrast-[1.2] drop-shadow-[0_40px_60px_rgba(0,0,0,1)] mix-blend-screen"
                    />

                    {/* --- ROTATING NEON FANS (CSS Parallaxed Rotors) --- */}
                    {/* Glowing Fan 1 (Top Left) */}
                    <div className="absolute top-[28%] left-[16%] w-24 h-24 -translate-x-1/2 -translate-y-1/2 z-20" style={{ perspective: 400 }}>
                        <motion.div
                            animate={{ rotateZ: 360 }} transition={{ repeat: Infinity, duration: 0.08, ease: "linear" }}
                            className="w-full h-full rounded-full border-[6px] border-cyan-400 border-x-transparent shadow-[0_0_40px_#22d3ee] mix-blend-screen opacity-100"
                            style={{ transform: 'rotateX(75deg)' }}
                        />
                    </div>
                    {/* Glowing Fan 2 (Top Right) */}
                    <div className="absolute top-[28%] right-[16%] w-24 h-24 translate-x-1/2 -translate-y-1/2 z-20" style={{ perspective: 400 }}>
                        <motion.div
                            animate={{ rotateZ: -360 }} transition={{ repeat: Infinity, duration: 0.08, ease: "linear" }}
                            className="w-full h-full rounded-full border-[6px] border-cyan-400 border-x-transparent shadow-[0_0_40px_#22d3ee] mix-blend-screen opacity-100"
                            style={{ transform: 'rotateX(75deg)' }}
                        />
                    </div>
                    {/* Glowing Fan 3 (Bottom Left) */}
                    <div className="absolute bottom-[35%] left-[18%] w-28 h-28 -translate-x-1/2 translate-y-1/2 z-20" style={{ perspective: 400 }}>
                        <motion.div
                            animate={{ rotateZ: 360 }} transition={{ repeat: Infinity, duration: 0.1, ease: "linear" }}
                            className="w-full h-full rounded-full border-[6px] border-indigo-500 border-y-transparent shadow-[0_0_50px_#6366f1] mix-blend-screen opacity-100"
                            style={{ transform: 'rotateX(75deg)' }}
                        />
                    </div>
                    {/* Glowing Fan 4 (Bottom Right) */}
                    <div className="absolute bottom-[35%] right-[18%] w-28 h-28 translate-x-1/2 translate-y-1/2 z-20" style={{ perspective: 400 }}>
                        <motion.div
                            animate={{ rotateZ: -360 }} transition={{ repeat: Infinity, duration: 0.1, ease: "linear" }}
                            className="w-full h-full rounded-full border-[6px] border-indigo-500 border-y-transparent shadow-[0_0_50px_#6366f1] mix-blend-screen opacity-100"
                            style={{ transform: 'rotateX(75deg)' }}
                        />
                    </div>
                </motion.div>

                {/* Orbiting Food - TOP LEFT (Burger) */}
                <motion.div
                    className="absolute top-[10%] left-[10%] md:top-[12%] md:left-[12%] w-24 md:w-36 z-30"
                    animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <motion.img
                        src={ASSETS.burger3D}
                        animate={{ rotateY: 360, rotateX: 360, rotateZ: 360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] filter contrast-[1.2] saturate-[1.3]"
                    />
                </motion.div>

                {/* Orbiting Food - TOP RIGHT (Pizza) */}
                <motion.div
                    className="absolute top-[5%] right-[5%] md:top-[5%] md:right-[15%] w-32 md:w-48 z-10"
                    animate={{ y: [0, -25, 0], x: [0, 15, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                    <motion.img
                        src={ASSETS.pizza3D}
                        animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] filter contrast-[1.2] saturate-[1.3]"
                    />
                </motion.div>

                {/* Orbiting Food - BOTTOM LEFT (Bowl/Noodles) */}
                <motion.div
                    className="absolute bottom-[20%] left-[5%] md:bottom-[20%] md:left-[15%] w-28 md:w-44 z-30"
                    animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <motion.img
                        src={ASSETS.bowl3D}
                        animate={{ rotateY: 360, rotateZ: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] filter contrast-[1.2] saturate-[1.3]"
                    />
                </motion.div>

                {/* Orbiting Food - BOTTOM RIGHT (Drink/Ice Cream) */}
                <motion.div
                    className="absolute bottom-[10%] right-[10%] md:bottom-[15%] md:right-[18%] w-20 md:w-32 z-30"
                    animate={{ y: [0, 30, 0], x: [0, -15, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                >
                    <motion.img
                        src={ASSETS.drink3D}
                        animate={{ rotateX: 360, rotateY: 360, rotateZ: [0, 180, 0] }}
                        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                        className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] filter contrast-[1.2] saturate-[1.3]"
                    />
                </motion.div>

            </div>

            {/* FEATURE CARDS BOTTOM GRID */}
            <div className="relative z-30 px-6 w-full max-w-7xl mx-auto pointer-events-auto mt-6 md:mt-10 overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">

                    {/* Card 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
                        className="bg-[#0f0728]/80 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:bg-[#1a0b3b]/90 hover:border-indigo-400/60 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-indigo-500/20 p-2.5 rounded-full ring-1 ring-indigo-500/50 group-hover:ring-indigo-400 transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                                <Zap className="w-5 h-5 text-indigo-300" />
                            </div>
                            <h3 className="font-bold text-[15px] whitespace-nowrap tracking-wide leading-tight">Lightning<br />Fast Delivery</h3>
                        </div>
                        <p className="text-xs text-indigo-100/60 leading-relaxed font-medium">
                            FoodExpress is a modern food delivery platform powered by AI to ensure timely routing.
                        </p>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
                        className="bg-[#0f0728]/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:bg-[#1a0b3b]/90 hover:border-purple-400/60 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-purple-500/20 p-2.5 rounded-full ring-1 ring-purple-500/50 group-hover:ring-purple-400 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                <MapPin className="w-5 h-5 text-purple-300" />
                            </div>
                            <h3 className="font-bold text-[15px] whitespace-nowrap tracking-wide leading-tight">Live Order<br />Tracking</h3>
                        </div>
                        <p className="text-xs text-indigo-100/60 leading-relaxed font-medium">
                            FoodExpress gives real time food delivery tracking powered by the ultimate GPS location.
                        </p>
                    </motion.div>

                    {/* Card 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
                        className="bg-[#0f0728]/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:bg-[#1a0b3b]/90 hover:border-cyan-400/60 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-cyan-500/20 p-2.5 rounded-full ring-1 ring-cyan-500/50 group-hover:ring-cyan-400 transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                                <Search className="w-5 h-5 text-cyan-300" />
                            </div>
                            <h3 className="font-bold text-[15px] whitespace-nowrap tracking-wide leading-tight">Smart Search<br />& Filters</h3>
                        </div>
                        <p className="text-xs text-indigo-100/60 leading-relaxed font-medium">
                            FoodExpress has AI algorithms to surface exact matches tailored to your palate & craving.
                        </p>
                    </motion.div>

                    {/* Card 4 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
                        className="bg-[#0f0728]/80 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:bg-[#1a0b3b]/90 hover:border-pink-400/60 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-pink-500/20 p-2.5 rounded-full ring-1 ring-pink-500/50 group-hover:ring-pink-400 transition-all shadow-[0_0_15px_rgba(236,72,153,0.4)]">
                                <ShieldCheck className="w-5 h-5 text-pink-300" />
                            </div>
                            <h3 className="font-bold text-[15px] whitespace-nowrap tracking-wide leading-tight">Secure<br />Payments</h3>
                        </div>
                        <p className="text-xs text-indigo-100/60 leading-relaxed font-medium">
                            FoodExpress ensures multiple tracking algorithms to secure your smart payment channels.
                        </p>
                    </motion.div>

                </div>
            </div>

        </div>
    );
};

export default LandingPage;
