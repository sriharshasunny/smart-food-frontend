import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Utensils, ShieldCheck, Zap, Rocket, ArrowDown, MapPin, Truck, Smartphone, Star, Clock } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const scrollRef = useRef(null);

    // --- FINAL ENGINE: WARP SPEED SPACE & FAST UFO ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;

        // Assets
        const FOOD_EMOJIS = ['🍔', '🍕', '🍩', '🌮', '🍱', '🍜', '🍤', '🥓', '🥨', '🍟', '🍖', '🌶️', '🥑', '🥥'];
        const CORE_ITEMS = ['🍕', '🍔', '🍩', '🥗'];

        // Physics State
        let width, height, centerX, centerY;
        let scale = 1;

        // UFO Interaction State
        const ufo = {
            x: -100, y: 100, vx: 0, vy: 0,
            targetX: 0, targetY: 0,
            state: 'IDLE', // IDLE, WARP_TO_SUN, RESPAWNING
            rotation: 0, opacity: 1, scale: 1,
            trail: [],
            respawnTimer: 0,
            message: "Hungry? 😋",
            msgTimer: 0
        };

        const MESSAGES = ["Fast Delivery 🚀", "Order Now 🍕", "Galactic Taste ✨", "Hungry? 😋", "Zoom Zoom! 🛸"];

        // Mouse/Touch Tracking
        let mouseX = 0, mouseY = 0;
        const handleInteraction = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            mouseX = clientX - rect.left;
            mouseY = clientY - rect.top;

            // Hit detection (120px radius)
            const dist = Math.hypot(mouseX - ufo.x, mouseY - ufo.y);
            if (dist < 120 && ufo.state === 'IDLE') {
                ufo.state = 'WARP_TO_SUN';
            }
        };

        window.addEventListener('mousedown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            if (width >= 768) {
                centerX = width * 0.75;
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.0013;
            } else {
                centerX = width * 0.5;
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.001;
            }
            if (ufo.state === 'IDLE') {
                ufo.targetX = width * 0.2;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        // 3D Particles
        const planets = Array.from({ length: 12 }, (_, i) => ({
            emoji: FOOD_EMOJIS[i % FOOD_EMOJIS.length],
            angle: (i / 12) * Math.PI * 2,
            distance: 180 + (i % 2) * 80,
            speed: 0.003 + (i % 2) * 0.002,
            size: 45,
            heightOffset: (Math.random() - 0.5) * 50,
            rotation: Math.random() * Math.PI
        }));

        // Stars - "OLD" WARP EFFECT (Falling Stars)
        const stars = Array.from({ length: 150 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            opacity: Math.random(),
            speed: 2 + Math.random() * 8 // Faster "Warp" speed
        }));

        let time = 0;
        let coreIndex = 0;
        let coreTimer = 0;

        const updateUFO = () => {
            // Message cycling
            ufo.msgTimer++;
            if (ufo.msgTimer > 300) {
                ufo.message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
                ufo.msgTimer = 0;
            }

            if (ufo.state === 'IDLE') {
                // Smooth Wander
                if (Math.random() < 0.01) {
                    ufo.targetX = Math.random() * (width * 0.5);
                    ufo.targetY = Math.random() * (height * 0.7);
                }
                const dx = ufo.targetX - ufo.x;
                const dy = ufo.targetY - ufo.y;
                ufo.x += dx * 0.02;
                ufo.y += dy * 0.02;
                ufo.rotation = dx * 0.002;
                ufo.scale = 1;
                ufo.opacity = 1;

            } else if (ufo.state === 'WARP_TO_SUN') {
                const dx = centerX - ufo.x;
                const dy = centerY - ufo.y;
                const dist = Math.hypot(dx, dy);

                ufo.x += dx * 0.08;
                ufo.y += dy * 0.08;
                ufo.scale = dist / 500;
                if (ufo.scale < 0) ufo.scale = 0;
                ufo.rotation += 0.5;

                if (dist < 10 || ufo.scale < 0.01) {
                    ufo.state = 'RESPAWNING';
                    ufo.respawnTimer = 120; // 2 Seconds (Requested)
                    ufo.x = -500;
                }

            } else if (ufo.state === 'RESPAWNING') {
                ufo.respawnTimer--;
                if (ufo.respawnTimer <= 0) {
                    ufo.state = 'IDLE';
                    ufo.x = -100; // Fly in
                    ufo.y = Math.random() * height * 0.5;
                    ufo.scale = 1;
                    ufo.targetX = width * 0.2;
                }
            }

            // Trail
            if (ufo.scale > 0.1 && (ufo.state === 'WARP_TO_SUN' || Math.abs(ufo.x - ufo.targetX) > 10)) {
                ufo.trail.push({ x: ufo.x, y: ufo.y, life: 1.0, size: Math.random() * 4 + 2 });
            }
            for (let i = ufo.trail.length - 1; i >= 0; i--) {
                ufo.trail[i].life -= 0.1;
                if (ufo.trail[i].life <= 0) ufo.trail.splice(i, 1);
            }
        };

        const render = () => {
            time++;
            coreTimer++;
            if (coreTimer > 200) {
                coreIndex = (coreIndex + 1) % CORE_ITEMS.length;
                coreTimer = 0;
            }

            // 1. Background - DEEP SPACE
            const bg = ctx.createLinearGradient(0, 0, 0, height);
            bg.addColorStop(0, '#000000');
            bg.addColorStop(1, '#0a0a1a');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);

            // 2. Stars - WARP SPEED EFFECT
            ctx.fillStyle = "white";
            stars.forEach(star => {
                star.y += star.speed;
                if (star.y > height) {
                    star.y = 0;
                    star.x = Math.random() * width;
                }
                // Warp Trail effect
                ctx.globalAlpha = star.opacity;
                ctx.beginPath();
                ctx.ellipse(star.x, star.y, star.size, star.size * 4, 0, 0, Math.PI * 2); // Elongated
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // 3. UFO
            updateUFO();
            // Trail
            ufo.trail.forEach(p => {
                ctx.globalAlpha = p.life * 0.6;
                ctx.fillStyle = '#00ffff';
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size * ufo.scale, 0, Math.PI * 2); ctx.fill();
            });
            ctx.globalAlpha = 1;
            // Body
            if (ufo.scale > 0.01) {
                ctx.save();
                ctx.translate(ufo.x, ufo.y);
                ctx.rotate(ufo.rotation);
                ctx.scale(ufo.scale, ufo.scale);
                ctx.font = "40px Arial";
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText("🛸", 0, 0);

                if (ufo.state === 'IDLE') {
                    ctx.rotate(-ufo.rotation);
                    ctx.font = "bold 13px Inter, sans-serif";
                    const metrics = ctx.measureText(ufo.message);
                    const boxW = metrics.width + 20;
                    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10;
                    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
                    ctx.beginPath();
                    ctx.roundRect(-boxW / 2, -50, boxW, 26, 10);
                    ctx.fill();
                    ctx.beginPath(); ctx.moveTo(-5, -24); ctx.lineTo(5, -24); ctx.lineTo(0, -18); ctx.fill();
                    ctx.shadowBlur = 0; ctx.fillStyle = "#000";
                    ctx.fillText(ufo.message, 0, -37);
                }
                ctx.restore();
            }

            // 4. CORE SUN - Stronger "Sun Effect"
            const sunSize = 95 * scale * 2.0;

            // Enhanced Sun Glow
            const glow = ctx.createRadialGradient(centerX, centerY, sunSize * 0.2, centerX, centerY, sunSize * 3.0);
            glow.addColorStop(0, 'rgba(255, 140, 20, 0.7)'); // Intense Core
            glow.addColorStop(0.3, 'rgba(255, 60, 0, 0.3)'); // Mid Fire
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(centerX, centerY, sunSize * 3.0, 0, Math.PI * 2); ctx.fill();

            // Core Emoji
            const pulse = 1 + Math.sin(time * 0.08) * 0.03; // Faster pulse
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(pulse, pulse);
            ctx.rotate(time * 0.015);
            ctx.shadowColor = 'rgba(255, 100, 0, 0.8)'; // Strong shadow
            ctx.shadowBlur = 50;
            ctx.font = `${sunSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(CORE_ITEMS[coreIndex], 0, 0);
            ctx.restore();

            // 5. PLANETS
            const items = [];
            planets.forEach(p => {
                p.angle += p.speed;
                const radiusX = p.distance * scale * 2.6;
                const radiusY = p.distance * scale * 0.7;
                items.push({
                    emoji: p.emoji, x: centerX + Math.cos(p.angle) * radiusX,
                    y: centerY + Math.sin(p.angle) * radiusY * 0.5 + p.heightOffset,
                    z: Math.sin(p.angle) * radiusY,
                    scale: 1 + Math.sin(p.angle) * 0.3,
                    rotation: time * 0.02 + p.rotation
                });
            });

            items.sort((a, b) => a.z - b.z);

            items.forEach(item => {
                ctx.save();
                ctx.translate(item.x, item.y);
                const fontSize = 45 * item.scale;
                ctx.font = `${fontSize}px Arial`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.globalAlpha = 0.3 + (item.scale * 0.7) * 0.7;
                ctx.rotate(item.rotation);
                ctx.fillText(item.emoji, 0, 0);
                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const scrollToContent = () => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    };

    const ScrollReveal = ({ children, delay = 0 }) => (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );

    return (
        <div ref={scrollRef} className="min-h-screen text-white font-sans overflow-x-hidden relative bg-black selection:bg-orange-500 selection:text-white">

            <canvas ref={canvasRef} className="fixed inset-0 z-0 cursor-crosshair" />

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

            <main className="relative z-10 flex flex-col w-full pointer-events-none">

                {/* HERO SECTION */}
                <section className="min-h-screen flex flex-col justify-center px-6 max-w-7xl mx-auto w-full">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8 mt-12 md:mt-0 order-1 pointer-events-auto">
                            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-400 text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-md">
                                    <Zap className="w-3 h-3 fill-orange-400" /> Premium Delivery v3.0
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
                                        Explore <ArrowDown className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                        <div className="h-[40vh] md:h-auto w-full order-2 pointer-events-none" />
                    </div>
                </section>

                {/* SCROLLING INFO - TRANSPARENT BACKGROUND (SPACE VISIBLE) */}
                {/* Changed from bg-black/60 to bg-transparent or very low opacity */}
                <div id="about" className="relative w-full backdrop-blur-sm pt-20 pb-32 border-t border-white/5 pointer-events-auto">
                    <section className="px-6 max-w-7xl mx-auto space-y-32">

                        {/* FEATURES */}
                        <div>
                            <ScrollReveal>
                                <div className="text-center mb-16">
                                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-lg">Galactic Capabilities</h2>
                                    <p className="text-gray-300 max-w-2xl mx-auto">Engineered for the modern space traveler.</p>
                                </div>
                            </ScrollReveal>
                            <div className="grid md:grid-cols-3 gap-6">
                                {[
                                    { title: "Hyper-Local", desc: "Precision landing at your pod.", icon: <MapPin className="w-8 h-8 text-rose-500" /> },
                                    { title: "Warp Speed", desc: "Hot food, defying physics.", icon: <Zap className="w-8 h-8 text-yellow-400" /> },
                                    { title: "Live Telemetry", desc: "Real-time pilot tracking.", icon: <Truck className="w-8 h-8 text-blue-400" /> },
                                    { title: "Quantum Pay", desc: "Encrypted & instant.", icon: <ShieldCheck className="w-8 h-8 text-green-400" /> },
                                    { title: "Cosmic Menu", desc: "Dishes from 500+ sectors.", icon: <Utensils className="w-8 h-8 text-purple-400" /> },
                                    { title: "Command Center", desc: "Full control via app.", icon: <Smartphone className="w-8 h-8 text-orange-400" /> }
                                ].map((item, i) => (
                                    <ScrollReveal key={i} delay={i * 0.05}>
                                        <div className="group p-8 rounded-[2rem] bg-white/[0.05] border border-white/5 hover:border-orange-500/20 transition-all hover:-translate-y-2 hover:bg-white/10 text-center h-full backdrop-blur-md">
                                            <div className="mb-6 inline-block opacity-80 group-hover:opacity-100 transition-opacity p-3 bg-white/5 rounded-2xl">{item.icon}</div>
                                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                            <p className="text-gray-400 text-sm font-medium">{item.desc}</p>
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>

                    </section>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
