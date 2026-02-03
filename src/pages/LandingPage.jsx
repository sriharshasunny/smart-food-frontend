import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Utensils, ShieldCheck, Zap, Rocket, ArrowDown, MapPin, Truck, Smartphone } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const scrollRef = useRef(null);

    // --- 120FPS OPTIMIZED ENGINE ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency
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

            // LAYOUT: Text Left (Desktop), Center (Mobile)
            if (width >= 768) {
                centerX = width * 0.75; // Right side for animation
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.0013;
            } else {
                centerX = width * 0.5;
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.001;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        // 3D Particles - REDUCED & CLEAN
        const planets = Array.from({ length: 12 }, (_, i) => ({
            emoji: FOOD_EMOJIS[i % FOOD_EMOJIS.length],
            angle: (i / 12) * Math.PI * 2,
            distance: 180 + (i % 2) * 80, // 2 Clean Rings
            speed: 0.003 + (i % 2) * 0.002, // Consistent speed
            size: 45,
            heightOffset: (Math.random() - 0.5) * 50, // Very minimal vertical noise
            rotation: Math.random() * Math.PI
        }));

        // Stars - Static Background (Optimization: Don't animate all 200 every frame if not needed, but moving stars look premium)
        // We will maintain moving stars but reduce count.
        const stars = Array.from({ length: 100 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5,
            opacity: Math.random() * 0.8,
            speed: 0.2 + Math.random() * 0.5 // Slow, smooth drift
        }));

        let time = 0;
        let coreIndex = 0;
        let coreTimer = 0;

        const render = () => {
            time++;
            coreTimer++;
            if (coreTimer > 180) { // Slower switch (3 sec) for premium feel
                coreIndex = (coreIndex + 1) % CORE_EMOJIS.length;
                coreTimer = 0;
            }

            // 1. Background - Solid Fill (Fastest)
            // Use gradient only if performance allows, else solid color
            const bg = ctx.createLinearGradient(0, 0, 0, height);
            bg.addColorStop(0, '#020205');
            bg.addColorStop(1, '#0b0b15');
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
                ctx.globalAlpha = star.opacity; // Remove sine wave calc per star for perf
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // 3. CORE SUN (Optimization: Draw directly, simplified glow)
            const sunSize = 140 * scale * 2.5;

            // Draw Glow (One radial gradient)
            const glow = ctx.createRadialGradient(centerX, centerY, sunSize * 0.2, centerX, centerY, sunSize * 2.2);
            glow.addColorStop(0, 'rgba(255, 120, 20, 0.4)'); // Lower alpha for premium subtlety
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(centerX, centerY, sunSize * 2.5, 0, Math.PI * 2); ctx.fill();

            // Draw Core Emoji
            const pulse = 1 + Math.sin(time * 0.05) * 0.02; // Subtle pulse
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(pulse, pulse);
            ctx.rotate(time * 0.01);
            ctx.font = `${sunSize}px Arial`; // Arial is faster than system emoji font sometimes
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // ctx.shadowBlur = 0; // REMOVED SHADOW FOR PERFORMANCE
            ctx.fillText(CORE_EMOJIS[coreIndex], 0, 0);
            ctx.restore();

            // 4. PLANETS (Batch operations?)
            // We need Z-sort, so we calculate first.
            const items = [];
            planets.forEach(p => {
                p.angle += p.speed;
                const radiusX = p.distance * scale * 2.6;
                const radiusY = p.distance * scale * 0.7; // Flattened

                const x = centerX + Math.cos(p.angle) * radiusX;
                const zDepth = Math.sin(p.angle) * radiusY;
                const y = centerY + zDepth * 0.5 + p.heightOffset;

                // Simple depth scale
                const depthScale = 1 + (Math.sin(p.angle) * 0.3);

                items.push({
                    emoji: p.emoji,
                    x, y, z: zDepth,
                    scale: depthScale,
                    size: p.size,
                    rotation: time * 0.02 + p.rotation,
                    opacity: 0.3 + (depthScale * 0.7)
                });
            });

            items.sort((a, b) => a.z - b.z);

            // Draw Planets
            items.forEach(item => {
                // Optimization: Don't render if behind sun and very small/far? No, render all for correctness.
                ctx.save();
                ctx.translate(item.x, item.y);
                const fontSize = item.size * item.scale;
                ctx.font = `${fontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.globalAlpha = item.opacity;
                ctx.rotate(item.rotation);
                // NO SHADOWS - Pure smooth rendering
                ctx.fillText(item.emoji, 0, 0);
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

    // Fast Scroll Reveal
    const ScrollReveal = ({ children, delay = 0 }) => (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay, ease: "circOut" }}
        >
            {children}
        </motion.div>
    );

    return (
        <div ref={scrollRef} className="min-h-screen text-white font-sans overflow-x-hidden relative bg-black selection:bg-orange-500 selection:text-white">

            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            {/* NAVBAR */}
            <nav className="fixed w-full z-50 top-6 px-4 pointer-events-none">
                <div className="max-w-fit mx-auto pointer-events-auto">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-3 flex items-center gap-8 shadow-2xl">
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
                    </div>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col w-full">

                {/* HERO SECTION - SPLIT LAYOUT (Desktop) */}
                <section className="min-h-screen flex flex-col justify-center px-6 max-w-7xl mx-auto w-full pointer-events-none">
                    <div className="grid md:grid-cols-2 gap-12 items-center pointer-events-auto">

                        {/* LEFT TEXT */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8 mt-12 md:mt-0 order-1">
                            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-400 text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-md">
                                    <Zap className="w-3 h-3 fill-orange-400" /> Premium Delivery
                                </div>

                                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black leading-[0.95] tracking-tighter mb-8 drop-shadow-2xl">
                                    Taste The<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-500 to-purple-600">
                                        Infinite.
                                    </span>
                                </h1>

                                <p className="text-lg md:text-xl text-gray-400/80 max-w-lg mx-auto md:mx-0 leading-relaxed mb-10 font-medium">
                                    Hyper-speed drone delivery. The galaxy's finest kitchens, now at your command.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center md:justify-start">
                                    <button onClick={() => navigate('/login')} className="px-10 py-4 bg-white text-black font-black rounded-full hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-2 min-w-[180px]">
                                        Order Now <ChevronRight className="w-5 h-5" />
                                    </button>
                                    <button onClick={scrollToContent} className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full backdrop-blur-md transition-colors flex items-center justify-center gap-2 min-w-[180px]">
                                        Features <ArrowDown className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT EMPTY (Animation Area) */}
                        <div className="h-[40vh] md:h-auto w-full order-2 pointer-events-none" />
                    </div>
                </section>

                {/* SCROLLING INFO */}
                <div id="about" className="relative w-full bg-black/40 backdrop-blur-sm pt-20 pb-32">
                    <section className="px-6 max-w-7xl mx-auto">
                        <ScrollReveal>
                            <div className="text-center mb-20">
                                <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Premium Features</h2>
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
                                <ScrollReveal key={i} delay={i * 0.05}>
                                    <div className="group p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-orange-500/20 transition-all hover:-translate-y-2 hover:bg-white/5 text-center">
                                        <div className="mb-6 inline-block opacity-80 group-hover:opacity-100 transition-opacity">{item.icon}</div>
                                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                        <p className="text-gray-500 text-sm font-medium">{item.desc}</p>
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
