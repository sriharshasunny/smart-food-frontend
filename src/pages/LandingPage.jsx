import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronRight, Utensils, ShieldCheck, Zap, Rocket, Star, MapPin, Truck, Smartphone, Clock, Search } from 'lucide-react';

// --- PREMIUM 3D ASSETS (Photorealistic / High-Res PNGs) ---
const ASSETS = {
    burger3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hamburger/3D/hamburger_3d.png",
    pizza3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pizza/3D/pizza_3d.png",
    taco3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Taco/3D/taco_3d.png",
    fries3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/French%20fries/3D/french_fries_3d.png",
    bowl3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Bento%20box/3D/bento_box_3d.png",
    ufo3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Flying%20saucer/3D/flying_saucer_3d.png",
    cityBg: "/citybg.png" // Deep Space / Cybercity background
};

const LandingPage = () => {
    const navigate = useNavigate();

    // --- CURSOR TRACKING (FRAMER MOTION) ---
    // Raw Mouse Values (-1 to 1)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring Smoothed Values for 3D Food Tilt
    const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
    const smoothMouseX = useSpring(mouseX, springConfig);
    const smoothMouseY = useSpring(mouseY, springConfig);

    // 3D Rotations mapped from mouse for the central "Sun"
    const rotateX = useTransform(smoothMouseY, [-1, 1], [30, -30]); // Look up/down
    const rotateY = useTransform(smoothMouseX, [-1, 1], [-30, 30]); // Look left/right

    // UFO Chaser Values
    const ufoX = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 0);
    const ufoY = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 2 : 0);
    const smoothUfoX = useSpring(ufoX, { damping: 40, stiffness: 100, mass: 1.5 }); // Heavy, "floaty" chase
    const smoothUfoY = useSpring(ufoY, { damping: 40, stiffness: 100, mass: 1.5 });

    // UFO Tilt Physics mapped from velocity
    const ufoRotX = useTransform(smoothUfoY, v => (v - (typeof window !== "undefined" ? window.innerHeight / 2 : 0)) * -0.05);
    const ufoRotZ = useTransform(smoothUfoX, v => {
        const targetX = (mouseX.get() + 1) / 2 * (typeof window !== "undefined" ? window.innerWidth : 1000);
        return (targetX - v) * 0.08;
    });

    // UFO State
    const [ufoState, setUfoState] = useState('IDLE'); // IDLE, WARPING, RESPAWNING
    const ufoScale = useSpring(1, { damping: 20, stiffness: 100 });
    const ufoWarpSpin = useSpring(0, { damping: 30, stiffness: 80 });

    // Current Displayed Food
    const [currentFood, setCurrentFood] = useState(ASSETS.burger3D);
    const foodKeys = [ASSETS.burger3D, ASSETS.pizza3D, ASSETS.taco3D, ASSETS.fries3D];

    useEffect(() => {
        let isMobile = window.innerWidth < 768;

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;

            // Normalize mouse coordinates to -1 -> 1
            mouseX.set((clientX / innerWidth) * 2 - 1);
            mouseY.set((clientY / innerHeight) * 2 - 1);

            // If UFO is IDLE, strictly update its raw tracking position
            if (ufoState === 'IDLE') {
                ufoX.set(clientX);
                ufoY.set(clientY);
            }
        };

        const handleTouchMove = (e) => {
            const touch = e.touches[0];
            handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [mouseX, mouseY, ufoX, ufoY, ufoState]);

    // Handle UFO WARP State Machine
    useEffect(() => {
        if (ufoState === 'WARPING') {
            // Target the center of the screen ("The Sun")
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            ufoX.set(centerX);
            ufoY.set(centerY);
            ufoScale.set(0); // Shrink to zero like entering a black hole
            ufoWarpSpin.set(1080); // Massive spiral rotation

            const respawnTimer = setTimeout(() => {
                setUfoState('RESPAWNING');
            }, 1200); // Wait for the dive to finish

            return () => clearTimeout(respawnTimer);
        }

        if (ufoState === 'RESPAWNING') {
            // Instantly move UFO way off screen
            ufoX.jump(-500);
            ufoY.jump(-500);
            ufoWarpSpin.jump(0);

            const idleTimer = setTimeout(() => {
                setUfoState('IDLE');
                ufoScale.set(1); // Resume normal size over time
            }, 100);

            return () => clearTimeout(idleTimer);
        }
    }, [ufoState, ufoX, ufoY, ufoScale, ufoWarpSpin]);

    const handleFoodClick = () => {
        if (ufoState === 'IDLE') {
            // Trigger Warp effect
            setUfoState('WARPING');

            // Cycle the Food Item
            const currentIndex = foodKeys.indexOf(currentFood);
            const nextIndex = (currentIndex + 1) % foodKeys.length;
            setCurrentFood(foodKeys[nextIndex]);
        }
    };

    return (
        <div className="relative min-h-screen bg-black overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">

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
            </div>

            {/* NAVBAR */}
            <nav className="fixed w-full z-50 top-0 px-6 py-4 flex justify-between items-center bg-black/5 backdrop-blur-sm border-b border-white/5 pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto cursor-pointer" onClick={() => navigate('/home')}>
                    <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                        <Rocket className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-md">FoodExpress</span>
                </div>
                <div className="hidden md:flex items-center gap-6 pointer-events-auto">
                    <button onClick={() => navigate('/login')} className="text-gray-300 font-medium hover:text-white transition-colors">Sign In</button>
                    <button onClick={() => navigate('/Signup')} className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-white/10">Get Started</button>
                </div>
            </nav>

            <div className="relative z-10 max-w-[1400px] mx-auto px-6 pt-32 h-screen flex flex-col md:flex-row items-center pointer-events-none">

                {/* LEFT HERO TEXT */}
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-30 pointer-events-none order-2 md:order-1 mt-10 md:mt-0">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="pointer-events-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-xl">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-semibold tracking-wide text-gray-200">The Universe's Best Cravings</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-extrabold leading-[1.1] mb-6 tracking-tight text-white drop-shadow-2xl">
                            Taste The <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Future.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-lg font-medium leading-relaxed">
                            AI-powered, ultra-fast delivery. Experience zero-gravity transit that brings your food piping hot across the galaxy.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-center md:items-start w-full md:w-auto">
                            <button
                                onClick={() => navigate('/home')}
                                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 group"
                            >
                                Order Now
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => navigate('/home')}
                                className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 hover:scale-105 active:scale-95 transition-all backdrop-blur-md flex items-center justify-center gap-2"
                            >
                                <Search className="w-5 h-5" /> Explore Options
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* RIGHT DOM-BASED 3D HERO FOOD (The "Sun") */}
                <div className="w-full md:w-1/2 flex items-center justify-center relative min-h-[40vh] md:min-h-0 order-1 md:order-2 mt-20 md:mt-0 pointer-events-auto" style={{ perspective: "1500px" }}>

                    {/* The "Sun" Aura behind the food */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-yellow-500/20 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />

                    {/* Orbiting Planets (Pizza, Fries, Bowl) continuously spinning around the Sun */}
                    <div className="absolute w-full h-full pointer-events-none" style={{ perspective: '1000px' }}>
                        {/* Pizza Orbit */}
                        <motion.div className="absolute top-1/2 left-1/2 w-2 h-2 z-20" animate={{ rotateZ: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                            <div className="absolute -left-[160px] md:-left-[240px] -top-[50px]">
                                <motion.img src={ASSETS.pizza3D} className="w-20 md:w-28 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter contrast-[1.1]" animate={{ rotateZ: -360, rotateY: 360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} />
                            </div>
                        </motion.div>

                        {/* Fries Orbit */}
                        <motion.div className="absolute top-1/2 left-1/2 w-2 h-2 z-20" animate={{ rotateZ: -360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}>
                            <div className="absolute left-[160px] md:left-[220px] top-[60px]">
                                <motion.img src={ASSETS.fries3D} className="w-16 md:w-24 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter contrast-[1.1]" animate={{ rotateZ: 360, rotateX: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
                            </div>
                        </motion.div>

                        {/* Bowl Orbit */}
                        <motion.div className="absolute top-1/2 left-1/2 w-2 h-2 z-20" animate={{ rotateZ: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
                            <div className="absolute -left-[60px] top-[180px] md:top-[260px]">
                                <motion.img src={ASSETS.bowl3D} className="w-24 md:w-32 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter contrast-[1.1]" animate={{ rotateZ: -360, rotateY: -360 }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }} />
                            </div>
                        </motion.div>
                    </div>

                    {/* Central Interactive Food Model */}
                    <motion.div
                        style={{ rotateX, rotateY }}
                        className="relative z-30 cursor-pointer group"
                        onClick={handleFoodClick}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentFood}
                                initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                exit={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                src={currentFood}
                                alt="3D Food"
                                className="w-[280px] h-[280px] md:w-[450px] md:h-[450px] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)] filter contrast-[1.1] saturate-[1.2]"
                                draggable="false"
                            />
                        </AnimatePresence>

                        {/* Click Hint */}
                        <motion.div
                            className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-1.5 rounded-full text-white text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            Click to Warp
                        </motion.div>
                    </motion.div>

                </div>
            </div>

            {/* DOM-BASED CHASER UFO */}
            {/* 
                This lives at the absolute root and follows the cursor via Framer Motion useSpring.
                It replaces the old canvas UFO entirely, bringing perfect quality and smooth physics.
            */}
            <motion.div
                className="fixed top-0 left-0 w-[120px] md:w-[180px] h-auto pointer-events-none z-[100]"
                style={{
                    x: smoothUfoX,
                    y: smoothUfoY,
                    rotateX: ufoRotX,
                    rotateZ: ufoState === 'WARPING' ? ufoWarpSpin : ufoRotZ,
                    scale: ufoScale,
                    // Offset by half width/height so mouse is completely centered on the UFO
                    translateX: "-50%",
                    translateY: "-50%"
                }}
            >
                {/* Engine Glow */}
                <div className="absolute inset-x-[20%] bottom-[10%] h-[30%] bg-fuchsia-500/60 rounded-full blur-[15px] animate-pulse mix-blend-screen" />

                <img
                    src={ASSETS.ufo3D}
                    alt="Chaser UFO"
                    className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                />

                {/* Fun Tooltip connected to the UFO */}
                <AnimatePresence>
                    {ufoState === 'IDLE' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: 2 }}
                            className="absolute -right-20 top-0 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap"
                        >
                            Warp Speed! 🚀
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* BOTTOM FEATURE BAR (Quick Info) */}
            <div className="absolute bottom-0 w-full z-20 bg-gradient-to-t from-black via-black/80 to-transparent pt-20 pb-6 px-6 md:px-12 pointer-events-none">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-6 opacity-60">
                    <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-indigo-400" /><span className="text-sm font-semibold tracking-wide">Instant Routing</span></div>
                    <div className="hidden sm:flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-purple-400" /><span className="text-sm font-semibold tracking-wide">100% Quality Guaranteed</span></div>
                    <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-pink-400" /><span className="text-sm font-semibold tracking-wide">Universal Tracking</span></div>
                </div>
            </div>

        </div>
    );
};

export default LandingPage;
