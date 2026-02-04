import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Utensils, ShieldCheck, Zap, Rocket, ArrowDown, MapPin, Truck, Smartphone, Star, Clock } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const scrollRef = useRef(null);

    // --- NEW DELTA-TIME PHYSICS ENGINE (v2.2 - Robust Edition) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Safety: Ensure Context
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let animationFrameId;

        // Assets
        const FOOD_EMOJIS = ['🍔', '🍕', '🍩', '🌮', '🍱', '🍜', '🍤', '🥓', '🥨', '🍟', '🍖', '🌶️', '🥑', '🥥'];
        const CORE_ITEMS = ['🍕', '🍔', '🍩', '🥗', '🌮', '🍱'];
        const UFO_MESSAGES = ["Hungry? 😋", "Warp Speed! 🚀", "Pizza Time? 🍕", "Order Now!", "Zoom! ✨"];

        // State Targets
        let width = window.innerWidth;
        let height = window.innerHeight;
        let isMobile = width < 768; // New Flag
        let centerX = width * 0.75;
        let centerY = height * 0.5;
        let scale = Math.min(width, height) * 0.0013;

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
            idleTimer: 0,
            floatOffset: 0
        };

        // Inputs - Smoothed for 3D feel
        let targetMouse = { x: 0, y: 0 };
        let mouse = { x: 0, y: 0 }; // Current smoothed pos

        const handleInteraction = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const logicX = clientX - rect.left;
            const logicY = clientY - rect.top;

            // Parallax Input
            if (width > 0 && height > 0) {
                targetMouse.x = (clientX / width) - 0.5;
                targetMouse.y = (clientY / height) - 0.5;
            }

            const dist = Math.hypot(logicX - ufo.pos.x, logicY - ufo.pos.y);
            if (dist < 100 && ufo.state === 'IDLE') {
                ufo.state = 'WARP_TO_SUN';
            }
        };

        const resize = () => {
            if (!canvas) return;
            width = window.innerWidth;
            height = window.innerHeight;

            // OPTIMIZATION: Max Speed on Mobile (Cap DPR at 1.0)
            const mobileView = width < 768;
            const dpr = mobileView ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            // Force CSS dimensions
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';

            ctx.scale(dpr, dpr);

            if (width >= 768) {
                isMobile = false;
                centerX = width * 0.75;
                centerY = height * 0.5;
                scale = Math.min(width, height) * 0.0013;
            } else {
                isMobile = true;
                centerX = width * 0.5;
                centerY = height * 0.75; // Lower 3/4th of screen for mobile
                scale = Math.min(width, height) * 0.001;
            }
            if (ufo.state === 'IDLE') {
                ufo.target.x = width * (isMobile ? 0.5 : 0.2);
            }
        };

        // Entities: Planets
        const planets = Array.from({ length: 4 }, (_, i) => ({
            emoji: FOOD_EMOJIS[i % FOOD_EMOJIS.length],
            angle: (i / 4) * Math.PI * 2,
            distance: 180 + (i % 2) * 80,
            orbitSpeed: 0.08 + (i % 2) * 0.05,
            size: 55,
            heightOffset: (Math.random() - 0.5) * 30,
            rotation: Math.random() * Math.PI,
            rotSpeed: 0.3
        }));

        // Entities: Stars (Optimized Count)
        // Entities: Stars (Optimized Count)
        const stars = Array.from({ length: 50 }, () => ({
            x: Math.random() * width, // Use dynamic width
            y: Math.random() * height,
            z: Math.random() * 2 + 0.1, // Depth for 3D effect
            size: Math.random() * 2 + 1, // Increased size
            baseOpacity: Math.random() * 0.7 + 0.3, // Increased min opacity
            phase: Math.random() * Math.PI * 2,
            speed: 5 + Math.random() * 10
        }));

        // Entities: Shooting Stars
        let shootingStars = [];
        const spawnShootingStar = () => {
            if (Math.random() < 0.002) {
                shootingStars.push({
                    x: Math.random() * width,
                    y: Math.random() * (height * 0.5),
                    vx: -100 - Math.random() * 100,
                    vy: 50 + Math.random() * 50,
                    life: 1.0,
                    length: 50 + Math.random() * 50
                });
            }
        };

        // Entities: Nebula Clouds
        const nebulas = Array.from({ length: 3 }, (_, i) => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 300 + Math.random() * 200,
            color: i === 0 ? 'rgba(76, 29, 149, 0.1)' : i === 1 ? 'rgba(236, 72, 153, 0.08)' : 'rgba(59, 130, 246, 0.08)', // Slightly increased opacity
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5
        }));

        // Entities: Space Dust (Parallax & Optimized)
        const dust = Array.from({ length: 20 }, () => ({
            x: Math.random() * 2000,
            y: Math.random() * 1000,
            size: Math.random() * 1.5 + 0.5,
            depth: Math.random() * 2 + 1
        }));

        // Entities: Emitted Food (Mobile Only)
        let emittedFoods = [];
        const spawnFoodBurst = () => {
            if (!isMobile) return;
            // Burst of 4-5 items
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5 + Math.random() * 0.5;
                const speed = 60 + Math.random() * 40;
                emittedFoods.push({
                    x: centerX, y: centerY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
                    life: 1.0,
                    scale: 0.5,
                    rot: Math.random() * Math.PI,
                    rotSpeed: (Math.random() - 0.5) * 2
                });
            }
        };


        // Timing
        let lastTime = 0;
        let coreIndex = 0;
        let coreTimer = 0;

        // --- GAME LOOP ---
        const loop = (timestamp) => {
            try {
                if (!lastTime) lastTime = timestamp;
                // Robust dt: clamp between 0.01 and 0.1
                const dt = Math.max(0.01, Math.min((timestamp - lastTime) / 1000, 0.1));
                lastTime = timestamp;

                if (!width || !height || width === 0) {
                    resize();
                    if (!width) return requestAnimationFrame(loop);
                }

                // 0. SMOOTH INPUT (Lerp)
                // factor 0.1 gives a nice weight/delay to the movement
                mouse.x += (targetMouse.x - mouse.x) * 0.1;
                mouse.y += (targetMouse.y - mouse.y) * 0.1;

                // 1. UPDATE PHYSICS (Safeguarded)
                coreTimer += dt;
                // Update central food every 2.0s
                if (coreTimer > 2.0) {
                    coreIndex = (coreIndex + 1) % CORE_ITEMS.length;
                    coreTimer = 0;
                    spawnFoodBurst(); // Trigger burst on change
                }

                // Update Emitted Food
                for (let i = emittedFoods.length - 1; i >= 0; i--) {
                    const f = emittedFoods[i];
                    f.x += f.vx * dt;
                    f.y += f.vy * dt;
                    f.life -= 0.5 * dt; // 2 seconds life
                    f.scale += 0.5 * dt; // Grow slightly
                    f.rot += f.rotSpeed * dt;
                    if (f.life <= 0) emittedFoods.splice(i, 1);
                }

                // UFO Logic
                ufo.floatOffset += dt * 2;
                if (ufo.state === 'IDLE') {
                    ufo.idleTimer += dt;
                    ufo.msgTimer += dt;
                    if (ufo.msgTimer > 3) {
                        ufo.msgIndex = (ufo.msgIndex + 1) % UFO_MESSAGES.length;
                        ufo.msgTimer = 0;
                        ufo.showMsg = true;
                    }

                    // Mobile: Roam actively with Zig-Zag and Flybys
                    const roamChance = isMobile ? 2.0 : 1.0;
                    if (Math.random() < roamChance * dt) {
                        if (isMobile) {
                            // Mobile Logic: 60% Bottom Zone, 40% Full Flyby
                            if (Math.random() < 0.6) {
                                // Bottom Zone (Safe)
                                ufo.target.x = Math.random() * width;
                                ufo.target.y = height * 0.65 + Math.random() * (height * 0.25);
                            } else {
                                // Flyby (Zig-Zag)
                                ufo.target.x = Math.random() * width;
                                ufo.target.y = Math.random() * height;
                            }

                            // AVOID CENTER (Food)
                            const distToCenter = Math.hypot(ufo.target.x - centerX, ufo.target.y - centerY);
                            if (distToCenter < 150) {
                                // Push away from center
                                ufo.target.x += (ufo.target.x < centerX ? -150 : 150);
                            }
                        } else {
                            // Desktop Standard
                            ufo.target.x = Math.random() * width;
                            ufo.target.y = Math.random() * (height * 0.6);
                        }
                    }

                    const dx = ufo.target.x - ufo.pos.x;
                    const dy = ufo.target.y - ufo.pos.y;

                    // Add Zig-Zag Sine Wave to velocity on Mobile
                    let zigzag = 0;
                    if (isMobile) {
                        zigzag = Math.sin(timestamp * 0.005) * 50;
                    }

                    ufo.vel.x += (dx + zigzag) * 0.5 * dt;
                    ufo.vel.y += dy * 0.5 * dt;
                    const friction = Math.pow(0.1, dt);
                    ufo.vel.x *= friction;
                    ufo.vel.y *= friction;

                    ufo.rotation = ufo.vel.x * 0.05 + Math.sin(ufo.floatOffset) * 0.05;

                    // Depth Effect: Smoothly scale up to 1 if just spawned
                    if (ufo.scale < 1) {
                        ufo.scale += (1 - ufo.scale) * dt * 2;
                    }
                    ufo.opacity = Math.min(1, ufo.opacity + dt);

                } else if (ufo.state === 'WARP_TO_SUN') {
                    const dx = centerX - ufo.pos.x;
                    const dy = centerY - ufo.pos.y;
                    const dist = Math.hypot(dx, dy);

                    ufo.vel.x += dx * 0.5 * dt;
                    ufo.vel.y += dy * 0.5 * dt;
                    const warpFriction = Math.pow(0.01, dt);
                    ufo.vel.x *= warpFriction;
                    ufo.vel.y *= warpFriction;

                    ufo.scale = Math.pow(Math.max(0, dist / 600), 1.5);
                    ufo.rotation += 8 * dt;

                    if (dist < 20 || ufo.scale < 0.05) {
                        ufo.state = 'RESPAWNING';
                        ufo.idleTimer = 4;
                        ufo.opacity = 0;
                        ufo.pos.x = -1000;
                        ufo.scale = 0;
                    }
                } else if (ufo.state === 'RESPAWNING') {
                    ufo.idleTimer -= dt;
                    if (ufo.idleTimer <= 0) {
                        ufo.state = 'IDLE';
                        // "Come from space" Effect
                        // Spawn at random X, restricted Y
                        ufo.pos.x = Math.random() * width;
                        if (isMobile) {
                            ufo.pos.y = height * 0.7 + (Math.random() - 0.5) * 100;
                        } else {
                            ufo.pos.y = Math.random() * height * 0.5;
                        }

                        // Start small (far away) and transparent
                        ufo.scale = 0.1;
                        ufo.opacity = 0;

                        ufo.vel.x = 0;
                        ufo.vel.y = 0;
                        ufo.rotation = 0;
                        ufo.target.x = ufo.pos.x; // Start by hovering
                        ufo.target.y = ufo.pos.y;
                    }
                }

                ufo.pos.x += ufo.vel.x * dt * 8;
                ufo.pos.y += ufo.vel.y * dt * 8;

                if (ufo.opacity > 0.1 && (Math.abs(ufo.vel.x) > 0.1 || Math.abs(ufo.vel.y) > 0.1)) {
                    const vLen = Math.hypot(ufo.vel.x, ufo.vel.y) || 1;
                    const vxNorm = ufo.vel.x / vLen;
                    const vyNorm = ufo.vel.y / vLen;
                    const offset = 20 * ufo.scale;
                    ufo.trail.push({
                        x: ufo.pos.x - vxNorm * offset,
                        y: ufo.pos.y - vyNorm * offset,
                        vx: -vxNorm * 50 + (Math.random() - 0.5) * 20,
                        vy: -vyNorm * 50 + (Math.random() - 0.5) * 20,
                        life: 1.0,
                        size: Math.random() * 6 + 4
                    });
                }
                for (let i = ufo.trail.length - 1; i >= 0; i--) {
                    const p = ufo.trail[i];
                    p.life -= 4.0 * dt;
                    p.x += p.vx * dt;
                    p.y += p.vy * dt;
                    p.size *= 0.95;
                    if (p.life <= 0) ufo.trail.splice(i, 1);
                }

                spawnShootingStar();
                for (let i = shootingStars.length - 1; i >= 0; i--) {
                    const s = shootingStars[i];
                    s.x += s.vx * dt;
                    s.y += s.vy * dt;
                    s.life -= 1.0 * dt;
                    if (s.life <= 0) shootingStars.splice(i, 1);
                }

                nebulas.forEach(n => {
                    n.x += n.vx * dt; n.y += n.vy * dt;
                    if (n.x < -n.radius) n.x = width + n.radius;
                    if (n.x > width + n.radius) n.x = -n.radius;
                });


                // 2. DRAW
                // Standard Clear
                ctx.clearRect(0, 0, width, height);

                // Draw Nebula using STANDARD blend mode to avoid invisibility issues
                ctx.globalCompositeOperation = 'source-over';
                nebulas.forEach(n => {
                    const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
                    g.addColorStop(0, n.color);
                    g.addColorStop(1, 'transparent');
                    ctx.fillStyle = g;
                    ctx.beginPath(); ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2); ctx.fill();
                });

                // Stars
                // Mobile: 3D Radial Warp | Desktop: Vertical Scroll
                ctx.fillStyle = "white";
                stars.forEach(s => {
                    if (isMobile) {
                        // 3D Radial Move
                        const dx = s.x - centerX;
                        const dy = s.y - centerY;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const angle = Math.atan2(dy, dx);
                        const speed = s.speed * (dist / 100) * dt * 2.5; // Faster near edges

                        s.x += Math.cos(angle) * speed;
                        s.y += Math.sin(angle) * speed;

                        // Reset if out of bounds
                        if (s.x < 0 || s.x > width || s.y < 0 || s.y > height) {
                            s.x = Math.random() * width;
                            s.y = Math.random() * height;
                            // Avoid center spawn to prevent "pop-in"
                            if (Math.hypot(s.x - centerX, s.y - centerY) < 50) s.x += 100;
                        }
                    } else {
                        // Vertical Scroll (Desktop)
                        s.y += s.speed * dt;
                        if (s.y > height) { s.y = -10; s.x = Math.random() * width; }
                    }

                    const opacity = s.baseOpacity + Math.sin(timestamp * 0.005 + s.phase) * 0.2;
                    if (opacity > 0.05) {
                        ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
                        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
                    }
                });
                ctx.globalAlpha = 1;

                // Dust
                ctx.fillStyle = "rgba(200, 200, 255, 0.4)";
                dust.forEach(d => {
                    const px = d.x + (mouse.x * 50 * d.depth);
                    const py = d.y + (mouse.y * 50 * d.depth);
                    const wx = (px % width + width) % width;
                    const wy = (py % height + height) % height;
                    ctx.beginPath(); ctx.arc(wx, wy, d.size, 0, Math.PI * 2); ctx.fill();
                });

                // Shooting Stars
                shootingStars.forEach(s => {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${s.life})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 0.1, s.y - s.vy * 0.1); ctx.stroke();
                });

                // UFO Trail
                ufo.trail.forEach(t => {
                    ctx.beginPath(); ctx.arc(t.x, t.y, t.size * ufo.scale, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(0, 255, 255, ${t.life * 0.6})`; ctx.fill();
                });

                // UFO
                if (ufo.opacity > 0) {
                    ctx.save();
                    ctx.translate(ufo.pos.x, ufo.pos.y);
                    ctx.rotate(ufo.rotation);
                    ctx.scale(ufo.scale, ufo.scale);

                    // No Shadow, just stroke
                    ctx.beginPath(); ctx.strokeStyle = "rgba(0, 255, 255, 0.5)"; ctx.lineWidth = 3; ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.stroke();
                    ctx.beginPath(); ctx.strokeStyle = "rgba(0, 255, 255, 0.15)"; ctx.lineWidth = 8; ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.stroke();

                    ctx.font = "40px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillText("🛸", 0, 0);

                    if (ufo.state === 'IDLE' && ufo.showMsg && scale > 0.8) {
                        ctx.rotate(-ufo.rotation);
                        const msg = UFO_MESSAGES[ufo.msgIndex];
                        ctx.font = "bold 12px sans-serif";

                        const metrics = ctx.measureText(msg);
                        const pad = 12;
                        const boxW = metrics.width + pad * 2;

                        // Sci-Fi HUD Bubble (Offset x=45 to clear UFO radius)
                        const offsetX = 45;
                        ctx.fillStyle = "rgba(0, 15, 30, 0.85)"; // Dark transparent background
                        ctx.strokeStyle = "rgba(0, 255, 255, 0.6)"; // Cyan border
                        ctx.lineWidth = 1.5;

                        ctx.beginPath();
                        ctx.roundRect(offsetX, -30, boxW, 34, 4);
                        ctx.fill();
                        ctx.stroke();

                        // Connector Line (Triangle pointing to UFO)
                        ctx.beginPath();
                        ctx.moveTo(offsetX, -5);
                        ctx.lineTo(30, 0); // Point touches UFO edge radius ~30
                        ctx.lineTo(offsetX, 5);
                        ctx.fillStyle = "rgba(0, 255, 255, 0.6)";
                        ctx.fill();

                        // Glow Text
                        ctx.shadowColor = "rgba(0, 255, 255, 0.8)";
                        ctx.shadowBlur = 4;
                        ctx.fillStyle = "#0ff"; // Cyan text
                        ctx.font = "bold 13px 'Courier New', monospace";
                        ctx.fillText(msg, offsetX + boxW / 2, -30 + 17); // Center text in box
                        ctx.shadowBlur = 0; // Reset shadow
                    }
                    ctx.restore();
                }

                // Sun
                const sunSize = 90 * scale * 2.0;
                const glow = ctx.createRadialGradient(centerX, centerY, sunSize * 0.1, centerX, centerY, sunSize * 2.5);
                glow.addColorStop(0, 'rgba(255, 120, 50, 0.6)');
                glow.addColorStop(0.5, 'rgba(100, 50, 255, 0.2)');
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow;
                ctx.beginPath(); ctx.arc(centerX, centerY, sunSize * 2.5, 0, Math.PI * 2); ctx.fill();

                // Core Emoji
                const pulse = 1 + Math.sin(timestamp * 0.003) * 0.03;
                // Mobile: Huge Pulse, Desktop: Normal
                const finalScale = isMobile ? pulse * 1.5 : pulse;

                // Draw Emitted Food (Behind Core)
                emittedFoods.forEach(f => {
                    ctx.save();
                    ctx.translate(f.x, f.y);
                    ctx.rotate(f.rotation + f.rot);
                    ctx.scale(f.scale * (isMobile ? 1.5 : 1), f.scale * (isMobile ? 1.5 : 1));
                    ctx.globalAlpha = f.life;
                    ctx.font = "30px Arial";
                    ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillText(f.emoji, 0, 0);
                    ctx.restore();
                });

                ctx.save(); ctx.translate(centerX, centerY); ctx.scale(finalScale, finalScale);
                ctx.font = `${sunSize}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                if (CORE_ITEMS[coreIndex]) {
                    ctx.fillText(CORE_ITEMS[coreIndex], 0, 0);
                }
                ctx.restore();

                // Planets (Hide on Mobile)
                if (!isMobile) {
                    planets.forEach(p => {
                        p.angle += p.orbitSpeed * dt;
                        const safeMaxRadius = width * 0.22;
                        const intendedRadius = p.distance * scale * 2.6;
                        const radiusX = Math.min(intendedRadius, safeMaxRadius);
                        const radiusY = p.distance * scale * 0.7;
                        const x = centerX + Math.cos(p.angle) * radiusX;
                        const zDepth = Math.sin(p.angle) * radiusY;
                        const y = centerY + zDepth * 0.5 + p.heightOffset;
                        const depthScale = 1 + (Math.sin(p.angle) * 0.3);

                        ctx.save(); ctx.translate(x, y);
                        const fontSize = p.size * depthScale;
                        ctx.font = `${fontSize}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                        ctx.globalAlpha = 0.7 + (depthScale * 0.3);
                        ctx.rotate(p.rotation + (timestamp * 0.001 * p.rotSpeed));
                        ctx.fillText(p.emoji, 0, 0);
                        ctx.restore();
                    });
                }

            } catch (err) {
                console.error("Animation Loop Error", err);
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        // Resize & Start
        let resizeTimeout;
        const debouncedResize = () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(resize, 100); };
        window.addEventListener('resize', debouncedResize);
        window.addEventListener('mousedown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            if (width > 0 && height > 0) {
                targetMouse.x = ((e.clientX - rect.left) / width) - 0.5;
                targetMouse.y = ((e.clientY - rect.top) / height) - 0.5;
            }
        });

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
        // Added 'relative' z-index context to container to ensure canvas (absolute) sits correctly under content but over background
        <div ref={scrollRef} className="min-h-screen text-white font-sans overflow-x-hidden relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#020205] to-black selection:bg-orange-500 selection:text-white">

            {/* CANVASES */}
            <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

            {/* Desktop Only 3D Cubes - REMOVED for Speed */}
            {/* Extended empty space for future effects if needed */}

            {/* NAVBAR */}
            <nav className="fixed w-full z-50 top-6 px-4 pointer-events-none">
                <div className="max-w-fit mx-auto pointer-events-auto">
                    <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-8 py-3 flex items-center gap-8 shadow-2xl">
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
                    </motion.div>
                </div>
            </nav >

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
                                        <div className="group p-8 rounded-[2rem] bg-white/[0.05] backdrop-blur-xl border border-white/10 hover:border-orange-500/30 transition-all hover:-translate-y-2 hover:bg-white/10 text-center h-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                                            <div className="mb-6 inline-block opacity-90 group-hover:opacity-100 transition-opacity p-4 bg-white/5 rounded-2xl shadow-lg ring-1 ring-white/10">{item.icon}</div>
                                            <h3 className="text-xl font-bold mb-3 text-white/90">{item.title}</h3>
                                            <p className="text-gray-400 text-sm font-medium leading-relaxed">{item.desc}</p>
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
        </div >
    );
};

export default LandingPage;
