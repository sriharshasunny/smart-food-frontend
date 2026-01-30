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

        // 1. STARS
        const stars = Array.from({ length: 150 }).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 0.2 + 0.05,
            opacity: Math.random()
        }));

        // 2. FOOD
        const foodEmojis = ['🍔', '🍕', '🍩', '🌮', '🥗', '🍱', '🍜', '🍤', '🥓'];
        const foods = Array.from({ length: 12 }).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
            size: 20 + Math.random() * 30,
            dx: (Math.random() - 0.5) * 1.5,
            dy: (Math.random() - 0.5) * 1.5,
            rotation: Math.random() * Math.PI * 2,
            dr: (Math.random() - 0.5) * 0.02
        }));

        // 3. UFO ENTITY (The "Roam & Warp" Logic)
        const ufo = {
            x: canvas.width * 0.8,
            y: canvas.height * 0.2,
            targetX: canvas.width * 0.8,
            targetY: canvas.height * 0.2,
            speed: 0.02, // Smooth interpolation factor
            opacity: 1,
            state: 'IDLE', // IDLE, MOVING, WARPING_OUT, WARPING_IN
            warpTimer: 0,
            message: "Hi! 👋",
            messageTimer: 0
        };

        const updateUFO = () => {
            // Random Message Logic
            ufo.messageTimer++;
            if (ufo.messageTimer > 180) { // ~3 seconds
                const msgs = ["Hi! 👋", "Pizza? 🍕", "Tasty! 😋", "Hungry? 🍔", "Zoom! 🚀"];
                ufo.message = msgs[Math.floor(Math.random() * msgs.length)];
                ufo.messageTimer = 0;
            }

            // State Machine
            if (ufo.state === 'IDLE') {
                // Randomly Decide to Move or Warp
                if (Math.random() < 0.01) {
                    ufo.state = 'MOVING';
                    ufo.targetX = Math.random() * (canvas.width - 100) + 50;
                    ufo.targetY = Math.random() * (canvas.height - 100) + 50;
                } else if (Math.random() < 0.005) {
                    ufo.state = 'WARPING_OUT';
                }
            }
            else if (ufo.state === 'MOVING') {
                // Smooth Lerp
                ufo.x += (ufo.targetX - ufo.x) * ufo.speed;
                ufo.y += (ufo.targetY - ufo.y) * ufo.speed;

                // Arrived?
                if (Math.abs(ufo.targetX - ufo.x) < 5 && Math.abs(ufo.targetY - ufo.y) < 5) {
                    ufo.state = 'IDLE';
                }
            }
            else if (ufo.state === 'WARPING_OUT') {
                ufo.opacity -= 0.05;
                if (ufo.opacity <= 0) {
                    ufo.opacity = 0;
                    ufo.state = 'WARPING_IN';
                    // Teleport instantly
                    ufo.x = Math.random() * (canvas.width - 100) + 50;
                    ufo.y = Math.random() * (canvas.height - 100) + 50;
                    ufo.targetX = ufo.x; // Stop moving
                    ufo.targetY = ufo.y;
                }
            }
            else if (ufo.state === 'WARPING_IN') {
                ufo.opacity += 0.05;
                if (ufo.opacity >= 1) {
                    ufo.opacity = 1;
                    ufo.state = 'IDLE';
                }
            }

            // Bobbing effect (always active)
            const bob = Math.sin(Date.now() / 500) * 5;

            return { x: ufo.x, y: ufo.y + bob, opacity: ufo.opacity };
        };

        const render = () => {
            // Clear & Background
            ctx.fillStyle = '#050510';
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
                if (food.x < 0 || food.x > canvas.width) food.dx *= -1;
                if (food.y < 0 || food.y > canvas.height) food.dy *= -1;
                ctx.save(); ctx.translate(food.x, food.y); ctx.rotate(food.rotation);
                ctx.font = `${food.size}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.globalAlpha = 0.7; ctx.fillText(food.emoji, 0, 0); ctx.restore();
            });

            // Draw UFO
            const ufoPos = updateUFO();
            ctx.save();
            ctx.globalAlpha = ufoPos.opacity;
            ctx.translate(ufoPos.x, ufoPos.y);

            // Emoji
            ctx.font = "60px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "rgba(0, 255, 0, 0.5)";
            ctx.shadowBlur = 20;
            ctx.fillText("🛸", 0, 0);

            // Bubble
            if (ufoPos.opacity > 0.8) {
                ctx.font = "bold 14px Arial";
                const textWidth = ctx.measureText(ufo.message).width + 20;

                ctx.shadowBlur = 0;
                ctx.fillStyle = "#22c55e"; // Green-500
                ctx.beginPath();
                ctx.roundRect(-textWidth / 2, 35, textWidth, 24, 12);
                ctx.fill();

                ctx.fillStyle = "black";
                ctx.fillText(ufo.message, 0, 47);
            }
            ctx.restore();

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
