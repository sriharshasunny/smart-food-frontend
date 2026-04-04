import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Utensils, ShieldCheck, Zap, Rocket, ArrowDown, MapPin, Truck, Smartphone, Star, Clock } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const scrollRef = useRef(null);

    // --- CANVAS ENGINE v3.0 — Depth + Scroll Follow + Fire Trail + Asteroids ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let animationFrameId;

        const FOOD_EMOJIS = ['🍔', '🍕', '🍩', '🌮', '🍱', '🍜', '🍤', '🥩', '🥑', '🥞', '🥨', '🍗', '🌭', '🥪'];
        const CORE_ITEMS  = ['🍕', '🍔', '🍩', '🥗', '🌮', '🍱', '🍜', '🍤'];
        const UFO_MESSAGES = ["Hungry? 😋", "Warp Speed! 🚀", "Pizza Time? 🍕", "Order Now!", "Zoom! ✨"];

        // --- dimensions ---
        let width  = window.innerWidth;
        let height = window.innerHeight;
        let isMobile = width < 768;
        let centerX = width * 0.75;
        let centerY = height * 0.5;
        let scale   = Math.min(width, height) * 0.0013;

        // --- scroll tracking (lightweight, no DOM reads in rAF) ---
        let scrollY    = 0; // current smooth scroll
        let rawScrollY = window.scrollY;
        let scrollVel  = 0; // for star warp effect
        const onScroll = () => { rawScrollY = window.scrollY; };
        window.addEventListener('scroll', onScroll, { passive: true });

        // --- UFO entity ---
        const ufo = {
            pos: { x: 120, y: 150 },
            vel: { x: 0, y: 0 },
            target: { x: 120, y: 150 },
            state: 'IDLE',
            rotation: 0, opacity: 1, scale: 1,
            trail: [], sparks: [],
            msgIndex: 0, msgTimer: 0, showMsg: true,
            idleTimer: 0, floatOffset: 0
        };

        // --- input ---
        let targetMouse = { x: 0, y: 0 };
        let mouse = { x: 0, y: 0 };

        const onMouseMove = (e) => {
            if (width > 0 && height > 0) {
                targetMouse.x = (e.clientX / width)  - 0.5;
                targetMouse.y = (e.clientY / height) - 0.5;
            }
        };
        const handleInteraction = (e) => {
            const rect = canvas.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            const lx = cx - rect.left, ly = cy - rect.top;
            if (width > 0 && height > 0) {
                targetMouse.x = cx / width  - 0.5;
                targetMouse.y = cy / height - 0.5;
            }
            if (Math.hypot(lx - ufo.pos.x, ly - ufo.pos.y) < 80 && ufo.state === 'IDLE') {
                ufo.state = 'WARP_TO_SUN';
            }
        };

        const resize = () => {
            if (!canvas) return;
            width  = window.innerWidth;
            height = window.innerHeight;
            const mobileView = width < 768;
            const dpr = mobileView ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);
            canvas.width  = width  * dpr;
            canvas.height = height * dpr;
            canvas.style.width  = width  + 'px';
            canvas.style.height = height + 'px';
            ctx.scale(dpr, dpr);
            isMobile = mobileView;
            if (isMobile) { centerX = width * 0.5; centerY = height * 0.75; scale = Math.min(width, height) * 0.001; }
            else          { centerX = width * 0.75; centerY = height * 0.5;  scale = Math.min(width, height) * 0.0013; }
        };

        // --- STARS — 3-layer depth with scroll parallax ---
        const starCount = isMobile ? 20 : 55;
        const stars = Array.from({ length: starCount }, () => {
            const layer = Math.floor(Math.random() * 3); // 0=far, 1=mid, 2=near
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                layer,
                size: 0.4 + layer * 0.6 + Math.random() * 0.6,
                baseOpacity: 0.25 + layer * 0.25 + Math.random() * 0.2,
                speed: 8 + layer * 18,     // scroll parallax speed
                phase: Math.random() * Math.PI * 2,
            };
        });

        // --- SHOOTING STARS ---
        let shootingStars = [];
        const spawnShootingStar = () => {
            if (isMobile && Math.random() > 0.4) return;
            shootingStars.push({ x: Math.random() * width, y: -50,
                length: 60 + Math.random() * 80, speed: 18 + Math.random() * 22,
                angle: Math.PI / 4 + (Math.random() * 0.3 - 0.15), life: 1 });
        };

        // --- DUST ---
        const dustCount = isMobile ? 12 : 35;
        const dust = Array.from({ length: dustCount }, () => ({
            x: Math.random() * width, y: Math.random() * height,
            size: Math.random() * 1.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.2 + 0.05
        }));

        // --- ORBITING SATELLITES ---
        const orbitingCount = isMobile ? 2 : 3;
        const orbitingFood = Array.from({ length: orbitingCount }, (_, i) => ({
            emoji: FOOD_EMOJIS[(i * 3) % FOOD_EMOJIS.length],
            angle: (i / orbitingCount) * Math.PI * 2,
            radius: (isMobile ? 85 : 125) + i * 28,
            speed: 0.7 + i * 0.35,
            size: isMobile ? 24 : 33
        }));

        // --- FALLING FOOD DROPS (top → bottom, simple) ---
        let asteroids = [];
        let asteroidTimer = 0;
        const MAX_ASTEROIDS = isMobile ? 2 : 4;
        const spawnAsteroid = () => {
            if (asteroids.length >= MAX_ASTEROIDS) return;
            const size = 20 + Math.random() * 16;      // emoji size px
            const ax   = size + Math.random() * (width - size * 2); // random X across screen
            const vy   = 55 + Math.random() * 65;                   // fall speed px/s
            asteroids.push({
                x: ax,
                y: -size,                               // start just above screen
                vx: (Math.random() - 0.5) * 12,        // tiny horizontal drift
                vy,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.8, // gentle spin
                emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
                size,
                opacity: 0,   // fade in from top
            });
        };

        // --- EMITTED & METEORITE (kept as stubs) ---
        let emittedFoods = [];
        let foodMeteorites = [];
        const spawnFoodBurst = () => {};

        // --- TIMING ---
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

                // Update central food: Mobile every 2.0s, Desktop every 3.0s
                const switchTime = isMobile ? 2.0 : 3.0;

                if (coreTimer > switchTime) {
                    coreIndex = (coreIndex + 1) % CORE_ITEMS.length;
                    coreTimer = 0;
                    spawnFoodBurst(); // Trigger burst on change (Both views)
                }

                // Orbiting satellites
                orbitingFood.forEach(o => { o.angle += o.speed * dt; });

                // --- FALLING FOOD UPDATE ---
                asteroidTimer += dt;
                const spawnInterval = isMobile ? 4.0 : 2.5;
                if (asteroidTimer > spawnInterval) { spawnAsteroid(); asteroidTimer = 0; }

                for (let i = asteroids.length - 1; i >= 0; i--) {
                    const a = asteroids[i];
                    a.opacity = Math.min(1, a.opacity + dt * 2);
                    a.x += a.vx * dt;
                    a.y += a.vy * dt;   // straight down
                    a.rot += a.rotSpeed * dt;
                    // cull when below screen
                    if (a.y > height + a.size + 20) asteroids.splice(i, 1);
                }

                // emitted food (kept, no-op spawnFoodBurst)
                for (let i = emittedFoods.length - 1; i >= 0; i--) {
                    const f = emittedFoods[i];
                    f.x += f.vx * dt; f.y += f.vy * dt;
                    f.life -= 0.5 * dt; f.scale += 0.5 * dt; f.rot += f.rotSpeed * dt;
                    if (f.life <= 0) emittedFoods.splice(i, 1);
                }

                // --- UFO Logic (scroll-following) ---
                // Smoothly track scroll: map scrollY fraction into vertical position band
                scrollVel += (rawScrollY - scrollY) * 0.08;
                scrollVel *= 0.85;
                scrollY  += scrollVel;

                ufo.floatOffset += dt * 2;
                if (ufo.state === 'IDLE') {
                    ufo.idleTimer += dt;
                    ufo.msgTimer  += dt;
                    if (ufo.msgTimer > 3) {
                        ufo.msgIndex = (ufo.msgIndex + 1) % UFO_MESSAGES.length;
                        ufo.msgTimer = 0; ufo.showMsg = true;
                    }

                    // --- SCROLL FOLLOW ---
                    // Convert rawScrollY to a vertical position on canvas, clamped within safe zone
                    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
                    const scrollFrac = Math.min(rawScrollY / maxScroll, 1);
                    // UFO floats in left 35% of screen, vertically tracks scroll
                    const scrollTargetY = height * 0.12 + scrollFrac * (height * 0.72);
                    const scrollTargetX = width * (isMobile ? 0.5 : 0.15) + Math.sin(ufo.floatOffset * 0.5) * (isMobile ? 60 : 90);

                    // Only re-target if not already heading somewhere interesting
                    const roamChance = isMobile ? 1.2 : 0.6;
                    if (Math.random() < roamChance * dt) {
                        ufo.target.x = scrollTargetX + (Math.random() - 0.5) * 80;
                        ufo.target.y = scrollTargetY + (Math.random() - 0.5) * 60;
                        // avoid center food sun
                        if (Math.hypot(ufo.target.x - centerX, ufo.target.y - centerY) < 160) {
                            ufo.target.x = scrollTargetX - 180;
                        }
                    }

                    const dx = ufo.target.x - ufo.pos.x;
                    const dy = ufo.target.y - ufo.pos.y;

                    // Add Zig-Zag Sine Wave to velocity on Mobile
                    let zigzag = 0;
                    if (isMobile) {
                        zigzag = Math.sin(timestamp * 0.005) * 50;
                    }

                    ufo.vel.x += (dx + zigzag) * 0.2 * dt;
                    ufo.vel.y += dy * 0.2 * dt;
                    const friction = Math.pow(0.05, dt);
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

                    ufo.vel.x += dx * 0.3 * dt;
                    ufo.vel.y += dy * 0.3 * dt;
                    const warpFriction = Math.pow(0.02, dt);
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

                ufo.pos.x += ufo.vel.x * dt * 3.5;
                ufo.pos.y += ufo.vel.y * dt * 3.5;

                // --- UFO TRAIL UPDATE (cyan/teal — Login style) ---
                const speed = Math.hypot(ufo.vel.x, ufo.vel.y);
                if (speed > 0.3 && ufo.opacity > 0) {
                    ufo.trail.push({
                        x: ufo.pos.x,
                        y: ufo.pos.y,
                        size: (2 + Math.random() * 4) * ufo.scale,
                        opacity: 0.8,
                        life: 1.0,
                    });
                    if (ufo.trail.length > 20) ufo.trail.shift();
                }
                for (let i = ufo.trail.length - 1; i >= 0; i--) {
                    ufo.trail[i].life    -= dt * 4;
                    ufo.trail[i].size    *= 0.92;
                    ufo.trail[i].opacity *= 0.9;
                    if (ufo.trail[i].life <= 0) ufo.trail.splice(i, 1);
                }

                // Shooting Stars
                if (Math.random() < (isMobile ? 0.004 : 0.009)) spawnShootingStar();
                for (let i = shootingStars.length - 1; i >= 0; i--) {
                    const s = shootingStars[i];
                    s.x += Math.cos(s.angle) * s.speed * dt * 50;
                    s.y += Math.sin(s.angle) * s.speed * dt * 50;
                    s.life -= dt * 0.9;
                    if (s.life <= 0 || s.y > height + 100) shootingStars.splice(i, 1);
                }

                // Dust
                dust.forEach(d => {
                    d.x += d.vx * dt * 50; d.y += d.vy * dt * 50;
                    if (d.x < 0) d.x = width; if (d.x > width) d.x = 0;
                    if (d.y < 0) d.y = height; if (d.y > height) d.y = 0;
                });


                // === 2. DRAW ===
                ctx.clearRect(0, 0, width, height);

                // Nebulas
                const nebulaCount = isMobile ? 1 : 2;
                ctx.save(); ctx.globalCompositeOperation = 'screen';
                for (let i = 0; i < nebulaCount; i++) {
                    const nx = width * (0.2 + i * 0.5) + Math.sin(coreTimer * 0.18 + i) * 100;
                    const ny = height * (0.3 + i * 0.4) + Math.cos(coreTimer * 0.1  + i) * 100;
                    const nGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, width * 0.4);
                    nGrad.addColorStop(0, i === 0 ? 'rgba(80,20,150,0.13)' : 'rgba(20,80,150,0.13)');
                    nGrad.addColorStop(1, 'rgba(0,0,0,0)');
                    ctx.fillStyle = nGrad;
                    ctx.beginPath(); ctx.arc(nx, ny, width * 0.4, 0, Math.PI * 2); ctx.fill();
                }
                ctx.restore();

                // smooth input
                mouse.x += (targetMouse.x - mouse.x) * 0.08;
                mouse.y += (targetMouse.y - mouse.y) * 0.08;

                // --- STARS — 3-layer depth with scroll-driven parallax warp ---
                // warp factor: stronger when scrolling fast
                const scrollWarpFactor = Math.min(Math.abs(scrollVel) / 12, 1.0);
                ctx.fillStyle = 'white';
                stars.forEach(s => {
                    const layerSpeed = [0.04, 0.14, 0.32][s.layer];
                    const parallaxY  = (rawScrollY * layerSpeed) % height;

                    let rx = s.x + mouse.x * s.layer * 18;
                    let ry = (s.y - parallaxY + height) % height;

                    // Always draw as dot — no streak lines
                    ctx.globalAlpha = s.baseOpacity;
                    ctx.beginPath();
                    ctx.arc(rx, ry, s.size, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.globalAlpha = 1;

                // Draw Dust
                ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                dust.forEach(d => {
                    ctx.globalAlpha = d.opacity;
                    ctx.beginPath(); ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2); ctx.fill();
                });
                ctx.globalAlpha = 1;

                // Draw Shooting Stars
                ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                ctx.lineCap = "round";
                shootingStars.forEach(star => {
                    ctx.globalAlpha = star.life;
                    ctx.lineWidth = 1 + (1 - star.life);
                    ctx.beginPath();
                    ctx.moveTo(star.x, star.y);
                    ctx.lineTo(star.x - Math.cos(star.angle) * star.length, star.y - Math.sin(star.angle) * star.length);
                    ctx.stroke();
                });
                ctx.globalAlpha = 1;

                // ===== FALLING FOOD DRAW (simple: no trail) =====
                asteroids.forEach(a => {
                    ctx.save();
                    ctx.translate(a.x, a.y);
                    ctx.rotate(a.rot);
                    ctx.globalAlpha = a.opacity;
                    ctx.font = `${a.size}px Arial`;
                    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillText(a.emoji, 0, 0);
                    ctx.restore();
                    ctx.globalAlpha = 1;
                });

                // ===== UFO TRAIL — Login.jsx style (cyan/teal) =====
                if (ufo.opacity > 0 && ufo.trail.length > 0) {
                    ufo.trail.forEach(p => {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(0, 255, 200, ${p.opacity * ufo.opacity})`;
                        ctx.fill();
                    });
                }

                // ===== UFO BODY — exact Login.jsx style =====
                if (ufo.opacity > 0) {
                    const renderY = ufo.pos.y + Math.sin(ufo.floatOffset) * 8; // gentle float bob

                    ctx.save();
                    ctx.globalAlpha = ufo.opacity;
                    ctx.translate(ufo.pos.x, renderY);
                    ctx.rotate(ufo.rotation);
                    ctx.scale(ufo.scale, ufo.scale);

                    // Green shadow glow — EXACTLY like Login
                    ctx.shadowColor = 'rgba(0, 255, 100, 0.8)';
                    ctx.shadowBlur  = 20;

                    // UFO emoji — clean, no rings
                    ctx.font = '40px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🛸', 0, 0);

                    ctx.shadowBlur = 0;
                    ctx.restore();

                    // White message bubble ABOVE ufo — exactly Login.jsx style
                    if (ufo.state === 'IDLE' && ufo.showMsg && ufo.opacity > 0.8) {
                        const msg = UFO_MESSAGES[ufo.msgIndex];
                        ctx.save();
                        ctx.translate(ufo.pos.x, renderY - 50);
                        ctx.font = 'bold 14px Segoe UI, sans-serif';
                        const metrics = ctx.measureText(msg);
                        const boxW = metrics.width + 24, boxH = 28;

                        // White pill bubble
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = 'rgba(0,0,0,0.25)';
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
                        ctx.beginPath();
                        ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 14);
                        ctx.fill();

                        // Small downward triangle pointer
                        ctx.beginPath();
                        ctx.moveTo(-6, boxH / 2 - 2);
                        ctx.lineTo(6, boxH / 2 - 2);
                        ctx.lineTo(0, boxH / 2 + 6);
                        ctx.fill();

                        // Black text
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = '#000';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(msg, 0, 1);
                        ctx.restore();
                    }
                    ctx.globalAlpha = 1;
                }

                // Sun (Realistic Multi-Stop Gradient)
                const sunSize = 90 * scale * 2.0;

                // Add atmospheric glow behind sun
                const glowGrad = ctx.createRadialGradient(centerX, centerY, sunSize * 0.5, centerX, centerY, sunSize * 3);
                glowGrad.addColorStop(0, 'rgba(255, 150, 50, 0.4)');
                glowGrad.addColorStop(0.5, 'rgba(255, 80, 20, 0.1)');
                glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

                ctx.fillStyle = glowGrad;
                ctx.beginPath(); ctx.arc(centerX, centerY, sunSize * 3, 0, Math.PI * 2); ctx.fill();

                // Core Sun Body
                const sunGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sunSize * 1.5);
                sunGrad.addColorStop(0, 'rgba(255, 255, 200, 1)');     // Hot white/yellow core
                sunGrad.addColorStop(0.2, 'rgba(255, 200, 50, 0.9)');  // Bright orange
                sunGrad.addColorStop(0.6, 'rgba(255, 100, 20, 0.4)');  // Deep orange/red
                sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');           // Fade to space

                ctx.fillStyle = sunGrad;
                ctx.beginPath(); ctx.arc(centerX, centerY, sunSize * 1.5, 0, Math.PI * 2); ctx.fill();

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

                // Draw Orbiting Food (Restored)
                orbitingFood.forEach(satellite => {
                    satellite.angle += satellite.speed * dt;
                    const sx = centerX + Math.cos(satellite.angle) * satellite.radius * scale * 1.5;
                    // Apply slight perspective tilt via Y scaling
                    const sy = centerY + Math.sin(satellite.angle) * satellite.radius * scale * 0.5;

                    ctx.save();
                    ctx.translate(sx, sy);
                    // Counter-rotate to keep emoji upright, or let it spin
                    ctx.rotate(satellite.angle * 0.5);
                    ctx.scale(scale * 1.5, scale * 1.5);
                    ctx.font = `${satellite.size}px Arial`;
                    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

                    // Add subtle shadow for depth
                    ctx.shadowColor = 'rgba(0,0,0,0.5)';
                    ctx.shadowBlur = 10;

                    ctx.fillText(satellite.emoji, 0, 0);
                    ctx.restore();
                });

                // (legacy meteorites — empty array, no cost)
            } catch (err) { /* silent */ }
            animationFrameId = requestAnimationFrame(loop);
        };

        // Resize & Start
        let resizeTimeout;
        const debouncedResize = () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(resize, 150); };
        window.addEventListener('resize', debouncedResize);
        window.addEventListener('mousedown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction, { passive: true });
        window.addEventListener('mousemove', onMouseMove);

        resize();
        animationFrameId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', debouncedResize);
            window.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const scrollToContent = () => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    };

    const ScrollReveal = ({ children, delay = 0, depth = false }) => (
        <motion.div
            initial={depth
                ? { opacity: 0, y: 60, rotateX: 15, scale: 0.92, z: -80 }
                : { opacity: 0, y: 40, rotateX: 8, scale: 0.95 }
            }
            whileInView={depth
                ? { opacity: 1, y: 0, rotateX: 0, scale: 1, z: 0 }
                : { opacity: 1, y: 0, rotateX: 0, scale: 1 }
            }
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: 'preserve-3d', perspective: 1200 }}
        >
            {children}
        </motion.div>
    );

    return (
        <div ref={scrollRef} className="min-h-screen text-white font-sans overflow-x-hidden relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#020205] to-black selection:bg-orange-500 selection:text-white">

            {/* GOO SVG FILTER */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -10" result="goo" />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>

            {/* GOO BLOBS — background hero layer */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ filter: 'url(#goo)' }}>
                <motion.div
                    className="absolute rounded-full"
                    style={{ width: 420, height: 420, background: 'radial-gradient(circle, rgba(255,90,0,0.22) 0%, rgba(255,30,0,0.08) 60%, transparent 100%)', top: '10%', left: '-8%' }}
                    animate={{ x: [0, 60, -30, 0], y: [0, 40, -20, 0], scale: [1, 1.12, 0.94, 1] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute rounded-full"
                    style={{ width: 320, height: 320, background: 'radial-gradient(circle, rgba(180,0,255,0.18) 0%, rgba(80,0,180,0.07) 60%, transparent 100%)', top: '30%', right: '-5%' }}
                    animate={{ x: [0, -50, 25, 0], y: [0, -30, 50, 0], scale: [1, 0.9, 1.08, 1] }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                />
                <motion.div
                    className="absolute rounded-full"
                    style={{ width: 260, height: 260, background: 'radial-gradient(circle, rgba(255,160,0,0.16) 0%, rgba(200,80,0,0.06) 60%, transparent 100%)', bottom: '15%', left: '35%' }}
                    animate={{ x: [0, 40, -60, 0], y: [0, -50, 30, 0], scale: [1, 1.15, 0.88, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
                />
                <motion.div
                    className="absolute rounded-full"
                    style={{ width: 200, height: 200, background: 'radial-gradient(circle, rgba(0,200,255,0.12) 0%, rgba(0,100,200,0.05) 60%, transparent 100%)', top: '60%', left: '15%' }}
                    animate={{ x: [0, -40, 70, 0], y: [0, 60, -40, 0], scale: [1, 1.1, 0.92, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
                />
            </div>

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
                            <ScrollReveal depth>
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
                                    <ScrollReveal key={i} delay={i * 0.08} depth>
                                        <motion.div
                                            className="group p-8 rounded-[2rem] bg-white/[0.05] backdrop-blur-xl border border-white/10 hover:border-orange-500/30 transition-all text-center h-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                                            whileHover={{ y: -10, scale: 1.03, boxShadow: '0 24px 60px rgba(255,100,0,0.18)', borderColor: 'rgba(255,120,0,0.4)' }}
                                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                        >
                                            <div className="mb-6 inline-block opacity-90 group-hover:opacity-100 transition-opacity p-4 bg-white/5 rounded-2xl shadow-lg ring-1 ring-white/10">{item.icon}</div>
                                            <h3 className="text-xl font-bold mb-3 text-white/90">{item.title}</h3>
                                            <p className="text-gray-400 text-sm font-medium leading-relaxed">{item.desc}</p>
                                        </motion.div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>

                        {/* STATS */}
                        <ScrollReveal depth>
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
                            <ScrollReveal depth>
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
                            <ScrollReveal delay={0.2} depth>
                                <motion.div
                                    className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-gradient-to-br from-orange-500/10 to-purple-600/10 flex items-center justify-center group"
                                    whileHover={{ scale: 1.02, boxShadow: '0 40px 90px rgba(255,80,0,0.2)' }}
                                    transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                                >
                                    <div className="absolute inset-0 bg-black/40" />
                                    {/* Animated goo blob inside card */}
                                    <motion.div
                                        className="absolute w-40 h-40 rounded-full"
                                        style={{ background: 'radial-gradient(circle, rgba(255,100,0,0.28) 0%, transparent 70%)', filter: 'blur(24px)' }}
                                        animate={{ x: [-20, 30, -10, -20], y: [-10, 20, -25, -10], scale: [1, 1.2, 0.85, 1] }}
                                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                    <div className="relative text-center p-8 bg-black/30 backdrop-blur-xl rounded-3xl border border-white/10 max-w-xs transform group-hover:-translate-y-2 transition-transform">
                                        <Clock className="w-10 h-10 text-orange-400 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold mb-2">24/7 Service</h3>
                                        <p className="text-sm text-gray-300">Our drones never sleep. Late night cravings or early morning fuel, we are online.</p>
                                    </div>
                                </motion.div>
                            </ScrollReveal>
                        </div>
                    </section>
                </div>
            </main>
        </div >
    );
};

export default LandingPage;
