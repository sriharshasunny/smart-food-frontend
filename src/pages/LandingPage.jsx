import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, Clock, ShieldCheck, Utensils, Star, Zap } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    // --- SOLAR SYSTEM ENGINE (Professional) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;

        let width, height, centerX, centerY;
        let scale = 1;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            // Responsive Layout: Right side on Desktop, Top/Center on Mobile
            if (width >= 768) {
                centerX = width * 0.75;
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.0006;
            } else {
                centerX = width * 0.5;
                centerY = height * 0.35; // Moved up slightly
                scale = Math.min(width, height) * 0.0005;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        // Assets
        const foodEmojis = ['🍔', '🍕', '🍩', '🌮', '🥗', '🍱', '🍜', '🍤', '🥓', '🍗', '🍟', '🧀'];

        // 1. Planets
        const planets = foodEmojis.map((emoji, i) => ({
            emoji,
            distance: 120 + i * 60,
            speed: 0.002 + Math.random() * 0.003,
            offset: Math.random() * Math.PI * 2,
            size: 30 + Math.random() * 20
        }));

        // 2. Stars (Background)
        const stars = Array.from({ length: 200 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            opacity: Math.random()
        }));

        let time = 0;

        const render = () => {
            time += 1;

            // Clear with Trail Effect? No, sharp clear for pro look.
            // Gradient Background (Deep Space)
            const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width);
            bgGradient.addColorStop(0, '#0a0a1a'); // Deep Blue/Black center
            bgGradient.addColorStop(0.6, '#020205'); // Almost black
            bgGradient.addColorStop(1, '#000000');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, width, height);

            // Nebula Effects (Subtle)
            const nebula1 = ctx.createRadialGradient(width * 0.8, height * 0.2, 0, width * 0.8, height * 0.2, 600);
            nebula1.addColorStop(0, 'rgba(60, 20, 100, 0.08)'); // Deep Purple
            nebula1.addColorStop(1, 'transparent');
            ctx.fillStyle = nebula1;
            ctx.fillRect(0, 0, width, height);

            const nebula2 = ctx.createRadialGradient(width * 0.2, height * 0.8, 0, width * 0.2, height * 0.8, 500);
            nebula2.addColorStop(0, 'rgba(0, 50, 100, 0.08)'); // Deep Blue
            nebula2.addColorStop(1, 'transparent');
            ctx.fillStyle = nebula2;
            ctx.fillRect(0, 0, width, height);

            // Draw Stars
            ctx.fillStyle = 'white';
            stars.forEach(star => {
                ctx.globalAlpha = star.opacity * 0.8;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // Draw Sun (Glowing Core)
            const sunRadius = 60 * scale * 300; // ~60px base
            const sunGlow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 200);
            sunGlow.addColorStop(0, 'rgba(255, 150, 0, 0.8)');
            sunGlow.addColorStop(0.4, 'rgba(255, 80, 0, 0.3)');
            sunGlow.addColorStop(1, 'transparent');

            ctx.fillStyle = sunGlow;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
            ctx.fill();

            // Core Sun
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
            ctx.fill();


            // Draw Planets (Orbits first, then planets)
            // Draw Orbits
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            planets.forEach(p => {
                const r = p.distance * scale * 4; // Adjust scale
                ctx.beginPath();
                ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
                ctx.stroke();
            });

            // Draw Planet Icons
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            planets.forEach(p => {
                const r = p.distance * scale * 4;
                const angle = time * p.speed + p.offset;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;

                ctx.font = `${p.size}px Arial`;
                // Shadow
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 10;
                ctx.fillText(p.emoji, x, y);
                ctx.shadowBlur = 0;
            });

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const scrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen text-white font-sans overflow-x-hidden relative">

            {/* CANVAS BACKGROUND */}
            <canvas ref={canvasRef} className="fixed inset-0 z-0 bg-black" />

            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-black/30 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <span className="text-xl">🪐</span>
                        </div>
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-500">
                            FoodVerse
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/login')} className="px-5 py-2 hover:text-orange-400 transition-colors font-medium">
                            Log In
                        </button>
                        <button onClick={() => navigate('/login')} className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors">
                            Sign Up
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="relative min-h-screen flex items-center pt-20 px-6 max-w-7xl mx-auto z-10 w-full">
                <div className="grid md:grid-cols-2 gap-4 w-full h-full">

                    {/* TEXT CONTENT (Left) */}
                    <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-8 order-2 md:order-1 mt-10 md:mt-0">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-400 text-sm font-bold mb-6 backdrop-blur-sm">
                                <Zap className="w-4 h-4 fill-current" />
                                <span>Hyperspeed Delivery Protocol v2.0</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6">
                                Interstellar <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-500 to-purple-500">
                                    Cravings.
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-gray-400 max-w-lg leading-relaxed mb-8">
                                Premium dining delivered from the furthest reaches of the galaxy.
                                Experience warp-speed logistics for your next meal.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full">
                                <button onClick={() => navigate('/login')} className="px-8 py-4 bg-gradient-to-r from-orange-600 to-rose-600 text-white text-lg font-bold rounded-2xl hover:shadow-lg hover:shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                    Initialize Order <ChevronRight className="w-5 h-5" />
                                </button>
                                <button onClick={scrollToFeatures} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-lg font-medium rounded-2xl transition-all backdrop-blur-sm">
                                    View Protocol
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* SOLAR SYSTEM SPACER (Right) */}
                    {/* The Canvas draws behind, this purely reserves space / ensures clicks fall through if needed */}
                    <div className="hidden md:block h-full order-1 md:order-2 pointer-events-none">
                        {/* Space reserved for Solar System */}
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION (Glassmorphism) */}
            <section id="features" className="relative py-32 px-6 z-10 w-full">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Galactic Capabilities</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Detailed specifications of our delivery fleet.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <Clock className="w-8 h-8 text-orange-400" />, title: "Hyper-Speed", desc: "Warp drive delivery technology ensures food arrives before it gets cold." },
                            { icon: <ShieldCheck className="w-8 h-8 text-blue-400" />, title: "Zero-G Shielded", desc: "Stasis fields keep your meal intact, even through asteroid fields." },
                            { icon: <Utensils className="w-8 h-8 text-green-400" />, title: "Universal Menu", desc: "Compatible with carbon-based lifeforms from 12 systems." }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 backdrop-blur-md shadow-xl group">
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-orange-400 transition-colors">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 border-t border-white/10 bg-black/60 backdrop-blur-xl text-center text-gray-500 text-sm">
                <p>&copy; 2024 FoodVerse Galactic. Designed for the Future.</p>
            </footer>

        </div>
    );
};

export default LandingPage;
