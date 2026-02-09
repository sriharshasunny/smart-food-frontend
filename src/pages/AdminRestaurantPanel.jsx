import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { ShieldCheck, PlusCircle, CheckCircle, Trash2, AlertCircle, RefreshCw, Search, MapPin, Power, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    // Delete Modal State
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Auto-fill email based on name
    useEffect(() => {
        if (formData.name && !formData.email) {
            // Only auto-fill if email is empty to allow manual override
        }
    }, [formData.name]);

    const handleNameChange = (e) => {
        const name = e.target.value;
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        // If the email matches the previous auto-generated one (or is empty), update it
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
                setCreatedCreds(data.credentials || { id: formData.email, password: formData.email });
                setFormData({ name: '', email: '', cuisine: '', address: '' });
                fetchRestaurants();
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
        const newStatus = !currentStatus;
        // Optimistic UI update
        setRestaurants(prev => prev.map(r => r.id === id ? { ...r, is_active: newStatus } : r));

        try {
            await fetch(`${API_URL}/api/restaurant/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: newStatus })
            });
        } catch (error) {
            console.error("Toggle Error:", error);
            fetchRestaurants(); // Revert
        }
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`${API_URL}/api/restaurant/${deleteId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setRestaurants(prev => prev.filter(r => r.id !== deleteId));
                setDeleteId(null);
            } else {
                alert("Failed to delete restaurant");
            }
        } catch (error) {
            console.error("Delete Error:", error);
            alert("Network error during deletion");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-8 font-sans">
            <div className="max-w-7xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="bg-gradient-to-br from-gray-900 to-black w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
                        <ShieldCheck className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">Admin Portal</h1>
                    <p className="text-gray-500 font-medium text-lg">Manage Restaurant Partners & Access</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Create Form */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                            className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl sticky top-8"
                        >
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                                <PlusCircle className="text-orange-500 w-7 h-7" />
                                Add Restaurant
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Restaurant Name</label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        value={formData.name}
                                        onChange={handleNameChange}
                                        required
                                        placeholder="e.g. Burger King"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Login ID (Email)</label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-gray-600"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        placeholder="Auto-generated"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Cuisine Tags</label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 font-medium outline-none focus:border-gray-400 transition-all"
                                        value={formData.cuisine}
                                        onChange={e => setFormData({ ...formData, cuisine: e.target.value })}
                                        required
                                        placeholder="e.g. Burgers, Fast Food"
                                    />
                                    <div className="flex gap-2 mt-2 flex-wrap min-h-[24px]">
                                        {formData.cuisine.split(',').filter(c => c.trim()).map((c, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold border border-orange-100">
                                                {c.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Address</label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 font-medium outline-none focus:border-gray-400 transition-all"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        required
                                        placeholder="Full Location Address"
                                    />
                                </div>

                                <button
                                    type="submit" disabled={isLoading}
                                    className="w-full bg-black text-white font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-200 flex justify-center items-center gap-2"
                                >
                                    {isLoading ? <RefreshCw className="animate-spin w-5 h-5" /> : "Create Account"}
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: List & Stats */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Success Message */}
                        <AnimatePresence>
                            {createdCreds && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-green-500 rounded-[2rem] p-8 text-white shadow-xl shadow-green-500/20 relative overflow-hidden"
                                >
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-white/20 p-2 rounded-full">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-2xl font-black">Restaurant Added!</h3>
                                        </div>
                                        <p className="opacity-90 mb-6 max-w-lg">Share these credentials with the partner immediately.</p>

                                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-xs font-bold uppercase tracking-wider opacity-60 block mb-1">Login ID</span>
                                                <span className="text-lg font-mono font-bold select-all">{createdCreds.email}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold uppercase tracking-wider opacity-60 block mb-1">Password</span>
                                                <span className="text-lg font-mono font-bold select-all">{createdCreds.password}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Decorative circles */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-24 -mb-24"></div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Search / Filter (Visual only for now) */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-gray-900">Partners <span className="text-gray-400 text-lg">({restaurants.length})</span></h2>
                            {/* Placeholder for future search */}
                        </div>

                        {/* Restaurant Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {restaurants.map((rest) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={rest.id}
                                    className={`group relative bg-white rounded-3xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${rest.is_active === false ? 'border-red-100 bg-red-50/30' : 'border-gray-100 shadow-sm'
                                        }`}
                                >
                                    {/* Status Badge */}
                                    <div className="absolute top-5 right-5 z-10">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide flex items-center gap-1.5 ${rest.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${rest.is_active !== false ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {rest.is_active !== false ? 'Active' : 'Suspended'}
                                        </span>
                                    </div>

                                    {/* Card Content */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                            {rest.image ? (
                                                <img src={rest.image} alt={rest.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <MapPin className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="pt-1">
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{rest.name}</h3>
                                            <p className="text-xs text-gray-400 font-medium mb-2">{rest.email}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {Array.isArray(rest.cuisine) ? rest.cuisine.slice(0, 3).map((c, i) => (
                                                    <span key={i} className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                                        {c}
                                                    </span>
                                                )) : <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{rest.cuisine}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-2">
                                        <button
                                            onClick={() => toggleStatus(rest.id, rest.is_active !== false)}
                                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${rest.is_active !== false
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100' // Suspend Action
                                                    : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-200' // Activate Action
                                                }`}
                                        >
                                            <Power className="w-4 h-4" />
                                            {rest.is_active !== false ? 'Suspend Access' : 'Activate Access'}
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(rest.id)}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                            title="Delete Restaurant"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}

                            {restaurants.length === 0 && (
                                <div className="col-span-full py-20 text-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">No Partners Found</h3>
                                    <p className="text-gray-500">Get started by adding a restaurant on the left.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* DELETE MODAL */}
            <AnimatePresence>
                {deleteId && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteId(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-center text-gray-900 mb-2">Delete Restaurant?</h3>
                            <p className="text-center text-gray-500 mb-8 text-sm leading-relaxed">
                                This action is permanent. All food items and history associated with this restaurant will be wiped.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                                >
                                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminRestaurantPanel;
