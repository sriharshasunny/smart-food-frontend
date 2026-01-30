import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Rocket, User, Mail, Lock, CheckCircle,
    AlertCircle, Sparkles, ChevronRight
} from 'lucide-react';

const SmoothUFO = () => {
    // PHYSICS BASED UFO
    // Uses CSS transform for GPU acceleration, but controlled by React state? 
    // No, rAF is better for continuous fluid motion.

    const ufoRef = useRef(null);
    const [message, setMessage] = useState("Hi! 👋");

    useEffect(() => {
        const ufo = ufoRef.current;
        if (!ufo) return;

        let animationId;
        let t = 0;

        // Physics variables for smooth sine wave motion
        // Hover: Y axis sine wave
        // Drift: X axis sine wave (slower)
        const baseX = window.innerWidth > 768 ? 80 : 50; // % position
        const baseY = 20; // % position

        const animate = () => {
            t += 0.02;

            // Smooth Hover (Bobbing)
            const hoverY = Math.sin(t * 2) * 15; // +/- 15px

            // Smooth Drift (Side to Side)
            const driftX = Math.cos(t * 0.5) * 30; // +/- 30px

            // Tilt (based on X movement)
            const tilt = Math.cos(t * 0.5) * 5; // +/- 5 deg

            if (ufo) {
                ufo.style.transform = `translate(${driftX}px, ${hoverY}px) rotate(${tilt}deg)`;
            }

            animationId = requestAnimationFrame(animate);
        };

        animate();

        // Message Rotation
        const msgInterval = setInterval(() => {
            const msgs = ["Hi! 👋", "Hungry? 🍔", "Warp Speed! 🚀", "Ordering? 🍕"];
            setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
        }, 3000);

        return () => {
            cancelAnimationFrame(animationId);
            clearInterval(msgInterval);
        };
    }, []);

    return (
        <div
            ref={ufoRef}
            className="fixed z-20 pointer-events-none flex flex-col items-center"
            style={{
                right: '10%', // Base position
                top: '15%',
                willChange: 'transform' // Hint for GPU
            }}
        >
            <div className="text-6xl filter drop-shadow-[0_0_15px_rgba(0,255,100,0.5)]">
                🛸
            </div>
            <div className="mt-2 text-sm font-mono bg-black/60 text-[#00ff66] px-3 py-1 rounded-full border border-[#00ff66]/30 backdrop-blur-md">
                {message}
            </div>
        </div>
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
        name: '',
        email: '',
        password: '',
        newPassword: '',
        otp: ''
    });
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // --- OPTIMIZED CANVAS ENGINE ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimization
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Redraw background immediately
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Entities
        const stars = [];
        const STAR_COUNT = 150;

        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                opacity: Math.random(),
                speed: Math.random() * 0.2 + 0.05
            });
        }

        const render = () => {
            // Clear
            // Use fillRect with low opacity for trails? No, crisp for pro feel.
            ctx.fillStyle = '#0a0a0f'; // Deep space background
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Stars
            ctx.fillStyle = 'white';
            stars.forEach(star => {
                ctx.globalAlpha = star.opacity;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();

                // Parallax Move
                star.y -= star.speed;
                if (star.y < 0) {
                    star.y = canvas.height;
                    star.x = Math.random() * canvas.width;
                }
            });
            ctx.globalAlpha = 1;

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
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
        <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center relative overflow-hidden font-sans">

            {/* CANVAS BACKGROUND */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0 bg-[#0a0a0f]" />

            {/* SMOOTH UFO */}
            <SmoothUFO />

            {/* Auth Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-lg p-6"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-20 h-20 bg-gradient-to-br from-orange-500 to-rose-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg hover:rotate-3 transition-transform duration-500 mb-4">
                        <Rocket className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight">
                        {mode === 'login' && 'Pilot Access'}
                        {mode === 'register' && 'New Recruit'}
                        {mode === 'forgot' && 'Recovery Mode'}
                    </h1>
                </div>

                <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">

                    {/* Gradient Border Overlay */}
                    <div className="absolute inset-0 border border-white/5 rounded-[2rem] pointer-events-none"></div>

                    {/* Mode Toggle */}
                    {mode !== 'forgot' && (
                        <div className="flex bg-black/40 rounded-xl p-1 mb-8 border border-white/5 relative">
                            <motion.div
                                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-orange-500 to-rose-600 rounded-lg shadow-lg"
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
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 flex items-start gap-3 text-red-200 text-sm overflow-hidden">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-6 flex items-start gap-3 text-green-200 text-sm overflow-hidden">
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
                                    <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-orange-500 focus:bg-white/10 focus:outline-none transition-all" placeholder="name@example.com" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-orange-500 focus:bg-white/10 focus:outline-none transition-all" placeholder="••••••••" required />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-orange-400 hover:text-white transition-colors font-medium">Forgot Password?</button>
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2">
                                    {loading ? 'Authenticating...' : <>Launch Console <ChevronRight className="w-4 h-4" /></>}
                                </button>
                            </motion.form>
                        )}

                        {/* REGISTER */}
                        {mode === 'register' && (
                            <motion.form key="register" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} onSubmit={handleRegister} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">Pilot Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-orange-500 focus:bg-white/10 focus:outline-none transition-all" placeholder="Han Solo" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-orange-500 focus:bg-white/10 focus:outline-none transition-all" placeholder="name@example.com" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-orange-500 focus:bg-white/10 focus:outline-none transition-all" placeholder="••••••••" required />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4">
                                    {loading ? 'Registering...' : <>Join Fleet <ChevronRight className="w-4 h-4" /></>}
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
                                            <h3 className="text-lg font-bold">Lost Credentials?</h3>
                                            <p className="text-sm text-gray-400">We'll send a recovery pulse to your comms device.</p>
                                        </div>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-orange-500 focus:bg-white/10 focus:outline-none transition-all" placeholder="name@example.com" required />
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-500 shadow-lg shadow-orange-500/20 mt-2 transition-all">
                                            {loading ? 'Sending...' : 'Send Coordinates'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-center mb-6">
                                            <div className="w-full bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm font-mono mb-4">Uplink Established: {formData.email}</div>
                                        </div>
                                        <div className="space-y-3">
                                            <input type="text" name="otp" value={formData.otp} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 text-center text-2xl tracking-[0.5em] text-white font-mono focus:border-green-500 focus:outline-none transition-all" placeholder="••••••" required maxLength={6} />
                                            <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:border-green-500 focus:outline-none transition-all" placeholder="New Secret Code" required />
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-500 shadow-lg shadow-green-500/20 mt-4 transition-all">
                                            {loading ? 'Updating...' : 'Restore Access'}
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
