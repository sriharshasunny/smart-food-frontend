import React, { useState } from 'react';
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

    const handleLogin = (e) => {
        e.preventDefault();
        if (inputID === ADMIN_CREDS.id) {
            setIsAuthenticated(true);
        } else {
            setError('Invalid Admin ID. Access Denied.');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black" />
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]" />

                <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-300 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <ShieldCheck className="w-8 h-8 text-black" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight">Admin Portal</h1>
                        <p className="text-gray-400 text-sm font-medium">Restricted Access Only</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Admin ID</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Enter Admin ID"
                                    value={inputID}
                                    onChange={(e) => {
                                        setInputID(e.target.value);
                                        setError('');
                                    }}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-10 py-3.5 text-white font-mono placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-white text-black font-black py-3.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mt-2"
                        >
                            Verify Identity <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                            Authorized Personnel: {ADMIN_CREDS.name}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <AdminRestaurantPanel />
        </div>
    );
};

export default AppAdmin;
