import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, User, Mail, Lock, CheckCircle,
    AlertCircle, ChevronRight
} from 'lucide-react';

const Auth = () => {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const canvasRef = useRef(null);
    const [mode, setMode] = useState('login');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', newPassword: '', otp: '' });
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // --- UNIFIED CANVAS ENGINE (UFO, STARS, FOOD, ASTEROIDS) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // 1. STARS - MINIMAL & BLINKING
        const stars = Array.from({ length: 80 }).map((_, i) => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            speed: Math.random() * 0.1 + 0.02,
            opacity: Math.random() * 0.6 + 0.1,
            blink: i < 5,
            blinkSpeed: 0.02 + Math.random() * 0.03,
            blinkDir: 1
        }));

        // 2. FOOD - VISIBLE BUT BALANCED
        const foodEmojis = ['🍔', '🍕', '🍩', '🌮', '🥗'];
        const foods = Array.from({ length: 5 }).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
            size: 20 + Math.random() * 20,
            dx: (Math.random() - 0.5) * 0.5,
            dy: (Math.random() - 0.5) * 0.5,
            rotation: Math.random() * Math.PI * 2,
            dr: (Math.random() - 0.5) * 0.005
        }));

        // 3. FOOD ASTEROIDS (REMOVED FOR CLEANER SPACE VIBE)

        // 4. UFO ENTITY
        const ufo = {
            x: canvas.width * 0.8,
            y: canvas.height * 0.2,
            vx: 0, vy: 0, rotation: 0,
            maxSpeed: 2.5, acceleration: 0.08, friction: 0.98,
            targetX: canvas.width * 0.5, targetY: canvas.height * 0.5,
            opacity: 1, state: 'IDLE', warpTimer: 0,
            message: "Welcome! 👋", messageTimer: 0, showMessage: true,
            trail: []
        };

        // ... UFO Logic (Same as before, collapsed for brevity in this update) ...
        const updateUFO = () => {
            ufo.messageTimer++;
            if (ufo.messageTimer > 250) {
                const msgs = ["Welcome! 👋", "Fast Delivery 🚀", "So Tasty 😋", "Order Now 🍔", "Zoom Zoom! ✨", "Pizza Time? 🍕"];
                if (Math.random() < 0.3) { ufo.message = msgs[Math.floor(Math.random() * msgs.length)]; ufo.showMessage = true; }
                ufo.messageTimer = 0;
            }
            if (ufo.state === 'IDLE') {
                const dist = Math.hypot(ufo.targetX - ufo.x, ufo.targetY - ufo.y);
                if (dist < 50) {
                    if (Math.random() < 0.02) { ufo.targetX = Math.random() * (canvas.width - 100) + 50; ufo.targetY = Math.random() * (canvas.height - 100) + 50; }
                    else if (Math.random() < 0.005) ufo.state = 'WARPING_OUT';
                } else ufo.state = 'ACCELERATING';
            } else if (ufo.state === 'ACCELERATING' || ufo.state === 'DECELERATING') {
                const dx = ufo.targetX - ufo.x, dy = ufo.targetY - ufo.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 50) ufo.state = 'IDLE';
                else { ufo.vx += (dx / dist) * ufo.acceleration; ufo.vy += (dy / dist) * ufo.acceleration; }
            } else if (ufo.state === 'WARPING_OUT') {
                ufo.opacity -= 0.08; ufo.rotation += 0.2;
                if (ufo.opacity <= 0) { ufo.opacity = 0; ufo.state = 'WARPING_IN'; ufo.x = Math.random() * (canvas.width - 100) + 50; ufo.y = Math.random() * (canvas.height - 100) + 50; ufo.vx = 0; ufo.vy = 0; ufo.targetX = ufo.x; ufo.targetY = ufo.y; ufo.trail = []; }
            } else if (ufo.state === 'WARPING_IN') {
                ufo.opacity += 0.08; ufo.rotation -= 0.2;
                if (ufo.opacity >= 1) { ufo.opacity = 1; ufo.rotation = 0; ufo.state = 'IDLE'; }
            }
            if (ufo.state !== 'WARPING_OUT' && ufo.state !== 'WARPING_IN') {
                ufo.vx *= ufo.friction; ufo.vy *= ufo.friction;
                ufo.x += ufo.vx; ufo.y += ufo.vy;
                ufo.rotation += (ufo.vx * 0.1 - ufo.rotation) * 0.1;
                const speed = Math.hypot(ufo.vx, ufo.vy);
                if (speed > 0.5) ufo.trail.push({ x: ufo.x, y: ufo.y, size: Math.random() * 4 + 2, opacity: 0.8, life: 1.0 });
            }
            for (let i = ufo.trail.length - 1; i >= 0; i--) {
                ufo.trail[i].life -= 0.08; ufo.trail[i].size *= 0.9;
                if (ufo.trail[i].life <= 0) ufo.trail.splice(i, 1);
            }
            if (ufo.x < 0 || ufo.x > canvas.width) { ufo.vx *= -0.8; ufo.x = Math.max(0, Math.min(canvas.width, ufo.x)); }
            if (ufo.y < 0 || ufo.y > canvas.height) { ufo.vy *= -0.8; ufo.y = Math.max(0, Math.min(canvas.height, ufo.y)); }
            return { x: ufo.x, y: ufo.y + Math.sin(Date.now() / 600) * 8, rotation: ufo.rotation, opacity: ufo.opacity, trail: ufo.trail };
        };

        const render = () => {
            ctx.fillStyle = '#020205'; ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Stars
            stars.forEach(star => {
                star.y += star.speed;
                if (star.y > canvas.height) { star.y = 0; star.x = Math.random() * canvas.width; }
                if (star.blink) {
                    star.opacity += star.blinkSpeed * star.blinkDir;
                    if (star.opacity > 1) { star.opacity = 1; star.blinkDir = -1; }
                    if (star.opacity < 0.2) { star.opacity = 0.2; star.blinkDir = 1; }
                }
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill();
            });

            // Food Background
            foods.forEach(food => {
                food.x += food.dx; food.y += food.dy; food.rotation += food.dr;
                if (food.x < -50) food.x = canvas.width + 50; if (food.x > canvas.width + 50) food.x = -50;
                if (food.y < -50) food.y = canvas.height + 50; if (food.y > canvas.height + 50) food.y = -50;
                ctx.save(); ctx.translate(food.x, food.y); ctx.rotate(food.rotation);
                ctx.font = `${food.size}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.globalAlpha = 0.5; ctx.fillText(food.emoji, 0, 0); ctx.restore();
            });

            // Asteroids Removed

            // UFO
            const ufoPos = updateUFO();
            if (ufoPos.opacity > 0) {
                ufoPos.trail.forEach(p => {
                    ctx.beginPath(); ctx.arc(p.x, p.y + ufoPos.y - ufo.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(0, 255, 200, ${p.opacity * ufoPos.opacity})`; ctx.fill();
                });
                ctx.save(); ctx.globalAlpha = ufoPos.opacity; ctx.translate(ufoPos.x, ufoPos.y); ctx.rotate(ufoPos.rotation);
                ctx.shadowColor = "rgba(0, 255, 100, 0.8)"; ctx.shadowBlur = 20;
                ctx.font = "40px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🛸", 0, 0); ctx.restore();

                if (ufo.showMessage && ufoPos.opacity > 0.8) {
                    ctx.save(); ctx.translate(ufoPos.x, ufoPos.y - 50);
                    ctx.font = "bold 14px Segoe UI, sans-serif";
                    const metrics = ctx.measureText(ufo.message);
                    const boxW = metrics.width + 24; const boxH = 28;
                    ctx.shadowBlur = 10; ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
                    ctx.beginPath(); ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 14); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(-6, boxH / 2 - 2); ctx.lineTo(6, boxH / 2 - 2); ctx.lineTo(0, boxH / 2 + 6); ctx.fill();
                    ctx.shadowBlur = 0; ctx.fillStyle = "#000"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(ufo.message, 0, 1); ctx.restore();
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
    }, []);

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(null); };
    const switchMode = (mode) => { setMode(mode); setStep(1); setError(null); setSuccessMsg(null); };

    const handleLogin = async (e) => { e.preventDefault(); setLoading(true); try { const res = await login(formData.email, formData.password); if (res.success) navigate('/home'); else setError(res.message); } catch { setError('Error'); } finally { setLoading(false); } };
    const handleRegister = async (e) => { e.preventDefault(); setLoading(true); try { const res = await register(formData.name, formData.email, formData.password); if (res.success) navigate('/home'); else setError(res.message); } catch { setError('Error'); } finally { setLoading(false); } };
    const handleSendResetOtp = async (e) => { e.preventDefault(); setLoading(true); try { const res = await fetch(`${API_URL}/api/auth/send-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email, type: 'reset' }) }); const data = await res.json(); if (res.ok) { setStep(2); if (data.devCode) console.log(data.devCode); } else setError(data.message); } catch { setError('Error'); } finally { setLoading(false); } };
    const handleResetPassword = async (e) => { e.preventDefault(); setLoading(true); try { const res = await fetch(`${API_URL}/api/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email, otp: formData.otp, newPassword: formData.newPassword }) }); if (res.ok) { setSuccessMsg('Success!'); setTimeout(() => switchMode('login'), 2000); } else setError('Failed'); } catch { setError('Error'); } finally { setLoading(false); } };

    return (
        <div className="h-[100dvh] w-full text-white flex flex-col items-center justify-center relative overflow-hidden font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-[#050510] to-black">
            <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-[420px] px-4 md:px-0 flex flex-col items-center">
                <div className="text-center mb-6 max-h-[25vh]">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-4 md:mb-5 z-20 relative"><Globe className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-md" /></motion.div>
                    <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight drop-shadow-xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{mode === 'login' ? 'Access Node' : mode === 'register' ? 'Initialize Link' : 'Emergency Override'}</h1>
                    <p className="text-gray-400 text-sm font-medium tracking-wide">{mode === 'login' ? 'Establish secure neural link to the fleet' : mode === 'register' ? 'Register your coordinates in the system' : 'Transmitting recovery protocols'}</p>
                </div>

                <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }} className="w-full bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_0_60px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] relative flex flex-col justify-center">
                    {mode !== 'forgot' && (<div className="flex bg-black/40 rounded-full p-1 border border-white/5 relative shadow-inner mb-6"><motion.div className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg" animate={{ left: mode === 'register' ? 'calc(50% + 2px)' : '4px' }} transition={{ type: "spring", stiffness: 400, damping: 30 }} /><button onClick={() => switchMode('login')} className={`flex-1 py-2.5 text-xs md:text-sm font-bold tracking-wide z-10 relative text-white rounded-full transition-colors`}>Authentication</button><button onClick={() => switchMode('register')} className={`flex-1 py-2.5 text-xs md:text-sm font-bold tracking-wide z-10 relative text-white rounded-full transition-colors`}>Registration</button></div>)}

                    <AnimatePresence>
                        {error && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 mb-4 flex items-start gap-2 text-red-200 text-xs shadow-[0_0_15px_rgba(239,68,68,0.1)]"><AlertCircle className="w-4 h-4 flex-shrink-0" /> <span className="pt-0.5">{error}</span></motion.div>}
                        {successMsg && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-green-500/10 border border-green-500/30 rounded-2xl p-3 mb-4 flex items-start gap-2 text-green-200 text-xs shadow-[0_0_15px_rgba(34,197,94,0.1)]"><CheckCircle className="w-4 h-4 flex-shrink-0" /> <span className="pt-0.5">{successMsg}</span></motion.div>}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {mode === 'login' && (
                            <motion.form key="login" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1.5"><label className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Fleet Identity</label><div className="relative group"><Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" /><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-gray-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.08] focus:outline-none transition-all duration-300 shadow-inner" placeholder="pilot@foodverse.com" required /></div></div>
                                <div className="space-y-1.5"><label className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Access Key</label><div className="relative group"><Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" /><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-gray-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.08] focus:outline-none transition-all duration-300 shadow-inner" placeholder="••••••••" required /></div></div>
                                <div className="flex justify-end pt-1"><button type="button" onClick={() => switchMode('forgot')} className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline underline-offset-4 tracking-wide font-bold transition-all">Lost Connection?</button></div>
                                <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded-xl font-bold tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_25px_rgba(99,102,241,0.5)] mt-4 text-sm group border border-indigo-400/30">{loading ? 'Establishing Link...' : <>Engage Drive <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}</button>
                            </motion.form>
                        )}
                        {mode === 'register' && (
                            <motion.form key="register" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-1.5"><label className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Pilot Designation</label><div className="relative group"><User className="absolute left-4 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" /><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-gray-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.08] focus:outline-none transition-all duration-300 shadow-inner" placeholder="Cmdr. Shepard" required /></div></div>
                                <div className="space-y-1.5"><label className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Fleet Identity</label><div className="relative group"><Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" /><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-gray-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.08] focus:outline-none transition-all duration-300 shadow-inner" placeholder="pilot@foodverse.com" required /></div></div>
                                <div className="space-y-1.5"><label className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Access Key</label><div className="relative group"><Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" /><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm placeholder-gray-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.08] focus:outline-none transition-all duration-300 shadow-inner" placeholder="••••••••" required /></div></div>
                                <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded-xl font-bold tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_25px_rgba(99,102,241,0.5)] mt-4 text-sm group border border-indigo-400/30">{loading ? 'Preparing Pod...' : <>Join System <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}</button>
                            </motion.form>
                        )}
                        {mode === 'forgot' && (<motion.form key="forgot" className="space-y-4" onSubmit={step === 1 ? handleSendResetOtp : handleResetPassword}><button type="button" onClick={() => switchMode('login')} className="text-[10px] md:text-[11px] font-black text-gray-400 hover:text-white mb-4 flex items-center uppercase tracking-[0.15em] transition-colors"><ChevronRight className="w-3 h-3 rotate-180 mr-1" /> Abort Sequence</button>{step === 1 ? (<div className="space-y-4"><div className="space-y-1.5"><label className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Fleet Identity</label><div className="relative group"><Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" /><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.08] focus:outline-none transition-all duration-300 shadow-inner" placeholder="pilot@foodverse.com" required /></div></div><button type="submit" disabled={loading} className={`w-full py-3.5 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded-xl font-bold tracking-wide shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_25px_rgba(99,102,241,0.5)] border border-indigo-400/30 transition-all text-sm ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}>{loading ? 'Transmitting...' : 'Send Protocol'}</button></div>) : (<div className="space-y-4"><div className="space-y-1.5"><label className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Recovery Code</label><input type="text" name="otp" value={formData.otp} onChange={handleChange} className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 px-4 text-white text-sm placeholder-gray-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.08] focus:outline-none transition-all duration-300 shadow-inner text-center tracking-widest font-mono" placeholder="----" required /></div><div className="space-y-1.5"><label className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">New Access Key</label><input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-3 px-4 text-white text-sm placeholder-gray-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.08] focus:outline-none transition-all duration-300 shadow-inner" placeholder="New Key" required /></div><button type="submit" disabled={loading} className={`w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-bold tracking-wide shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.5)] border border-emerald-400/30 transition-all text-sm ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}>{loading ? 'Re-encrypting...' : 'Lock New Key'}</button></div>)}</motion.form>)}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    );
};
export default Auth;
