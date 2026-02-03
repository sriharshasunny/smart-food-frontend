import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Utensils, ShieldCheck, Zap, Rocket, ArrowDown, Star, Smartphone, MapPin, Truck } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const scrollRef = useRef(null);

    // --- "OLD" ANIMATION ENGINE (Restored) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;

        // Assets
        const FOOD_EMOJIS = ['🍔', '🍕', '🍩', '🌮', '🍱', '🍜', '🍤', '🥓', '🥨', '🍟', '🍖', '🌶️', '🥑', '🥥'];
        const CORE_EMOJIS = ['🍕', '🍔', '🍩', '🥗'];

        // Physics State
        let width, height, centerX, centerY;
        let scale = 1;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            // LAYOUT LOGIC:
            if (width >= 768) {
                // LAPTOP: Text Left, Animation Right
                // Center the solar system in the RIGHT HALF of the screen
                centerX = width * 0.75;
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.0013;
            } else {
                // MOBILE: Centered
                centerX = width * 0.5;
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.001;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        // 3D Particles
        const planets = Array.from({ length: 24 }, (_, i) => ({
            emoji: FOOD_EMOJIS[i % FOOD_EMOJIS.length],
            angle: (i / 24) * Math.PI * 2,
            distance: 140 + (i % 4) * 60 + Math.random() * 40,
            speed: 0.003 + Math.random() * 0.003,
            size: 40 + Math.random() * 30,
            heightOffset: (Math.random() - 0.5) * 160,
            rotation: Math.random() * Math.PI
        }));

        // Stars
        const stars = Array.from({ length: 200 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            opacity: Math.random(),
            speed: 0.5 + Math.random() * 1.5
        }));

        let time = 0;
        let coreIndex = 0;
        let coreTimer = 0;

        const render = () => {
            time++;
            coreTimer++;
            // Switch core item every ~2 seconds
            if (coreTimer > 120) {
                coreIndex = (coreIndex + 1) % CORE_EMOJIS.length;
                coreTimer = 0;
            }

            // 1. Background
            const bg = ctx.createLinearGradient(0, 0, 0, height);
            bg.addColorStop(0, '#020205');
            bg.addColorStop(1, '#0f0f1d');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);

            // 2. Stars
            ctx.fillStyle = "white";
            stars.forEach(star => {
                star.y += star.speed;
                if (star.y > height) {
                    star.y = 0;
                    star.x = Math.random() * width;
                }
                ctx.globalAlpha = star.opacity * (0.6 + Math.sin(time * 0.1) * 0.4);
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // 3. Prepare Items (Z-Sort)
            const items = [];

            // CENTER SUN (Pizza/Burger)
            items.push({
                type: 'sun',
                z: 0,
                x: centerX,
                y: centerY,
                scale: 1,
                emoji: CORE_EMOJIS[coreIndex]
            });

            // PLANETS
            planets.forEach(p => {
                p.angle += p.speed;
                const radiusX = p.distance * scale * 2.8;
                const radiusY = p.distance * scale * 0.8;

                const x = centerX + Math.cos(p.angle) * radiusX;
                const zDepth = Math.sin(p.angle) * radiusY;
                const y = centerY + zDepth * 0.6 + p.heightOffset;

                const depthScale = 1 + (Math.sin(p.angle) * 0.45);

                items.push({
                    type: 'planet',
                    emoji: p.emoji,
                    x: x,
                    y: y,
                    z: zDepth,
                    scale: depthScale,
                    size: p.size,
                    rotation: time * 0.02 + p.rotation,
                    opacity: 0.2 + (depthScale * 0.8)
                });
            });

            items.sort((a, b) => a.z - b.z);

            // 4. Draw
            items.forEach(item => {
                ctx.save();
                ctx.translate(item.x, item.y);

                if (item.type === 'sun') {
                    // Core Glow
                    const sunSize = 130 * scale * 2.5;
                    const glow = ctx.createRadialGradient(0, 0, sunSize * 0.2, 0, 0, sunSize * 2.5);
                    glow.addColorStop(0, 'rgba(255, 120, 0, 0.7)');
                    glow.addColorStop(1, 'transparent');
                    ctx.fillStyle = glow;
                    ctx.beginPath(); ctx.arc(0, 0, sunSize * 3, 0, Math.PI * 2); ctx.fill();

                    const pulse = 1 + Math.sin(time * 0.08) * 0.05;
                    ctx.scale(pulse, pulse);
                    ctx.rotate(time * 0.01);
                    ctx.font = `${sunSize}px "Segoe UI Emoji", "Apple Color Emoji", Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    ctx.shadowColor = 'rgba(255, 100, 0, 0.8)';
                    ctx.shadowBlur = 40;
                    ctx.fillText(item.emoji, 0, 0);

                } else {
                    const fontSize = item.size * item.scale;
                    ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.globalAlpha = item.opacity;
                    ctx.rotate(item.rotation);

                    if (item.scale > 1.2) {
                        ctx.shadowColor = 'rgba(0,0,0,0.6)';
                        ctx.shadowBlur = 15;
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

    // Scroll Reveal
    const ScrollReveal = ({ children, delay = 0 }) => (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay, ease: "backOut" }}
        >
            {children}
        </motion.div>
    );

    return (
        <div ref={scrollRef} className="min-h-screen text-white font-sans overflow-x-hidden relative bg-black selection:bg-orange-500 selection:text-white">

            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            {/* FLOATING HEADER */}
            <nav className="fixed w-full z-50 top-6 px-4 pointer-events-none">
                <div className="max-w-fit mx-auto pointer-events-auto">
                    <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-full px-8 py-3 flex items-center gap-8 shadow-2xl">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
                            <Rocket className="w-5 h-5 text-orange-500" />
                            <span className="font-black text-lg tracking-tight">FoodVerse</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/login')} className="px-5 py-2 text-xs font-bold hover:text-orange-400 transition-colors">
                                Login
                            </button>
                            <button onClick={() => navigate('/signup')} className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-rose-600 text-white text-xs font-black rounded-full hover:scale-105 transition-transform shadow-lg">
                                SIGN UP
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col w-full">

                {/* HERO SECTION - SPLIT LAYOUT FOR LAPTOP */}
                <section className="min-h-screen flex flex-col justify-center px-6 max-w-7xl mx-auto w-full pointer-events-none">

                    {/* Grid: 1 Col Mobile (Center), 2 Cols Desktop (Text Left, Empty Right for Canvas) */}
                    <div className="grid md:grid-cols-2 gap-12 items-center pointer-events-auto">

                        {/* LEFT TEXT (Center on Mobile, Left on Desktop) */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8 mt-12 md:mt-0 order-1">
                            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-950/30 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-md">
                                    <Zap className="w-3 h-3 fill-orange-400" /> Galactic Delivery
                                </div>

                                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black leading-[0.95] tracking-tighter mb-8 drop-shadow-2xl">
                                    Taste The<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-500 to-purple-600">
                                        Infinite.
                                    </span>
                                </h1>

                                <p className="text-lg md:text-xl text-gray-300/90 max-w-lg mx-auto md:mx-0 leading-relaxed mb-10 font-medium">
                                    Experience hyper-speed drone delivery from the universe's finest kitchens.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center md:justify-start">
                                    <button onClick={() => navigate('/login')} className="px-10 py-4 bg-white text-black font-black rounded-full hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-2 min-w-[200px]">
                                        Launch App <ChevronRight className="w-5 h-5" />
                                    </button>
                                    <button onClick={scrollToContent} className="px-10 py-4 bg-black/40 hover:bg-black/60 border border-white/20 text-white font-bold rounded-full backdrop-blur-md transition-colors flex items-center justify-center gap-2 min-w-[200px]">
                                        Explore <ArrowDown className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT EMPTY (For 3D Animation to shine through) */}
                        <div className="h-[40vh] md:h-auto w-full order-2 pointer-events-none" />
                    </div>
                </section>

                {/* SCROLLING INFO */}
                <div id="about" className="relative w-full bg-gradient-to-b from-transparent to-black backdrop-blur-sm pt-20 pb-32">
                    <section className="px-6 max-w-7xl mx-auto">
                        <ScrollReveal>
                            <div className="text-center mb-20">
                                <h2 className="text-3xl md:text-5xl font-black mb-4">Galactic Features</h2>
                            </div>
                        </ScrollReveal>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { title: "Hyper-Local", desc: "Precision landing.", icon: <MapPin className="w-8 h-8 text-rose-500" /> },
                                { title: "Warp Speed", desc: "Faster than light.", icon: <Zap className="w-8 h-8 text-yellow-400" /> },
                                { title: "Live Track", desc: "Pilot telemetry.", icon: <Truck className="w-8 h-8 text-blue-400" /> },
                                { title: "Secure Pay", desc: "Quantum encrypted.", icon: <ShieldCheck className="w-8 h-8 text-green-400" /> },
                                { title: "Cosmic Menu", desc: "500+ sectors.", icon: <Utensils className="w-8 h-8 text-purple-400" /> },
                                { title: "Mobile Cmd", desc: "Full control.", icon: <Smartphone className="w-8 h-8 text-orange-400" /> }
                            ].map((item, i) => (
                                <ScrollReveal key={i} delay={i * 0.1}>
                                    <div className="group p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all hover:-translate-y-2 hover:bg-white/10 text-center">
                                        <div className="mb-4 inline-block">{item.icon}</div>
                                        <h3 className="text-xl font-black mb-2">{item.title}</h3>
                                        <p className="text-gray-400 text-sm font-bold">{item.desc}</p>
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
