import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Clock, ShieldCheck, Utensils, Star, Zap, Globe, Rocket, Heart, ArrowDown } from 'lucide-react';

// New high-quality food assets for the "Realistic" solar system
const FOOD_IMAGES = [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80", // Burger
    "https://images.unsplash.com/photo-1574484284008-59d730545264?auto=format&fit=crop&w=300&q=80", // Pizza
    "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=300&q=80", // Cake
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80", // Drinks
    "https://images.unsplash.com/photo-1563245372-f217273852cd?auto=format&fit=crop&w=300&q=80", // Sushi
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80", // Salad
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80", // BBQ
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=300&q=80", // Curry
    "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=300&q=80", // Pepperoni
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=300&q=80", // Pancake
];

const SUN_IMAGES = [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80", // Pizza Main
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80", // Salad Main
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80", // Burger Main
];

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const scrollRef = useRef(null);

    // --- REALISTIC 3D SOLAR SYSTEM ENGINE ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;

        // --- ASSET LOADER ---
        // Helper to load an image and cut it into a circle
        const loadCircularImage = (url, size) => {
            const img = new Image();
            img.src = url;
            // Native offscreen canvas creation to process it once loaded
            const pCanvas = document.createElement('canvas');
            pCanvas.width = size;
            pCanvas.height = size;
            const pCtx = pCanvas.getContext('2d');
            pCtx.imageSmoothingEnabled = true;
            pCtx.imageSmoothingQuality = 'high';

            return {
                ready: false,
                canvas: pCanvas,
                width: size,
                height: size,
                imgObj: img,
                // Process on load
                init: function () {
                    this.imgObj.onload = () => {
                        pCtx.save();
                        pCtx.beginPath();
                        pCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                        pCtx.clip();
                        pCtx.drawImage(this.imgObj, 0, 0, size, size);
                        pCtx.restore();

                        // Add Rim Lighting / Shadow for 3D effect
                        const grad = pCtx.createRadialGradient(size / 3, size / 3, size / 6, size / 2, size / 2, size / 2);
                        grad.addColorStop(0, 'rgba(255,255,255,0.1)');
                        grad.addColorStop(0.8, 'rgba(0,0,0,0.1)');
                        grad.addColorStop(1, 'rgba(0,0,0,0.6)');
                        pCtx.fillStyle = grad;
                        pCtx.fill();

                        this.ready = true;
                    };
                }
            };
        };

        // Initialize Earth/Planets
        const planetAssets = FOOD_IMAGES.map(url => {
            const asset = loadCircularImage(url, 120); // 120px resolution
            asset.init();
            return asset;
        });

        // Initialize Sun
        const sunAssets = SUN_IMAGES.map(url => {
            const asset = loadCircularImage(url, 250); // 250px resolution
            asset.init();
            return asset;
        });

        // Setup Physics
        let width, height, centerX, centerY;
        let scale = 1;
        let isMobile = false;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            isMobile = width < 768;

            if (!isMobile) { // Desktop
                centerX = width * 0.75; // Right side
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.0008;
            } else { // Mobile
                centerX = width * 0.5;
                // Position specifically where the "gap" in content is, or slightly lower
                // User wants "animnot need in some what top" => Pushing it down
                centerY = height * 0.55;
                scale = Math.min(width, height) * 0.00065;
            }
        };
        window.addEventListener('resize', resize);
        resize();

        // Init Planets Objects
        const planets = planetAssets.map((asset, i) => ({
            type: 'planet',
            assetIndex: i,
            angle: (i / planetAssets.length) * Math.PI * 2,
            distance: 180 + (i % 3) * 70 + Math.random() * 50,
            speed: 0.002 + Math.random() * 0.003, // Slower, more realistic
            size: 40 + Math.random() * 40,
            heightOffset: (Math.random() - 0.5) * 60
        }));

        // Stars
        const stars = Array.from({ length: isMobile ? 50 : 300 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            opacity: Math.random(),
            blinkSpeed: Math.random() * 0.05
        }));

        let time = 0;
        let sunIndex = 0;
        let sunTimer = 0;

        const render = () => {
            time++;
            sunTimer++;
            if (sunTimer > 200) { // Slower switch
                sunIndex = (sunIndex + 1) % sunAssets.length;
                sunTimer = 0;
            }

            // 1. Clear & Background
            const bg = ctx.createLinearGradient(0, 0, 0, height);
            bg.addColorStop(0, '#0a0a0a');
            bg.addColorStop(1, '#1a1a2e');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);

            // 2. Stars
            stars.forEach(star => {
                star.opacity += star.blinkSpeed;
                const flicker = Math.abs(Math.sin(star.opacity));
                ctx.fillStyle = `rgba(255, 255, 255, ${flicker * 0.8})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // 3. Prepare Items (Z-Indexing)
            const items = [];

            // Sun Wrapper
            items.push({
                type: 'sun',
                z: 0,
                y: centerY,
                scale: 1,
                asset: sunAssets[sunIndex]
            });

            // Planets logic
            planets.forEach(p => {
                p.angle += p.speed;
                const radiusX = p.distance * scale * 2.5; // Elliptical X
                const radiusY = p.distance * scale * 0.8; // Compressed Y for tilt

                const x = centerX + Math.cos(p.angle) * radiusX;
                // Tilt logic: Z affects Y position
                const zDepth = Math.sin(p.angle) * radiusY;
                const y = centerY + zDepth * 0.6 + p.heightOffset;

                const depthScale = 1 + (Math.sin(p.angle) * 0.35); // Perspective scaling

                items.push({
                    type: 'planet',
                    asset: planetAssets[p.assetIndex],
                    x: x,
                    y: y,
                    z: zDepth,
                    scale: depthScale,
                    size: p.size,
                    opacity: 0.8 + (depthScale * 0.2)
                });
            });

            // Sort by Z (Depth Buffer)
            items.sort((a, b) => a.z - b.z);

            // 4. Draw All
            items.forEach(item => {
                if (item.type === 'sun') {
                    // Sun Glow
                    const sunBaseSize = 120 * scale * 2.5;
                    const glow = ctx.createRadialGradient(centerX, centerY, sunBaseSize * 0.4, centerX, centerY, sunBaseSize * 2.5);
                    glow.addColorStop(0, 'rgba(255, 120, 0, 0.6)');
                    glow.addColorStop(1, 'transparent');
                    ctx.fillStyle = glow;
                    ctx.beginPath(); ctx.arc(centerX, centerY, sunBaseSize * 3, 0, Math.PI * 2); ctx.fill();

                    // Draw Sun Asset
                    if (item.asset && item.asset.ready) {
                        ctx.save();
                        ctx.translate(centerX, centerY);
                        const rotateSpeed = time * 0.002;
                        const pulse = 1 + Math.sin(time * 0.05) * 0.02; // Gentle pulse
                        ctx.scale(pulse, pulse);
                        ctx.rotate(rotateSpeed);
                        ctx.globalAlpha = 1;
                        ctx.shadowColor = "rgba(255, 100, 0, 0.8)";
                        ctx.shadowBlur = 40;
                        ctx.drawImage(item.asset.canvas, -sunBaseSize / 2, -sunBaseSize / 2, sunBaseSize, sunBaseSize);
                        ctx.restore();
                    }

                } else {
                    // Draw Planet Asset
                    if (item.asset && item.asset.ready) {
                        ctx.save();
                        ctx.translate(item.x, item.y);
                        const sizeScale = (item.size / 120) * item.scale; // 120 is native asset size
                        ctx.scale(sizeScale, sizeScale);
                        ctx.globalAlpha = item.opacity;

                        // Fake Rotation (Spinning on own axis)
                        ctx.rotate(time * 0.02);

                        ctx.drawImage(item.asset.canvas, -60, -60, 120, 120); // Draw at native size centered
                        ctx.restore();
                    }
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
        <div ref={scrollRef} className="min-h-screen text-white font-sans overflow-x-hidden relative bg-black selection:bg-orange-500 selection:text-white">

            {/* FIXED CANVAS BACKGROUND - Stays fixed while content scrolls over it if we want parallax, 
                OR absolute to scroll with flow. User said "all need scroll like text".
                If we make it 'fixed', the content scrolls OVER it, which is physically correct for a 'background'.
                If we make it 'absolute', it scrolls away. 
                Let's stick with FIXED for the background but ensure content has transparency to see it.
            */}
            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            {/* HEADER / NAVBAR */}
            <nav className="fixed w-full z-50 top-0 left-0 bg-black/60 backdrop-blur-xl border-b border-white/5 transition-all">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Rocket className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <span className="text-xl md:text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            FoodVerse
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-white transition-colors">Log In</button>
                        <button onClick={() => navigate('/signup')} className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-transform active:scale-95 shadow-lg shadow-white/10">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO CONTENT SECTION - Scrollable */}
            <main className="relative z-10 flex flex-col w-full">

                {/* HERO BLOCK */}
                <section className="min-h-screen flex flex-col justify-center pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
                    <div className="grid md:grid-cols-2 gap-12 items-center">

                        {/* LEFT TEXT (Top on mobile) */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 md:space-y-8 mt-4 md:mt-0 order-1">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-orange-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                                    <Star className="w-3 h-3 fill-orange-400" /> #1 Intergalactic Food Service
                                </div>
                                <h1 className="text-5xl sm:text-6xl md:text-8xl font-black leading-[1.05] tracking-tight mb-6 md:mb-8 drop-shadow-2xl">
                                    Taste the <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600">
                                        Future.
                                    </span>
                                </h1>
                                <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-lg mx-auto md:mx-0 leading-relaxed mb-8 md:mb-10 text-shadow-sm font-medium">
                                    Experience gravity-defying flavor. Delivered hot to your doorstep by our fleet of hyper-speed drones.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <button onClick={() => navigate('/login')} className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-orange-600/40 transition-all flex items-center justify-center gap-2 text-lg">
                                        Order Now <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button onClick={scrollToContent} className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl backdrop-blur-md transition-colors flex items-center justify-center gap-2">
                                        How it Works <ArrowDown className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT (Spacer for 3D on Desktop, or Bottom on mobile) */}
                        {/* On MOBILE, we want the animation to be visible below the text, so we leave a gap here */}
                        <div className="h-[40vh] md:h-auto w-full order-2 pointer-events-none md:pointer-events-auto" >
                            {/* The 3D animation fills this visual void */}
                        </div>

                    </div>

                    {/* SCROLL LINE INDICATOR for Mobile hint */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce md:hidden">
                        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
                        <ArrowDown className="w-4 h-4" />
                    </div>
                </section>

                {/* DETAILS SECTION (White Glass Background) */}
                <div id="about" className="relative w-full bg-black/80 backdrop-blur-xl border-t border-white/10">

                    <section className="py-20 md:py-32 px-6 max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-5xl font-black mb-6">How It Works</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                                Join the revolution in three simple steps.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "Select", desc: "Choose from thousands of premium restaurants.", icon: <Utensils className="w-8 h-8 text-orange-400" /> },
                                { title: "Order", desc: "Pay securely with quantum encryption.", icon: <ShieldCheck className="w-8 h-8 text-blue-400" /> },
                                { title: "Devour", desc: "Hyper-speed drone delivery to your coords.", icon: <Zap className="w-8 h-8 text-yellow-400" /> }
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
                                { val: "10M+", label: "Happy Eaters" },
                                { val: "500+", label: "City Zones" },
                                { val: "12m", label: "Avg Delivery" },
                                { val: "4.9", label: "App Rating" }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-2">{stat.val}</div>
                                    <div className="text-sm md:text-base text-gray-400 font-bold uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FINAL CALL TO ACTION */}
                    <section className="py-24 px-6 text-center">
                        <div className="max-w-3xl mx-auto bg-gradient-to-b from-orange-600 to-red-600 rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-orange-600/20 relative overflow-hidden group">
                            {/* Decorative Circles */}
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                            <h2 className="text-3xl md:text-5xl font-black mb-6 relative z-10">Stop Reading, Start Eating.</h2>
                            <p className="text-white/80 text-lg md:text-xl mb-10 relative z-10">
                                The best food in the galaxy is waiting for you.
                            </p>
                            <button onClick={() => navigate('/login')} className="relative z-10 px-10 py-5 bg-white text-orange-600 text-lg font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl">
                                Create Free Account
                            </button>
                        </div>

                        <footer className="mt-20 text-gray-500 text-sm">
                            <p>&copy; 2024 FoodVerse Inc. All rights reserved.</p>
                        </footer>
                    </section>
                </div>

            </main>
        </div>
    );
};

export default LandingPage;
