import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, Star, Clock, MapPin,
    ShieldCheck, Zap, Heart, Utensils
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    // --- 3D CANVAS ENGINE (Rotating Food Sphere) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;

        let width, height, centerX, centerY;
        let rotationX = 0;
        let rotationY = 0;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            centerX = width / 2;
            centerY = height / 2;
        };
        window.addEventListener('resize', resize);
        resize();

        // Assets
        const foodEmojis = ['🍔', '🍕', '🌮', '🍩', '🍪', '🥗', '🍱', '🍜', '🍤', '🍗', '🥪', '🥨'];

        // Sphere Configuration
        const radius = Math.min(width, height) * 0.35; // Size of sphere
        const particles = [];
        const numParticles = 60;

        // Initialize Particles on Sphere Surface (Fibonacci Sphere)
        for (let i = 0; i < numParticles; i++) {
            const y = 1 - (i / (numParticles - 1)) * 2;
            const radiusAtY = Math.sqrt(1 - y * y);
            const theta = i * Math.PI * (3 - Math.sqrt(5)); // Golden Angle

            const x = Math.cos(theta) * radiusAtY;
            const z = Math.sin(theta) * radiusAtY;

            particles.push({
                x: x * radius,
                y: y * radius,
                z: z * radius,
                emoji: foodEmojis[i % foodEmojis.length],
                origX: x * radius,
                origY: y * radius,
                origZ: z * radius
            });
        }

        const render = () => {
            // Clear
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, width, height);

            // Draw Background Gradient
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.8);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#000000');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Rotate Globa
            rotationY += 0.003; // Auto Rotation
            rotationX += 0.001;

            particles.forEach(p => {
                // Rotate around Y
                let x1 = p.origX * Math.cos(rotationY) - p.origZ * Math.sin(rotationY);
                let z1 = p.origZ * Math.cos(rotationY) + p.origX * Math.sin(rotationY);

                // Rotate around X
                let y1 = p.origY * Math.cos(rotationX) - z1 * Math.sin(rotationX);
                let z2 = z1 * Math.cos(rotationX) + p.origY * Math.sin(rotationX);

                // Project
                const scale = 500 / (500 + z2); // Perspective
                const screenX = centerX + x1 * scale;
                const screenY = centerY + y1 * scale;
                const fontSize = 40 * scale;

                // Store projected values for sorting
                p.screenX = screenX;
                p.screenY = screenY;
                p.scale = scale;
                p.z = z2;
                p.fontSize = fontSize;
            });

            // Painter's Algorithm: Sort by Z (farthest first)
            particles.sort((a, b) => b.z - a.z);

            // Draw
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            particles.forEach(p => {
                ctx.globalAlpha = p.scale; // Fade remote items
                ctx.font = `${p.fontSize}px Arial`;

                // Add Glow to close items
                if (p.z < 0) {
                    ctx.shadowColor = 'rgba(255, 165, 0, 0.5)';
                    ctx.shadowBlur = 10;
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.fillText(p.emoji, p.screenX, p.screenY);
            });
            ctx.shadowBlur = 0; // Reset
            ctx.globalAlpha = 1;

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Scroll to features
    const scrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#0f0f13] text-white font-sans overflow-x-hidden relative">

            {/* 3D CANVAS BACKGROUND */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 z-0 pointer-events-none"
            />

            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/10 bg-black/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-xl">🚀</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">FoodVerse</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
                        <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/login')} className="px-5 py-2.5 text-sm font-bold text-white hover:text-orange-400 transition-colors">
                            Log In
                        </button>
                        <button onClick={() => navigate('/login')} className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold hover:bg-orange-50 transition-colors shadow-lg shadow-white/10">
                            Sign Up
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-sm font-medium text-gray-300">Now serving the entire galaxy</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-6xl md:text-8xl font-black tracking-tight leading-tight mb-8"
                    >
                        Food Delivery at <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-rose-500 to-purple-600">
                            Warp Speed
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Experience the fastest delivery in the universe. Fresh, hot, and instantly at your doorstep.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button onClick={() => navigate('/login')} className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-600 rounded-full text-lg font-bold shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2">
                                Start Your Order <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                        <button onClick={scrollToFeatures} className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-lg font-bold hover:bg-white/10 transition-all backdrop-blur-sm">
                            Learn More
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative py-32 px-6 bg-[#0a0a0f]/80 backdrop-blur-lg border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose FoodVerse?</h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">We don't just deliver food; we deliver an experience.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <Clock className="w-8 h-8 text-orange-400" />, title: "Hyper-Fast Delivery", desc: "Our drone fleet ensures your food arrives hot, usually within 15 minutes." },
                            { icon: <ShieldCheck className="w-8 h-8 text-green-400" />, title: "Secure Handling", desc: "Tamper-proof packaging and real-time temperature tracking for every order." },
                            { icon: <Utensils className="w-8 h-8 text-blue-400" />, title: "Premium Restaurants", desc: "Curated selection of the finest eateries in your local star system." }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-orange-500/30 hover:bg-white/10 transition-all group"
                            >
                                <div className="w-16 h-16 bg-black/50 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
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
