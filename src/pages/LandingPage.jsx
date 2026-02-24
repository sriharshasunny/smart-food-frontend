import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronRight, Utensils, ShieldCheck, Zap, Rocket, Star, MapPin, Truck, Smartphone } from 'lucide-react';

// --- PREMIUM 3D ASSETS (Photorealistic / High-Res PNGs) ---
const ASSETS = {
    burger3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Hamburger/3D/hamburger_3d.png",
    pizza3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pizza/3D/pizza_3d.png",
    taco3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Taco/3D/taco_3d.png",
    fries3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/French%20fries/3D/french_fries_3d.png",
    ufo3D: "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Flying%20saucer/3D/flying_saucer_3d.png"
};

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const scrollRef = useRef(null);

    // --- CURSOR TRACKING (FRAMER MOTION) ---
    // Raw Mouse Values (-1 to 1)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring Smoothed Values for 3D Food Tilt
    const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
    const smoothMouseX = useSpring(mouseX, springConfig);
    const smoothMouseY = useSpring(mouseY, springConfig);

    // 3D Rotations mapped from mouse
    const rotateX = useTransform(smoothMouseY, [-1, 1], [30, -30]); // Look up/down
    const rotateY = useTransform(smoothMouseX, [-1, 1], [-30, 30]); // Look left/right

    // UFO Chaser Values
    const ufoX = useMotionValue(typeof window !== "undefined" ? window.innerWidth / 2 : 0);
    const ufoY = useMotionValue(typeof window !== "undefined" ? window.innerHeight / 2 : 0);
    const smoothUfoX = useSpring(ufoX, { damping: 40, stiffness: 100, mass: 1.5 }); // Heavy, "floaty" chase
    const smoothUfoY = useSpring(ufoY, { damping: 40, stiffness: 100, mass: 1.5 });

    // UFO Tilt Physics mapped from velocity (difference between smooth and raw target)
    // To fake velocity tilt: if mouse is far right of UFO, UFO tilts right to 'accelerate'
    const ufoRotX = useTransform(smoothUfoY, v => (v - (typeof window !== "undefined" ? window.innerHeight / 2 : 0)) * -0.05);
    const ufoRotZ = useTransform(smoothUfoX, v => {
        // Find distance from true mouse
        // We cheat by using raw mouseX to guess velocity direction
        const targetX = (mouseX.get() + 1) / 2 * (typeof window !== "undefined" ? window.innerWidth : 1000);
        return (targetX - v) * 0.08;
    });


    // Current Displayed Food
    const [currentFood, setCurrentFood] = useState(ASSETS.burger3D);
    const foodKeys = [ASSETS.burger3D, ASSETS.pizza3D, ASSETS.taco3D, ASSETS.fries3D];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFood(prev => {
                const currentIndex = foodKeys.indexOf(prev);
                return foodKeys[(currentIndex + 1) % foodKeys.length];
            });
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Global Mouse Tracker Handler
    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        // Normalize to -1 to 1
        mouseX.set((clientX / innerWidth) * 2 - 1);
        mouseY.set((clientY / innerHeight) * 2 - 1);

        // Update UFO Target slightly offset from cursor
        ufoX.set(clientX + 40);
        ufoY.set(clientY - 40);
    };

    // --- ULTRA-FAST LITE CANVAS ENGINE (ONLY Stars & Dust) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Safety: Ensure Context
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let animationFrameId;

        // Assets
        let width = window.innerWidth;
        let height = window.innerHeight;
        let isMobile = width < 768;

        // State Targets
        let centerX = width * 0.75;
        let centerY = height * 0.5;
        let scale = Math.min(width, height) * 0.0013;

        // Removed UFO state from Canvas -> Handled perfectly by DOM React Physics

        const resize = () => {
            if (!canvas) return;
            width = window.innerWidth;
            height = window.innerHeight;

            // OPTIMIZATION: Max Speed on Mobile (Cap DPR at 1.0)
            const mobileView = width < 768;
            const dpr = mobileView ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            // Force CSS dimensions
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';

            ctx.scale(dpr, dpr);

            if (width >= 768) {
                isMobile = false;
            } else {
                isMobile = true;
            }
        };


        // Mobile Optimization: Significantly reduce counts
        const starCount = isMobile ? 15 : 40;
        const stars = Array.from({ length: starCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            z: Math.random() * 2 + 0.5, // Deeper Z range
            size: Math.random() * 1.5 + 0.5,
            baseOpacity: Math.random() * 0.6 + 0.4,
            phase: Math.random() * Math.PI * 2,
            speed: 50 + Math.random() * 80 // MUCHO FASTER
        }));

        // Entities: Shooting Stars
        let shootingStars = [];
        const spawnShootingStar = () => {
            if (isMobile && Math.random() > 0.3) return; // Less frequent on mobile
            shootingStars.push({
                x: Math.random() * width,
                y: -50,
                length: Math.random() * 80 + 40,
                speed: Math.random() * 20 + 20,
                angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1), // Angled down-right
                opacity: 1,
                life: 1
            });
        };

        // Entities: Space Dust
        const dustCount = isMobile ? 15 : 40;
        const dust = Array.from({ length: dustCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.3 + 0.1
        }));

        // All Canvas Food Removed.

        // Timing
        let lastTime = 0;
        let coreTimer = 0;

        const loop = (timestamp) => {
            if (!lastTime) lastTime = timestamp;
            const dt = Math.max(0.01, Math.min((timestamp - lastTime) / 1000, 0.1));
            lastTime = timestamp;
            coreTimer += dt;

            // Update Shooting Stars
            if (Math.random() < (isMobile ? 0.005 : 0.01)) spawnShootingStar();
            shootingStars.forEach((star, index) => {
                star.x += Math.cos(star.angle) * star.speed * dt * 50;
                star.y += Math.sin(star.angle) * star.speed * dt * 50;
                star.life -= dt * 0.8;
                if (star.life <= 0 || star.y > height + 100 || star.x > width + 100) {
                    shootingStars.splice(index, 1);
                }
            });

            // Update Dust
            dust.forEach(d => {
                d.x += d.vx * dt * 50;
                d.y += d.vy * dt * 50;
                if (d.x < 0) d.x = width; if (d.x > width) d.x = 0;
                if (d.y < 0) d.y = height; if (d.y > height) d.y = 0;
            });

            // RENDER LITE ENGINE
            ctx.fillStyle = '#020205'; ctx.fillRect(0, 0, width, height);

            // Draw Stars
            stars.forEach(star => {
                ctx.fillStyle = `rgba(255, 255, 255, ${(Math.sin(star.phase + coreTimer) + 1) * 0.5 * star.baseOpacity})`;
                ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill();
            });

            // Draw Parallax Dust
            dust.forEach(d => {
                ctx.fillStyle = `rgba(200, 200, 255, ${d.opacity})`;
                ctx.beginPath(); ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2); ctx.fill();
            });

            animationFrameId = requestAnimationFrame(loop);
        };
        // Resize & Start
        let resizeTimeout;
        const debouncedResize = () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(resize, 100); };
        window.addEventListener('resize', debouncedResize);

        // Init
        resize();
        requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', debouncedResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

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
        <div onMouseMove={handleMouseMove} ref={scrollRef} className="min-h-screen text-white font-sans overflow-x-hidden relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-[#050510] to-black selection:bg-orange-500 selection:text-white" style={{ perspective: '1200px' }}>

            {/* CANVASES */}
            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            {/* --- DOM BASED 3D UFO CHASER --- */}
            <motion.div
                className="fixed top-0 left-0 w-32 h-32 z-50 pointer-events-none drop-shadow-[0_20px_40px_rgba(0,255,100,0.5)] flex items-center justify-center"
                style={{
                    x: smoothUfoX,
                    y: smoothUfoY,
                    translateX: '-50%',
                    translateY: '-50%',
                    rotateX: ufoRotX,
                    rotateZ: ufoRotZ,
                }}
            >
                <img src={ASSETS.ufo3D} alt="UFO" className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(0,255,200,0.4)]" />
                <motion.div
                    animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute bottom-[-10px] w-12 h-12 bg-green-400 rounded-full blur-[20px] mix-blend-screen"
                />
            </motion.div>

            {/* NAVBAR */}
            <nav className="fixed w-full z-50 top-6 px-4 pointer-events-none">
                <div className="max-w-fit mx-auto pointer-events-auto">
                    <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-8 py-3 flex items-center gap-8 shadow-2xl">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
                            <Rocket className="w-5 h-5 text-orange-500" />
                            <span className="font-black text-lg tracking-tight">FoodVerse</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/login')} className="px-5 py-2 text-xs font-bold hover:text-white text-gray-300 transition-colors">
                                Login
                            </button>
                            <button onClick={() => navigate('/signup')} className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-rose-600 text-white text-xs font-black rounded-full hover:scale-105 transition-transform shadow-lg">
                                SIGN UP
                            </button>
                        </div>
                    </motion.div>
                </div>
            </nav >

            {/* Hero Section */}
            <main className="relative z-10 w-full px-6 flex flex-col md:flex-row items-center justify-center min-h-[90vh] md:min-h-screen max-w-7xl mx-auto pt-20 md:pt-0">

                <div className="w-full md:w-1/2 flex flex-col items-start space-y-8 pr-0 md:pr-12 text-left relative z-10 pointer-events-none mb-12 md:mb-0 order-2 md:order-1 mt-10 md:mt-0">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="w-full">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md mb-6 relative overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.05)] pointer-events-auto">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <Rocket className="w-4 h-4 text-orange-400" />
                            <span className="text-xs font-bold tracking-widest text-orange-400 uppercase">Foodverse Protocol v3.0</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight drop-shadow-2xl font-sans">
                            Taste the <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-500 to-purple-500 relative inline-block">
                                Future
                                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-purple-500 opacity-20 blur-2xl -z-10 rounded-full" />
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-lg font-medium leading-relaxed drop-shadow-md">
                            Experience highly immersive, hyper-speed delivery directly to your coordinates. We are redefining intergalactic dining.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 pointer-events-auto">
                            <button onClick={() => navigate('/home')} className="px-8 py-4.5 bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 rounded-2xl text-white font-black hover:scale-105 active:scale-95 transition-all text-lg shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] flex items-center justify-center gap-3 overflow-hidden group relative">
                                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative z-10 flex items-center gap-2">Explore Menu <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* --- DOM BASED 3D HERO FOOD --- */}
                <div className="w-full md:w-1/2 flex items-center justify-center relative min-h-[40vh] md:min-h-0 order-1 md:order-2 mt-20 md:mt-0 pointer-events-none" style={{ perspective: "1500px" }}>
                    <motion.div
                        style={{ rotateX, rotateY }}
                        className="relative z-20"
                    >
                        {/* Huge glow behind the food */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-purple-600 rounded-full blur-[100px] opacity-40 mix-blend-screen scale-150 animate-pulse" />

                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentFood}
                                initial={{ opacity: 0, scale: 0.5, rotateZ: -20 }}
                                animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
                                exit={{ opacity: 0, scale: 1.5, rotateZ: 20 }}
                                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                                src={currentFood}
                                alt="3D Food"
                                className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.8)]"
                            />
                        </AnimatePresence>

                        {/* Orbiting Elements (DOM Parallax) */}
                        <motion.div animate={{ rotateZ: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 pointer-events-none border border-white/5 rounded-full scale-125 md:scale-[1.8] border-dashed border-spacing-4" />
                        <motion.div animate={{ rotateZ: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute inset-0 pointer-events-none border border-orange-500/10 rounded-full scale-150 md:scale-[2.4]" />
                    </motion.div>
                </div>

            </main>

            {/* SCROLLING INFO */}
            <div id="about" className="relative w-full bg-black/60 pt-20 pb-32 border-t border-white/5 pointer-events-auto">
                <section className="px-6 max-w-7xl mx-auto space-y-32">
                    {/* FEATURES GRID */}
                    <div>
                        <ScrollReveal>
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Galactic Capabilities</h2>
                                <p className="text-gray-400 max-w-2xl mx-auto">Engineered for the modern space traveler.</p>
                            </div>
                        </ScrollReveal>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { title: "Hyper-Local", desc: "Precision landing at your pod.", icon: <MapPin className="w-8 h-8 text-rose-500" /> },
                                { title: "Warp Speed", desc: "Hot food, defying physics.", icon: <Zap className="w-8 h-8 text-yellow-400" /> },
                                { title: "Live Telemetry", desc: "Real-time pilot tracking.", icon: <Truck className="w-8 h-8 text-blue-400" /> },
                                { title: "Quantum Pay", desc: "Encrypted & instant.", icon: <ShieldCheck className="w-8 h-8 text-green-400" /> },
                                { title: "Cosmic Menu", desc: "Dishes from 500+ sectors.", icon: <Utensils className="w-8 h-8 text-purple-400" /> },
                                { title: "Command Center", desc: "Full control via app.", icon: <Smartphone className="w-8 h-8 text-orange-400" /> }
                            ].map((item, i) => (
                                <ScrollReveal key={i} delay={i * 0.05}>
                                    <div className="group p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-2xl border border-white/10 hover:border-orange-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(249,115,22,0.15)] text-center h-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative z-10">
                                            <div className="mb-6 inline-flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 p-4 bg-white/5 rounded-2xl shadow-lg ring-1 ring-white/20 group-hover:ring-orange-500/50">{item.icon}</div>
                                            <h3 className="text-xl font-bold mb-3 text-white/95 tracking-wide">{item.title}</h3>
                                            <p className="text-gray-400 text-sm font-medium leading-relaxed group-hover:text-gray-300 transition-colors">{item.desc}</p>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>

                    {/* STATS */}
                    <ScrollReveal>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/5 bg-white/[0.02] rounded-[3rem] px-8">
                            {[
                                { label: "Active Pilots", val: "12,000+" },
                                { label: "Sectors Served", val: "540" },
                                { label: "Avg Delivery", val: "12 min" },
                                { label: "Happy Aliens", val: "2.5 M+" }
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.val}</div>
                                    <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>

                    {/* WHY US */}
                    <div className="grid md:grid-cols-2 gap-16 items-center mt-20">
                        <ScrollReveal>
                            <div className="space-y-6">
                                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">Our Mission</div>
                                <h2 className="text-4xl md:text-5xl font-black leading-tight">Food that travels<br />across dimensions.</h2>
                                <p className="text-gray-400 text-lg leading-relaxed">
                                    We don't just deliver food; we bridge culinary worlds. From the spicy nebulas of Sector 7 to the comfort synthesisers of Earth, we bring it all to your doorstep.
                                </p>
                                <ul className="space-y-4 pt-4">
                                    {[
                                        "Freshness locked in stasis fields",
                                        "Zero-G prepared delicacies",
                                        "Drone pilots with elite certification"
                                    ].map((pt, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-300 font-medium">
                                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center"><Star className="w-3 h-3 text-green-400" /></div>
                                            {pt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal delay={0.2}>
                            <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-gradient-to-br from-orange-500/10 to-purple-600/10 flex items-center justify-center group">
                                <div className="absolute inset-0 bg-black/40" />
                                <div className="relative text-center p-8 bg-black/30 backdrop-blur-xl rounded-3xl border border-white/10 max-w-xs transform group-hover:-translate-y-2 transition-transform">
                                    <Clock className="w-10 h-10 text-orange-400 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold mb-2">24/7 Service</h3>
                                    <p className="text-sm text-gray-300">Our drones never sleep. Late night cravings or early morning fuel, we are online.</p>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LandingPage;
