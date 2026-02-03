import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Utensils, ShieldCheck, Zap, Rocket, ArrowDown, Star, Smartphone, MapPin, Truck } from 'lucide-react';

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
        const CORE_EMOJIS = ['🍕', '🍔', '🍩']; // Rotating Core Items

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
                // Desktop: Center the solar system on the right half
                centerX = width * 0.70;
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.0012;
            } else {
                // Mobile: Center it
                centerX = width * 0.5;
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.0009;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        // Init Particles/Planets
        const planets = Array.from({ length: 22 }, (_, i) => ({
            emoji: FOOD_EMOJIS[i % FOOD_EMOJIS.length],
            angle: (i / 22) * Math.PI * 2, // Even spacing
            distance: 150 + (i % 4) * 60 + Math.random() * 30, // Distinct layers
            speed: 0.002 + Math.random() * 0.003, // varied speed
            size: 40 + Math.random() * 30,
            heightOffset: (Math.random() - 0.5) * 180, // Vertical spread
            rotationAxis: Math.random() * Math.PI,
            rotationSpeed: (Math.random() - 0.5) * 0.05
        }));

        // Stars
        const stars = Array.from({ length: isMobile ? 60 : 250 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            opacity: Math.random(),
            speed: 0.2 + Math.random() * 1.5 // Warp speed vertical
        }));

        let time = 0;
        let coreIndex = 0;
        let coreTimer = 0;

        const render = () => {
            time++;
            coreTimer++;
            if (coreTimer > 200) { // Switch core item periodically
                coreIndex = (coreIndex + 1) % CORE_EMOJIS.length;
                coreTimer = 0;
            }

            // 1. Clear & Deep Space Background
            const bg = ctx.createLinearGradient(0, 0, 0, height);
            bg.addColorStop(0, '#000000');
            bg.addColorStop(0.4, '#050510');
            bg.addColorStop(1, '#0a0a20');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);

            // 2. Stars (Warp Effect)
            ctx.fillStyle = "white";
            stars.forEach(star => {
                star.y += star.speed;
                if (star.y > height) {
                    star.y = 0;
                    star.x = Math.random() * width;
                }

                // Twinkle / Trailing effect
                ctx.globalAlpha = star.opacity * (0.5 + Math.sin(time * 0.1) * 0.3);
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // 3. Prepare Items (Z-Sort)
            const items = [];

            // Core Rotating Food Sun
            // CRITICAL FIX: Added x: centerX
            items.push({
                type: 'sun',
                z: 0,
                x: centerX, // Ensure it's centered!
                y: centerY,
                scale: 1,
                emoji: CORE_EMOJIS[coreIndex]
            });

            // Orbiting Food
            planets.forEach(p => {
                p.angle += p.speed;
                const radiusX = p.distance * scale * 2.8;
                const radiusY = p.distance * scale * 0.8; // Tilt

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
                    rotationAngle: time * p.rotationSpeed + p.rotationAxis,
                    opacity: 0.15 + (depthScale * 0.85) // Fade far items
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
                    const sunSize = 120 * scale * 2.5;
                    const glow = ctx.createRadialGradient(0, 0, sunSize * 0.2, 0, 0, sunSize * 2.5);
                    glow.addColorStop(0, 'rgba(255, 100, 0, 0.7)');
                    glow.addColorStop(1, 'transparent');
                    ctx.fillStyle = glow;
                    ctx.beginPath(); ctx.arc(0, 0, sunSize * 2.5, 0, Math.PI * 2); ctx.fill();

                    // Rotating Core Food
                    const pulse = 1 + Math.sin(time * 0.05) * 0.03;
                    ctx.scale(pulse, pulse);
                    ctx.rotate(time * 0.005);
                    ctx.font = `${sunSize}px "Segoe UI Emoji", "Apple Color Emoji", Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    // Core Shadow
                    ctx.shadowColor = 'rgba(255, 80, 0, 0.8)';
                    ctx.shadowBlur = 50;

                    ctx.fillText(item.emoji, 0, 0);

                } else {
                    const fontSize = item.size * item.scale;
                    ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.globalAlpha = item.opacity;

                    // Self Rotation
                    ctx.rotate(item.rotationAngle);

                    // Depth Blur Simulation
                    if (item.scale > 1.1) {
                        // Near items
                        ctx.shadowColor = 'rgba(0,0,0,0.6)';
                        ctx.shadowBlur = 20;
                    } else if (item.scale < 0.8) {
                        // Far items
                        ctx.globalAlpha *= 0.5;
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
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.0, delay, ease: [0.22, 1, 0.36, 1] }} // Custom easing
        >
            {children}
        </motion.div>
    );

    return (
        <div ref={scrollRef} className="min-h-screen text-white font-sans overflow-x-hidden relative bg-black selection:bg-orange-500 selection:text-white">

            {/* BACKGROUND CANVAS - Fixed */}
            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            {/* NAVBAR - Floating Glass Pill */}
            <nav className="fixed w-full z-50 top-6 px-4 pointer-events-none">
                <div className="max-w-2xl mx-auto pointer-events-auto">
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-3 flex items-center justify-between shadow-2xl shadow-black/80">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <Rocket className="w-5 h-5 text-orange-500" />
                            <span className="text-xl font-black tracking-tighter text-white">
                                FoodVerse
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/login')} className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
                                Login
                            </button>
                            <button onClick={() => navigate('/signup')} className="px-6 py-2.5 bg-white text-black text-xs font-black rounded-full hover:bg-gray-200 transition-all hover:scale-105 shadow-lg tracking-wider">
                                GET APP
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* HERO CONTENT */}
            <main className="relative z-10 flex flex-col w-full">

                {/* HERO SECTION */}
                <section className="min-h-screen flex flex-col justify-center pt-20 pb-12 px-6 max-w-7xl mx-auto w-full pointer-events-none">
                    <div className="grid md:grid-cols-2 gap-12 items-center pointer-events-auto">

                        {/* LEFT TEXT */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8 mt-12 md:mt-0 order-1">
                            <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.2, ease: "easeOut" }}>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
                                    <Star className="w-3 h-3 fill-orange-400" /> Voted #1 in Andromeda
                                </div>
                                <h1 className="text-6xl sm:text-7xl md:text-9xl font-black leading-[0.9] tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-600 drop-shadow-2xl">
                                    Taste<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600">
                                        Future.
                                    </span>
                                </h1>
                                <p className="text-lg md:text-2xl text-gray-400 max-w-lg mx-auto md:mx-0 leading-relaxed mb-10 font-medium">
                                    Defy gravity. Hyper-speed drone delivery from the galaxy's finest kitchens.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto justify-center md:justify-start">
                                    <button onClick={() => navigate('/login')} className="px-8 py-4 bg-gradient-to-br from-orange-500 to-red-600 text-white font-black rounded-2xl hover:shadow-2xl hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest transform hover:-translate-y-1">
                                        Launch Order <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <button onClick={scrollToContent} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl backdrop-blur-md transition-colors flex items-center justify-center gap-3 text-sm uppercase tracking-widest">
                                        Explore <ArrowDown className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT (Canvas area) */}
                        <div className="h-[40vh] md:h-auto w-full order-2 pointer-events-none" />
                    </div>
                </section>

                {/* --- SCROLLING CONTENT SECTION --- */}
                <div id="about" className="relative w-full bg-gradient-to-b from-transparent via-[#050510] to-black backdrop-blur-sm pt-32 pb-40">

                    {/* FEATURES */}
                    <section className="px-6 max-w-7xl mx-auto">
                        <ScrollReveal>
                            <div className="text-center mb-24">
                                <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Galactic Standard</h2>
                                <p className="text-gray-500 max-w-2xl mx-auto text-xl font-medium">Propulsion. Precision. Pizza.</p>
                            </div>
                        </ScrollReveal>

                        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                            {[
                                { title: "Hyper-Local", desc: "Pinpoint landing at your pod.", icon: <MapPin className="w-8 h-8 text-rose-500" /> },
                                { title: "Warp Speed", desc: "Hot food, faster than light.", icon: <Zap className="w-8 h-8 text-yellow-400" /> },
                                { title: "Live Tracking", desc: "Watch your pilot's telemetry.", icon: <Truck className="w-8 h-8 text-blue-400" /> },
                                { title: "Quantum Secure", desc: "Encrypted transactions.", icon: <ShieldCheck className="w-8 h-8 text-green-400" /> },
                                { title: "Cosmic Menu", desc: "Dishes from 500+ sectors.", icon: <Utensils className="w-8 h-8 text-purple-400" /> },
                                { title: "Command Deck", desc: "Full control via handheld.", icon: <Smartphone className="w-8 h-8 text-orange-400" /> }
                            ].map((item, i) => (
                                <ScrollReveal key={i} delay={i * 0.1}>
                                    <div className="group h-full p-8 md:p-10 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-orange-500/20 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:bg-white/[0.08]">
                                        <div className="mb-6 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-2xl font-black mb-3 text-gray-100">{item.title}</h3>
                                        <p className="text-gray-500 leading-relaxed font-medium">{item.desc}</p>
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

export default LandingPage;
