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
    // ACTIVE ROAMING UFO (User Liked This)
    const controls = useAnimation();
    const [message, setMessage] = useState("Hi! 👋");

    useEffect(() => {
        let isMounted = true;

        const roam = async () => {
            if (!isMounted) return;
            // Random destination (10% to 90% screen space)
            const nextX = Math.random() * 80 + 10;
            const nextY = Math.random() * 80 + 10;
            const duration = Math.random() * 4 + 3; // Slow, drifting movement

            await controls.start({
                left: `${nextX}%`,
                top: `${nextY}%`,
                transition: { duration: duration, ease: "easeInOut" }
            });

            if (isMounted) setTimeout(roam, Math.random() * 1000 + 500);
        };
        roam();

        const msgInterval = setInterval(() => {
            const msgs = ["Hungry? 🍔", "Scanning... 🛸", "Warp Speed! 🚀", "Tasty! 🍩", "Beep Boop 🤖"];
            setMessage(msgs[Math.floor(Math.random() * msgs.length)]);
        }, 4000);

        return () => { isMounted = false; clearInterval(msgInterval); };
    }, [controls]);

    return (
        <motion.div
            animate={controls}
            className="fixed z-20 pointer-events-none flex flex-col items-center"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
            <motion.div
                animate={{ rotate: [0, 5, -5, 0], y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl filter drop-shadow-[0_0_20px_rgba(0,255,100,0.6)]"
            >
                🛸
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={message}
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
    const [mode, setMode] = useState('login');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', newPassword: '', otp: '' });
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // --- HYBRID ENGINE: Floating Food + Light Meteors ---
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

        // Entities
        const meteors = [];
        const foods = [];

        // Meteor Class (Shooting Stars)
        class Meteor {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height * 0.5; // Top half spawn
                this.length = Math.random() * 80 + 20;
                this.speed = Math.random() * 10 + 5;
                this.angle = Math.PI / 4; // 45 deg
                this.opacity = 0;
                this.active = false;
                this.wait = Math.random() * 200; // Delay spawn
            }
            update() {
                if (this.wait > 0) {
                    this.wait--;
                    if (this.wait <= 0) {
                        this.active = true;
                        this.opacity = 1;
                    }
                    return;
                }
                if (!this.active) return;

                this.x += this.speed;
                this.y += this.speed;
                this.opacity -= 0.02; // Fade out trail

                if (this.opacity <= 0 || this.x > canvas.width || this.y > canvas.height) {
                    this.reset();
                    this.wait = Math.random() * 500; // Reset delay
                }
            }
            draw() {
                if (!this.active || this.opacity <= 0) return;
                ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.length, this.y - this.length);
                ctx.stroke();
            }
        }

        // Floating Food Class (Disappearing)
        class FloatingFood {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.emoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
                this.size = Math.random() * 20 + 20;
                this.dx = (Math.random() - 0.5) * 0.5; // Slow drift
                this.dy = (Math.random() - 0.5) * 0.5;

                // Opacity Cycle
                this.opacity = 0;
                this.phase = 'in'; // in, wait, out
                this.fadeSpeed = 0.01 + Math.random() * 0.01;
                this.waitTimer = Math.random() * 200 + 100;
            }
            update() {
                this.x += this.dx;
                this.y += this.dy;

                if (this.phase === 'in') {
                    this.opacity += this.fadeSpeed;
                    if (this.opacity >= 0.6) this.phase = 'wait';
                } else if (this.phase === 'wait') {
                    this.waitTimer--;
                    if (this.waitTimer <= 0) this.phase = 'out';
                } else if (this.phase === 'out') {
                    this.opacity -= this.fadeSpeed;
                    if (this.opacity <= 0) this.reset();
                }
            }
            draw() {
                ctx.globalAlpha = Math.max(0, this.opacity);
                ctx.font = `${this.size}px Arial`;
                ctx.fillText(this.emoji, this.x, this.y);
                ctx.globalAlpha = 1;
            }
        }

        // Populate
        for (let i = 0; i < 5; i++) meteors.push(new Meteor()); // Few shooting stars
        for (let i = 0; i < 15; i++) foods.push(new FloatingFood());

        const render = () => {
            // Background
            ctx.fillStyle = '#050510';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Stars (Static)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            for (let i = 0; i < 80; i++) {
                const x = (i * 137) % canvas.width;
                const y = (i * 541) % canvas.height;
                ctx.fillRect(x, y, 2, 2);
            }

            meteors.forEach(m => { m.update(); m.draw(); });
            foods.forEach(f => { f.update(); f.draw(); });

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
    }, []);

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(null); };
    const switchMode = (mode) => { setMode(mode); setStep(1); setError(null); setSuccessMsg(null); };

    // ... (Keep existing handlers slightly compacted)
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
            <RoamingUFO />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-lg p-6">
                <div className="text-center mb-8">
                    <motion.div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-rose-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-4 z-20 relative"><Rocket className="w-10 h-10 text-white" /></motion.div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight drop-shadow-lg">{mode === 'login' ? 'Pilot Access' : mode === 'register' ? 'New Recruit' : 'Recovery Mode'}</h1>
                </div>

                <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 border border-white/5 rounded-[2rem] pointer-events-none"></div>
                    {mode !== 'forgot' && (
                        <div className="flex bg-black/40 rounded-xl p-1 mb-8 border border-white/5 relative">
                            <motion.div className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-orange-500 to-rose-600 rounded-lg shadow-lg" animate={{ left: mode === 'register' ? 'calc(50% + 2px)' : '2px' }} transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                            <button onClick={() => switchMode('login')} className="flex-1 py-3 text-sm font-bold z-10 relative text-white">Login</button>
                            <button onClick={() => switchMode('register')} className="flex-1 py-3 text-sm font-bold z-10 relative text-white">Sign Up</button>
                        </div>
                    )}

                    <AnimatePresence>
                        {error && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 flex items-start gap-3 text-red-200 text-sm"><AlertCircle className="w-4 h-4" /> {error}</motion.div>}
                        {successMsg && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-6 flex items-start gap-3 text-green-200 text-sm"><CheckCircle className="w-4 h-4" /> {successMsg}</motion.div>}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {mode === 'login' && (
                            <motion.form key="login" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-2"><label className="text-xs font-bold text-gray-400">EMAIL</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" required /></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-gray-400">PASSWORD</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" required /></div>
                                <div className="flex justify-end"><button type="button" onClick={() => switchMode('forgot')} className="text-xs text-orange-400 hover:text-white">Forgot?</button></div>
                                <button type="submit" disabled={loading} className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 flex justify-center gap-2">{loading ? '...' : 'Launch'}</button>
                            </motion.form>
                        )}
                        {mode === 'register' && (
                            <motion.form key="register" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} onSubmit={handleRegister} className="space-y-5">
                                <div className="space-y-2"><label className="text-xs font-bold text-gray-400">NAME</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" required /></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-gray-400">EMAIL</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" required /></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-gray-400">PASSWORD</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" required /></div>
                                <button type="submit" disabled={loading} className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 flex justify-center gap-2">{loading ? '...' : 'Join'}</button>
                            </motion.form>
                        )}
                        {mode === 'forgot' && (<motion.form key="forgot" className="space-y-5" onSubmit={step === 1 ? handleSendResetOtp : handleResetPassword}>
                            <button type="button" onClick={() => switchMode('login')} className="text-xs font-bold text-gray-400 hover:text-white mb-4">Back</button>
                            {step === 1 ? (<><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" placeholder="Email" required /><button type="submit" className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold">Send Code</button></>) :
                                (<><input type="text" name="otp" value={formData.otp} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" placeholder="OTP" /><input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4" placeholder="New Password" /><button type="submit" className="w-full py-4 bg-green-600 text-white rounded-xl font-bold">Reset</button></>)}
                        </motion.form>)}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
export default Auth;
