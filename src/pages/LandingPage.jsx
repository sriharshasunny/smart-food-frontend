import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Utensils, ShieldCheck, Zap, Rocket, ArrowDown, Star, Smartphone, MapPin, Truck } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const scrollRef = useRef(null);

    // --- RESTORED "OLD" CENTRAL 3D ENGINE ---
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
        let isMobile = false;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            isMobile = width < 768;

            // USER REQUEST: "CNERT" (CENTER) for Laptop too.
            // Absolute Center for everyone.
            centerX = width * 0.5;
            centerY = height * 0.5;

            // Adjust scale
            scale = Math.min(width, height) * (isMobile ? 0.001 : 0.0012);
        };
        window.addEventListener('resize', resize);
        resize();

        // 3D Particles
        const planets = Array.from({ length: 20 }, (_, i) => ({
            emoji: FOOD_EMOJIS[i % FOOD_EMOJIS.length],
            angle: (i / 20) * Math.PI * 2,
            distance: 140 + (i % 4) * 60 + Math.random() * 40,
            speed: 0.003 + Math.random() * 0.004,
            size: 40 + Math.random() * 30,
            heightOffset: (Math.random() - 0.5) * 150,
            rotation: Math.random() * Math.PI
        }));

        // Stars
        const stars = Array.from({ length: isMobile ? 50 : 200 }, () => ({
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
            if (coreTimer > 150) { // Switch core item
                coreIndex = (coreIndex + 1) % CORE_EMOJIS.length;
                coreTimer = 0;
            }

            // 1. Clear & Background
            const bg = ctx.createLinearGradient(0, 0, 0, height);
            bg.addColorStop(0, '#000000');
            bg.addColorStop(1, '#111122');
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
                ctx.globalAlpha = star.opacity * (0.5 + Math.sin(time * 0.1) * 0.5);
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // 3. Prepare Items (Z-Sort)
            const items = [];

            // CENTER SUN
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
                const radiusY = p.distance * scale * 0.9;

                const x = centerX + Math.cos(p.angle) * radiusX;
                const zDepth = Math.sin(p.angle) * radiusY;
                const y = centerY + zDepth * 0.6 + p.heightOffset;

                const depthScale = 1 + (Math.sin(p.angle) * 0.4);

                items.push({
                    type: 'planet',
                    emoji: p.emoji,
                    x: x,
                    y: y,
                    z: zDepth,
                    scale: depthScale,
                    size: p.size,
                    rotation: time * 0.02 + p.rotation,
                    opacity: 0.3 + (depthScale * 0.7)
                });
            });

            items.sort((a, b) => a.z - b.z);

            // 4. Draw
            items.forEach(item => {
                ctx.save();
                ctx.translate(item.x, item.y);

                if (item.type === 'sun') {
                    // Core Glow
                    const sunSize = 120 * scale * 2.5;
                    const glow = ctx.createRadialGradient(0, 0, sunSize * 0.2, 0, 0, sunSize * 2.5);
                    glow.addColorStop(0, 'rgba(255, 100, 0, 0.6)');
                    glow.addColorStop(1, 'transparent');
                    ctx.fillStyle = glow;
                    ctx.beginPath(); ctx.arc(0, 0, sunSize * 2.5, 0, Math.PI * 2); ctx.fill();

                    const pulse = 1 + Math.sin(time * 0.05) * 0.04;
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

                    if (item.scale > 1.1) {
                        ctx.shadowColor = 'rgba(0,0,0,0.5)';
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

    // Fast Scroll Reveal
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

            {/* FLOATING HEADER - Centered Pill */}
            <nav className="fixed w-full z-50 top-6 px-4 pointer-events-none">
                <div className="max-w-fit mx-auto pointer-events-auto">
                    <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-full px-8 py-3 flex items-center gap-8 shadow-2xl">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
                            <Rocket className="w-5 h-5 text-orange-500" />
                            <span className="font-black text-lg tracking-tight">FoodVerse</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => navigate('/login')} className="px-5 py-2 text-xs font-bold hover:text-orange-400 transition-colors">
                                Login
                            </button>
                            <button onClick={() => navigate('/signup')} className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-black rounded-full hover:scale-105 transition-transform shadow-lg">
                                JOIN
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col w-full">

                {/* HERO SECTION - Centered Text + Animation Background */}
                <section className="min-h-screen flex flex-col justify-center items-center pt-24 pb-12 px-6 w-full pointer-events-none text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="pointer-events-auto relative z-10 bg-black/20 backdrop-blur-[2px] p-8 rounded-[3rem] border border-white/5"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-widest mb-6 mx-auto">
                            <Star className="w-3 h-3 fill-orange-400" /> Galactic Delivery
                        </div>
                        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-6 drop-shadow-2xl">
                            Taste<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-500 to-purple-600">
                                The Infinite
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 max-w-lg mx-auto leading-relaxed mb-8 font-medium">
                            Hyper-speed drone delivery. Any galaxy. Any time.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={() => navigate('/login')} className="px-10 py-4 bg-white text-black font-black rounded-full hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-2">
                                ORDER NOW <ChevronRight className="w-5 h-5" />
                            </button>
                            <button onClick={scrollToContent} className="px-10 py-4 bg-black/40 hover:bg-black/60 border border-white/20 text-white font-bold rounded-full backdrop-blur-md transition-colors flex items-center justify-center gap-2">
                                MISSION BRIEF <ArrowDown className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* SCROLLING INFO */}
                <div id="about" className="relative w-full bg-gradient-to-b from-transparent to-black backdrop-blur-sm pt-20 pb-32">
                    <section className="px-6 max-w-7xl mx-auto">
                        <ScrollReveal>
                            <div className="text-center mb-20">
                                <h2 className="text-4xl md:text-5xl font-black mb-4">Galactic Features</h2>
                            </div>
                        </ScrollReveal>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { title: "Hyper-Local", desc: "Precision landing at your pod.", icon: <MapPin className="w-8 h-8 text-rose-500" /> },
                                { title: "Warp Speed", desc: "Hot food, defying physics.", icon: <Zap className="w-8 h-8 text-yellow-400" /> },
                                { title: "Live Track", desc: "Real-time pilot telemetry.", icon: <Truck className="w-8 h-8 text-blue-400" /> },
                                { title: "Quantum Pay", desc: "Encrypted transactions.", icon: <ShieldCheck className="w-8 h-8 text-green-400" /> },
                                { title: "Cosmic Menu", desc: "Dishes from 500+ sectors.", icon: <Utensils className="w-8 h-8 text-purple-400" /> },
                                { title: "Mobile Cmd", desc: "Full control via handheld.", icon: <Smartphone className="w-8 h-8 text-orange-400" /> }
                            ].map((item, i) => (
                                <ScrollReveal key={i} delay={i * 0.05}>
                                    <div className="group p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all hover:-translate-y-2 hover:bg-white/10">
                                        <div className="mb-4">{item.icon}</div>
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
