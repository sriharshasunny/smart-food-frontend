import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Utensils, ShieldCheck, Zap, Rocket, ArrowDown, Star, Smartphone, MapPin, Truck, Play } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const scrollRef = useRef(null);

    // --- PREMIUM 3D EMOJI ENGINE ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;

        // Assets
        const FOOD_EMOJIS = ['🍔', '🍕', '🍩', '🌮', '🍱', '🍜', '🍤', '🥓', '🥨', '🍟', '🍖', '🌶️', '🥑', '🥥'];
        const CORE_EMOJIS = ['🍕', '🍔', '🍩', '🍣']; // Rotating Core Items

        // Physics State
        let width, height, centerX, centerY;
        let scale = 1;
        let isMobile = false;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            isMobile = width < 768;

            if (!isMobile) {
                centerX = width * 0.75;
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.0013;
            } else {
                centerX = width * 0.5;
                centerY = height * 0.5; // Centered orbit on mobile behind text
                scale = Math.min(width, height) * 0.001;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        // Init Particles/Planets
        const planets = Array.from({ length: 24 }, (_, i) => ({
            emoji: FOOD_EMOJIS[i % FOOD_EMOJIS.length],
            angle: (i / 24) * Math.PI * 2,
            distance: 160 + (i % 4) * 55 + Math.random() * 30,
            speed: 0.002 + Math.random() * 0.003,
            size: 40 + Math.random() * 30,
            heightOffset: (Math.random() - 0.5) * 200, // More vertical spread
            rotationAxis: Math.random() * Math.PI
        }));

        // Stars
        const stars = Array.from({ length: isMobile ? 80 : 300 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            opacity: Math.random(),
            speed: 0.2 + Math.random() * 0.8
        }));

        let time = 0;
        let coreIndex = 0;
        let coreTimer = 0;

        const render = () => {
            time++;
            coreTimer++;
            if (coreTimer > 180) { // Switch core item slower
                coreIndex = (coreIndex + 1) % CORE_EMOJIS.length;
                coreTimer = 0;
            }

            // 1. Clear & Deep Space Background
            const bg = ctx.createLinearGradient(0, 0, 0, height);
            bg.addColorStop(0, '#000000');
            bg.addColorStop(0.5, '#0a0a12');
            bg.addColorStop(1, '#1a1a2e');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);

            // 2. Moving Warp Stars
            ctx.fillStyle = "white";
            stars.forEach(star => {
                star.y += star.speed; // Downward warp feel
                if (star.y > height) {
                    star.y = 0;
                    star.x = Math.random() * width;
                }

                ctx.globalAlpha = star.opacity * (0.6 + Math.sin(time * 0.05) * 0.4);
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // 3. Prepare Items (Z-Sort)
            const items = [];

            // Core Rotating Food Sun
            items.push({
                type: 'sun',
                z: 0,
                y: centerY,
                scale: 1,
                emoji: CORE_EMOJIS[coreIndex]
            });

            // Orbiting Food
            planets.forEach(p => {
                p.angle += p.speed;
                const radiusX = p.distance * scale * 2.8;
                const radiusY = p.distance * scale * 0.8;

                const x = centerX + Math.cos(p.angle) * radiusX;
                const zDepth = Math.sin(p.angle) * radiusY;
                const y = centerY + zDepth * 0.7 + p.heightOffset;

                const depthScale = 1 + (Math.sin(p.angle) * 0.45);

                items.push({
                    type: 'planet',
                    emoji: p.emoji,
                    x: x,
                    y: y,
                    z: zDepth,
                    scale: depthScale,
                    size: p.size,
                    rotationAxis: p.rotationAxis,
                    opacity: 0.1 + (depthScale * 0.9) // Strong fade for depth
                });
            });

            // Sort by Z
            items.sort((a, b) => a.z - b.z);

            // 4. Draw Items
            items.forEach(item => {
                ctx.save();
                ctx.translate(item.x, item.y);

                if (item.type === 'sun') {
                    // Core Glow
                    const sunSize = 110 * scale * 2.2;
                    const glow = ctx.createRadialGradient(0, 0, sunSize * 0.2, 0, 0, sunSize * 2.5);
                    glow.addColorStop(0, 'rgba(255, 120, 0, 0.7)');
                    glow.addColorStop(0.5, 'rgba(255, 50, 0, 0.3)');
                    glow.addColorStop(1, 'transparent');
                    ctx.fillStyle = glow;
                    ctx.beginPath(); ctx.arc(0, 0, sunSize * 3, 0, Math.PI * 2); ctx.fill();

                    // Rotating Core Food
                    const pulse = 1 + Math.sin(time * 0.04) * 0.03;
                    ctx.scale(pulse, pulse);
                    ctx.rotate(time * 0.01);
                    ctx.font = `${sunSize}px "Segoe UI Emoji", "Apple Color Emoji", Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    // Core Shadow
                    ctx.shadowColor = 'rgba(255, 80, 0, 0.9)';
                    ctx.shadowBlur = 40;

                    ctx.fillText(item.emoji, 0, 0);

                } else {
                    const fontSize = item.size * item.scale;
                    ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.globalAlpha = item.opacity;

                    // 3D Rotation
                    ctx.rotate(time * 0.02 + item.rotationAxis);

                    // Depth Blur Simulation
                    if (item.scale > 1.1) {
                        // Near items - Crisp + Shadow
                        ctx.shadowColor = 'rgba(0,0,0,0.7)';
                        ctx.shadowBlur = 20;
                    } else if (item.scale < 0.8) {
                        // Far items - Simulate blur with low opacity (canvas blur is slow)
                        ctx.globalAlpha *= 0.6;
                    }

                    ctx.fillText(item.emoji, 0, 0);
                }
                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
    }, []);

    const scrollToContent = () => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Scroll Reveal Component
    const ScrollReveal = ({ children, delay = 0 }) => (
        <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );

    return (
        <div ref={scrollRef} className="min-h-screen text-white font-sans overflow-x-hidden relative bg-black selection:bg-orange-500 selection:text-white">

            {/* BACKGROUND CANVAS - Fixed */}
            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            {/* FLOAT PILL NAVBAR - Minimal & Premium */}
            <nav className="fixed w-full z-50 top-6 px-4 pointer-events-none">
                <div className="max-w-xl mx-auto pointer-events-auto">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2.5 flex items-center justify-between shadow-2xl shadow-black/80 ring-1 ring-white/5">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5">
                            <div className="bg-gradient-to-tr from-orange-500 to-rose-600 p-1.5 rounded-full shadow-lg shadow-orange-500/20">
                                <Rocket className="w-3.5 h-3.5 text-white" fill="white" />
                            </div>
                            <span className="text-sm font-black tracking-widest text-white uppercase">
                                FoodVerse
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                            <button onClick={() => navigate('/login')} className="px-4 py-1.5 text-xs font-bold text-gray-300 hover:text-white transition-colors">
                                LOGIN
                            </button>
                            <button onClick={() => navigate('/signup')} className="px-4 py-2 bg-white text-black text-[10px] font-black rounded-full hover:bg-gray-200 transition-all hover:scale-105 shadow-lg shadow-white/10 tracking-wider">
                                GET STARTED
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* HERO CONTENT */}
            <main className="relative z-10 flex flex-col w-full">

                {/* HERO SECTION */}
                <section className="min-h-screen flex flex-col justify-center pt-24 pb-12 px-6 max-w-7xl mx-auto w-full pointer-events-none">
                    <div className="grid md:grid-cols-2 gap-12 items-center pointer-events-auto">

                        {/* LEFT TEXT */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8 mt-12 md:mt-0 order-1">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md shadow-lg shadow-orange-500/5">
                                    <Star className="w-3 h-3 fill-orange-400" /> #1 Galaxy Rated App
                                </div>
                                <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-[0.95] tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500 drop-shadow-2xl">
                                    Taste the <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 animate-gradient-x">
                                        Infinite
                                    </span>
                                </h1>
                                <p className="text-base sm:text-lg md:text-xl text-gray-400/80 max-w-lg mx-auto md:mx-0 leading-relaxed mb-10 font-medium">
                                    Advanced culinary propulsion. Hyper-local delivery.
                                    Experience the future of food, right at your pod.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto justify-center md:justify-start">
                                    <button onClick={() => navigate('/login')} className="group px-8 py-4 bg-gradient-to-r from-orange-600 to-rose-600 text-white font-black rounded-2xl hover:shadow-2xl hover:shadow-orange-600/30 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-wider">
                                        Launch Application <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button onClick={scrollToContent} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl backdrop-blur-md transition-colors flex items-center justify-center gap-3 text-sm uppercase tracking-wider">
                                        Mission Brief <ArrowDown className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT (Canvas area) */}
                        <div className="h-[40vh] md:h-auto w-full order-2 pointer-events-none" />
                    </div>
                </section>

                {/* --- SCROLLING CONTENT SECTION --- */}
                <div id="about" className="relative w-full bg-gradient-to-b from-transparent via-[#050510] to-[#000000] backdrop-blur-sm pt-32 pb-24">

                    {/* FEATURES GRID */}
                    <section className="px-6 max-w-7xl mx-auto">
                        <ScrollReveal>
                            <div className="text-center mb-24">
                                <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Galactic Features</h2>
                                <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">Engineered for the modern space traveler.</p>
                            </div>
                        </ScrollReveal>

                        <div className="grid md:grid-cols-3 gap-6 md:gap-10">
                            {[
                                { title: "Hyper-Local Ops", desc: "Precision landing at your coordinates.", icon: <MapPin className="w-6 h-6 text-rose-500" />, color: "border-rose-500/20 hover:border-rose-500/50" },
                                { title: "Warp Speed", desc: "Hot food, defying physics.", icon: <Zap className="w-6 h-6 text-yellow-400" />, color: "border-yellow-400/20 hover:border-yellow-400/50" },
                                { title: "Live Telemetry", desc: "Track pilot trajectory in real-time.", icon: <RadarComponent />, color: "border-blue-400/20 hover:border-blue-400/50" },
                                { title: "Quantum Secure", desc: "Encrypted transactions.", icon: <ShieldCheck className="w-6 h-6 text-green-400" />, color: "border-green-400/20 hover:border-green-400/50" },
                                { title: "Cosmic Menu", desc: "Dishes from 500+ star systems.", icon: <Utensils className="w-6 h-6 text-purple-400" />, color: "border-purple-400/20 hover:border-purple-400/50" },
                                { title: "Command Center", desc: "Full control via handheld.", icon: <Smartphone className="w-6 h-6 text-orange-400" />, color: "border-orange-400/20 hover:border-orange-400/50" }
                            ].map((item, i) => (
                                <ScrollReveal key={i} delay={i * 0.1}>
                                    <div className={`group p-8 md:p-10 rounded-[2.5rem] bg-white/[0.03] border ${item.color} transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:bg-white/[0.06]`}>
                                        <div className="w-16 h-16 rounded-2xl bg-black/50 flex items-center justify-center mb-8 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-2xl font-black mb-3 text-gray-100">{item.title}</h3>
                                        <p className="text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </section>

                    {/* STATS SECTION */}
                    <section className="mt-32 px-6 max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-y border-white/10 py-16 bg-white/[0.02]">
                            {[
                                { val: "10M+", label: "Happy Pilots" },
                                { val: "500+", label: "Sectors" },
                                { val: "12m", label: "Avg Arrival" },
                                { val: "4.9", label: "Star Rating" }
                            ].map((stat, i) => (
                                <ScrollReveal key={i} delay={0.2 + (i * 0.1)}>
                                    <div className="text-center">
                                        <div className="text-4xl md:text-5xl font-black text-white mb-2">{stat.val}</div>
                                        <div className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </section>
                </div>

            </main>
        </div>
    );
};

// Simple Icon Component for variety
const RadarComponent = () => (
    <div className="relative w-6 h-6">
        <div className="absolute inset-0 rounded-full border-2 border-blue-400 opacity-50 animate-ping"></div>
        <div className="absolute inset-2 bg-blue-400 rounded-full"></div>
    </div>
);

export default LandingPage;
