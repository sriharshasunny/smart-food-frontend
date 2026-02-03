import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Utensils, ShieldCheck, Zap, Rocket, ArrowDown, Star } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const scrollRef = useRef(null);

    // --- HIGH-PERFORMANCE 3D EMOJI ENGINE ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;

        // Assets (System Emojis)
        const FOOD_EMOJIS = ['🍔', '🍕', '🍩', '🌮', '🍱', '🍜', '🍤', '🥓', '🥨', '🍟', '🍖', '🌶️', '🥑', '🥥'];

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
                centerX = width * 0.75; // Right side on desktop
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.0012; // Larger on desktop
            } else {
                centerX = width * 0.5;
                centerY = height * 0.55;
                scale = Math.min(width, height) * 0.0009;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        // Init Particles/Planets
        const planets = Array.from({ length: 18 }, (_, i) => ({
            emoji: FOOD_EMOJIS[i % FOOD_EMOJIS.length],
            angle: (i / 18) * Math.PI * 2, // Even distribution
            distance: 140 + (i % 3) * 60 + Math.random() * 40, // Layers
            speed: 0.004 + Math.random() * 0.004, // Dynamic speed
            size: 40 + Math.random() * 25,
            heightOffset: (Math.random() - 0.5) * 100 // Vertical spread (3D chaos)
        }));

        // Stars Background
        const stars = Array.from({ length: isMobile ? 50 : 200 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            opacity: Math.random()
        }));

        let time = 0;

        const render = () => {
            time++;

            // 1. Clear & Background
            // Create a deep "Space" gradient
            const bg = ctx.createLinearGradient(0, 0, 0, height);
            bg.addColorStop(0, '#020205');
            bg.addColorStop(1, '#10101a');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);

            // 2. Stars
            ctx.fillStyle = "white";
            stars.forEach(star => {
                ctx.globalAlpha = star.opacity * (0.5 + Math.sin(time * 0.05 + star.x) * 0.5); // Twinkle
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // 3. Prepare Items (Z-Sort)
            const items = [];

            // Core Sun/Planet
            items.push({
                type: 'sun',
                z: 0,
                y: centerY,
                scale: 1,
                emoji: '🌍'
            });

            // Orbiting Food
            planets.forEach(p => {
                p.angle += p.speed;
                const radiusX = p.distance * scale * 2.5;
                const radiusY = p.distance * scale * 0.8; // Tilt

                const x = centerX + Math.cos(p.angle) * radiusX;
                const zDepth = Math.sin(p.angle) * radiusY; // Z-coordinate for depth
                const y = centerY + zDepth * 0.6 + p.heightOffset;

                // Depth Scale Effect (Closer = Bigger)
                const depthScale = 1 + (Math.sin(p.angle) * 0.3);

                items.push({
                    type: 'planet',
                    emoji: p.emoji,
                    x: x,
                    y: y,
                    z: zDepth,
                    scale: depthScale,
                    size: p.size,
                    opacity: 0.3 + (depthScale * 0.7) // Fade distance
                });
            });

            // Sort by Z (Draw far items first)
            items.sort((a, b) => a.z - b.z);

            // 4. Draw Items
            items.forEach(item => {
                ctx.save();
                ctx.translate(item.x, item.y);

                if (item.type === 'sun') {
                    // Sun Glow
                    const sunSize = 80 * scale * 2;
                    const glow = ctx.createRadialGradient(0, 0, sunSize * 0.2, 0, 0, sunSize * 2);
                    glow.addColorStop(0, 'rgba(255, 100, 0, 0.4)');
                    glow.addColorStop(1, 'transparent');
                    ctx.fillStyle = glow;
                    ctx.beginPath(); ctx.arc(0, 0, sunSize * 2, 0, Math.PI * 2); ctx.fill();

                    // Rotating World
                    ctx.rotate(time * 0.005);
                    ctx.font = `${sunSize}px "Segoe UI Emoji", "Apple Color Emoji", Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(item.emoji, 0, 0);

                } else {
                    // Food Planet
                    const fontSize = item.size * item.scale;
                    ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.globalAlpha = item.opacity;

                    // Blur Effect for Depth (Simple simulation without heavy 'filter')
                    // Real 'ctx.filter' is expensive. We use opacity + size to simulate depth.

                    // Rotation (Spin on axis)
                    ctx.rotate(time * 0.02 + item.x);

                    // Shadow/Glow for 3D pop
                    ctx.shadowColor = 'rgba(0,0,0,0.5)';
                    ctx.shadowBlur = 10;

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

    return (
        <div ref={scrollRef} className="min-h-screen text-white font-sans overflow-x-hidden relative bg-black selection:bg-orange-500 selection:text-white">

            {/* BACKGROUND CANVAS - Fixed position */}
            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            {/* FLOATING NAVBAR */}
            <nav className="fixed w-full z-50 top-4 px-4 pointer-events-none">
                <div className="max-w-7xl mx-auto pointer-events-auto">
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-black/50">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-tr from-orange-500 to-rose-500 p-1.5 rounded-full">
                                <Rocket className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                FoodVerse
                            </span>
                        </div>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
                            <button onClick={() => navigate('/home')} className="hover:text-white transition-colors">Menu</button>
                            <button onClick={() => navigate('/restaurants')} className="hover:text-white transition-colors">Restaurants</button>
                            <button onClick={scrollToContent} className="hover:text-white transition-colors">About</button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/login')} className="px-4 py-1.5 text-xs font-bold text-white hover:text-orange-400 transition-colors">
                                Log In
                            </button>
                            <button onClick={() => navigate('/signup')} className="px-5 py-2 bg-white text-black text-xs font-black rounded-full hover:bg-gray-200 transition-transform active:scale-95 shadow-lg shadow-white/20">
                                JOIN NOW
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* HERO CONTENT */}
            <main className="relative z-10 flex flex-col w-full">

                {/* HERO SECTION */}
                <section className="min-h-screen flex flex-col justify-center pt-32 pb-12 px-6 max-w-7xl mx-auto w-full pointer-events-none">
                    <div className="grid md:grid-cols-2 gap-12 items-center pointer-events-auto">

                        {/* LEFT TEXT */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8 mt-8 md:mt-0 order-1">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-orange-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                                    <Star className="w-3 h-3 fill-orange-400" /> Voted Best in Galaxy
                                </div>
                                <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-[1.05] tracking-tight mb-6 md:mb-8 drop-shadow-2xl">
                                    Taste the <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600">
                                        Future.
                                    </span>
                                </h1>
                                <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-lg mx-auto md:mx-0 leading-relaxed mb-8 md:mb-10 text-shadow-sm font-medium">
                                    Defy gravity. Experience hyper-speed delivery of the universe's finest cuisines directly to your pod.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <button onClick={() => navigate('/login')} className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-orange-600/40 transition-all flex items-center justify-center gap-2 text-lg">
                                        Start Order <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button onClick={scrollToContent} className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl backdrop-blur-md transition-colors flex items-center justify-center gap-2">
                                        Learn More <ArrowDown className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT SPACER for 3D Art */}
                        <div className="h-[30vh] md:h-auto w-full order-2 pointer-events-none" />

                    </div>
                </section>

                {/* INFO SECTION */}
                <div id="about" className="relative w-full bg-black/80 backdrop-blur-xl border-t border-white/10">
                    <section className="py-20 md:py-32 px-6 max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-5xl font-black mb-6">Mission Control</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                                Three steps to gastronomic bliss.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "Select", desc: "Browse a curated nebula of cuisines.", icon: <Utensils className="w-8 h-8 text-orange-400" /> },
                                { title: "Secure", desc: "Encrypted checkout via QuantumPay.", icon: <ShieldCheck className="w-8 h-8 text-blue-400" /> },
                                { title: "Receive", desc: "Mach-10 drone delivery to your door.", icon: <Zap className="w-8 h-8 text-yellow-400" /> }
                            ].map((step, i) => (
                                <div key={i} className="group p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-orange-500/30 transition-all duration-300">
                                    <div className="w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* STATS */}
                    <section className="py-20 border-t border-white/5 bg-white/5">
                        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
                            {[
                                { val: "10M+", label: "Users" },
                                { val: "500+", label: "Cities" },
                                { val: "12m", label: "Avg Time" },
                                { val: "4.9", label: "Rating" }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-2">{stat.val}</div>
                                    <div className="text-sm md:text-base text-gray-400 font-bold uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="py-24 px-6 text-center">
                        <div className="max-w-3xl mx-auto bg-gradient-to-b from-orange-600 to-red-600 rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-orange-600/20 relative overflow-hidden group">
                            <h2 className="text-3xl md:text-5xl font-black mb-6 relative z-10">Hungry?</h2>
                            <p className="text-white/80 text-lg md:text-xl mb-10 relative z-10">
                                The universe awaits.
                            </p>
                            <button onClick={() => navigate('/login')} className="relative z-10 px-10 py-5 bg-white text-orange-600 text-lg font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl">
                                Launch Order
                            </button>
                        </div>
                        <footer className="mt-20 text-gray-500 text-sm">
                            <p>&copy; 2024 FoodVerse Galactic Inc.</p>
                        </footer>
                    </section>
                </div>

            </main>
        </div>
    );
};

export default LandingPage;
