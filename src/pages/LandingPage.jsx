import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, ShieldCheck, Utensils } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    // --- SOLAR SYSTEM ENGINE ---
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
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);

            // --- RESPONSIVE POSITIONING ---
            if (width >= 768) {
                // Desktop: System on the RIGHT
                centerX = width * 0.75; // 75% to the right
                centerY = height * 0.5; // Vertically centered
                scale = Math.min(width, height) * 0.0012; // Base scale on screen size
            } else {
                // Mobile: System BELOW text
                centerX = width * 0.5; // Horizontally centered
                centerY = height * 0.7; // Pushed down (70% down)
                scale = Math.min(width, height) * 0.0015; // Slightly larger relative to screen
            }
        };
        window.addEventListener('resize', resize);
        resize();

        // --- Assets ---
        // 9 Planets for 9 Orbits
        const planets = [
            { emoji: '🍔', speed: 0.004, offset: 0, distance: 100, size: 40 },
            { emoji: '🍕', speed: 0.003, offset: 2, distance: 160, size: 45 },
            { emoji: '🍩', speed: 0.005, offset: 4, distance: 220, size: 35 },
            { emoji: '🌮', speed: 0.002, offset: 1, distance: 280, size: 42 },
            { emoji: '🍜', speed: 0.0035, offset: 5, distance: 340, size: 40 },
            { emoji: '🍟', speed: 0.0025, offset: 3, distance: 400, size: 38 },
            { emoji: '🥗', speed: 0.0045, offset: 0.5, distance: 460, size: 42 },
            { emoji: '🍦', speed: 0.0015, offset: 6, distance: 520, size: 36 },
            { emoji: '🥤', speed: 0.006, offset: 2.5, distance: 580, size: 34 },
        ];

        // Stars
        const starCount = 200;
        const stars = [];
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() * 2,
                opacity: Math.random(),
                twinkleSpeed: Math.random() * 0.02
            });
        }

        let time = 0;

        const render = () => {
            time += 1;

            // 1. Clear & Background
            const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 1.5);
            bgGradient.addColorStop(0, '#0f0c29');
            bgGradient.addColorStop(0.5, '#302b63');
            bgGradient.addColorStop(1, '#24243e');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, width, height);

            // 2. Draw Stars (Background)
            ctx.fillStyle = 'white';
            stars.forEach(star => {
                ctx.globalAlpha = star.opacity;
                ctx.beginPath();
                // Star positions relative to width/height to survive resize nicely-ish
                ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
                ctx.fill();

                // Twinkle
                star.opacity += star.twinkleSpeed;
                if (star.opacity > 1 || star.opacity < 0.1) star.twinkleSpeed *= -1;
            });
            ctx.globalAlpha = 1;

            // 3. Draw Solar System
            // Sun Glow
            const sunRadius = 60 * scale * 300; // Arbitrary sizing based on scale
            const sunGlow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 120 * scale * 4);
            sunGlow.addColorStop(0, '#ffaa00');
            sunGlow.addColorStop(0.4, '#ff5500');
            sunGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = sunGlow;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 150 * scale * 4, 0, Math.PI * 2);
            ctx.fill();

            // Sun Body
            ctx.fillStyle = '#ff8800';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 40 * scale * 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffcc00'; // Inner core
            ctx.beginPath();
            ctx.arc(centerX, centerY, 25 * scale * 4, 0, Math.PI * 2);
            ctx.fill();


            // Planets & Orbits
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            planets.forEach((planet, index) => {
                const currentDistance = planet.distance * scale * 3.5; // Adjust spread
                const angle = time * planet.speed + planet.offset;

                // Orbit Path (Elliptical look via persepctive simulation or just circles? User said "solar system". Circles are cleaner top-down)
                // Let's do slight ellipse to give 3D tilt
                const tilt = 0.3; // 1 = circle, 0 = flat line

                const x = centerX + Math.cos(angle) * currentDistance;
                const y = centerY + Math.sin(angle) * currentDistance * 0.8; // 0.8 compression for slight tilt

                // Draw Orbit Line
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, currentDistance, currentDistance * 0.8, 0, 0, Math.PI * 2);
                ctx.stroke();

                // Draw Planet (Emoji)
                const fontSize = planet.size * scale * 4;
                ctx.font = `${fontSize}px Arial`;

                // Shadow for depth
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 4;
                ctx.fillText(planet.emoji, x, y);
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

            {/* CANVAS BACKGROUND (Fixed) */}
            <canvas ref={canvasRef} className="fixed inset-0 z-0" />

            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-black/20 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🪐</span>
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600">
                            FoodSpace
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/login')} className="px-5 py-2.5 font-bold hover:text-orange-400 transition-colors">
                            Log In
                        </button>
                        <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                            Sign Up
                        </button>
                    </div>
                </div>
            </nav>

            {/* SPLIT HERO SECTION */}
            <section className="relative min-h-screen flex items-center pt-20 px-6 max-w-7xl mx-auto z-10">
                <div className="grid md:grid-cols-2 gap-12 w-full h-full items-center">

                    {/* LEFT COLUMN: Text & CTA */}
                    <div className="text-center md:text-left flex flex-col items-center md:items-start space-y-8 order-1 md:order-1 pt-10 md:pt-0">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-5xl md:text-7xl font-black leading-tight drop-shadow-2xl">
                                Taste the <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500">
                                    Galaxy
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-300 mt-6 max-w-lg mx-auto md:mx-0 leading-relaxed shadow-black drop-shadow-md">
                                The first interplanetary food delivery service.
                                Orbiting flavor delivered at lightspeed.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center md:justify-start">
                                <button onClick={() => navigate('/login')} className="px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-gray-100 transition-all shadow-xl hover:shadow-white/20 active:scale-95 flex items-center gap-2 justify-center">
                                    Launch Order <ChevronRight className="w-5 h-5" />
                                </button>
                                <button onClick={scrollToFeatures} className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-lg font-bold rounded-full transition-all backdrop-blur-sm">
                                    Explore System
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Spacer for Solar System (which is on canvas behind) */}
                    {/* On Desktop: This space is empty to show the System. */}
                    {/* On Mobile: We might need a spacer if the canvas draws below. */}
                    {/* The Canvas logic positions the system at 70% height on mobile, so we need some height here or just let the page flow. */}
                    <div className="h-[40vh] md:h-auto order-2 md:order-2 pointer-events-none">
                        {/* Invisible spacer to push content if needed, designs rely on Fixed Canvas */}
                    </div>
                </div>
            </section>

            {/* Features Section - Pushed down to clear the "System" on mobile */}
            <section id="features" className="relative py-32 px-6 bg-black/80 backdrop-blur-lg border-t border-white/10 mt-[20vh] md:mt-0 z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Galactic Features</h2>
                        <p className="text-gray-400">Why the universe chooses us.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <Clock className="w-8 h-8 text-orange-400" />, title: "Hyper-Speed", desc: "Warp drive delivery technology." },
                            { icon: <ShieldCheck className="w-8 h-8 text-green-400" />, title: "Zero-G Shielded", desc: "Food stays intact, even through asteroid fields." },
                            { icon: <Utensils className="w-8 h-8 text-blue-400" />, title: "Universal Menu", desc: "Dishes from 12 different star systems." }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 to-transparent pointer-events-none" />
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black mb-8">Hungry? Don't Wait.</h2>
                    <p className="text-2xl text-gray-300 mb-12">Your next favorite meal is just a warp jump away.</p>
                    <button onClick={() => navigate('/login')} className="px-12 py-5 bg-white text-black text-xl font-bold rounded-full hover:scale-105 active:scale-95 shadow-2xl shadow-white/20 transition-all">
                        Get Started Now
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10 bg-black/80 backdrop-blur-xl text-center text-gray-500 text-sm">
                <p>&copy; 2024 FoodVerse Galactic. Designed for the Future.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
```
