import React, { useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import AdminRestaurantPanel from '../pages/AdminRestaurantPanel';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';

const ADMIN_CREDS = {
    id: '6281871173',
    name: 'Harsha' // Display name
};

const AppAdmin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [inputID, setInputID] = useState('');
    const [error, setError] = useState('');

    // Mock Stats for Dashboard
    const stats = [
        { label: 'Total Revenue', value: '₹12.5L', change: '+14%', icon: '💰', color: 'from-green-400 to-green-600' },
        { label: 'Total Orders', value: '1,240', change: '+28%', icon: '📦', color: 'from-blue-400 to-blue-600' },
        { label: 'Active Partners', value: '48', change: '+4%', icon: 'store', color: 'from-orange-400 to-orange-600' },
        { label: 'Avg. Rating', value: '4.8', change: '+0.2', icon: '⭐', color: 'from-yellow-400 to-yellow-600' },
    ];

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] animate-pulse delay-1000" />

                <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-400 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-white/10 rotate-3 hover:rotate-0 transition-all duration-500">
                            <ShieldCheck className="w-10 h-10 text-black" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">Admin Portal</h1>
                        <p className="text-gray-400 font-medium">Restricted Access • Ecstacy Food</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Enter Access Key"
                                    value={inputID}
                                    onChange={(e) => {
                                        setInputID(e.target.value);
                                        setError('');
                                    }}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-12 py-4 text-white font-mono placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-lg" // Increased visuals
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm font-bold text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20 animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 text-lg shadow-xl shadow-white/10"
                        >
                            Verify Identity <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            Authorized Personnel Only: {ADMIN_CREDS.name}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Authenticated Dashboard View
    return (
        <Router>
            <div className="min-h-screen bg-gray-50 font-sans">
                {/* Top Navigation Bar */}
                <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-20">
                            <div className="flex items-center gap-4">
                                <div className="bg-black text-white p-2.5 rounded-xl">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Admin Console</h1>
                                    <p className="text-xs text-gray-500 font-bold">v2.4.0 • Live</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-bold text-gray-900">Welcome, {ADMIN_CREDS.name}</p>
                                    <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Harsha"
                                    alt="Admin"
                                    className="w-10 h-10 rounded-full border-2 border-orange-100 bg-orange-50"
                                />
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    {/* Welcome Section */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-black text-white p-8 md:p-12 shadow-2xl">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-orange-600/30 to-transparent rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-600/20 to-transparent rounded-full blur-3xl -ml-20 -mb-20"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                                Good Evening, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-200">{ADMIN_CREDS.name}</span>.
                            </h2>
                            <p className="text-gray-400 text-lg max-w-2xl font-medium">
                                System performance is optimal. You have <span className="text-white font-bold">5 pending approvals</span> and revenue is up by <span className="text-green-400 font-bold">14%</span> this week.
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl shadow-lg`}>
                                        {/* Simple Emoji Icons for now */}
                                        <span className="text-white">{stat.label.includes('Revenue') ? '$' : stat.label.includes('Orders') ? '📦' : stat.label.includes('Partners') ? '🏪' : '⭐'}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
                                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Area - Restaurant Panel */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                        <div className="p-1">
                            <AdminRestaurantPanel />
                        </div>
                    </div>
                </main>
            </div>
        </Router>
    );
};

export default AppAdmin;
