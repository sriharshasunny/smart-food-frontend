import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Rocket, User, Mail, Lock, CheckCircle,
    AlertCircle, Sparkles, ChevronRight
} from 'lucide-react';

// CLASSIC UFO (Simple & Fun)
const FloatingUFO = () => {
    const [message, setMessage] = useState("Hi! 👋");
    useEffect(() => {
        const interval = setInterval(() => {
            const msgs = ["Hi! 👋", "Pizza Time? 🍕", "Tasty! 😋", "Hungry? 🍔"];
            setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    return (
        <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="fixed top-20 right-[15%] z-20 flex flex-col items-center pointer-events-none"
        >
            <div className="text-6xl filter drop-shadow-xl">🛸</div>
            <motion.div key={message} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 bg-white/90 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                {message}
            </motion.div>
        </motion.div>
    );
};

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

    // --- DEEP SPACE + FLOATING FOOD ENGINE ---
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

        const foodEmojis = ['🍔', '🍕', '🍩', '🌮', '🥗', '🍱', '🍜', '🍤', '🥓'];

        // ENTITIES
        const stars = Array.from({ length: 100 }).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 0.5 + 0.1
        }));

        const foods = Array.from({ length: 15 }).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
            size: 20 + Math.random() * 30, // 20-50px
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
            rotation: Math.random() * Math.PI * 2,
            dr: (Math.random() - 0.5) * 0.05
        }));

        const render = () => {
            // 1. Deep Space Background
            ctx.fillStyle = '#050510';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Draw Stars
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            stars.forEach(star => {
                star.y += star.speed;
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // 3. Draw Floating Food
            foods.forEach(food => {
                food.x += food.dx;
                food.y += food.dy;
                food.rotation += food.dr;

                // Bounce
                if (food.x < 0 || food.x > canvas.width) food.dx *= -1;
                if (food.y < 0 || food.y > canvas.height) food.dy *= -1;

                ctx.save();
                ctx.translate(food.x, food.y);
                ctx.rotate(food.rotation);
                ctx.font = `${food.size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.globalAlpha = 0.8;
                ctx.fillText(food.emoji, 0, 0);
                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
    }, []);

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(null); };
    const switchMode = (mode) => { setMode(mode); setStep(1); setError(null); setSuccessMsg(null); };

    const handleLogin = async (e) => {
        e.preventDefault(); setLoading(true);
        try { const res = await login(formData.email, formData.password); if (res.success) navigate('/home'); else setError(res.message); }
        catch { setError('Error'); } finally { setLoading(false); }
    };
    const handleRegister = async (e) => {
        e.preventDefault(); setLoading(true);
        try { const res = await register(formData.name, formData.email, formData.password); if (res.success) navigate('/home'); else setError(res.message); }
        catch { setError('Error'); } finally { setLoading(false); }
    };
    const handleSendResetOtp = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/send-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email, type: 'reset' }) });
            const data = await res.json();
            if (res.ok) { setStep(2); if (data.devCode) console.log(data.devCode); } else setError(data.message);
        } catch { setError('Error'); } finally { setLoading(false); }
    };
    const handleResetPassword = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: formData.email, otp: formData.otp, newPassword: formData.newPassword }) });
            if (res.ok) { setSuccessMsg('Success! Login now.'); setTimeout(() => switchMode('login'), 2000); } else setError('Failed');
        } catch { setError('Error'); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center relative overflow-hidden font-sans">
            <canvas ref={canvasRef} className="absolute inset-0 z-0 bg-[#050510]" />
            <FloatingUFO />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-lg p-6">

                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-20 h-20 bg-gradient-to-br from-orange-500 to-rose-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-4 z-20 relative"><Rocket className="w-10 h-10 text-white" /></motion.div>
                    <h1 className="text-4xl font-extrabold mb-2 tracking-tight drop-shadow-lg">{mode === 'login' ? 'Welcome Back!' : mode === 'register' ? 'Join the Feast' : 'Reset Password'}</h1>
                </div>

                <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 border border-white/5 rounded-[2rem] pointer-events-none"></div>

                    {mode !== 'forgot' && (
                        <div className="flex bg-black/40 rounded-xl p-1 mb-8 border border-white/5 relative">
                            <motion.div className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-orange-600 rounded-lg shadow-lg" animate={{ left: mode === 'register' ? 'calc(50% + 2px)' : '2px' }} transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                            <button onClick={() => switchMode('login')} className={`flex-1 py-3 text-sm font-bold z-10 relative transition-colors text-white`}>Login</button>
                            <button onClick={() => switchMode('register')} className={`flex-1 py-3 text-sm font-bold z-10 relative transition-colors text-white`}>Sign Up</button>
                        </div>
                    )}

                    <AnimatePresence>
                        {error && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 flex items-start gap-3 text-red-200 text-sm"><AlertCircle className="w-4 h-4" /> {error}</motion.div>}
                        {successMsg && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-6 flex items-start gap-3 text-green-200 text-sm"><CheckCircle className="w-4 h-4" /> {successMsg}</motion.div>}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {mode === 'login' && (
                            <motion.form key="login" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2"><label className="text-xs font-bold text-gray-400">EMAIL</label><div className="relative"><Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" /><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" placeholder="name@example.com" required /></div></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-gray-400">PASSWORD</label><div className="relative"><Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" /><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" placeholder="••••••••" required /></div></div>
                                <div className="flex justify-end"><button type="button" onClick={() => switchMode('forgot')} className="text-xs text-orange-400 hover:text-white">Forgot?</button></div>
                                <button type="submit" disabled={loading} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20">{loading ? 'Logging...' : 'Login'}</button>
                            </motion.form>
                        )}
                        {mode === 'register' && (
                            <motion.form key="register" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} onSubmit={handleRegister} className="space-y-5">
                                <div className="space-y-2"><label className="text-xs font-bold text-gray-400">NAME</label><div className="relative"><User className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" /><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" required /></div></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-gray-400">EMAIL</label><div className="relative"><Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" /><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" required /></div></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-gray-400">PASSWORD</label><div className="relative"><Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" /><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" required /></div></div>
                                <button type="submit" disabled={loading} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20">{loading ? 'Signing up...' : 'Sign Up'}</button>
                            </motion.form>
                        )}
                        {mode === 'forgot' && (<motion.form key="forgot" className="space-y-5" onSubmit={step === 1 ? handleSendResetOtp : handleResetPassword}>
                            <button type="button" onClick={() => switchMode('login')} className="text-xs font-bold text-gray-400 hover:text-white mb-4">Back</button>
                            {step === 1 ? (<><div className="relative"><Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" /><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500" placeholder="Email" required /></div><button type="submit" className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold">Send Code</button></>) :
                                (<><input type="text" name="otp" value={formData.otp} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-orange-500" placeholder="OTP" /><input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-orange-500" placeholder="New Password" /><button type="submit" className="w-full py-4 bg-green-600 text-white rounded-xl font-bold">Reset</button></>)}
                        </motion.form>)}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
export default Auth;
