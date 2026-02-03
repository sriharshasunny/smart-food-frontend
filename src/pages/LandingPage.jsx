import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, ShieldCheck, Utensils, Star, Zap, Globe, Rocket, Heart } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    // --- 3D SOLAR SYSTEM ENGINE ---
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

            if (width >= 768) { // Desktop
                centerX = width * 0.75; // Right side
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.0008;
            } else { // Mobile
                centerX = width * 0.5;
                centerY = height * 0.4;
                scale = Math.min(width, height) * 0.0006;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        // Assets
        const foodEmojis = ['🍔', '🍩', '🌮', '🥗', '🍱', '🍜', '🍤', '🥓', '🍗', '🍟', '🧀', '🥒', '🥨'];

        // 1. Planets (Food Items)
        const planets = foodEmojis.map((emoji, i) => ({
            type: 'planet',
            emoji,
            angle: (i / foodEmojis.length) * Math.PI * 2, // Evenly spaced
            distance: 150 + (i % 3) * 60 + Math.random() * 40, // Varied distances
            speed: 0.004 + Math.random() * 0.004, // Fast orbit
            size: 30 + Math.random() * 25,
            heightOffset: (Math.random() - 0.5) * 40 // Up/down variation
        }));

        // 2. Stars
        const stars = Array.from({ length: 150 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            opacity: Math.random(),
            blinkSpeed: Math.random() * 0.05
        }));

        let time = 0;

        const render = () => {
            time++;

            // 1. Background (Deep Space)
            const bg = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width);
            bg.addColorStop(0, '#0a0a1a');
            bg.addColorStop(0.5, '#050508');
            bg.addColorStop(1, '#000000');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);

            // 2. Stars (Moving + Blinking)
            stars.forEach(star => {
                star.opacity += star.blinkSpeed;
                const flicker = Math.abs(Math.sin(star.opacity));
                ctx.fillStyle = `rgba(255, 255, 255, ${flicker * 0.8})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // 3. Prepare 3D Scene Items
            const items = [];

            // Add Sun (Central Pizza)
            items.push({
                type: 'sun',
                z: 0, // Center
                y: centerY,
                scale: 1
            });

            // Add Planets (Calculated Positions)
            planets.forEach(p => {
                p.angle += p.speed;

                // 3D Projection Logic
                // We tilt the plane slightly: x is normal, y is compressed (z-depth)
                const radiusX = p.distance * scale * 3;
                const radiusY = p.distance * scale * 1.2; // Squashed Y for tilt effect

                const x = centerX + Math.cos(p.angle) * radiusX;
                // Z-depth approximation (y-position on screen relative to center)
                const zDepth = Math.sin(p.angle) * radiusY;

                // Visual Y position (tilted plane + depth)
                const y = centerY + zDepth * 0.8 + p.heightOffset;

                // Scale based on "Z" (pseudo-depth)
                // If sin(angle) is > 0, it's "in front" (closer, larger). < 0 is "behind" (farther, smaller)
                // Normalized scale factor: 0.7 to 1.3
                const depthScale = 1 + (Math.sin(p.angle) * 0.3);

                items.push({
                    type: 'planet',
                    emoji: p.emoji,
                    x: x,
                    y: y,
                    z: zDepth, // Used for sorting
                    scale: depthScale,
                    size: p.size,
                    opacity: 0.6 + (depthScale * 0.4) // Closer = brighter
                });
            });

            // 4. Sort by Depth (Painter's Algorithm)
            // Draw furthest (negative z / negative Sin) first
            items.sort((a, b) => a.z - b.z);

            // 5. Draw All
            items.forEach(item => {
                if (item.type === 'sun') {
                    // Draw Sun
                    const sunBaseSize = 100 * scale * 2.5;

                    // Glow
                    const glow = ctx.createRadialGradient(centerX, centerY, sunBaseSize * 0.5, centerX, centerY, sunBaseSize * 3);
                    glow.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
                    glow.addColorStop(0.4, 'rgba(255, 50, 0, 0.2)');
                    glow.addColorStop(1, 'transparent');
                    ctx.fillStyle = glow;
                    ctx.beginPath(); ctx.arc(centerX, centerY, sunBaseSize * 3, 0, Math.PI * 2); ctx.fill();

                    // Core (Pizza Emoji rotating)
                    ctx.save();
                    ctx.translate(centerX, centerY);
                    ctx.rotate(time * 0.005);
                    ctx.font = `${sunBaseSize}px Arial`;
                    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.shadowColor = "#ffaa00"; ctx.shadowBlur = 40;
                    ctx.fillText("🍕", 0, 0);
                    ctx.restore();

                } else {
                    // Draw Planet
                    ctx.save();
                    ctx.translate(item.x, item.y);
                    // Scale transform
                    ctx.scale(item.scale, item.scale);

                    ctx.font = `${item.size}px Arial`;
                    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.globalAlpha = item.opacity;

                    // Shadow purely for aesthetics
                    ctx.shadowColor = item.scale > 1.1 ? "rgba(255,255,255,0.5)" : "transparent";
                    ctx.shadowBlur = 10;

                    ctx.fillText(item.emoji, 0, 0);
                    ctx.restore();
                }
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
        <div className="min-h-screen text-white font-sans overflow-x-hidden relative bg-black">

            {/* CANVAS BACKGROUND (Fixed) */}
            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            {/* NAVBAR */}
            <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-[-10deg]">
                            <span className="text-2xl">🪐</span>
                        </div>
                        <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-rose-500 to-purple-500">
                            FoodVerse
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/login')} className="px-5 py-2 hover:text-orange-400 transition-colors font-medium text-sm md:text-base">Login</button>
                        <button onClick={() => navigate('/login')} className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all hover:scale-105 shadow-lg shadow-white/10 text-sm md:text-base">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="relative min-h-screen flex items-center pt-20 px-6 max-w-7xl mx-auto z-10 w-full pointer-events-none">
                <div className="grid md:grid-cols-2 gap-8 w-full h-full pointer-events-auto">
                    {/* Left Content */}
                    <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-8 mt-12 md:mt-0">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold mb-6 backdrop-blur-md uppercase tracking-widest">
                                <Rocket className="w-3 h-3" /> Galactic Delivery v2.0
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6">
                                The Taste of <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-500 to-purple-500">
                                    Infinity.
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-300 max-w-lg mb-8 leading-relaxed">
                                Join the intergalactic food revolution. Order from the finest restaurants across the quadrant and receive your meal at warp speed.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <button onClick={() => navigate('/login')} className="px-8 py-4 bg-gradient-to-r from-orange-600 to-rose-600 text-white text-lg font-bold rounded-2xl hover:shadow-xl hover:shadow-orange-600/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    Launch App <ChevronRight className="w-5 h-5" />
                                </button>
                                <button onClick={scrollToContent} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-lg font-medium rounded-2xl backdrop-blur-md transition-all">
                                    Explore Menu
                                </button>
                            </div>
                        </motion.div>
                    </div>
                    {/* Right spacer for 3D Art */}
                    <div className="hidden md:block" />
                </div>
            </section>

            {/* INFO CONTENT (Below Fold) */}
            <div id="about" className="relative z-10 bg-gradient-to-b from-transparent to-black/90 pb-20">

                {/* HOW IT WORKS */}
                <section className="py-24 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-6">How It Works</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Three simple steps to gastronomic nirvana.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: "Choose Your Fuel", desc: "Browse a galaxy of cuisines from top-rated star kitchens.", icon: "🍔" },
                            { step: "02", title: "Warp Speed Checkout", desc: "Secure, instant payment via quantum encryption.", icon: "💳" },
                            { step: "03", title: "Hyper-Delivery", desc: "Track your pilot as they zoom to your coordinates.", icon: "🚀" }
                        ].map((item, i) => (
                            <div key={i} className="relative p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-orange-500/30 hover:bg-white/10 transition-all group overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-9xl group-hover:scale-110 transition-transform">{item.step}</div>
                                <div className="text-6xl mb-6 relative z-10">{item.icon}</div>
                                <h3 className="text-2xl font-bold mb-3 relative z-10 text-white">{item.title}</h3>
                                <p className="text-gray-400 relative z-10 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* WHY CHOOSE US */}
                <section className="py-24 px-6 border-t border-white/5 bg-white/5 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-black leading-tight">
                                Why the Galaxy <br /> Chooses <span className="text-orange-500">FoodVerse</span>
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                We are not just a delivery app; we are a culinary transport system.
                                Our fleet of anti-gravity scooters and skilled pilots ensures your food
                                defies physics to reach you fresh.
                            </p>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                                    <div className="font-black text-3xl text-orange-500 mb-1">10M+</div>
                                    <div className="text-sm text-gray-400">Orders Delivered</div>
                                </div>
                                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                                    <div className="font-black text-3xl text-purple-500 mb-1">500+</div>
                                    <div className="text-sm text-gray-400">Partner Planets</div>
                                </div>
                                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                                    <div className="font-black text-3xl text-green-500 mb-1">99.9%</div>
                                    <div className="text-sm text-gray-400">On-Time Rate</div>
                                </div>
                                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                                    <div className="font-black text-3xl text-rose-500 mb-1">24/7</div>
                                    <div className="text-sm text-gray-400">Support Crew</div>
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-6">
                            {[
                                { icon: <Clock className="w-6 h-6 text-orange-400" />, title: "Instant Gratification", desc: "Average delivery time of 18 minutes." },
                                { icon: <ShieldCheck className="w-6 h-6 text-blue-400" />, title: "Quality Guarantee", desc: "If it's cold, it's on the house." },
                                { icon: <Globe className="w-6 h-6 text-purple-400" />, title: "Global & Local", desc: "From street food to orbital fine dining." }
                            ].map((feat, i) => (
                                <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-black/20 hover:bg-black/40 border border-white/5 transition-colors">
                                    <div className="p-3 rounded-lg bg-white/5">{feat.icon}</div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">{feat.title}</h4>
                                        <p className="text-sm text-gray-400">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA FOOTER */}
                <section className="pt-24 pb-12 px-6 text-center">
                    <div className="max-w-4xl mx-auto bg-gradient-to-br from-orange-600/20 to-purple-600/20 rounded-[3rem] p-12 border border-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5 blur-3xl opacity-20" />
                        <h2 className="text-4xl md:text-6xl font-black mb-6 relative z-10">Hungry Yet?</h2>
                        <p className="text-xl text-gray-300 mb-10 relative z-10">The best food in the universe is just one click away.</p>
                        <button onClick={() => navigate('/login')} className="relative z-10 px-10 py-5 bg-white text-black text-xl font-bold rounded-full hover:scale-105 transition-transform shadow-2xl shadow-white/20">
                            Start Your Order
                        </button>
                    </div>

                    <div className="mt-16 text-gray-600 text-sm flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto border-t border-white/5 pt-8">
                        <p>&copy; 2024 FoodVerse Galactic Inc.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <span className="hover:text-white cursor-pointer transition-colors">Privacy Protocol</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Mission Control</span>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default LandingPage;
