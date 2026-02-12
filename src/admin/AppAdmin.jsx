import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import AdminRestaurantPanel from '../pages/AdminRestaurantPanel';
import { ShieldCheck, Lock, ArrowRight, ScanLine, Terminal, Cpu, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_CREDS = {
    id: '6281871173',
    name: 'Harsha' // Display name
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
                {/* The Dashboard */}
                <Router>
                    <AdminRestaurantPanel />
                </Router>

                {/* The Blast Doors Overlay */}
                <AnimatePresence>
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0, transition: { delay: 4.5, duration: 0.5 } }}
                    >
                        {/* LEFT DOOR */}
                        <motion.div
                            className="absolute left-0 top-0 w-1/2 h-full bg-[#111] border-r-4 border-cyan-900 overflow-hidden shadow-[10px_0_50px_rgba(0,0,0,0.8)] z-20"
                            initial={{ x: 0 }}
                            animate={{ x: '-105%' }}
                            transition={{ duration: 1.8, ease: "easeInOut", delay: 2.5 }}
                        >
                            {/* Industrial Texture */}
                            <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]" />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-40 mix-blend-overlay" />

                            {/* Vertical Caution Stripe */}
                            <div className="absolute right-0 top-0 h-full w-16 bg-yellow-500/10 border-l border-yellow-500/20 flex flex-col items-center justify-center gap-20 py-10">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-8 h-32 bg-yellow-500/20 skew-y-12 border border-yellow-500/30" />
                                ))}
                            </div>

                            {/* Center Locking Piston (Left Half) */}
                            <motion.div
                                className="absolute top-1/2 right-0 -translate-y-1/2 w-40 h-64 bg-zinc-800 border-l-2 border-t-2 border-b-2 border-cyan-500/50 rounded-l-3xl flex items-center justify-end pr-4 shadow-2xl"
                                initial={{ x: 0 }}
                                animate={{ x: -50 }}
                                transition={{ duration: 0.5, delay: 1.8 }}
                            >
                                <div className="w-4 h-40 bg-cyan-900 rounded-full animate-pulse" />
                            </motion.div>
                        </motion.div>

                        {/* RIGHT DOOR */}
                        <motion.div
                            className="absolute right-0 top-0 w-1/2 h-full bg-[#111] border-l-4 border-cyan-900 overflow-hidden shadow-[-10px_0_50px_rgba(0,0,0,0.8)] z-20"
                            initial={{ x: 0 }}
                            animate={{ x: '105%' }}
                            transition={{ duration: 1.8, ease: "easeInOut", delay: 2.5 }}
                        >
                            {/* Industrial Texture */}
                            <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,#000_10px,#000_20px)]" />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-40 mix-blend-overlay" />

                            {/* Vertical Caution Stripe */}
                            <div className="absolute left-0 top-0 h-full w-16 bg-yellow-500/10 border-r border-yellow-500/20 flex flex-col items-center justify-center gap-20 py-10">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-8 h-32 bg-yellow-500/20 -skew-y-12 border border-yellow-500/30" />
                                ))}
                            </div>

                            {/* Center Locking Piston (Right Half) */}
                            <motion.div
                                className="absolute top-1/2 left-0 -translate-y-1/2 w-40 h-64 bg-zinc-800 border-r-2 border-t-2 border-b-2 border-cyan-500/50 rounded-r-3xl flex items-center justify-start pl-4 shadow-2xl"
                                initial={{ x: 0 }}
                                animate={{ x: 50 }}
                                transition={{ duration: 0.5, delay: 1.8 }}
                            >
                                <div className="w-4 h-40 bg-cyan-900 rounded-full animate-pulse" />
                            </motion.div>
                        </motion.div>

                        {/* LOCKING MECHANISM - CENTER OVERLAY */}
                        <motion.div
                            className="absolute z-30 flex flex-col items-center gap-4"
                            initial={{ opacity: 1, scale: 1 }}
                            animate={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3, delay: 1.8 }}
                        >
                            <div className="w-32 h-32 bg-black border-4 border-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,255,255,0.4)] relative">
                                <div className="absolute inset-0 border-2 border-dashed border-cyan-500/50 rounded-full animate-[spin_10s_linear_infinite]" />
                                <Lock className="w-12 h-12 text-cyan-400" />
                                {/* Bolts */}
                                <motion.div
                                    className="absolute -top-4 w-4 h-12 bg-gray-300 rounded-sm"
                                    animate={{ y: -50, opacity: 0 }} transition={{ delay: 1.5, duration: 0.3 }}
                                />
                                <motion.div
                                    className="absolute -bottom-4 w-4 h-12 bg-gray-300 rounded-sm"
                                    animate={{ y: 50, opacity: 0 }} transition={{ delay: 1.5, duration: 0.3 }}
                                />
                            </div>
                            <div className="bg-black/80 px-4 py-1 rounded text-cyan-500 font-mono text-xs tracking-widest border border-cyan-900">
                                UNLOCKING...
                            </div>
                        </motion.div>

                        {/* WELCOME SEQUENCE */}
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 3 }}
                        >
                            <div className="text-center relative">
                                {/* Atmospheric Particles/Glitch Overlay */}
                                <div className="absolute inset-0 -m-20 bg-cyan-500/10 blur-[100px] animate-pulse" />

                                <motion.h2
                                    className="text-5xl md:text-7xl font-black text-white tracking-widest mb-4 font-mono uppercase mix-blend-screen"
                                    initial={{ opacity: 0, filter: "blur(20px)" }}
                                    animate={{
                                        opacity: [0, 1, 0.8, 1],
                                        filter: ["blur(20px)", "blur(0px)", "blur(2px)", "blur(0px)"],
                                        x: [0, -5, 5, 0]
                                    }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                >
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
                                        WELCOME
                                    </span>
                                </motion.h2>

                                <motion.h3
                                    className="text-4xl md:text-5xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 font-bold tracking-[0.2em] relative inline-block"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.5, type: "spring" }}
                                >
                                    {ADMIN_CREDS.name}
                                    {/* Scanline Effect */}
                                    <motion.div
                                        className="absolute top-0 left-0 w-full h-1 bg-white/50 shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                </motion.h3>

                                <div className="mt-8 flex justify-center gap-1">
                                    <motion.div className="w-20 h-1 bg-cyan-500" animate={{ width: [0, 80, 0] }} transition={{ repeat: Infinity, duration: 2 }} />
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
