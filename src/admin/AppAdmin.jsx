import React, { useState, useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import AdminRestaurantPanel from '../pages/AdminRestaurantPanel';
import { ShieldCheck, Lock, ArrowRight, ScanLine, Terminal } from 'lucide-react';
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
    // If authenticated, we show the dashboard behind the curtains, then open them.

    if (isAuthenticated) {
        return (
            <div className="relative min-h-screen bg-gray-50 overflow-hidden">
                {/* The Dashboard */}
                <Router>
                    <AdminRestaurantPanel />
                </Router>

                {/* The Curtains Overlay (Animate Out) */}
                <AnimatePresence>
                    <motion.div
                        className="fixed inset-0 z-50 pointer-events-none flex"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0, transition: { delay: 2.5, duration: 1 } }}
                    >
                        {/* Left Curtain */}
                        <motion.div
                            className="w-1/2 h-full bg-black border-r border-cyan-500/50 shadow-[0_0_50px_rgba(0,255,255,0.2)]"
                            initial={{ x: 0 }}
                            animate={{ x: '-100%' }}
                            transition={{ duration: 1.5, ease: "circInOut", delay: 0.5 }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-cyan-400/50 blur-sm" />
                        </motion.div>

                        {/* Right Curtain */}
                        <motion.div
                            className="w-1/2 h-full bg-black border-l border-cyan-500/50 shadow-[0_0_50px_rgba(0,255,255,0.2)]"
                            initial={{ x: 0 }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 1.5, ease: "circInOut", delay: 0.5 }}
                        >
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-cyan-400/50 blur-sm" />
                        </motion.div>

                        {/* Welcome Text (Fades out before curtains open) */}
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center z-50"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: [0, 1, 1, 0],
                                scale: [0.8, 1, 1, 1.5],
                            }}
                            transition={{ duration: 2.5, times: [0, 0.2, 0.8, 1] }}
                        >
                            <div className="text-center">
                                <h2 className="text-4xl md:text-6xl font-black text-white tracking-[0.2em] mb-4 font-mono">
                                    WELCOME COMMANDER
                                </h2>
                                <h3 className="text-2xl md:text-3xl text-cyan-400 font-mono tracking-widest animate-pulse">
                                    {ADMIN_CREDS.name}
                                </h3>
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
                className="relative z-10 w-full max-w-lg bg-black/80 backdrop-blur-xl border border-cyan-500/30 p-12 rounded-xl shadow-[0_0_60px_rgba(0,255,255,0.1)] overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-xl" />
                <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-purple-500/50 rounded-br-xl" />

                <div className="flex flex-col items-center mb-10">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 border-2 border-dashed border-cyan-500/50 rounded-full flex items-center justify-center mb-6 relative"
                    >
                        <div className="absolute inset-0 border border-cyan-500/20 rounded-full animate-ping" />
                        <ShieldCheck className="w-10 h-10 text-cyan-400" />
                    </motion.div>

                    <h1 className="text-4xl font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                        ADMIN_GATEWAY
                    </h1>
                    <p className="text-cyan-500/60 text-xs tracking-[0.3em]">SECURE CONNECTION ESTABLISHED</p>
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
                            <h2 className="text-2xl text-green-400 tracking-widest font-bold">ACCESS GRANTED</h2>
                            <p className="text-green-500/50 text-sm mt-2">Initializing System Sequence...</p>
                        </div>
                    ) : (
                        <>
                            <div className="relative group">
                                <Terminal className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors" />
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
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 font-bold text-center bg-red-900/20 py-2 border border-red-500/30 rounded tracking-widest text-sm"
                                >
                                    ⚠ {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loginState === 'verifying'}
                                className="w-full bg-cyan-500/10 border border-cyan-500 text-cyan-400 font-bold py-5 rounded-lg hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_40px_rgba(0,255,255,0.4)] transition-all flex items-center justify-center gap-3 text-lg tracking-widest disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loginState === 'verifying' ? (
                                    <>
                                        <ScanLine className="w-5 h-5 animate-spin" />
                                        VERIFYING...
                                    </>
                                ) : (
                                    <>
                                        AUTHENTICATE <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
