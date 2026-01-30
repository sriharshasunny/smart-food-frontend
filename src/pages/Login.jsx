import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Rocket, User, Mail, Lock, CheckCircle,
    AlertCircle, Sparkles, ChevronRight
} from 'lucide-react';

// UFO Animation - Keeps DOM for complex interactions/css-transforms which are cheap for single elements
const FloatingUFO = () => {
    const [message, setMessage] = React.useState("Hi! 👋");
    const [position, setPosition] = React.useState({ x: 110, y: 20 });
    const [duration, setDuration] = React.useState(3.5);
    const [opacity, setOpacity] = React.useState(1);
    const isMounted = React.useRef(true);

    React.useEffect(() => {
        isMounted.current = true;

        const messageInterval = setInterval(() => {
            if (!isMounted.current) return;
            const messages = ["Hi! 👋", "Order Fast! 🚀", "Yum! 🍔", "Hungry? 🍕", "Vroom! 💨"];
            setMessage(prev => messages[(messages.indexOf(prev) + 1) % messages.length]);
        }, 4000);

        return () => {
            clearInterval(messageInterval);
            isMounted.current = false;
        };
    }, []);

    React.useEffect(() => {
        let timeoutId;

        const moveUFO = async () => {
            if (!isMounted.current) return;

            // 1. ENTERING / ROAMING
            const moves = 4;

            for (let i = 0; i < moves; i++) {
                if (!isMounted.current) return;
                const newX = 10 + Math.random() * 80;
                const newY = 10 + Math.random() * 60;

                setDuration(4);
                setPosition({ x: newX, y: newY });

                await new Promise(r => timeoutId = setTimeout(r, 4500));
            }

            // 2. LEAVING
            if (!isMounted.current) return;
            const exitRight = Math.random() > 0.5;
            setDuration(3);
            setPosition({ x: exitRight ? 120 : -20, y: 30 });
            await new Promise(r => timeoutId = setTimeout(r, 3000));

            // 3. GONE
            if (!isMounted.current) return;
            const goneDuration = 8000;
            await new Promise(r => timeoutId = setTimeout(r, goneDuration));

            // 4. RETURN
            if (!isMounted.current) return;
            const enterRight = Math.random() > 0.5;
            setDuration(0);
            setPosition({ x: enterRight ? 120 : -20, y: 40 });
            await new Promise(r => timeoutId = setTimeout(r, 100));

            moveUFO();
        };

        moveUFO();

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <motion.div
            animate={{
                x: `${position.x}vw`,
                y: `${position.y}vh`,
                rotate: [0, -3, 3, 0],
            }}
            transition={{
                x: { duration: duration, ease: "easeInOut" },
                y: { duration: duration, ease: "easeInOut" },
                rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="will-change-transform"
            style={{
                position: 'fixed',
                zIndex: 1,
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
            }}
        >
            <div style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 8px rgba(0, 255, 100, 0.4))' }}>
                🛸
            </div>

            <motion.div
                key={message}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    background: 'rgba(0, 20, 10, 0.8)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    color: '#00ff66',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    border: '1px solid rgba(0, 255, 100, 0.3)',
                }}
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
        name: '',
        email: '',
        password: '',
        newPassword: '',
        otp: ''
    });
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // --- CANVAS ANIMATION ENGINE ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Resize Canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Assets
        const foodEmojis = ['🍔', '🍕', '🍩', '🌮', '🍦', '🍪'];

        // Entities
        const stars = [];
        const foods = [];
        const meteors = [];

        // Helper: Random Range
        const random = (min, max) => Math.random() * (max - min) + min;

        // Initialize Objects
        const init = () => {
            // Create Stars
            for (let i = 0; i < 100; i++) {
                stars.push({
                    x: random(0, canvas.width),
                    y: random(0, canvas.height),
                    size: random(0.5, 2.5),
                    opacity: random(0.1, 0.8),
                    speed: random(0.05, 0.2)
                });
            }

            // Create Floating Food
            for (let i = 0; i < 8; i++) {
                foods.push({
                    x: random(0, canvas.width),
                    y: random(0, canvas.height),
                    emoji: foodEmojis[Math.floor(random(0, foodEmojis.length))],
                    size: random(20, 40),
                    speedX: random(-0.3, 0.3),
                    speedY: random(-0.3, 0.3),
                    opacity: 0,
                    targetOpacity: 0.6,
                    fadeSpeed: 0.01,
                    phase: 'in' // in, wait, out
                });
            }
        };

        // Draw Frame
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Draw Stars
            ctx.fillStyle = "white";
            stars.forEach(star => {
                ctx.globalAlpha = star.opacity;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();

                // Move Stars (Parallax effect)
                star.y -= star.speed;
                if (star.y < 0) {
                    star.y = canvas.height;
                    star.x = random(0, canvas.width);
                }
            });

            // 2. Draw Meteors (Random Chance spawn)
            if (Math.random() < 0.005) { // Spawn chance
                meteors.push({
                    x: random(0, canvas.width),
                    y: -50,
                    size: random(2, 4),
                    speed: random(5, 10),
                    angle: Math.PI / 4 // 45 degrees
                });
            }

            // Render & Update Meteors
            for (let i = meteors.length - 1; i >= 0; i--) {
                const m = meteors[i];
                ctx.globalAlpha = 1;

                // Draw Trail
                const gradient = ctx.createLinearGradient(m.x, m.y, m.x - 50, m.y - 50);
                gradient.addColorStop(0, 'rgba(255, 100, 0, 1)');
                gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
                ctx.strokeStyle = gradient;
                ctx.lineWidth = m.size;
                ctx.beginPath();
                ctx.moveTo(m.x, m.y);
                ctx.lineTo(m.x - 80, m.y - 80); // Trail length
                ctx.stroke();

                // Draw Head
                ctx.fillStyle = '#ffaa00';
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
                ctx.fill();

                // Move
                m.x += m.speed;
                m.y += m.speed;

                // Remove if out of bounds
                if (m.y > canvas.height + 100) {
                    meteors.splice(i, 1);
                }
            }

            // 3. Draw Floating Food
            ctx.font = "30px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            foods.forEach(food => {
                // Update Opacity
                if (food.phase === 'in') {
                    food.opacity += food.fadeSpeed;
                    if (food.opacity >= food.targetOpacity) food.phase = 'wait';
                } else if (food.phase === 'wait') {
                    // slight chance to start fading out
                    if (Math.random() < 0.005) food.phase = 'out';
                } else if (food.phase === 'out') {
                    food.opacity -= food.fadeSpeed;
                    if (food.opacity <= 0) {
                        // Respawn
                        food.opacity = 0;
                        food.x = random(0, canvas.width);
                        food.y = random(0, canvas.height);
                        food.phase = 'in';
                        food.emoji = foodEmojis[Math.floor(random(0, foodEmojis.length))];
                    }
                }

                // Move
                food.x += food.speedX;
                food.y += food.speedY;

                // Wrap around screen
                if (food.x > canvas.width) food.x = 0;
                if (food.x < 0) food.x = canvas.width;
                if (food.y > canvas.height) food.y = 0;
                if (food.y < 0) food.y = canvas.height;

                // Draw
                ctx.globalAlpha = Math.max(0, food.opacity);
                ctx.font = `${food.size}px Arial`;
                // Simple Shadow
                ctx.shadowColor = "rgba(255, 255, 255, 0.3)";
                ctx.shadowBlur = 10;
                ctx.fillText(food.emoji, food.x, food.y);
                ctx.shadowBlur = 0; // Reset
            });

            animationFrameId = requestAnimationFrame(render);
        };

        init();
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

    // --- SUBMISSION HANDLERS ---

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await login(formData.email, formData.password);
            if (res.success) {
                navigate('/home');
            } else {
                setError(res.message || 'Login failed');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await register(formData.name, formData.email, formData.password);
            if (res.success) {
                navigate('/home');
            } else {
                setError(res.message || 'Registration failed');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    // Forgot Password Flow
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
            } else {
                setError(data.message || 'Failed to send code');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
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
                    switchMode('login'); // Redirect to login
                    setSuccessMsg('Please login with your new password.');
                    setFormData(prev => ({ ...prev, password: '' }));
                }, 2000);
            } else {
                setError(data.message || 'Reset failed');
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center relative overflow-hidden font-sans">
            {/* CANVAS BACKGROUND */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0"
                style={{ background: 'linear-gradient(to bottom right, #0a0a0f, #1a1a2e)' }}
            />

            {/* Floating UFO (Kept as DOM element for simplicity) */}
            <FloatingUFO />

            {/* Auth Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-lg p-6"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div initial={{ rotate: -10 }} animate={{ rotate: 0 }} className="w-20 h-20 bg-gradient-to-br from-orange-500 to-rose-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-4">
                        <Rocket className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                        {mode === 'login' && 'Welcome Back'}
                        {mode === 'register' && 'Join the Fleet'}
                        {mode === 'forgot' && 'Account Recovery'}
                    </h1>
                </div>

                <div className="bg-black/70 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">

                    {/* Mode Toggle (Login/Register) */}
                    {mode !== 'forgot' && (
                        <div className="flex bg-black/60 rounded-full p-1 mb-6 border border-white/10 relative">
                            <motion.div
                                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-b from-orange-500 to-orange-600 rounded-full shadow-lg"
                                animate={{ left: mode === 'register' ? 'calc(50% + 3px)' : '3px' }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            />
                            <button onClick={() => switchMode('login')} className={`flex-1 py-3 text-sm font-bold z-10 relative ${mode === 'login' ? 'text-white' : 'text-gray-400'}`}>Login</button>
                            <button onClick={() => switchMode('register')} className={`flex-1 py-3 text-sm font-bold z-10 relative ${mode === 'register' ? 'text-white' : 'text-gray-400'}`}>Sign Up</button>
                        </div>
                    )}

                    {/* Messages */}
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 flex items-center gap-2 text-red-200 text-sm">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4 flex items-center gap-2 text-green-200 text-sm">
                                <CheckCircle className="w-4 h-4" /> {successMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* FORMS */}
                    <AnimatePresence mode="wait">

                        {/* LOGIN FORM */}
                        {mode === 'login' && (
                            <motion.form key="login" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 ml-3 uppercase">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none transition-colors" placeholder="pilot@foodverse.com" required />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 ml-3 uppercase">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none transition-colors" placeholder="••••••••" required />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-1">
                                    <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-orange-400 hover:text-white transition-colors">Forgot Password?</button>
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-rose-600 rounded-xl font-bold text-white shadow-lg hover:shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                    {loading ? 'Logging in...' : <>Take Flight <ChevronRight className="w-4 h-4" /></>}
                                </button>
                            </motion.form>
                        )}

                        {/* REGISTER FORM */}
                        {mode === 'register' && (
                            <motion.form key="register" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 ml-3 uppercase">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none transition-colors" placeholder="John Doe" required />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 ml-3 uppercase">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none transition-colors" placeholder="pilot@foodverse.com" required />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 ml-3 uppercase">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none transition-colors" placeholder="••••••••" required />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-rose-600 rounded-xl font-bold text-white shadow-lg hover:shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4">
                                    {loading ? 'Creating Account...' : <>Join Now <ChevronRight className="w-4 h-4" /></>}
                                </button>
                            </motion.form>
                        )}

                        {/* FORGOT PASSWORD FORM */}
                        {mode === 'forgot' && (
                            <motion.form key="forgot" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="space-y-4" onSubmit={step === 1 ? handleSendResetOtp : handleResetPassword}>
                                <button type="button" onClick={() => switchMode('login')} className="flex items-center text-sm text-gray-400 hover:text-white mb-4"><ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back to Login</button>

                                {step === 1 ? (
                                    <>
                                        <div className="text-center mb-4">
                                            <Sparkles className="w-10 h-10 text-orange-400 mx-auto mb-2" />
                                            <h3 className="text-lg font-bold">Reset Password</h3>
                                            <p className="text-sm text-gray-400">Enter your email to receive a recovery code.</p>
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:border-orange-500 focus:outline-none transition-colors" placeholder="pilot@foodverse.com" required />
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-rose-600 rounded-xl font-bold text-white shadow-lg mt-2">
                                            {loading ? 'Sending...' : 'Send Recovery Code'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-center mb-4">
                                            <div className="w-full bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-green-400 text-sm mb-4">Code sent to {formData.email}</div>
                                        </div>
                                        <div className="space-y-3">
                                            <input type="text" name="otp" value={formData.otp} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 text-center text-2xl tracking-[0.5em] text-white font-mono focus:border-green-500 focus:outline-none" placeholder="••••••" required maxLength={6} />
                                            <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none" placeholder="New Secure Password" required />
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-white shadow-lg hover:shadow-green-500/25 mt-4">
                                            {loading ? 'Resetting...' : 'Reset & Login'}
                                        </button>
                                    </>
                                )}
                            </motion.form>
                        )}

                    </AnimatePresence>
                </div>
                <div className="mt-8 text-center text-gray-600 text-xs font-medium">© 2024 FoodVerse Galactic. All rights reserved.</div>
            </motion.div>
        </div>
    );
};

export default Auth;
