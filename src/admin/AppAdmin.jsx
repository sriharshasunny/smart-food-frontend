import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import AdminRestaurantPanel from '../pages/AdminRestaurantPanel';
import { ShieldCheck, Lock, ArrowRight, ScanLine, Terminal, Cpu, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_CREDS = {
    id: '6281871173',
    name: 'Harsha' // Display name -- USER REQUEST: Show this FIRST
};

const AppAdmin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginState, setLoginState] = useState('idle'); // idle, verifying, success
    const [inputID, setInputID] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginState('verifying');

        // Simulate scanning delay
        await new Promise(r => setTimeout(r, 1500));

        if (inputID === ADMIN_CREDS.id) {
            setLoginState('success');
            // Wait for "Access Granted" animation before showing dashboard
            setTimeout(() => setIsAuthenticated(true), 2000);
        } else {
            setLoginState('idle');
            setError('ACCESS DENIED: INVALID KEY');
            setInputID('');
        }
    };

    // --- CURTAIN ANIMATION ---
    if (isAuthenticated) {
        return (
            <div className="relative min-h-screen bg-black overflow-hidden font-sans">
                {/* The Dashboard -- Underlying Layer */}
                <Router>
                    <AdminRestaurantPanel />
                </Router>

                {/* The Blast Doors Overlay -- Top Layer */}
                <AnimatePresence>
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0, transition: { delay: 6.0, duration: 0.5 } }} // Fade out container LAST (after doors open)
                    >
                        {/* CAMERA SHAKE WRAPPER */}
                        <motion.div
                            className="absolute inset-0 flex"
                            animate={{ x: [-3, 3, -3, 3, 0], y: [2, -2, 0] }}
                            transition={{ duration: 0.5, delay: 3.5 }} // Shake when doors start opening
                        >
                            {/* LEFT DOOR */}
                            <motion.div
                                className="w-1/2 h-full bg-[#050505] border-r-4 border-cyan-900/50 relative overflow-hidden shadow-[10px_0_50px_rgba(0,0,0,0.9)] z-20 flex items-center justify-end"
                                initial={{ x: 0 }}
                                animate={{ x: '-105%' }}
                                transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 3.5 }} // Open AFTER text
                            >
                                {/* Industrial Texture - Carbon Fiber + Rivets */}
                                <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
                                <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,#fff_20px,#fff_21px)]" />

                                {/* Vertical Caution Stripe */}
                                <div className="absolute right-0 top-0 h-full w-24 bg-yellow-500/5 border-l border-yellow-500/10 flex flex-col items-center justify-around py-10">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="w-12 h-24 bg-yellow-500/20 skew-y-12 border-t border-b border-yellow-500/30 backdrop-blur-sm" />
                                    ))}
                                </div>

                                {/* Center Locking Piston (Left Half) */}
                                <motion.div
                                    className="w-32 h-48 bg-zinc-900 border-l-2 border-t-2 border-b-2 border-cyan-500/50 rounded-l-2xl flex items-center justify-end pr-4 shadow-[0_0_30px_rgba(0,255,255,0.1)] relative z-30"
                                    initial={{ x: 0 }}
                                    animate={{ x: -100, opacity: 0 }}
                                    transition={{ duration: 0.4, delay: 3.0, ease: "backIn" }} // Retract before door opens
                                >
                                    <div className="w-2 h-32 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(0,255,255,0.8)]" />
                                    {/* Sparks Emitter (Visual only) */}
                                    <div className="absolute right-0 top-1/2 w-1 h-1 bg-white animate-ping" />
                                </motion.div>
                            </motion.div>

                            {/* RIGHT DOOR */}
                            <motion.div
                                className="w-1/2 h-full bg-[#050505] border-l-4 border-cyan-900/50 relative overflow-hidden shadow-[-10px_0_50px_rgba(0,0,0,0.9)] z-20 flex items-center justify-start"
                                initial={{ x: 0 }}
                                animate={{ x: '105%' }}
                                transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 3.5 }}
                            >
                                {/* Industrial Texture */}
                                <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
                                <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(-45deg,transparent,transparent_20px,#fff_20px,#fff_21px)]" />

                                {/* Vertical Caution Stripe */}
                                <div className="absolute left-0 top-0 h-full w-24 bg-yellow-500/5 border-r border-yellow-500/10 flex flex-col items-center justify-around py-10">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="w-12 h-24 bg-yellow-500/20 -skew-y-12 border-t border-b border-yellow-500/30 backdrop-blur-sm" />
                                    ))}
                                </div>

                                {/* Center Locking Piston (Right Half) */}
                                <motion.div
                                    className="w-32 h-48 bg-zinc-900 border-r-2 border-t-2 border-b-2 border-cyan-500/50 rounded-r-2xl flex items-center justify-start pl-4 shadow-[0_0_30px_rgba(0,255,255,0.1)] relative z-30"
                                    initial={{ x: 0 }}
                                    animate={{ x: 100, opacity: 0 }}
                                    transition={{ duration: 0.4, delay: 3.0, ease: "backIn" }}
                                >
                                    <div className="w-2 h-32 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(0,255,255,0.8)]" />
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* WELCOME SEQUENCE (Plays WHILE doors are closed, 0s - 3s) */}
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.3, delay: 2.8 }} // Fade out right before pistons retract
                        >
                            <div className="text-center relative">
                                {/* Holographic Projector Beam */}
                                <motion.div
                                    className="absolute -top-40 left-1/2 -translate-x-1/2 w-1 h-40 bg-gradient-to-b from-transparent to-cyan-500/50 blur-sm"
                                    initial={{ height: 0 }} animate={{ height: 200 }} transition={{ duration: 0.2 }}
                                />

                                {/* Glithcy Welcome Text */}
                                <motion.h2
                                    className="text-6xl md:text-8xl font-black text-white tracking-[0.2em] mb-6 font-mono uppercase mix-blend-lighten"
                                    initial={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
                                    animate={{
                                        opacity: [0, 1, 1, 1], // Flash in
                                        scale: [2, 1, 1, 0.9], // Slam down
                                        filter: ["blur(20px)", "blur(0px)", "blur(0px)", "blur(2px)"],
                                        textShadow: [
                                            "0 0 0px #0ff",
                                            "2px 2px 0px #f0f, -2px -2px 0px #0ff", // RGB Split
                                            "0 0 10px #0ff",
                                            "0 0 0px #0ff"
                                        ]
                                    }}
                                    transition={{ duration: 0.8, ease: "circOut" }}
                                >
                                    WELCOME
                                </motion.h2>

                                {/* Commander Name with Scanning Laser */}
                                <div className="relative inline-block">
                                    <motion.h3
                                        className="text-5xl md:text-6xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500 tracking-widest relative z-10"
                                        initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
                                        animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
                                        transition={{ duration: 1.0, delay: 0.5, ease: "linear" }}
                                    >
                                        {ADMIN_CREDS.name}
                                    </motion.h3>

                                    {/* The Laser Scanner Line */}
                                    <motion.div
                                        className="absolute top-0 w-full h-[2px] bg-red-500 shadow-[0_0_20px_rgba(255,0,0,1)] z-20"
                                        initial={{ top: 0, opacity: 1 }}
                                        animate={{ top: "100%", opacity: 0 }}
                                        transition={{ duration: 1.0, delay: 0.5, ease: "linear" }}
                                    />

                                    {/* Residual Glow */}
                                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl -z-10 animate-pulse" />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    // --- LOGIN SCREEN ---
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white font-mono relative overflow-hidden">
            {/* Cyberpunk Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] perspective-1000 transform-style-3d opacity-30" />
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_20px_rgba(0,255,255,0.5)]" />
            <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.5)]" />

            {/* Main Login Module */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.01 }}
                className="relative z-10 w-full max-w-lg bg-black/80 backdrop-blur-xl border border-cyan-500/30 p-12 rounded-xl shadow-[0_0_60px_rgba(0,255,255,0.1)] overflow-hidden group"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-xl" />
                <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-purple-500/50 rounded-br-xl" />

                {/* HUD Corners */}
                <div className="absolute top-2 right-2 flex gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150" />
                </div>

                <div className="flex flex-col items-center mb-10">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 border-2 border-dashed border-cyan-500/50 rounded-full flex items-center justify-center mb-6 relative"
                    >
                        <div className="absolute inset-0 border border-cyan-500/20 rounded-full animate-ping" />
                        <ShieldCheck className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
                    </motion.div>

                    <h1 className="text-4xl font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
                        ADMIN_GATEWAY
                    </h1>
                    <p className="text-cyan-500/60 text-xs tracking-[0.3em] flex items-center gap-2">
                        <Cpu className="w-3 h-3" /> SECURE CONNECTION ESTABLISHED
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-8 relative">
                    {loginState === 'success' ? (
                        <div className="text-center py-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-green-500 text-6xl mb-4 mx-auto w-fit"
                            >
                                <ScanLine className="w-16 h-16 animate-pulse" />
                            </motion.div>
                            <h2 className="text-2xl text-green-400 tracking-widest font-bold animate-pulse">ACCESS GRANTED</h2>
                            <p className="text-green-500/50 text-sm mt-2 font-mono">Initiating Blast Door Sequence...</p>
                        </div>
                    ) : (
                        <>
                            <div className="relative group/input">
                                <Terminal className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500/50 group-focus-within/input:text-cyan-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="ENTER_PASSCODE_ID"
                                    value={inputID}
                                    onChange={(e) => {
                                        setInputID(e.target.value);
                                        setError('');
                                    }}
                                    className="w-full bg-black border border-cyan-500/30 rounded-lg px-14 py-5 text-cyan-100 font-mono tracking-widest focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all text-xl uppercase placeholder-cyan-900"
                                    autoFocus
                                    disabled={loginState === 'verifying'}
                                />
                                {/* Typing Cursor Effect */}
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2 h-6 bg-cyan-500/50 animate-pulse" />
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: [-10, 10, -10, 10, 0] }}
                                    transition={{ duration: 0.4 }}
                                    className="text-red-500 font-bold text-center bg-red-900/10 py-2 border border-red-500/30 rounded tracking-widest text-sm flex items-center justify-center gap-2"
                                >
                                    <AlertTriangle className="w-4 h-4" /> {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loginState === 'verifying'}
                                className="w-full bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 font-bold py-5 rounded-lg hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_50px_rgba(0,255,255,0.6)] transition-all flex items-center justify-center gap-3 text-lg tracking-widest disabled:opacity-50 disabled:cursor-not-allowed group/btn overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                {loginState === 'verifying' ? (
                                    <>
                                        <ScanLine className="w-5 h-5 animate-spin" />
                                        VERIFYING...
                                    </>
                                ) : (
                                    <>
                                        AUTHENTICATE <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </form>

                <div className="mt-10 text-center">
                    <p className="text-[10px] text-gray-600 font-mono">
                        SYSTEM ID: {ADMIN_CREDS.id.substring(0, 4)}**** • ENCRYPTION: AES-256
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AppAdmin;
