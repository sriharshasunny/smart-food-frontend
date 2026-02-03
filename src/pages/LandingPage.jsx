import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Utensils, ShieldCheck, Zap, Rocket, ArrowDown, MapPin, Truck, Smartphone, Star, Clock } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;

        // --- ASSETS ---
        const FOOD_EMOJIS = ['🍔', '🍕', '🍩', '🌮', '🍱', '🍜', '🍤', '🥓', '🥨', '🍟', '🍖', '🌶️', '🥑', '🥥'];
        const CORE_ITEMS = ['🍕', '🍔', '🍩', '🥗'];
        const UFO_MESSAGES = ["Hungry? 😋", "Warp Speed! 🚀", "Pizza Time? 🍕", "Hot & Fresh! 🔥", "Order Now!", "Zoom Zoom ✨"];

        // --- STATE ---
        let width, height, centerX, centerY, scale;
        // Mouse State for smooth Parallax only (No heavy trail)
        let mouseX = 0, mouseY = 0;
        let targetMouseX = 0, targetMouseY = 0;

        // UFO STATE
        const ufo = {
            x: -100, y: 100, vx: 0, vy: 0,
            targetX: 0, targetY: 0,
            state: 'IDLE',
            rotation: 0, opacity: 1, scale: 1,
            trail: [],
            respawnTimer: 0,
            msgIndex: 0, msgTimer: 0, showMsg: true
        };

        const handleInteraction = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            targetMouseX = clientX - rect.left;
            targetMouseY = clientY - rect.top;

            // Click Hit Test
            const dist = Math.hypot(targetMouseX / window.devicePixelRatio - ufo.x, targetMouseY / window.devicePixelRatio - ufo.y); // Adjust for DPI if needed, but logic usually uses CSS pixels. Actually mouse events are CSS pixels.
            // Wait, logic variables (x,y) are usually logical pixels. 
            // We need to keep physics in logical pixels and only SCALE for drawing.

            const logicMouseX = clientX - rect.left;
            const logicMouseY = clientY - rect.top;

            const distLogic = Math.hypot(logicMouseX - ufo.x, logicMouseY - ufo.y);

            if (distLogic < 150 && ufo.state === 'IDLE') {
                ufo.state = 'WARP_TO_SUN';
                ufo.vx += (centerX - ufo.x) * 0.05;
                ufo.vy += (centerY - ufo.y) * 0.05;
            }
        };

        const handleMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            targetMouseX = e.clientX - rect.left;
            targetMouseY = e.clientY - rect.top;
        };

        window.addEventListener('mousedown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        window.addEventListener('mousemove', handleMove);

        const resize = () => {
            // HIGH DPI HANDLING (For "Premium/proffession alook")
            const dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.scale(dpr, dpr); // Normalize coordinate system to use CSS pixels

            if (width >= 768) {
                centerX = width * 0.75;
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.0013;
            } else {
                centerX = width * 0.5;
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.001;
            }
            if (ufo.state === 'IDLE') ufo.targetX = width * 0.2;
        };
        window.addEventListener('resize', resize);
        resize();

        // --- PARTICLES ---
        const planets = Array.from({ length: 12 }, (_, i) => ({
            emoji: FOOD_EMOJIS[i % FOOD_EMOJIS.length],
            angle: (i / 12) * Math.PI * 2,
            distance: 155 + (i % 2) * 60,
            speed: 0.005 + (i % 2) * 0.003,
            size: 45,
            heightOffset: (Math.random() - 0.5) * 40,
            rotation: Math.random() * Math.PI,
            rotSpeed: 0.05 + Math.random() * 0.05
        }));

        const stars = Array.from({ length: 140 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5,
            opacity: Math.random() * 0.8,
            speed: 0.2 + Math.random() * 0.6
        }));

        let time = 0;
        let coreIndex = 0, coreTimer = 0;

        // --- UPDATE ---
        const updatePhysics = () => {
            // Smooth Parallax Mouse Tracking
            mouseX += (targetMouseX - mouseX) * 0.1;
            mouseY += (targetMouseY - mouseY) * 0.1;

            // UFO Logic
            ufo.msgTimer++;
            if (ufo.msgTimer > 180) {
                ufo.msgIndex = (ufo.msgIndex + 1) % UFO_MESSAGES.length; ufo.msgTimer = 0;
            }

            if (ufo.state === 'IDLE') {
                if (Math.random() < 0.02) {
                    ufo.targetX = Math.random() * width;
                    ufo.targetY = Math.random() * (height * 0.6);
                }
                const dx = ufo.targetX - ufo.x;
                const dy = ufo.targetY - ufo.y;

                ufo.vx += dx * 0.0008;
                ufo.vy += dy * 0.0008;
                ufo.vx *= 0.96;
                ufo.vy *= 0.96;
                ufo.rotation = ufo.vx * 0.08;
                ufo.scale = 1; ufo.opacity = 1;

            } else if (ufo.state === 'WARP_TO_SUN') {
                const dx = centerX - ufo.x;
                const dy = centerY - ufo.y;
                const dist = Math.hypot(dx, dy);
                ufo.vx += dx * 0.008; ufo.vy += dy * 0.008;
                ufo.vx *= 0.90; ufo.vy *= 0.90;

                ufo.scale = Math.min(1, dist / 200);
                ufo.rotation += 0.4;
                if (dist < 15 || ufo.scale < 0.1) {
                    ufo.state = 'RESPAWNING'; ufo.respawnTimer = 120;
                    ufo.opacity = 0; ufo.x = -9999;
                }
            } else if (ufo.state === 'RESPAWNING') {
                ufo.respawnTimer--;
                if (ufo.respawnTimer <= 0) {
                    ufo.state = 'IDLE';
                    ufo.x = -100; ufo.y = Math.random() * height * 0.5;
                    ufo.vx = 10;
                    ufo.opacity = 1; ufo.scale = 1;
                }
            }
            ufo.x += ufo.vx; ufo.y += ufo.vy;

            // UFO Trail (Keep this, it's cool and low cost compared to mouse sparkles)
            if (ufo.opacity > 0.1 && (Math.hypot(ufo.vx, ufo.vy) > 0.5)) {
                ufo.trail.push({ x: ufo.x, y: ufo.y, life: 1.0, size: Math.random() * 4 + 2 });
            }
            for (let i = ufo.trail.length - 1; i >= 0; i--) {
                ufo.trail[i].life -= 0.08;
                if (ufo.trail[i].life <= 0) ufo.trail.splice(i, 1);
            }
        };

        // --- RENDER ---
        const render = () => {
            updatePhysics();

            time++;
            coreTimer++;
            if (coreTimer > 180) { coreIndex = (coreIndex + 1) % CORE_ITEMS.length; coreTimer = 0; }

            // 1. Background (CLEAN DEEP SPACE)
            const bg = ctx.createLinearGradient(0, 0, 0, height);
            bg.addColorStop(0, '#000000');
            bg.addColorStop(0.7, '#020205');
            bg.addColorStop(1, '#080815');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);

            // 2. Stars (Subtle Parallax)
            const parallaxX = (mouseX - width / 2) * 0.02;
            const parallaxY = (mouseY - height / 2) * 0.02;

            ctx.fillStyle = "white";
            stars.forEach(star => {
                star.y += star.speed;
                if (star.y > height) { star.y = 0; star.x = Math.random() * width; }
                const px = star.x + parallaxX * (star.size * 0.5);
                const py = star.y + parallaxY * (star.size * 0.5);
                ctx.globalAlpha = star.opacity * 0.8;
                ctx.beginPath(); ctx.arc(px, py, star.size, 0, Math.PI * 2); ctx.fill();
            });
            ctx.globalAlpha = 1;

            // 3. UFO
            ufo.trail.forEach(p => {
                ctx.globalAlpha = p.life * 0.7 * ufo.opacity;
                ctx.fillStyle = '#00ffff';
                ctx.beginPath(); ctx.arc(p.x + parallaxX, p.y + parallaxY, p.size * ufo.scale, 0, Math.PI * 2); ctx.fill();
            });
            ctx.globalAlpha = 1;

            if (ufo.opacity > 0) {
                ctx.save();
                ctx.translate(ufo.x + parallaxX, ufo.y + parallaxY);
                ctx.rotate(ufo.rotation);
                ctx.scale(ufo.scale, ufo.scale);
                ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 25;
                ctx.font = "40px Arial"; // Will look sharper now due to ctx.scale(dpr, dpr)
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText("🛸", 0, 0);

                if (ufo.state === 'IDLE' && ufo.showMsg && scale > 0.8) {
                    ctx.shadowBlur = 0; ctx.rotate(-ufo.rotation);
                    const msg = UFO_MESSAGES[ufo.msgIndex];
                    ctx.font = "bold 12px sans-serif";
                    const metrics = ctx.measureText(msg); const pad = 10;
                    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                    ctx.beginPath(); ctx.roundRect(25, -25, metrics.width + pad * 2, 30, 10); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(25, -10); ctx.lineTo(15, 0); ctx.lineTo(30, -5); ctx.fill();
                    ctx.fillStyle = "#000"; ctx.textAlign = "left";
                    ctx.fillText(msg, 25 + pad, -25 + 19);
                }
                ctx.restore();
            }

            // 4. CORE SUN
            const sunX = centerX + parallaxX * 0.5;
            const sunY = centerY + parallaxY * 0.5;

            const sunSize = 90 * scale * 2.0;
            const glow = ctx.createRadialGradient(sunX, sunY, sunSize * 0.1, sunX, sunY, sunSize * 2.8);
            glow.addColorStop(0, 'rgba(255, 140, 0, 0.3)');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(sunX, sunY, sunSize * 2.8, 0, Math.PI * 2); ctx.fill();

            const pulse = 1 + Math.sin(time * 0.05) * 0.02;
            ctx.save();
            ctx.translate(sunX, sunY);
            ctx.scale(pulse, pulse);
            ctx.rotate(time * 0.015);
            ctx.shadowColor = 'rgba(255, 100, 0, 0.4)'; ctx.shadowBlur = 25;
            ctx.font = `${sunSize}px Arial`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(CORE_ITEMS[coreIndex], 0, 0);
            ctx.restore();

            // 5. PLANETS
            const items = [];
            planets.forEach(p => {
                p.angle += p.speed;
                const radiusX = p.distance * scale * 2.6;
                const radiusY = p.distance * scale * 0.7;
                const x = centerX + Math.cos(p.angle) * radiusX;
                const zDepth = Math.sin(p.angle) * radiusY;
                const y = centerY + zDepth * 0.5 + p.heightOffset;
                const depthScale = 1 + (Math.sin(p.angle) * 0.3);
                items.push({
                    emoji: p.emoji, x: x + parallaxX * 0.8, y: y + parallaxY * 0.8,
                    z: zDepth, scale: depthScale, size: p.size,
                    rotation: time * p.rotSpeed + p.rotation,
                    opacity: 0.3 + (depthScale * 0.7)
                });
            });

            items.sort((a, b) => a.z - b.z);

            items.forEach(item => {
                ctx.save();
                ctx.translate(item.x, item.y);
                const fontSize = item.size * item.scale;
                ctx.font = `${fontSize}px Arial`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.globalAlpha = item.opacity;
                ctx.rotate(item.rotation);
                ctx.fillText(item.emoji, 0, 0);
                ctx.restore();
            });

            // REMOVED Sparkle Mouse Trail (Requested: "remove heavy cursor animation")

            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('mousemove', handleMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const scrollToContent = () => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    };

    const FastFade = ({ children, delay = 0 }) => (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 0.2, delay: delay }}
            className="w-full"
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
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-8 py-3 flex items-center gap-8 shadow-2xl">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
                            <Rocket className="w-5 h-5 text-orange-500" />
                            <span className="font-black text-lg tracking-tight">FoodVerse</span>
                        </motion.div>
                        <div className="flex items-center gap-3">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/login')} className="px-5 py-2 text-xs font-bold hover:text-white text-gray-300 transition-colors">
                                Login
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/signup')} className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-rose-600 text-white text-xs font-black rounded-full shadow-lg">
                                SIGN UP
                            </motion.button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col w-full pointer-events-none">

                {/* HERO */}
                <section className="min-h-screen flex flex-col justify-center px-6 max-w-7xl mx-auto w-full">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8 mt-12 md:mt-0 order-1 pointer-events-auto">
                            <FastFade>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-400 text-[10px] font-black uppercase tracking-widest mb-6">
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
                                    <motion.button whileHover={{ scale: 1.05, backgroundColor: "#fff" }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/login')} className="px-10 py-4 bg-white text-black font-black rounded-full shadow-xl flex items-center justify-center gap-2 min-w-[180px]">
                                        Order Now <ChevronRight className="w-5 h-5" />
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }} whileTap={{ scale: 0.95 }} onClick={scrollToContent} className="px-10 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2 min-w-[180px]">
                                        Explore <ArrowDown className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </FastFade>
                        </div>
                        <div className="h-[40vh] md:h-auto w-full order-2 pointer-events-none" />
                    </div>
                </section>

                {/* INFO */}
                <div id="about" className="relative w-full pb-32 pointer-events-auto">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black z-[-1]" />

                    <section className="px-6 max-w-7xl mx-auto space-y-32 pt-20">
                        <div>
                            <FastFade>
                                <div className="text-center mb-16">
                                    <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Galactic Capabilities</h2>
                                    <p className="text-gray-400 max-w-2xl mx-auto">Engineered for the modern space traveler.</p>
                                </div>
                            </FastFade>
                            <div className="grid md:grid-cols-3 gap-6">
                                {[
                                    { title: "Hyper-Local", desc: "Precision landing at your pod.", icon: <MapPin className="w-8 h-8 text-rose-500" /> },
                                    { title: "Warp Speed", desc: "Hot food, defying physics.", icon: <Zap className="w-8 h-8 text-yellow-400" /> },
                                    { title: "Live Telemetry", desc: "Real-time pilot tracking.", icon: <Truck className="w-8 h-8 text-blue-400" /> },
                                    { title: "Quantum Pay", desc: "Encrypted & instant.", icon: <ShieldCheck className="w-8 h-8 text-green-400" /> },
                                    { title: "Cosmic Menu", desc: "Dishes from 500+ sectors.", icon: <Utensils className="w-8 h-8 text-purple-400" /> },
                                    { title: "Command Center", desc: "Full control via app.", icon: <Smartphone className="w-8 h-8 text-orange-400" /> }
                                ].map((item, i) => (
                                    <FastFade key={i} delay={i * 0.02}>
                                        <div className="group p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-orange-500/20 transition-all hover:bg-white/5 text-center h-full">
                                            <div className="mb-6 inline-block opacity-80 group-hover:opacity-100 transition-opacity p-3 bg-white/5 rounded-2xl">{item.icon}</div>
                                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                            <p className="text-gray-500 text-sm font-medium">{item.desc}</p>
                                        </div>
                                    </FastFade>
                                ))}
                            </div>
                        </div>

                        <FastFade>
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
                        </FastFade>

                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <FastFade>
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
                            </FastFade>
                            <FastFade delay={0.1}>
                                <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-gradient-to-br from-orange-500/10 to-purple-600/10 flex items-center justify-center group">
                                    <div className="absolute inset-0 bg-black/40" />
                                    <div className="relative text-center p-8 bg-black/60 rounded-3xl border border-white/10 max-w-xs transition-transform transform group-hover:-translate-y-1">
                                        <Clock className="w-10 h-10 text-orange-400 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold mb-2">24/7 Service</h3>
                                        <p className="text-sm text-gray-300">Our drones never sleep. Late night cravings or early morning fuel, we are online.</p>
                                    </div>
                                </div>
                            </FastFade>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
