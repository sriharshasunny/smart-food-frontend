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

    // --- UNIFIED CANVAS ENGINE (UFO, STARS, FOOD) ---
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

        // 1. STARS - MINIMAL & DEEP
        // Reduced count and opacity for a cleaner professional look
        const stars = Array.from({ length: 80 }).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            speed: Math.random() * 0.1 + 0.02, // Slower, more distant feel
            opacity: Math.random() * 0.6 + 0.1 // Fainter
        }));

        // 2. FOOD - MINIMAL FLOATING
        // reduced from 12 to 5, slower speed
        const foodEmojis = ['🍔', '🍕', '🍩', '🌮', '🥗'];
        const foods = Array.from({ length: 5 }).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
            size: 20 + Math.random() * 20, // Slightly smaller range
            dx: (Math.random() - 0.5) * 0.5, // Very slow drift
            dy: (Math.random() - 0.5) * 0.5,
            rotation: Math.random() * Math.PI * 2,
            dr: (Math.random() - 0.5) * 0.005 // Very slow spin
        }));

        // 3. UFO ENTITY - REALISTIC PHYSICS
        const ufo = {
            x: canvas.width * 0.8,
            y: canvas.height * 0.2,
            vx: 0,
            vy: 0,
            rotation: 0,
            // Physics params
            maxSpeed: 4,
            acceleration: 0.1,
            friction: 0.98,
            // Target params
            targetX: canvas.width * 0.5,
            targetY: canvas.height * 0.5,
            // State
            opacity: 1,
            state: 'IDLE', // IDLE, ACCELERATING, DECELERATING, WARPING_OUT, WARPING_IN
            warpTimer: 0,
            message: "Welcome! 👋",
            messageTimer: 0,
            showMessage: true
        };

        const updateUFO = () => {
            // Random Message Logic
            ufo.messageTimer++;
            if (ufo.messageTimer > 250) { // ~4 seconds
                const msgs = [
                    "Welcome! 👋",
                    "Exploring flavors... 🍕",
                    "So many choices! 🍩",
                    "Hungry? 🍔",
                    "Warp speed delivery! 🚀",
                    "Did someone say Tacos? 🌮"
                ];
                // Only change message occasionally (~20% chance every cycle)
                if (Math.random() < 0.3) {
                    ufo.message = msgs[Math.floor(Math.random() * msgs.length)];
                    ufo.showMessage = true;
                }
                ufo.messageTimer = 0;
            }

            // AI Behavior
            if (ufo.state === 'IDLE') {
                // Determine next move
                const distToTarget = Math.hypot(ufo.targetX - ufo.x, ufo.targetY - ufo.y);

                if (distToTarget < 50) {
                    // Pick new target
                    if (Math.random() < 0.02) {
                        ufo.targetX = Math.random() * (canvas.width - 100) + 50;
                        ufo.targetY = Math.random() * (canvas.height - 100) + 50;
                    }
                    // Rare warp chance
                    else if (Math.random() < 0.005) {
                        ufo.state = 'WARPING_OUT';
                    }
                } else {
                    ufo.state = 'ACCELERATING';
                }
            }
            else if (ufo.state === 'ACCELERATING' || ufo.state === 'DECELERATING') {
                // Physics Steering
                const dx = ufo.targetX - ufo.x;
                const dy = ufo.targetY - ufo.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 50) {
                    ufo.state = 'IDLE';
                } else {
                    const ax = (dx / dist) * ufo.acceleration;
                    const ay = (dy / dist) * ufo.acceleration;

                    ufo.vx += ax;
                    ufo.vy += ay;
                }
            }
            else if (ufo.state === 'WARPING_OUT') {
                ufo.opacity -= 0.08;
                ufo.rotation += 0.2; // Spin fast when warping
                if (ufo.opacity <= 0) {
                    ufo.opacity = 0;
                    ufo.state = 'WARPING_IN';
                    ufo.x = Math.random() * (canvas.width - 100) + 50;
                    ufo.y = Math.random() * (canvas.height - 100) + 50;
                    ufo.vx = 0;
                    ufo.vy = 0;
                    ufo.targetX = ufo.x; // Stay put for a moment
                    ufo.targetY = ufo.y;
                }
            }
            else if (ufo.state === 'WARPING_IN') {
                ufo.opacity += 0.08;
                ufo.rotation -= 0.2;
                if (ufo.opacity >= 1) {
                    ufo.opacity = 1;
                    ufo.rotation = 0;
                    ufo.state = 'IDLE';
                }
            }

            // Apply Physics (Friction)
            if (ufo.state !== 'WARPING_OUT' && ufo.state !== 'WARPING_IN') {
                ufo.vx *= ufo.friction;
                ufo.vy *= ufo.friction;

                ufo.x += ufo.vx;
                ufo.y += ufo.vy;

                // Banking effect: Rotate towards velocity vector slightly
                // Target rotation based on x velocity (lean into turns)
                const targetRotation = ufo.vx * 0.1;
                ufo.rotation += (targetRotation - ufo.rotation) * 0.1;
            }

            // Screen Bounds (Bounce)
            if (ufo.x < 0 || ufo.x > canvas.width) { ufo.vx *= -0.8; ufo.x = Math.max(0, Math.min(canvas.width, ufo.x)); }
            if (ufo.y < 0 || ufo.y > canvas.height) { ufo.vy *= -0.8; ufo.y = Math.max(0, Math.min(canvas.height, ufo.y)); }

            // Hover Bobbing (always added visually)
            const bob = Math.sin(Date.now() / 600) * 8; // Slower, deeper bob

            return { x: ufo.x, y: ufo.y + bob, rotation: ufo.rotation, opacity: ufo.opacity };
        };

        const render = () => {
            // Clear & Background (Dark deep space)
            ctx.fillStyle = '#020205'; // Almost black
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Stars
            stars.forEach(star => {
                star.y += star.speed;
                if (star.y > canvas.height) { star.y = 0; star.x = Math.random() * canvas.width; }
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill();
            });

            // Draw Food
            foods.forEach(food => {
                food.x += food.dx; food.y += food.dy; food.rotation += food.dr;
                if (food.x < -50) food.x = canvas.width + 50; if (food.x > canvas.width + 50) food.x = -50;
                if (food.y < -50) food.y = canvas.height + 50; if (food.y > canvas.height + 50) food.y = -50;

                ctx.save();
                ctx.translate(food.x, food.y);
                ctx.rotate(food.rotation);
                ctx.font = `${food.size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // Very subtle opacity for minimal look
                ctx.globalAlpha = 0.3;
                ctx.fillText(food.emoji, 0, 0);
                ctx.restore();
            });

            // Draw UFO
            const ufoPos = updateUFO();
            if (ufoPos.opacity > 0) {
                ctx.save();
                ctx.globalAlpha = ufoPos.opacity;
                ctx.translate(ufoPos.x, ufoPos.y);
                ctx.rotate(ufoPos.rotation);

                // Draw UFO Emoji
                ctx.font = "60px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.shadowColor = "rgba(0, 255, 200, 0.4)"; // Cyan/Teal glow
                ctx.shadowBlur = 25;
                ctx.fillText("🛸", 0, 0);

                ctx.restore();

                // Draw Message Bubble (No rotation on text)
                if (ufo.showMessage && ufoPos.opacity > 0.8) {
                    ctx.save();
                    ctx.translate(ufoPos.x, ufoPos.y - 50); // Position above UFO

                    ctx.font = "bold 14px Segoe UI, sans-serif";
                    const textMetrics = ctx.measureText(ufo.message);
                    const textWidth = textMetrics.width;
                    const padding = 12;
                    const boxWidth = textWidth + padding * 2;
                    const boxHeight = 28;

                    // Bubble Background (Glassmorphism)
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = "rgba(0,0,0,0.3)";
                    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

                    // Rounded Rect for Bubble
                    ctx.beginPath();
                    ctx.roundRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 14);
                    ctx.fill();

                    // Tiny triangle pointer
                    ctx.beginPath();
                    ctx.moveTo(-6, boxHeight / 2 - 2);
                    ctx.lineTo(6, boxHeight / 2 - 2);
                    ctx.lineTo(0, boxHeight / 2 + 6);
                    ctx.fill();

                    // Text
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = "#000"; // Dark text
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(ufo.message, 0, 1);

                    ctx.restore();
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
