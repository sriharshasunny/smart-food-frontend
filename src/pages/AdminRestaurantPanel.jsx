import React, { useState } from 'react';
import { API_URL } from '../config';
import { ShieldCheck, PlusCircle, CheckCircle, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminRestaurantPanel = () => {
    const [restaurants, setRestaurants] = useState([]);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const res = await fetch(`${API_URL}/api/restaurant/all/list`);
            const data = await res.json();
            if (res.ok) setRestaurants(data);
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        // Optimistic Update
        const newStatus = !currentStatus;
        setRestaurants(prev => prev.map(r => r.id === id ? { ...r, is_active: newStatus } : r));

        try {
            await fetch(`${API_URL}/api/restaurant/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: newStatus })
            });
        } catch (error) {
            console.error("Toggle Error:", error);
            fetchRestaurants(); // Revert on error
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 font-sans">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-10">
                    <div className="bg-black w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <ShieldCheck className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">Admin Portal</h1>
                    <p className="text-gray-500 font-medium">Manage Platform & Partners</p>
                </div>

                {/* CREATE FORM */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-[2rem] p-8 border border-gray-200 shadow-xl mb-12"
                >
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <PlusCircle className="text-orange-500" /> Register New Restaurant
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

                {/* SUCCESS MESSAGE */}
                {createdCreds && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="mb-12 bg-green-50 border border-green-200 rounded-2xl p-6 relative overflow-hidden"
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

                {/* PARTNER LIST */}
                <div className="bg-white rounded-[2rem] border border-gray-200 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Registered Partners</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-6">Restaurant</th>
                                    <th className="p-6">Contact / ID</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {restaurants.map((rest) => (
                                    <tr key={rest.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6">
                                            <div className="font-bold text-gray-900">{rest.name}</div>
                                            <div className="text-xs text-gray-500">{rest.cuisine} • {rest.address}</div>
                                        </td>
                                        <td className="p-6 text-sm font-mono text-gray-600">
                                            {rest.email}
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${rest.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {rest.is_active !== false ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <button
                                                onClick={() => toggleStatus(rest.id, rest.is_active !== false)}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${rest.is_active !== false
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                    }`}
                                            >
                                                {rest.is_active !== false ? 'Suspend' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {restaurants.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-10 text-center text-gray-400">No restaurants found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRestaurantPanel;
