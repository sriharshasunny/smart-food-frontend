import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Rocket, User, Mail, Lock, CheckCircle,
    AlertCircle, Sparkles, ChevronRight
} from 'lucide-react';

// Floating Food Component - Optimized
const FloatingFood = ({ emoji, x, y, delay, scale, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{
                opacity: [0, 0, 0.3, 0.3, 0.3, 0.3, 0, 0], // Reduced max opacity
            }}
            transition={{
                duration: 6 + (index % 3) * 1.5,
                delay: delay,
                repeat: Infinity,
                repeatDelay: index * 0.4,
                ease: "easeInOut"
            }}
            className="absolute pointer-events-none select-none will-change-transform" // Added will-change
            style={{
                left: `${x}%`,
                top: `${y}%`,
                fontSize: `${scale * 1.5}rem`, // Slightly smaller
                // Removed heavy drop-shadow, kept simple text-shadow
                textShadow: '0 0 5px rgba(255,255,255,0.2)',
            }}
        >
            {emoji}
        </motion.div>
    );
};

// Falling Meteor Component - Optimized
const FallingMeteor = ({ emoji, startX, delay, index }) => {
    return (
        <motion.div
            initial={{
                x: 0,
                y: -100,
                opacity: 0,
                rotate: -45
            }}
            animate={{
                x: [0, 200],
                y: [-100, window.innerHeight + 100],
                opacity: [0, 1, 1, 0.8, 0],
                rotate: -45
            }}
            transition={{
                duration: 3.5 + Math.random() * 1.5,
                delay: delay,
                repeat: Infinity,
                repeatDelay: 10 + Math.random() * 8,
                ease: "linear"
            }}
            className="absolute pointer-events-none select-none will-change-transform"
            style={{
                left: `${startX}%`,
                top: 0,
                fontSize: '2.5rem',
                // Single drop-shadow instead of double, reduced blur
                filter: 'drop-shadow(0 0 10px rgba(255, 80, 0, 0.8))',
            }}
        >
            {emoji}
            {/* Simplified Fire Trail - CSS only, no extra divs if possible, or simplified */}
            <div style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)' }}>
                <div style={{
                    width: '60px',
                    height: '6px',
                    background: 'linear-gradient(to left, rgba(255, 60, 0, 0.8), transparent)',
                    borderRadius: '50%',
                    filter: 'blur(2px)', // Reduced blur radius
                    position: 'absolute'
                }} />
            </div>
        </motion.div>
    );
};

// UFO Animation - Optimized
const FloatingUFO = () => {
    const [message, setMessage] = React.useState("Hi! 👋");
    const [position, setPosition] = React.useState({ x: 110, y: 20 });
    const [duration, setDuration] = React.useState(3.5);
    const [opacity, setOpacity] = React.useState(1);
    const isMounted = React.useRef(true); // Usage of ref for mounted state

    React.useEffect(() => {
        isMounted.current = true;

        const messageInterval = setInterval(() => {
            if (!isMounted.current) return;
            const messages = ["Hi! 👋", "Order Fast! 🚀", "Yum! 🍔", "Hungry? 🍕", "Vroom! 💨"];
            setMessage(prev => messages[(messages.indexOf(prev) + 1) % messages.length]);
        }, 4000); // Slower updates

        return () => {
            clearInterval(messageInterval);
            isMounted.current = false;
        };
    }, []);

    React.useEffect(() => {
        let timeoutId;

        const moveUFO = async () => {
            if (!isMounted.current) return;

            // 1. ENTERING / ROAMING SEQUENCE
            const moves = 4; // Fixed number of moves, less random churn

            for (let i = 0; i < moves; i++) {
                if (!isMounted.current) return;
                const newX = 10 + Math.random() * 80;
                const newY = 10 + Math.random() * 60;

                setDuration(4); // Slower, smoother
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
                rotate: [0, -3, 3, 0], // Reduced rotation
            }}
            transition={{
                x: { duration: duration, ease: "easeInOut" },
                y: { duration: duration, ease: "easeInOut" },
                rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="will-change-transform" // CSS optimization
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

// ... Auth Component ...
// (We will update the number of particles in the Auth component next)

const Auth = () => {
    const navigate = useNavigate();
    const { login, register } = useAuth();

    // Mode: 'login' | 'register' | 'forgot'
    const [mode, setMode] = useState('login');
    const [step, setStep] = useState(1); // Only for 'forgot' mode (1: Email, 2: OTP/Reset)
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

    // Dynamic Background Elements
    const [stars, setStars] = useState([]);
    const [foods, setFoods] = useState([]);
    const [meteors, setMeteors] = useState([]);

    useEffect(() => {
        // Generate Stars
        const genStars = Array.from({ length: 20 }).map((_, i) => ({ // Reduced from 40 to 20
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 0.5,
            delay: Math.random() * 5
        }));
        setStars(genStars);

        // Generate Subtle Floating Food - Reduced
        const foodEmojis = ['🍔', '🍕', '🍩', '🍦']; // Reduced to 4 items
        const genFoods = foodEmojis.map((emoji, i) => {
            let x, y;
            let attempts = 0;
            // Spread across entire page, only avoid the small center login box
            do {
                x = Math.random() * 100;
                y = Math.random() * 100;
                attempts++;
                // Only exclude the actual login box area (much smaller)
            } while (attempts < 50 && x > 35 && x < 65 && y > 25 && y < 75);

            return {
                id: i,
                emoji,
                x,
                y,
                delay: i * 0.5, // Staggered delays for one-by-one effect
                scale: Math.random() * 0.4 + 0.9,
                index: i
            };
        });
        setFoods(genFoods);

        // Generate Falling Meteors - Reduced
        const meteorEmojis = ['🍕', '🍔', '🌮']; // Reduced to 3 items
        const genMeteors = meteorEmojis.map((emoji, i) => ({
            id: i,
            emoji,
            startX: Math.random() * 80, // Start from different X positions
            delay: i * 4, // More staggered start times
            index: i
        }));
        setMeteors(genMeteors);
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
        setFormData(prev => ({ ...prev, otp: '', newPassword: '' })); // Clear sensitive/temp fields
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
            {/* Backgrounds */}
            <div className="absolute inset-0 z-0">
                {stars.map(star => (
                    <div key={star.id} className="absolute bg-white rounded-full opacity-60" style={{ left: `${star.x}%`, top: `${star.y}%`, width: `${star.size}px`, height: `${star.size}px` }} />
                ))}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 via-transparent to-orange-900/20" />
            </div>
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {foods.map(food => (
                    <FloatingFood key={food.id} {...food} />
                ))}
                {meteors.map(meteor => (
                    <FallingMeteor key={`meteor-${meteor.id}`} {...meteor} />
                ))}
            </div>


            {/* Floating UFO */}
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
