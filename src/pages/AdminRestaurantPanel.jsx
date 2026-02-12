import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, PlusCircle, RefreshCw, CheckCircle, MapPin, Power, Trash2, Search, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';
import { optimizeImage } from '../utils/imageOptimizer';



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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-900/20 to-transparent opacity-50" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute top-20 left-20 w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative max-w-7xl mx-auto p-6 md:p-12">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative bg-black border border-white/10 p-4 rounded-2xl shadow-2xl">
                                <ShieldCheck className="w-10 h-10 text-cyan-400" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                                COMMAND <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">CENTER</span>
                            </h1>
                            <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">
                                System Status: <span className="text-green-400">ONLINE</span> • {restaurants.length} Active Nodes
                            </p>
                        </div>
                    </div>

                    {/* Logout/Profile Placeholder */}
                    <div className="flex items-center gap-4">
                        <div className="h-10 px-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold tracking-wider text-gray-400">
                            ADMIN_V1.0
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN: Create Form */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                            className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] sticky top-8"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-t-3xl" />

                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <PlusCircle className="text-cyan-400 w-6 h-6" />
                                <span className="tracking-wide">INDUCT PARTNER</span>
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Restaurant Name</label>
                                    <input
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-medium"
                                        value={formData.name}
                                        onChange={handleNameChange}
                                        required
                                        placeholder="e.g. Cyber Burger"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">System ID (Email)</label>
                                    <input
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-300 placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono text-sm"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        placeholder="Auto-generated"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Cuisine Tags</label>
                                    <input
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                                        value={formData.cuisine}
                                        onChange={e => setFormData({ ...formData, cuisine: e.target.value })}
                                        required
                                        placeholder="e.g. Neon Noodles"
                                    />
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {formData.cuisine.split(',').filter(c => c.trim()).map((c, i) => (
                                            <span key={i} className="px-2 py-1 bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                {c.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Sector (Address)</label>
                                    <input
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        required
                                        placeholder="Sector 7, District 9"
                                    />
                                </div>

                                <button
                                    type="submit" disabled={isLoading}
                                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex justify-center items-center gap-2 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {isLoading ? <RefreshCw className="animate-spin w-5 h-5" /> : "Deploy Unit"}
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: List & Stats */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Success Message */}
                        <AnimatePresence>
                            {createdCreds && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-green-500/10 border border-green-500/50 rounded-2xl p-6 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.1)] relative overflow-hidden backdrop-blur-md"
                                >
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CheckCircle className="w-6 h-6" />
                                            <h3 className="text-xl font-black uppercase tracking-wide">Deployment Successful</h3>
                                        </div>
                                        <p className="opacity-80 mb-6 text-sm">Secure channel established. Transmit credentials immediately.</p>

                                        <div className="bg-black/40 rounded-xl p-4 border border-green-500/20 grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-1">Access ID</span>
                                                <span className="text-lg font-bold select-all text-white">{createdCreds.email}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-1">Access Key</span>
                                                <span className="text-lg font-bold select-all text-white">{createdCreds.password}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Search / Filter Header */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                                <h2 className="text-lg font-bold tracking-widest uppercase text-gray-300">Active Units <span className="text-gray-600">/</span> {restaurants.length}</h2>
                            </div>
                        </div>

                        {/* Restaurant Grid */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 gap-5"
                        >
                            {restaurants.map((rest) => (
                                <motion.div
                                    layout
                                    variants={itemVariants}
                                    key={rest.id}
                                    className={`group relative bg-zinc-900/40 backdrop-blur-md rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 ${rest.is_active === false
                                        ? 'border-red-500/30 bg-red-900/10'
                                        : 'border-white/5 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]'
                                        }`}
                                >
                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4 z-10">
                                        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border bg-black/40 backdrop-blur-sm ${rest.is_active !== false
                                            ? 'border-green-500/50 text-green-400'
                                            : 'border-red-500/50 text-red-400'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${rest.is_active !== false ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                {rest.is_active !== false ? 'Active' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-xl bg-black/60 overflow-hidden shrink-0 border border-white/10 relative">
                                            {rest.image ? (
                                                <img src={optimizeImage(rest.image, 150)} alt={rest.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="pt-0.5 min-w-0">
                                            <h3 className="font-bold text-white text-lg leading-tight mb-0.5 truncate pr-6">{rest.name}</h3>
                                            <p className="text-xs text-gray-500 font-mono mb-2 truncate">{rest.email}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {Array.isArray(rest.cuisine) ? rest.cuisine.slice(0, 3).map((c, i) => (
                                                    <span key={i} className="text-[9px] font-bold text-gray-400 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded">
                                                        {c}
                                                    </span>
                                                )) : <span className="text-[9px] font-bold text-gray-400 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded">{rest.cuisine}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-2">
                                        <button
                                            onClick={() => toggleStatus(rest.id, rest.is_active !== false)}
                                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border uppercase tracking-wider ${rest.is_active !== false
                                                ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                                                : 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                                                }`}
                                        >
                                            <Power className="w-3.5 h-3.5" />
                                            {rest.is_active !== false ? 'Suspend' : 'Activate'}
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(rest.id)}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all"
                                            title="Purge Data"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}

                            {restaurants.length === 0 && (
                                <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                        <Search className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">No Active Units</h3>
                                    <p className="text-gray-500 text-sm">Initialize deployment from the command panel.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* DELETE MODAL */}
            <AnimatePresence>
                {deleteId && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteId(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Warning Strip */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />

                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-black text-center text-white mb-2 uppercase tracking-wide">Confirm Purge</h3>
                            <p className="text-center text-gray-400 mb-8 text-sm leading-relaxed">
                                This action is irreversible. All associated data tracks will be permanently erased from the mainframe.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 py-3 rounded-xl font-bold bg-white/5 text-gray-300 hover:bg-white/10 transition-colors uppercase text-xs tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.4)] uppercase text-xs tracking-wider"
                                >
                                    {isDeleting ? 'Erasing...' : 'Execute Purge'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default AdminRestaurantPanel;
