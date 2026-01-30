import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Rocket, User, Mail, Lock, CheckCircle,
    AlertCircle, Sparkles, ChevronRight
} from 'lucide-react';

// CLASSIC UFO COMPONENT
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
            animate={{
                y: [0, -20, 0], // Gentle bobbing
                rotate: [0, -5, 5, 0] // Gentle tilt
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className="fixed top-20 right-[15%] z-20 flex flex-col items-center pointer-events-none"
        >
            <div className="text-6xl filter drop-shadow-xl">🛸</div>
            <motion.div
                key={message}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 bg-white/90 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg"
            >
                {message}
            </motion.div>
        </motion.div>
    );
};

const Auth = () => {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const canvasRef = useRef(null);

    // Mode: 'login' | 'register' | 'forgot'
    const [mode, setMode] = useState('login');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', newPassword: '', otp: ''
    });
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // --- CLASSIC FLOATING FOOD ENGINE ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const foodEmojis = ['🍔', '🍕', '🍩', '🌮', '🥗', '🍱', '🍜', '🍤', '🥓', '🍗', '🍟'];

        // Entities for Fast & Smooth movement
        const foods = Array.from({ length: 20 }).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
            size: 20 + Math.random() * 30, // 20-50px
            dx: (Math.random() - 0.5) * 3, // Fast drift X
            dy: (Math.random() - 0.5) * 3, // Fast drift Y
            rotation: Math.random() * Math.PI * 2,
            dr: (Math.random() - 0.5) * 0.1
        }));

        const render = () => {
            // Clear entire screen (Standard Draw)
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Transparent background

            foods.forEach(food => {
                // Update
                food.x += food.dx;
                food.y += food.dy;
                food.rotation += food.dr;

                // Bounce off walls
                if (food.x < 0 || food.x > canvas.width) food.dx *= -1;
                if (food.y < 0 || food.y > canvas.height) food.dy *= -1;

                // Draw
                ctx.save();
                ctx.translate(food.x, food.y);
                ctx.rotate(food.rotation);
                ctx.font = `${food.size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.globalAlpha = 0.6; // Slightly transparent
                ctx.fillText(food.emoji, 0, 0);
                ctx.restore();
            });

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setStep(1);
        setError(null);
        setSuccessMsg(null);
        setFormData(prev => ({ ...prev, otp: '', newPassword: '' }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await login(formData.email, formData.password);
            if (res.success) navigate('/home');
            else setError(res.message || 'Login failed');
        } catch (err) { setError('An unexpected error occurred.'); }
        finally { setLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await register(formData.name, formData.email, formData.password);
            if (res.success) navigate('/home');
            else setError(res.message || 'Registration failed');
        } catch (err) { setError('An unexpected error occurred.'); }
        finally { setLoading(false); }
    };

    const handleSendResetOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, type: 'reset' })
            });
            const data = await res.json();
            if (res.ok) {
                setStep(2);
                if (data.devCode) console.log("DEV OTP:", data.devCode);
            } else { setError(data.message || 'Failed to send code'); }
        } catch (err) { setError('Network error'); }
        finally { setLoading(false); }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: formData.otp, newPassword: formData.newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMsg('Password Reset Successfully! Redirecting...');
                setTimeout(() => {
                    switchMode('login');
                    setSuccessMsg('Please login with your new password.');
                    setFormData(prev => ({ ...prev, password: '' }));
                }, 2000);
            } else { setError(data.message || 'Reset failed'); }
        } catch (err) { setError('Verification failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center relative overflow-hidden font-sans">

            {/* CANVAS BACKGROUND */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0 bg-transparent" />

            {/* CLASSIC UFO */}
            <FloatingUFO />

            {/* Auth Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-lg p-6"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg hover:rotate-3 transition-transform duration-500 mb-4 z-20 relative">
                        <Rocket className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-extrabold mb-2 tracking-tight drop-shadow-lg">
                        {mode === 'login' && 'Welcome Back!'}
                        {mode === 'register' && 'Join the Feast'}
                        {mode === 'forgot' && 'Reset Password'}
                    </h1>
                    <p className="text-gray-400">Your galactic delivery service awaits.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">

                    {/* Mode Toggle */}
                    {mode !== 'forgot' && (
                        <div className="flex bg-black/40 rounded-xl p-1 mb-8 border border-white/5 relative">
                            <motion.div
                                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-orange-500 rounded-lg shadow-lg"
                                animate={{ left: mode === 'register' ? 'calc(50% + 2px)' : '2px' }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            />
                            <button onClick={() => switchMode('login')} className={`flex-1 py-3 text-sm font-bold z-10 relative transition-colors ${mode === 'login' ? 'text-white' : 'text-gray-400'}`}>Login</button>
                            <button onClick={() => switchMode('register')} className={`flex-1 py-3 text-sm font-bold z-10 relative transition-colors ${mode === 'register' ? 'text-white' : 'text-gray-400'}`}>Sign Up</button>
                        </div>
                    )}

                    {/* Messages */}
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-6 flex items-start gap-3 text-red-200 text-sm overflow-hidden">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-6 flex items-start gap-3 text-green-200 text-sm overflow-hidden">
                                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{successMsg}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* FORMS */}
                    <AnimatePresence mode="wait">
                        {/* LOGIN */}
                        {mode === 'login' && (
                            <motion.form key="login" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-300 ml-1 uppercase tracking-wider">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" placeholder="name@example.com" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-300 ml-1 uppercase tracking-wider">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" placeholder="••••••••" required />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-orange-400 hover:text-orange-300 transition-colors font-medium">Forgot Password?</button>
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-orange-500/30">
                                    {loading ? 'Logging...' : <>Login <ChevronRight className="w-4 h-4" /></>}
                                </button>
                            </motion.form>
                        )}

                        {/* REGISTER */}
                        {mode === 'register' && (
                            <motion.form key="register" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} onSubmit={handleRegister} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-300 ml-1 uppercase tracking-wider">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" placeholder="Han Solo" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-300 ml-1 uppercase tracking-wider">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" placeholder="name@example.com" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-300 ml-1 uppercase tracking-wider">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" placeholder="••••••••" required />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-orange-500/30">
                                    {loading ? 'Signing up...' : <>Sign Up <ChevronRight className="w-4 h-4" /></>}
                                </button>
                            </motion.form>
                        )}

                        {/* FORGOT */}
                        {mode === 'forgot' && (
                            <motion.form key="forgot" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="space-y-5" onSubmit={step === 1 ? handleSendResetOtp : handleResetPassword}>
                                <button type="button" onClick={() => switchMode('login')} className="flex items-center text-xs font-bold text-gray-400 hover:text-white mb-4 uppercase tracking-wider"><ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Return</button>

                                {step === 1 ? (
                                    <>
                                        <div className="text-center mb-6">
                                            <Sparkles className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                                            <h3 className="text-lg font-bold">Resend Link?</h3>
                                            <p className="text-sm text-gray-400">Enter email to restore access.</p>
                                        </div>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" placeholder="name@example.com" required />
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 mt-2 transition-all">
                                            {loading ? 'Sending...' : 'Send OTP'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-center mb-6">
                                            <div className="w-full bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm font-mono mb-4">OTP Sent to {formData.email}</div>
                                        </div>
                                        <div className="space-y-3">
                                            <input type="text" name="otp" value={formData.otp} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 text-center text-2xl tracking-[0.5em] text-white font-mono focus:border-orange-500 focus:outline-none transition-all" placeholder="••••••" required maxLength={6} />
                                            <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all" placeholder="New Password" required />
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 mt-4 transition-all">
                                            {loading ? 'Updating...' : 'Reset Password'}
                                        </button>
                                    </>
                                )}
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
