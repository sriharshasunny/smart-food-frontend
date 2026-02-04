import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Utensils, ShieldCheck, Zap, Rocket, ArrowDown, MapPin, Truck, Smartphone, Star, Clock } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const scrollRef = useRef(null);

    // --- NEW DELTA-TIME PHYSICS ENGINE (v2.0) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        let animationFrameId;

        // Assets
        const FOOD_EMOJIS = ['🍔', '🍕', '🍩', '🌮', '🍱', '🍜', '🍤', '🥓', '🥨', '🍟', '🍖', '🌶️', '🥑', '🥥'];
        const CORE_ITEMS = ['🍕', '🍔', '🍩', '🥗', '⚡', '🚀'];
        const UFO_MESSAGES = ["Hungry? 😋", "Warp Speed! 🚀", "Pizza Time? 🍕", "Order Now!", "Zoom! ✨"];

        // State Targets
        let width, height, centerX, centerY, scale;

        // Entity: UFO
        const ufo = {
            pos: { x: -100, y: 100 },
            vel: { x: 0, y: 0 },
            target: { x: 0, y: 0 },
            state: 'IDLE', // IDLE, WARP_TO_SUN, RESPAWNING
            rotation: 0,
            opacity: 1,
            scale: 1,
            trail: [],
            msgIndex: 0,
            msgTimer: 0,
            showMsg: true,
            idleTimer: 0
        };

        // Inputs
        let mouse = { x: 0, y: 0 };

        const handleInteraction = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const logicX = clientX - rect.left;
            const logicY = clientY - rect.top;

            const dist = Math.hypot(logicX - ufo.pos.x, logicY - ufo.pos.y);
            // Hitbox 100px
            if (dist < 100 && ufo.state === 'IDLE') {
                ufo.state = 'WARP_TO_SUN';
            }
        };

        const resize = () => {
            // Optimization: Cap DPR at 1.5 for performance while maintaining good quality
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);

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
                ufo.target.x = width * 0.2; // Default resting spot
            }
        };

        // Entities: Planets
        const planets = Array.from({ length: 12 }, (_, i) => ({
            emoji: FOOD_EMOJIS[i % FOOD_EMOJIS.length],
            angle: (i / 12) * Math.PI * 2,
            distance: 180 + (i % 2) * 80,
            orbitSpeed: 0.15 + (i % 2) * 0.1, // Radians per second
            size: 45,
            heightOffset: (Math.random() - 0.5) * 50,
            rotation: Math.random() * Math.PI,
            rotSpeed: 1.0 // Rotation per second
        }));

        // Entities: Stars
        const stars = Array.from({ length: 90 }, () => ({
            x: Math.random() * 2000,
            y: Math.random() * 1000,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.8,
            speed: 20 + Math.random() * 30 // Pixels per second
        }));

        // Timing
        let lastTime = 0;
        let coreIndex = 0;
        let coreTimer = 0;

        // --- GAME LOOP ---
        const loop = (timestamp) => {
            if (!lastTime) lastTime = timestamp;
            // Delta Time in Seconds (cap at 0.1 to prevent huge jumps on lag spikes)
            const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
            lastTime = timestamp;

            // 1. UPDATE PHYSICS

            // Core Logic
            coreTimer += dt;
            if (coreTimer > 2.5) { // Change every 2.5s
                coreIndex = (coreIndex + 1) % CORE_ITEMS.length;
                coreTimer = 0;
            }

            // UFO Logic
            if (ufo.state === 'IDLE') {
                ufo.idleTimer += dt;

                // Change Message every 3s
                ufo.msgTimer += dt;
                if (ufo.msgTimer > 3) {
                    ufo.msgIndex = (ufo.msgIndex + 1) % UFO_MESSAGES.length;
                    ufo.msgTimer = 0;
                    ufo.showMsg = true;
                }

                // Wander AI: Change target occasionally
                if (Math.random() < 1.0 * dt) { // approx once per second probability
                    ufo.target.x = Math.random() * width;
                    ufo.target.y = Math.random() * (height * 0.6);
                }

                // Spring/Ease Movement
                const dx = ufo.target.x - ufo.pos.x;
                const dy = ufo.target.y - ufo.pos.y;

                // Acceleration = Force / Mass
                // Simplification for smooth UI: Velocity += (Dist * SpeedFactor) * dt
                ufo.vel.x += dx * 0.5 * dt;
                ufo.vel.y += dy * 0.5 * dt;

                // Friction
                const friction = Math.pow(0.05, dt); // Higher friction for stability
                ufo.vel.x *= friction;
                ufo.vel.y *= friction;

                ufo.rotation = ufo.vel.x * 0.05;
                ufo.scale = 1;
                ufo.opacity = 1;

            } else if (ufo.state === 'WARP_TO_SUN') {
                const dx = centerX - ufo.pos.x;
                const dy = centerY - ufo.pos.y;
                const dist = Math.hypot(dx, dy);

                // Strong pull to center
                ufo.vel.x += dx * 20.0 * dt;
                ufo.vel.y += dy * 20.0 * dt;

                // Less friction for "slingshot" feel
                const warpFriction = Math.pow(0.1, dt);
                ufo.vel.x *= warpFriction;
                ufo.vel.y *= warpFriction;

                ufo.scale = Math.max(0, dist / 400);
                ufo.rotation += 10 * dt; // Fast spin

                if (dist < 20 || ufo.scale < 0.05) {
                    ufo.state = 'RESPAWNING';
                    ufo.idleTimer = 4; // Use as countdown
                    ufo.opacity = 0;
                    ufo.pos.x = -1000;
                }
            } else if (ufo.state === 'RESPAWNING') {
                ufo.idleTimer -= dt;
                if (ufo.idleTimer <= 0) {
                    ufo.state = 'IDLE';
                    ufo.pos.x = -100;
                    ufo.pos.y = Math.random() * height * 0.5;
                    ufo.vel.x = 200; // Burst in pixels/sec
                    ufo.opacity = 1;
                    ufo.target.x = width * 0.2;
                }
            }

            // Apply Velocity
            ufo.pos.x += ufo.vel.x * dt * 8; // Scale factor for pixel movement
            ufo.pos.y += ufo.vel.y * dt * 8;

            // Update Trail
            if (ufo.opacity > 0.1 && (Math.abs(ufo.vel.x) > 0.5 || ufo.state === 'WARP_TO_SUN')) {
                // Add trail particle
                ufo.trail.push({ x: ufo.pos.x, y: ufo.pos.y, life: 1.0, size: Math.random() * 3 + 2 });
            }
            // Update Trail Life
            for (let i = ufo.trail.length - 1; i >= 0; i--) {
                ufo.trail[i].life -= 2.0 * dt; // Fade out in 0.5s
                if (ufo.trail[i].life <= 0) ufo.trail.splice(i, 1);
            }


            // 2. DRAW
            ctx.clearRect(0, 0, width, height); // Clear (CSS does background)

            // Draw Stars
            ctx.fillStyle = "white";
            stars.forEach(s => {
                s.y += s.speed * dt;
                if (s.y > height) { s.y = -10; s.x = Math.random() * width; }
                if (s.opacity > 0.3) {
                    ctx.globalAlpha = s.opacity;
                    ctx.fillRect(s.x, s.y, s.size, s.size);
                }
            });
            ctx.globalAlpha = 1;

            // Draw UFO Trail
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ufo.trail.forEach(t => {
                ctx.rect(t.x, t.y, t.size * ufo.scale, t.size * ufo.scale);
            });
            ctx.fill();

            // Draw UFO
            if (ufo.opacity > 0) {
                ctx.save();
                ctx.translate(ufo.pos.x, ufo.pos.y);
                ctx.rotate(ufo.rotation);
                ctx.scale(ufo.scale, ufo.scale);
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 15;
                ctx.font = "40px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText("🛸", 0, 0);

                // Message Bubble
                if (ufo.state === 'IDLE' && ufo.showMsg && scale > 0.8) {
                    ctx.shadowBlur = 0;
                    ctx.rotate(-ufo.rotation); // Keep text level
                    const msg = UFO_MESSAGES[ufo.msgIndex];
                    ctx.font = "bold 12px sans-serif";
                    const metrics = ctx.measureText(msg);
                    const pad = 12;
                    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                    // Bubble body
                    ctx.beginPath();
                    ctx.roundRect(25, -30, metrics.width + pad * 2, 34, 8);
                    ctx.fill();
                    // Bubble tail
                    ctx.beginPath(); ctx.moveTo(25, -10); ctx.lineTo(18, 0); ctx.lineTo(35, -5); ctx.fill();
                    ctx.fillStyle = "#000";
                    ctx.fillText(msg, 25 + pad, -30 + 17);
                }
                ctx.restore();
            }

            // Draw Sun
            const sunSize = 90 * scale * 2.0;
            const glow = ctx.createRadialGradient(centerX, centerY, sunSize * 0.1, centerX, centerY, sunSize * 2.5);
            glow.addColorStop(0, 'rgba(255, 120, 50, 0.6)');
            glow.addColorStop(0.5, 'rgba(100, 50, 255, 0.2)');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(centerX, centerY, sunSize * 2.5, 0, Math.PI * 2); ctx.fill();

            // Core Emoji
            const pulse = 1 + Math.sin(timestamp * 0.003) * 0.03;
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(pulse, pulse);
            ctx.shadowColor = 'rgba(255, 140, 0, 0.6)'; ctx.shadowBlur = 40;
            ctx.font = `${sunSize}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(CORE_ITEMS[coreIndex], 0, 0);
            ctx.restore();

            // Draw Planets
            planets.forEach(p => {
                p.angle += p.orbitSpeed * dt;

                const radiusX = p.distance * scale * 2.6;
                const radiusY = p.distance * scale * 0.7;

                const x = centerX + Math.cos(p.angle) * radiusX;
                const zDepth = Math.sin(p.angle) * radiusY;
                const y = centerY + zDepth * 0.5 + p.heightOffset;

                const depthScale = 1 + (Math.sin(p.angle) * 0.3);

                ctx.save();
                ctx.translate(x, y);
                const fontSize = p.size * depthScale;
                ctx.font = `${fontSize}px Arial`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.globalAlpha = 0.3 + (depthScale * 0.7);
                ctx.rotate(p.rotation + (timestamp * 0.001 * p.rotSpeed));
                ctx.fillText(p.emoji, 0, 0);
                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(loop);
        };

        let resizeTimeout;
        const debouncedResize = () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(resize, 100); };
        window.addEventListener('resize', debouncedResize);
        window.addEventListener('mousedown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);

        // Init
        resize();
        animationFrameId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', debouncedResize);
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
        <div ref={scrollRef} className="min-h-screen text-white font-sans overflow-x-hidden relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#020205] to-black selection:bg-orange-500 selection:text-white">

            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            {/* NAVBAR */}
            <nav className="fixed w-full z-50 top-6 px-4 pointer-events-none">
                <div className="max-w-fit mx-auto pointer-events-auto">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-8 py-3 flex items-center gap-8 shadow-2xl">
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
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-400 text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-sm">
                                    <Zap className="w-3 h-3 fill-orange-400" /> Premium Delivery v3.0
                                </div>
                                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black leading-[0.95] tracking-tighter mb-8 drop-shadow-xl">
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
                                    <button onClick={scrollToContent} className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full backdrop-blur-sm transition-colors flex items-center justify-center gap-2 min-w-[180px]">
                                        Explore <ArrowDown className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                        <div className="h-[40vh] md:h-auto w-full order-2 pointer-events-none" />
                    </div>
                </section>

                {/* SCROLLING INFO */}
                <div id="about" className="relative w-full bg-black/60 pt-20 pb-32 border-t border-white/5 pointer-events-auto">
                    <section className="px-6 max-w-7xl mx-auto space-y-32">
                        {/* FEATURES GRID */}
                        <div>
                            <ScrollReveal>
                                <div className="text-center mb-16">
                                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Galactic Capabilities</h2>
                                    <p className="text-gray-400 max-w-2xl mx-auto">Engineered for the modern space traveler.</p>
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
                                        <div className="group p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-orange-500/20 transition-all hover:-translate-y-2 hover:bg-white/5 text-center h-full">
                                            <div className="mb-6 inline-block opacity-80 group-hover:opacity-100 transition-opacity p-3 bg-white/5 rounded-2xl">{item.icon}</div>
                                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                            <p className="text-gray-500 text-sm font-medium">{item.desc}</p>
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>

                        {/* STATS */}
                        <ScrollReveal>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/5 bg-white/[0.02] rounded-[3rem]">
                                {[
                                    { label: "Active Pilots", val: "12,000+" },
                                    { label: "Sectors Served", val: "540" },
                                    { label: "Avg Delivery", val: "12 min" },
                                    { label: "Happy Aliens", val: "2.5 M+" }
                                ].map((stat, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.val}</div>
                                        <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>

                        {/* WHY US */}
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <ScrollReveal>
                                <div className="space-y-6">
                                    <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">Our Mission</div>
                                    <h2 className="text-4xl md:text-5xl font-black leading-tight">Food that travels<br />across dimensions.</h2>
                                    <p className="text-gray-400 text-lg leading-relaxed">
                                        We don't just deliver food; we bridge culinary worlds. From the spicy nebulas of Sector 7 to the comfort synthesisers of Earth, we bring it all to your doorstep.
                                    </p>
                                    <ul className="space-y-4 pt-4">
                                        {[
                                            "Freshness locked in stasis fields",
                                            "Zero-G prepared delicacies",
                                            "Drone pilots with elite certification"
                                        ].map((pt, i) => (
                                            <li key={i} className="flex items-center gap-3 text-gray-300 font-medium">
                                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center"><Star className="w-3 h-3 text-green-400" /></div>
                                                {pt}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </ScrollReveal>
                            <ScrollReveal delay={0.2}>
                                <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-gradient-to-br from-orange-500/10 to-purple-600/10 flex items-center justify-center group">
                                    <div className="absolute inset-0 bg-black/40" />
                                    <div className="relative text-center p-8 bg-black/30 backdrop-blur-xl rounded-3xl border border-white/10 max-w-xs transform group-hover:-translate-y-2 transition-transform">
                                        <Clock className="w-10 h-10 text-orange-400 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold mb-2">24/7 Service</h3>
                                        <p className="text-sm text-gray-300">Our drones never sleep. Late night cravings or early morning fuel, we are online.</p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
