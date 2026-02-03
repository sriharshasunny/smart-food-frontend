import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Rocket, User, Mail, Lock, CheckCircle,
    AlertCircle, Sparkles, ChevronRight
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

    // --- UPGRADED PHYSICS ENGINE (MATCHING LANDING PAGE) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;

        // Physics Vars
        let width, height;

        const resize = () => {
            // RETINA / HIGH DPI SUPPORT (PREMIUM FEEL)
            const dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
        };
        window.addEventListener('resize', resize);
        resize();

        // 1. STARS
        const stars = Array.from({ length: 90 }).map((_, i) => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5,
            speed: Math.random() * 0.1 + 0.05, // Slightly faster
            opacity: Math.random() * 0.6 + 0.1,
            blink: i < 8,
            blinkSpeed: 0.03 + Math.random() * 0.03,
            blinkDir: 1
        }));

        // 2. FOOD PARTICLES (FASTER ROTATION)
        const foodEmojis = ['🍔', '🍕', '🍩', '🌮', '🥗', '🍱', '🍜'];
        const foods = Array.from({ length: 6 }).map(() => ({
            x: Math.random() * width,
            y: Math.random() * height,
            emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
            size: 20 + Math.random() * 20,
            dx: (Math.random() - 0.5) * 0.6,
            dy: (Math.random() - 0.5) * 0.6,
            rotation: Math.random() * Math.PI * 2,
            dr: (Math.random() - 0.5) * 0.015 // FASTER ROTATION (~3x previous)
        }));

        // 3. FALLING ASTEROIDS
        const asteroids = [];
        const spawnAsteroid = () => {
            if (asteroids.length < 2 && Math.random() < 0.005) {
                asteroids.push({
                    x: Math.random() * width,
                    y: -50,
                    emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
                    size: 30 + Math.random() * 20,
                    speed: 2.5 + Math.random() * 2,
                    angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
                    rotation: 0,
                    rotSpeed: (Math.random() - 0.5) * 0.2, // Fast spin
                    trail: []
                });
            }
        };

        // 4. UFO ENTITY (ZIPPY LANDING PAGE PHYSICS)
        const ufo = {
            x: width * 0.8, y: height * 0.2,
            vx: 0, vy: 0, rotation: 0,
            targetX: width * 0.5, targetY: height * 0.3,
            state: 'IDLE',
            opacity: 1, scale: 1,
            trail: [],
            message: "Welcome! 👋", messageTimer: 0, showMessage: true
        };

        const updateUFO = () => {
            // Message Logic
            ufo.messageTimer++;
            if (ufo.messageTimer > 250) {
                const msgs = ["Welcome! 👋", "Fast Delivery 🚀", "So Tasty 😋", "Order Now 🍔", "Zoom Zoom! ✨", "Pizza Time? 🍕"];
                if (Math.random() < 0.4) { ufo.message = msgs[Math.floor(Math.random() * msgs.length)]; ufo.showMessage = true; }
                ufo.messageTimer = 0;
            }

            // State Logic
            if (ufo.state === 'IDLE') {
                if (Math.random() < 0.02) { // Change target frequently (Zippy)
                    ufo.targetX = Math.random() * width;
                    ufo.targetY = Math.random() * height * 0.7; // Stay mostly top/mid
                }
                const dx = ufo.targetX - ufo.x;
                const dy = ufo.targetY - ufo.y;

                // HIGH ACCEL / LOW FRICTION (The "Smooth" feel)
                ufo.vx += dx * 0.0008;
                ufo.vy += dy * 0.0008;
                ufo.vx *= 0.96;
                ufo.vy *= 0.96;

                // Banking
                ufo.rotation = ufo.vx * 0.08;

            } else if (ufo.state === 'WARPING') {
                // Just for login exit animation if needed
            }

            // Boundary Bounce
            if (ufo.x < 0 || ufo.x > width) { ufo.vx *= -0.8; ufo.x = Math.max(0, Math.min(width, ufo.x)); }
            if (ufo.y < 0 || ufo.y > height) { ufo.vy *= -0.8; ufo.y = Math.max(0, Math.min(height, ufo.y)); }

            ufo.x += ufo.vx;
            ufo.y += ufo.vy;

            // Trail
            if (Math.hypot(ufo.vx, ufo.vy) > 0.5) {
                ufo.trail.push({ x: ufo.x, y: ufo.y, size: Math.random() * 4 + 2, opacity: 0.8, life: 1.0 });
            }
            for (let i = ufo.trail.length - 1; i >= 0; i--) {
                ufo.trail[i].life -= 0.08; ufo.trail[i].size *= 0.9;
                if (ufo.trail[i].life <= 0) ufo.trail.splice(i, 1);
            }
        };

        const render = () => {
            // Dark Space Background
            ctx.fillStyle = '#020205';
            ctx.fillRect(0, 0, width, height);

            // Stars
            stars.forEach(star => {
                star.y += star.speed;
                if (star.y > height) { star.y = 0; star.x = Math.random() * width; }
                if (star.blink) {
                    star.opacity += star.blinkSpeed * star.blinkDir;
                    if (star.opacity > 1) { star.opacity = 1; star.blinkDir = -1; }
                    if (star.opacity < 0.2) { star.opacity = 0.2; star.blinkDir = 1; }
                }
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill();
            });

            // Food Particles
            foods.forEach(food => {
                food.x += food.dx; food.y += food.dy; food.rotation += food.dr;
                if (food.x < -50) food.x = width + 50; if (food.x > width + 50) food.x = -50;
                if (food.y < -50) food.y = height + 50; if (food.y > height + 50) food.y = -50;
                ctx.save(); ctx.translate(food.x, food.y); ctx.rotate(food.rotation);
                ctx.font = `${food.size}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.globalAlpha = 0.4; ctx.fillText(food.emoji, 0, 0); ctx.restore();
            });

            // Asteroids
            spawnAsteroid();
            for (let i = asteroids.length - 1; i >= 0; i--) {
                const a = asteroids[i];
                a.x += Math.cos(a.angle) * a.speed;
                a.y += Math.sin(a.angle) * a.speed;
                a.rotation += a.rotSpeed;

                // Trail
                a.trail.push({ x: a.x, y: a.y, size: a.size * 0.4, opacity: 0.6 });
                if (a.trail.length > 10) a.trail.shift();

                a.trail.forEach((p, idx) => {
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (idx / 10), 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 100, 50, ${p.opacity * (idx / 10)})`;
                    ctx.fill();
                });

                ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rotation);
                ctx.font = `${a.size}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.shadowColor = "rgba(255, 100, 0, 0.5)"; ctx.shadowBlur = 20;
                ctx.fillText(a.emoji, 0, 0); ctx.restore();

                if (a.y > height + 50) asteroids.splice(i, 1);
            }

            // UFO
            updateUFO();
            ctx.globalAlpha = ufo.opacity;
            // Trail
            ufo.trail.forEach(p => {
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 255, 200, ${p.opacity})`; ctx.fill();
            });
            // Body
            ctx.save(); ctx.translate(ufo.x, ufo.y); ctx.rotate(ufo.rotation);
            ctx.shadowColor = "rgba(0, 255, 100, 0.8)"; ctx.shadowBlur = 30;
            ctx.font = "60px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText("🛸", 0, 0);
            ctx.restore();

            // Message Bubble
            if (ufo.showMessage && ufo.opacity > 0.8) {
                ctx.save(); ctx.translate(ufo.x, ufo.y - 50);
                // Counter-rotate so text stays flat
                // Actually, let's keep it simple and flat
                ctx.font = "bold 13px Segoe UI, sans-serif";
                const metrics = ctx.measureText(ufo.message);
                const boxW = metrics.width + 20; const boxH = 26;
                ctx.shadowBlur = 10; ctx.shadowColor = "rgba(0,0,0,0.3)";
                ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
                ctx.beginPath(); ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 12); ctx.fill();
                // Tail
                ctx.beginPath(); ctx.moveTo(-5, boxH / 2 - 2); ctx.lineTo(5, boxH / 2 - 2); ctx.lineTo(0, boxH / 2 + 5); ctx.fill();
                ctx.shadowBlur = 0; ctx.fillStyle = "#000"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText(ufo.message, 0, 1); ctx.restore();
            }
            ctx.globalAlpha = 1;

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
        <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center relative overflow-hidden font-sans">
            <canvas ref={canvasRef} className="absolute inset-0 z-0 bg-[#050510]" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-lg p-6">
                <div className="text-center mb-8">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-20 h-20 bg-gradient-to-br from-orange-500 to-rose-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-4 z-20 relative"><Rocket className="w-10 h-10 text-white" /></motion.div>
                    <h1 className="text-4xl font-extrabold mb-2 tracking-tight drop-shadow-lg">{mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join the Feast' : 'Reset Password'}</h1>
                </div>

                <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                    {mode !== 'forgot' && (<div className="flex bg-black/40 rounded-full p-1 mb-8 border border-white/5 relative"><motion.div className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-orange-600 rounded-full shadow-lg" animate={{ left: mode === 'register' ? 'calc(50% + 2px)' : '2px' }} transition={{ type: "spring", stiffness: 300, damping: 25 }} /><button onClick={() => switchMode('login')} className={`flex-1 py-3 text-sm font-bold z-10 relative text-white rounded-full`}>Login</button><button onClick={() => switchMode('register')} className={`flex-1 py-3 text-sm font-bold z-10 relative text-white rounded-full`}>Sign Up</button></div>)}

                    <AnimatePresence>
                        {error && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 flex items-start gap-3 text-red-200 text-sm"><AlertCircle className="w-4 h-4" /> {error}</motion.div>}
                        {successMsg && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-6 flex items-start gap-3 text-green-200 text-sm"><CheckCircle className="w-4 h-4" /> {successMsg}</motion.div>}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {mode === 'login' && (
                            <motion.form key="login" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label><div className="relative"><Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" /><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" placeholder="pilot@foodverse.com" required /></div></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label><div className="relative"><Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" /><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" placeholder="••••••••" required /></div></div>
                                <div className="flex justify-end"><button type="button" onClick={() => switchMode('forgot')} className="text-xs text-orange-400 hover:text-white font-bold">Forgot Password?</button></div>
                                <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white rounded-xl font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 mt-4 text-lg">{loading ? 'Igniting...' : <>Take Flight <ChevronRight className="w-5 h-5" /></>}</button>
                            </motion.form>
                        )}
                        {mode === 'register' && (
                            <motion.form key="register" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} onSubmit={handleRegister} className="space-y-5">
                                <div className="space-y-2"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</label><div className="relative"><User className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" /><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" placeholder="Commander Shepherd" required /></div></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label><div className="relative"><Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" /><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" placeholder="pilot@foodverse.com" required /></div></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label><div className="relative"><Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" /><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" placeholder="••••••••" required /></div></div>
                                <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white rounded-xl font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 mt-4 text-lg">{loading ? 'Preparing...' : <>Join the Feast <ChevronRight className="w-5 h-5" /></>}</button>
                            </motion.form>
                        )}
                        {mode === 'forgot' && (<motion.form key="forgot" className="space-y-5" onSubmit={step === 1 ? handleSendResetOtp : handleResetPassword}><button type="button" onClick={() => switchMode('login')} className="text-xs font-bold text-gray-400 hover:text-white mb-4 flex items-center uppercase tracking-wider"><ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Return</button>{step === 1 ? (<><div className="relative"><Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" /><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500" placeholder="pilot@foodverse.com" required /></div><button type="submit" className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded-xl font-bold">Send Recovery Code</button></>) : (<><input type="text" name="otp" value={formData.otp} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-orange-500" placeholder="OTP Code" /><input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-orange-500" placeholder="New Password" /><button type="submit" className="w-full py-4 bg-green-600 text-white rounded-xl font-bold">Reset Password</button></>)}</motion.form>)}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
export default Auth;
