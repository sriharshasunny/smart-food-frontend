import React, { useState } from 'react';
import { API_URL } from '../config';
import { ShieldCheck, PlusCircle, CheckCircle, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminRestaurantPanel = () => {
    const [formData, setFormData] = useState({ name: '', email: '', address: '', cuisine: '' });
    const [createdCreds, setCreatedCreds] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/restaurant/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                setCreatedCreds({
                    name: formData.name,
                    id: formData.email,
                    password: formData.email // Per requirement: ID and Pass same
                });
                setFormData({ name: '', email: '', address: '', cuisine: '' });
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-10">
                    <div className="bg-black w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <ShieldCheck className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Admin Portal</h1>
                    <p className="text-gray-500 font-medium">Add new restaurant partners to the platform.</p>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-[2rem] p-8 border border-gray-200 shadow-xl"
                >
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <PlusCircle className="text-orange-500" /> Register Restaurant
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Restaurant Name</label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Login ID / Email</label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required
                                    placeholder="Used for login"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cuisine</label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none"
                                    value={formData.cuisine} onChange={e => setFormData({ ...formData, cuisine: e.target.value })} required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none"
                                    value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={isLoading}
                            className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition-all shadow-lg active:scale-95"
                        >
                            {isLoading ? "Creating..." : "Create Restaurant Account"}
                        </button>
                    </form>
                </motion.div>

                {/* Success Message / Credentials Display */}
                {createdCreds && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-6 relative overflow-hidden"
                    >
                        <div className="flex items-start gap-4 z-10 relative">
                            <CheckCircle className="text-green-600 w-8 h-8 shrink-0" />
                            <div>
                                <h3 className="text-lg font-bold text-green-900">Success! Account Created</h3>
                                <p className="text-green-700 text-sm mb-4">Please share these credentials with the restaurant owner.</p>

                                <div className="bg-white/80 p-4 rounded-xl border border-green-100 space-y-2 font-mono text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Login ID:</span>
                                        <span className="font-bold text-gray-900">{createdCreds.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Password:</span>
                                        <span className="font-bold text-gray-900">{createdCreds.password}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminRestaurantPanel;
