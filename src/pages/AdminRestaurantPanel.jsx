import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { ShieldCheck, PlusCircle, CheckCircle, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminRestaurantPanel = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [createdCreds, setCreatedCreds] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cuisine: '',
        address: ''
    });

    // Auto-fill email based on name
    useEffect(() => {
        if (formData.name && !formData.email) {
            // Only auto-fill if email is empty to allow manual override
            // This is a simple convenience, user can still edit
        }
    }, [formData.name]);

    const handleNameChange = (e) => {
        const name = e.target.value;
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        // If the email matches the previous auto-generated one (or is empty), update it
        // Otherwise keep user's manual entry
        setFormData(prev => {
            const prevCleanName = prev.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const expectedEmail = prevCleanName ? `${prevCleanName}@gmail.com` : '';

            let newEmail = prev.email;
            if (!prev.email || prev.email === expectedEmail) {
                newEmail = cleanName ? `${cleanName}@gmail.com` : '';
            }
            return { ...prev, name, email: newEmail };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setCreatedCreds(null);
        try {
            const res = await fetch(`${API_URL}/api/restaurant/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                // Use returned credentials if available, else fallback to form data
                setCreatedCreds(data.credentials || { id: formData.email, password: formData.email });
                setFormData({ name: '', email: '', cuisine: '', address: '' });
                fetchRestaurants(); // Refresh list
            } else {
                alert(data.message + (data.error ? `\nDetails: ${data.error}` : "") || "Failed to create");
            }
        } catch (error) {
            console.error(error);
            alert("Network Error: Failed to create restaurant");
        } finally {
            setIsLoading(false);
        }
    };

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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Restaurant Name</label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    value={formData.name}
                                    onChange={handleNameChange} // Auto-fills email
                                    required
                                    placeholder="e.g. Spicy Hut"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Login ID / Email</label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="Auto-generated or custom"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 pl-1">This will be the login ID</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cuisine</label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-gray-400 transition-all"
                                    value={formData.cuisine}
                                    onChange={e => setFormData({ ...formData, cuisine: e.target.value })}
                                    required
                                    placeholder="e.g. Indian, Chinese"
                                />
                                <div className="flex gap-1 mt-2 flex-wrap">
                                    {formData.cuisine.split(',').filter(c => c.trim()).map((c, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold border border-gray-200">
                                            {c.trim()}
                                        </span>
                                    ))}
                                    {formData.cuisine === '' && <span className="text-[10px] text-gray-300 italic">Separate with commas...</span>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-gray-400 transition-all"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    placeholder="Location address"
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={isLoading}
                            className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition-all shadow-lg active:scale-95 flex justify-center items-center gap-2"
                        >
                            {isLoading ? <RefreshCw className="animate-spin w-5 h-5" /> : "Create Restaurant Account"}
                        </button>
                    </form>
                </motion.div>

                {/* SUCCESS MESSAGE */}
                {createdCreds && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="mb-12 bg-green-50 border border-green-200 rounded-[2rem] p-8 relative overflow-hidden shadow-lg"
                    >
                        <div className="flex items-start gap-4 z-10 relative">
                            <div className="bg-green-100 p-2 rounded-full">
                                <CheckCircle className="text-green-600 w-8 h-8 shrink-0" />
                            </div>
                            <div className="w-full">
                                <h3 className="text-xl font-bold text-green-900 mb-1">Success! Account Created</h3>
                                <p className="text-green-700 text-sm mb-4">Please share these credentials with the restaurant owner.</p>

                                <div className="bg-white/90 p-5 rounded-xl border border-green-100 space-y-3 font-mono text-sm shadow-sm">
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">Login ID</span>
                                        <span className="font-bold text-gray-900 text-lg">{createdCreds.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">Password</span>
                                        <span className="font-bold text-gray-900 text-lg">{createdCreds.password}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* PARTNER LIST */}
                <div className="bg-white rounded-[2rem] border border-gray-200 shadow-xl overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Registered Partners</h2>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{restaurants.length} Total</span>
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
                                    <tr key={rest.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-6">
                                            <div className="font-bold text-gray-900">{rest.name}</div>
                                            <div className="text-xs text-gray-500 flex gap-1 mt-1">
                                                {Array.isArray(rest.cuisine) ? rest.cuisine.join(', ') : rest.cuisine}
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm font-mono text-gray-600">
                                            {rest.email}
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${rest.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${rest.is_active !== false ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {rest.is_active !== false ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <button
                                                onClick={() => toggleStatus(rest.id, rest.is_active !== false)}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${rest.is_active !== false
                                                    ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
                                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200'
                                                    }`}
                                            >
                                                {rest.is_active !== false ? 'Suspend' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {restaurants.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-10 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                                            <AlertCircle className="w-8 h-8 opacity-20" />
                                            <span>No restaurants found. Add one above!</span>
                                        </td>
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
