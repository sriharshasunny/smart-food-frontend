import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
    Rocket, User, Mail, Lock, CheckCircle,
    AlertCircle, Sparkles, ChevronRight
} from 'lucide-react';

const RoamingUFO = () => {
    // ACTIVE ROAMING UFO
    const controls = useAnimation();
    const [message, setMessage] = useState("Hi! 👋");
    const containerRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const roam = async () => {
            if (!isMounted) return;

            // 1. Pick a random destination
            // Avoid edges: 10% to 90%
            const nextX = Math.random() * 80 + 10; // %
            const nextY = Math.random() * 80 + 10; // %

            // 2. Calculate duration based on distance (uniform speed)
            // Simple random duration for "drifting" feel
            const duration = Math.random() * 3 + 2; // 2-5s

            // 3. Move
            await controls.start({
                left: `${nextX}%`,
                top: `${nextY}%`,
                transition: {
                    duration: duration,
                    ease: "easeInOut", // Smooth start/stop
                }
            });

            // 4. Wait a bit then move again
            if (isMounted) {
                setTimeout(roam, Math.random() * 1000 + 500);
            }
        };

        roam();

        // Message Cycle
        const msgInterval = setInterval(() => {
            const msgs = [
                "Hungry? 🍔", "Incoming! 🍕", "Scanning... 🛸",
                "Warp Speed! 🚀", "Lost? 🗺️", "Tasty! 🍩",
                "Beep Boop 🤖", "Delivery! 📦"
            ];
            setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
        }, 3500);

        return () => {
            isMounted = false;
            clearInterval(msgInterval);
        };
    }, [controls]);

    return (
        <motion.div
            animate={controls}
            className="fixed z-20 pointer-events-none flex flex-col items-center"
            style={{
                left: '50%', // Start center
                top: '50%',
                transform: 'translate(-50%, -50%)', // Center anchor
                willChange: 'left, top'
            }}
        >
            <motion.div
                animate={{ rotate: [0, 5, -5, 0], y: [0, -10, 0] }} // Subtle hover bob while moving
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl filter drop-shadow-[0_0_20px_rgba(0,255,100,0.6)]"
            >
                🛸
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={message} // Re-animate on change
                className="mt-2 text-sm font-mono bg-black/80 text-[#00ff66] px-3 py-1 rounded-full border border-[#00ff66]/30 backdrop-blur-md whitespace-nowrap"
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

    // --- FOOD RAIN / ASTEROID ENGINE ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const foodEmojis = ['🍔', '🍕', '🍩', '🌮', '🥗', '🍱', '🍜', '🍤', '🥓', '🍗', '🍟', '🧀'];

        // Entities
        const entities = [];
        const MAX_ENTITIES = 50;

        class FoodAsteroid {
            constructor() {
                this.reset(true);
            }

            reset(randomY = false) {
                this.x = Math.random() * canvas.width;
                this.y = randomY ? Math.random() * canvas.height : -100;
                this.emoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
                this.size = Math.random() * 30 + 15; // 15-45px
                this.speed = Math.random() * 2 + 1; // 1-3 px/frame
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.05;
                this.opacity = Math.random() * 0.5 + 0.3; // 0.3-0.8
            }

            update() {
                this.y += this.speed;
                this.rotation += this.rotationSpeed;

                if (this.y > canvas.height + 100) {
                    this.reset();
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                // Glow effect (Asteroid atmosphere)
                ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
                ctx.shadowBlur = 15;

                ctx.globalAlpha = this.opacity;
                ctx.font = `${this.size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.emoji, 0, 0);

                ctx.restore();
            }
        }

        // Init
        for (let i = 0; i < MAX_ENTITIES; i++) {
            entities.push(new FoodAsteroid());
        }

        const render = () => {
            // Clear with slight trail? No, clean rain.
            // Dark Space Background
            ctx.fillStyle = '#050510';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Stars (Static background layer)
            // Optimize: Could be pre-rendered, but simple dots are fast.
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            for (let i = 0; i < 100; i++) {
                // Pseudo-random stars based on index to avoid storing them just for background
                const x = (Math.sin(i * 132.1) * canvas.width + canvas.width) % canvas.width;
                const y = (Math.cos(i * 453.2) * canvas.height + canvas.height) % canvas.height;
                ctx.fillRect(x, y, 2, 2);
            }

            // Update & Draw Food
            entities.forEach(ent => {
                ent.update();
                ent.draw();
            });

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
        <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center relative overflow-hidden font-sans">

            {/* CANVAS BACKGROUND */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0 bg-[#050510]" />

            {/* ROAMING UFO */}
            <RoamingUFO />

            {/* Auth Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-lg p-6"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-20 h-20 bg-gradient-to-br from-orange-500 to-rose-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg hover:rotate-3 transition-transform duration-500 mb-4 z-20 relative">
                        <Rocket className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight drop-shadow-lg">
                        {mode === 'login' && 'Pilot Access'}
                        {mode === 'register' && 'New Recruit'}
                        {mode === 'forgot' && 'Recovery Mode'}
                    </h1>
                </div>

                <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">

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
