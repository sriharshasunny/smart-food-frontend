import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Rocket, User, Mail, Lock, CheckCircle,
    AlertCircle, Sparkles, ChevronRight, Zap
} from 'lucide-react';

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

    // --- METEOR SHOWER ENGINE ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const foodEmojis = ['🍔', '🍕', '🍩', '🌮', '🍦', '🍪', '🌶️', '🥩'];
        const meteors = [];

        // Meteor Class
        class Meteor {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width * 1.5 - canvas.width * 0.5; // Wide spawn area
                this.y = -100;
                this.size = Math.random() * 20 + 20; // Size of food
                this.speed = Math.random() * 10 + 5; // Fast!
                this.angle = Math.PI / 4; // 45 degrees
                this.emoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
                this.tailLength = Math.random() * 100 + 50;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = Math.random() * 0.1 - 0.05;
            }

            update() {
                this.x += this.speed;
                this.y += this.speed;
                this.rotation += this.rotationSpeed;

                if (this.y > canvas.height + 100 || this.x > canvas.width + 100) {
                    this.reset();
                }
            }

            draw() {
                ctx.save();

                // Draw Trail (Burning Entry)
                const gradient = ctx.createLinearGradient(this.x, this.y, this.x - this.tailLength, this.y - this.tailLength);
                gradient.addColorStop(0, 'rgba(255, 100, 0, 0.6)');
                gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

                ctx.strokeStyle = gradient;
                ctx.lineWidth = this.size * 0.8;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.tailLength, this.y - this.tailLength);
                ctx.stroke();

                // Draw Glowing Head
                ctx.shadowColor = 'orange';
                ctx.shadowBlur = 20;

                // Draw Food
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.font = `${this.size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.emoji, 0, 0);

                ctx.restore();
            }
        }

        // Initialize Meteors
        for (let i = 0; i < 15; i++) {
            meteors.push(new Meteor());
            // Pre-warm (scatter them initially)
            meteors[i].x = Math.random() * canvas.width;
            meteors[i].y = Math.random() * canvas.height;
        }

        const render = () => {
            // Trail Effect (Clear with opacity)
            // Hard clear for crisp movement
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Stars Static
            ctx.fillStyle = 'white';
            for (let i = 0; i < 100; i++) {
                // Simple static starfield for depth
                const x = (i * 137) % canvas.width;
                const y = (i * 243) % canvas.height;
                const size = (i % 3) / 2;
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // Update & Draw Meteors
            meteors.forEach(m => {
                m.update();
                m.draw();
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
        <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center relative overflow-hidden font-sans">
            {/* CANVAS BACKGROUND */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0 bg-[#050510]"
            />

            {/* Auth Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md p-6"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="w-16 h-16 bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20 mb-6"
                    >
                        <Zap className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold mb-2 text-white tracking-tight">
                        {mode === 'login' && 'Terminal Access'}
                        {mode === 'register' && 'New Pilot Registration'}
                        {mode === 'forgot' && 'Credential Recovery'}
                    </h1>
                </div>

                <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                    {/* Mode Toggle (Login/Register) */}
                    {mode !== 'forgot' && (
                        <div className="flex bg-black/40 rounded-xl p-1 mb-8 border border-white/5 relative z-10">
                            <motion.div
                                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 border border-white/10 rounded-lg shadow-sm"
                                animate={{ left: mode === 'register' ? 'calc(50% + 2px)' : '2px' }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            />
                            <button onClick={() => switchMode('login')} className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider z-10 relative transition-colors ${mode === 'login' ? 'text-white' : 'text-gray-500'}`}>Login</button>
                            <button onClick={() => switchMode('register')} className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider z-10 relative transition-colors ${mode === 'register' ? 'text-white' : 'text-gray-500'}`}>Register</button>
                        </div>
                    )}

                    {/* Messages */}
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 flex items-start gap-3 text-red-200 text-sm overflow-hidden">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-6 flex items-start gap-3 text-green-200 text-sm overflow-hidden">
                                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{successMsg}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* FORMS */}
                    <AnimatePresence mode="wait">

                        {/* LOGIN FORM */}
                        {mode === 'login' && (
                            <motion.form key="login" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} onSubmit={handleLogin} className="space-y-5 z-10 relative">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-700 focus:border-orange-500/50 focus:bg-white/5 focus:outline-none transition-all" placeholder="name@domain.com" required />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Password Code</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-700 focus:border-orange-500/50 focus:bg-white/5 focus:outline-none transition-all" placeholder="••••••••" required />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-1">
                                    <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-gray-500 hover:text-orange-400 transition-colors font-medium">Lost Keys?</button>
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-3.5 bg-white text-black rounded-xl font-bold hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2">
                                    {loading ? 'Authenticating...' : <>Access System <ChevronRight className="w-4 h-4" /></>}
                                </button>
                            </motion.form>
                        )}

                        {/* REGISTER FORM */}
                        {mode === 'register' && (
                            <motion.form key="register" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} onSubmit={handleRegister} className="space-y-5 z-10 relative">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Full Identification</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-700 focus:border-orange-500/50 focus:bg-white/5 focus:outline-none transition-all" placeholder="John Doe" required />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-700 focus:border-orange-500/50 focus:bg-white/5 focus:outline-none transition-all" placeholder="name@domain.com" required />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">Set Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-700 focus:border-orange-500/50 focus:bg-white/5 focus:outline-none transition-all" placeholder="••••••••" required />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-3.5 bg-white text-black rounded-xl font-bold hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4">
                                    {loading ? 'Processing...' : <>Initialize Account <ChevronRight className="w-4 h-4" /></>}
                                </button>
                            </motion.form>
                        )}

                        {/* FORGOT PASSWORD FORM */}
                        {mode === 'forgot' && (
                            <motion.form key="forgot" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="space-y-5 z-10 relative" onSubmit={step === 1 ? handleSendResetOtp : handleResetPassword}>
                                <button type="button" onClick={() => switchMode('login')} className="flex items-center text-xs font-bold text-gray-400 hover:text-white mb-6 uppercase tracking-wider"><ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back to Terminal</button>

                                {step === 1 ? (
                                    <>
                                        <div className="text-center mb-6">
                                            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Sparkles className="w-6 h-6 text-orange-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-white">Reset Credentials</h3>
                                            <p className="text-sm text-gray-500 mt-1">Enter your registered email frequency.</p>
                                        </div>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-700 focus:border-orange-500/50 focus:bg-white/5 focus:outline-none transition-all" placeholder="name@domain.com" required />
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full py-3.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-500 shadow-lg shadow-orange-500/20 mt-2 transition-all">
                                            {loading ? 'Transmitting...' : 'Send Recovery Code'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-center mb-6">
                                            <div className="w-full bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-green-400 text-xs font-mono mb-4">Signal locked: {formData.email}</div>
                                        </div>
                                        <div className="space-y-3">
                                            <input type="text" name="otp" value={formData.otp} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 text-center text-2xl tracking-[0.5em] text-white font-mono focus:border-green-500/50 focus:outline-none transition-all" placeholder="••••••" required maxLength={6} />
                                            <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-700 focus:border-green-500/50 focus:outline-none transition-all " placeholder="New Password" required />
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-500 shadow-lg shadow-green-500/20 mt-4 transition-all">
                                            {loading ? 'Updating...' : 'Confirm Reset'}
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
