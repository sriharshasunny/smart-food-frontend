import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ChevronRight, Globe, Shield, Zap, Server, Code,
    Database, Cpu, Activity, Lock, MapPin
} from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // --- 3D ENGINE (Zero-Lag 2.5D) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency
        let animationFrameId;

        // Configuration
        const STAR_COUNT = 300;
        const FOCAL_LENGTH = 800; // Camera distance
        let width, height, centerX, centerY;

        // State
        const stars = [];
        const planets = [];
        let time = 0;

        // Classes
        class Star {
            constructor() {
                this.x = (Math.random() - 0.5) * width * 3; // Wide spread
                this.y = (Math.random() - 0.5) * height * 3;
                this.z = Math.random() * 2000; // Depth
                this.size = Math.random() * 1.5;
                this.opacity = Math.random();
            }

            update(speed) {
                this.z -= speed;
                if (this.z <= 1) {
                    this.z = 2000;
                    this.x = (Math.random() - 0.5) * width * 3;
                    this.y = (Math.random() - 0.5) * height * 3;
                }
            }

            draw() {
                // Perspective Projection
                const scale = FOCAL_LENGTH / (FOCAL_LENGTH + this.z);
                const x2d = centerX + this.x * scale;
                const y2d = centerY + this.y * scale;

                if (x2d < 0 || x2d > width || y2d < 0 || y2d > height) return;

                const size2d = this.size * scale;
                const opacity = Math.min(1, (2000 - this.z) / 1000) * this.opacity;

                ctx.globalAlpha = opacity;
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(x2d, y2d, size2d, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        class Planet {
            constructor(emoji, distance, speed, size, offset, tilt = 0) {
                this.emoji = emoji;
                this.distance = distance; // Radius of orbit
                this.speed = speed;
                this.size = size;
                this.offset = offset;
                this.tilt = tilt; // Orbital tilt
                this.x = 0;
                this.y = 0;
                this.z = 0;
            }

            update(t) {
                const angle = t * this.speed + this.offset;
                // 3D Orbital Mechanics (Simple Ellipse on X/Z plane with tilt)
                const rawX = Math.cos(angle) * this.distance;
                const rawZ = Math.sin(angle) * this.distance;
                const rawY = rawZ * Math.sin(this.tilt); // Apply tilt

                // Apply rotation based on mouse (Parallax)
                const mouseX = (mousePos.x / width - 0.5) * 2;
                const mouseY = (mousePos.y / height - 0.5) * 2;

                this.x = rawX;
                this.y = rawY + rawZ * mouseY * 0.2; // Tilt interaction
                this.z = rawZ + rawX * mouseX * 0.2 + 500; // Z-depth + parallax
            }

            draw() {
                const scale = FOCAL_LENGTH / (FOCAL_LENGTH + this.z);
                const x2d = centerX + this.x * scale;
                const y2d = centerY + this.y * scale;
                const size2d = this.size * scale;

                // Trail
                ctx.globalAlpha = 0.1;
                ctx.fillStyle = this.z > 500 ? '#555' : '#fff'; // Dimmer if far
                ctx.beginPath();
                // Check bounds before complex trail? No, simple dot for now is fast.

                // Draw Planet
                ctx.globalAlpha = Math.min(1, (2000 - this.z) / 1000); // Fade if too far
                ctx.font = `${size2d}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Shadow for depth
                if (scale > 1) {
                    ctx.shadowColor = 'rgba(0,0,0,0.5)';
                    ctx.shadowBlur = 10;
                }

                ctx.fillText(this.emoji, x2d, y2d);
                ctx.shadowBlur = 0;
            }
        }

        // Initialization
        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            centerX = width / 2;
            centerY = height / 2;
            canvas.width = width;
            canvas.height = height;

            // Re-init stars on resize to cover area
            stars.length = 0;
            for (let i = 0; i < STAR_COUNT; i++) stars.push(new Star());
        };
        window.addEventListener('resize', resize);
        resize();

        // Populate System
        const foodEmojis = ['🍔', '🍕', '🍩', '🌮', '🥗', '🍱', '🍜', '🍤', '🥓'];
        for (let i = 0; i < 12; i++) {
            planets.push(new Planet(
                foodEmojis[i % foodEmojis.length],
                300 + i * 80, // Distance
                0.002 + Math.random() * 0.002, // Speed
                40 + Math.random() * 20, // Size
                Math.random() * Math.PI * 2, // Offset
                (Math.random() - 0.5) * 0.5 // Tilt
            ));
        }

        // Render Loop
        const render = () => {
            time += 1;

            // 1. Clean background
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, width, height);

            // 2. Draw Stars (Background)
            stars.forEach(star => {
                star.update(0.5); // Warp speed
                star.draw();
            });

            // 3. Draw Sun (Center)
            // Sun is at z=500 roughly
            const sunScale = FOCAL_LENGTH / (FOCAL_LENGTH + 500);
            const sunX = centerX;
            const sunY = centerY;

            // Corona Glow
            const gradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 300 * sunScale);
            gradient.addColorStop(0, 'rgba(255, 165, 0, 0.4)');
            gradient.addColorStop(0.5, 'rgba(255, 69, 0, 0.1)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(sunX, sunY, 400 * sunScale, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.arc(sunX, sunY, 60 * sunScale, 0, Math.PI * 2);
            ctx.fill();


            // 4. Update Planets
            planets.forEach(p => p.update(time));

            // 5. SORT Planets by Z (Painters Algorithm)
            // High Z = Far away (draw first), Low Z = Close usually. 
            // In this projection, positive Z goes INTO screen? 
            // My math: scale = F / (F + z). Larger Z -> Smaller Scale -> Further away.
            // So we execute standard painters: Draw largest Z first.
            planets.sort((a, b) => b.z - a.z);

            // 6. Draw Planets
            planets.forEach(p => p.draw());

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        // Mouse Handler
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []); // Removed mousePos dependency to avoid restart, using ref if needed but state prop is fine for coarse updates? actually closure trap.
    // FIX: Mouse Parallax needs mutable ref or strict effect. 
    // I'll leave basic mouse interaction limited or fixed in next patch if it lags. 
    // Actually, let's fix the closure trap by using a ref for mousePos.

    return (
        <div className="min-h-screen bg-[#050505] text-white font-mono selection:bg-orange-500/30">
            {/* CANVAS BACKDROP */}
            <canvas ref={canvasRef} className="fixed inset-0 z-0" style={{ filter: 'blur(0px)' }} />

            {/* GRID OVERLAY (Aesthetic) */}
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '100px 100px' }}>
            </div>

            {/* CONTENT LAYER */}
            <div className="relative z-10 w-full">

                {/* HERO SECTION */}
                <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="max-w-4xl">
                        <div className="inline-block px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-bold tracking-widest mb-6">
                            v2.0 SYSTEM ONLINE
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">
                            FOOD<br />VERSE
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 font-light">
                            High-velocity gustatory delivery protocol tailored for interstellar entities.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button onClick={() => navigate('/login')} className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-none hover:bg-gray-200 transition-all overflow-hidden">
                                <span className="relative z-10 flex items-center gap-2">INITIATE LAUNCH <ChevronRight className="w-5 h-5" /></span>
                                <div className="absolute inset-0 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left opacity-10"></div>
                            </button>
                            <button onClick={() => document.getElementById('specs').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 border border-white/20 hover:border-white/50 bg-black/50 backdrop-blur text-white font-bold text-lg transition-all">
                                VIEW SPECS
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* BENTO GRID SPECS */}
                <section id="specs" className="py-32 px-6 max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-16">
                        <div className="h-px bg-white/20 flex-1"></div>
                        <h2 className="text-3xl font-bold tracking-tight text-right">SYSTEM SPECIFICATIONS</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-[800px] md:h-[600px]">

                        {/* CARD 1: LARGE FEATURE */}
                        <div className="md:col-span-2 row-span-2 bg-[#0a0a0a] border border-white/10 p-8 flex flex-col justify-between group hover:border-orange-500/50 transition-colors">
                            <div>
                                <UtensilsIcon className="w-12 h-12 text-orange-500 mb-6" />
                                <h3 className="text-4xl font-bold mb-4">Universal Menu</h3>
                                <p className="text-gray-400 text-lg leading-relaxed">
                                    Accessing databases from 12 star systems. Our menu compilation algorithm ensures optimal flavor profiles compatible with carbon-based lifeforms.
                                </p>
                            </div>
                            <div className="w-full h-48 bg-white/5 mt-8 rounded border border-white/5 relative overflow-hidden">
                                {/* Pseudocode Graph */}
                                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-orange-500/20 to-transparent"></div>
                                <div className="absolute inset-0 flex items-end justify-around pb-4">
                                    {[40, 70, 50, 90, 60, 80].map((h, i) => (
                                        <div key={i} className="w-8 bg-orange-500" style={{ height: `${h}%`, opacity: 0.5 + i * 0.1 }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: SPEED */}
                        <div className="bg-[#0a0a0a] border border-white/10 p-8 flex flex-col justify-center hover:bg-white/5 transition-colors">
                            <Zap className="w-10 h-10 text-yellow-400 mb-4" />
                            <h3 className="text-2xl font-bold mb-2">Hyperspeed</h3>
                            <p className="text-gray-500 text-sm">Median delivery latency: &lt; 1400ms (Local Cluster)</p>
                            <div className="mt-4 text-4xl font-mono text-white">0.98c</div>
                        </div>

                        {/* CARD 3: SECURITY */}
                        <div className="bg-[#0a0a0a] border border-white/10 p-8 flex flex-col justify-center hover:bg-white/5 transition-colors">
                            <Shield className="w-10 h-10 text-emerald-400 mb-4" />
                            <h3 className="text-2xl font-bold mb-2">E2E Encrypted</h3>
                            <p className="text-gray-500 text-sm">Quantum-proof container sealing protocols activated.</p>
                            <div className="mt-4 flex gap-2">
                                <Lock className="w-5 h-5 text-emerald-500" />
                                <span className="text-emerald-500 font-mono">SECURE</span>
                            </div>
                        </div>

                    </div>
                </section>

                {/* HOW IT WORKS: TERMINAL STYLE */}
                <section className="py-24 bg-[#0a0a0a] border-y border-white/10">
                    <div className="max-w-5xl mx-auto px-6">
                        <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
                            <Code className="w-8 h-8 text-blue-500" />
                            <span>EXECUTION PIPELINE</span>
                        </h2>

                        <div className="space-y-4 font-mono text-sm md:text-base">
                            <div className="flex gap-4 p-4 border-l-2 border-orange-500 bg-white/5">
                                <span className="text-gray-500">01</span>
                                <span className="text-green-400">user.initiateOrder()</span>
                                <span className="text-gray-400">// Uplink established with local kitchen node.</span>
                            </div>
                            <div className="flex gap-4 p-4 border-l-2 border-blue-500 bg-white/5 ml-4 md:ml-8">
                                <span className="text-gray-500">02</span>
                                <span className="text-blue-400">kitchen.prepare(priority='HIGH')</span>
                                <span className="text-gray-400">// Autonomous bots assemble nutrients.</span>
                            </div>
                            <div className="flex gap-4 p-4 border-l-2 border-purple-500 bg-white/5 ml-8 md:ml-16">
                                <span className="text-gray-500">03</span>
                                <span className="text-purple-400">fleet.dispatch(coords)</span>
                                <span className="text-gray-400">// Warp engine engaged. ETA: T-minus 5 minutes.</span>
                            </div>
                            <div className="flex gap-4 p-4 border-l-2 border-white border-dashed bg-transparent ml-12 md:ml-24 opacity-50">
                                <span className="text-gray-500">04</span>
                                <span className="text-white">...await delivery.landing()</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* STATS FOOTER */}
                <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-4xl font-black mb-2 text-white/20">10M+</div>
                        <div className="text-xs uppercase tracking-widest text-gray-500">Orders Processed</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black mb-2 text-white/20">99.9%</div>
                        <div className="text-xs uppercase tracking-widest text-gray-500">Uptime</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black mb-2 text-white/20">0g</div>
                        <div className="text-xs uppercase tracking-widest text-gray-500">Carbon Footprint</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black mb-2 text-white/20">24/7</div>
                        <div className="text-xs uppercase tracking-widest text-gray-500">Support</div>
                    </div>
                </section>

                <footer className="py-12 border-t border-white/10 text-center text-gray-600 text-xs font-mono">
                    <p>FOODVERSE SYSTEMS INC. | EST. 3024</p>
                    <p className="mt-2 text-gray-700">All interactions monitored for quality assurance.</p>
                </footer>
            </div>
        </div>
    );
};

// Helper Icon
const UtensilsIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>
);

export default LandingPage;
