import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import {
    User, Mail, Phone, MapPin, Save, LogOut, ChevronLeft,
    Camera, Check, Edit3, Package, Heart, Star,
    Shield, Clock, ChevronRight, Sparkles, Building, ListOrdered
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const FIELD_CSS = `
  .field-input {
    width: 100%; padding: 14px 16px 14px 52px;
    background: #fafafa; border: 1.5px solid #f0f0f0;
    border-radius: 14px; font-size: 14px; font-weight: 500; color: #111;
    outline: none; transition: all 0.2s;
  }
  .field-input:focus {
    background: #fff; border-color: #f97316;
    box-shadow: 0 0 0 4px rgba(249,115,22,0.08);
  }
  .field-input::placeholder { color: #ccc; }
  .field-input:read-only { background: #f5f5f5; color: #999; cursor: not-allowed; }
`;

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || ''
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || ''
            });
        }
    }, [user]);

    const handleImageUpload = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => setAvatarPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        if (e) e.preventDefault();
        let currentUser = user || (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
        if (!currentUser?._id) { alert('Please login again.'); return; }
        setSaving(true);
        try {
            const url = formData.email
                ? `${API_URL}/api/user/profile-by-email`
                : `${API_URL}/api/user/profile/${currentUser._id}`;
            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: formData.name, 
                    email: formData.email, 
                    phone: formData.phone, 
                    address: formData.address,
                    city: formData.city
                })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('user', JSON.stringify({ ...currentUser, ...data.user }));
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            } else { alert(data.message || 'Update failed'); }
        } catch { alert('Network error'); }
        finally { setSaving(false); }
    };

    const handleLogout = async () => {
        try { await logout(); } catch {}
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-[#f8f9fc] pb-20 overflow-x-hidden">
            <style>{FIELD_CSS}</style>
            
            {/* Mesh Gradient Hero Section */}
            <div className="relative h-80 md:h-96 w-full overflow-hidden bg-[#0D0D14]">
                {/* Dynamic Glows */}
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[120%] bg-gradient-to-br from-orange-600/20 to-transparent blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[100%] bg-gradient-to-tl from-indigo-600/20 to-transparent blur-[100px] rounded-full" />
                
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8"
                    >
                        {/* Avatar */}
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-[2.5rem] blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.2rem] bg-neutral-900 border-4 border-white overflow-hidden shadow-2xl">
                                <img
                                    src={avatarPreview || user?.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop"}
                                    alt="Profile"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                    <Camera className="text-white w-8 h-8" />
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                        </div>

                        <div className="text-center md:text-left flex-1 pb-2">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">Executive Tier</span>
                                <div className="h-1 w-12 bg-orange-500 rounded-full" />
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2">
                                {formData.name || "Foodie Explorer"}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {formData.email}</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-600 hidden md:block" />
                                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {formData.phone || "No phone added"}</span>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                            className="px-8 py-3.5 bg-white text-gray-900 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:shadow-orange-500/20 transition-all flex items-center gap-2"
                        >
                            Edit Credentials <ChevronRight className="w-4 h-4" />
                        </motion.button>
                    </motion.div>
                </div>
                
                {/* Wave Cut */}
                <div className="absolute bottom-0 left-0 w-full leading-none z-10">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                        <path d="M0 120L1440 120L1440 0C1440 0 1120 120 720 120C320 120 0 0 0 0L0 120Z" fill="#f8f9fc"/>
                    </svg>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Side: Stats & Navigation */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Stats HUD */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100/50">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 text-center md:text-left">Operational Snapshot</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-orange-50/50 rounded-3xl p-6 text-center border border-orange-100">
                                <p className="text-3xl font-black text-orange-600 mb-1">12</p>
                                <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Orders</p>
                            </div>
                            <div className="bg-indigo-50/50 rounded-3xl p-6 text-center border border-indigo-100">
                                <p className="text-3xl font-black text-indigo-600 mb-1">4.8</p>
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Rank</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access List */}
                    <div className="bg-white rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100/50 overflow-hidden">
                        {[
                            { icon: ListOrdered, label: "Order History", link: "/orders" },
                            { icon: Heart, label: "Wishlist Area", link: "/wishlist" },
                            { icon: User, label: "Personal Config", active: true },
                            { icon: Shield, label: "Security & Keys" },
                            { icon: LogOut, label: "Terminate Session", color: "text-red-500", onClick: handleLogout }
                        ].map((item, idx) => (
                            <button
                                key={idx}
                                onClick={item.onClick || (() => item.link && navigate(item.link))}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${item.active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className={`w-5 h-5 ${item.active ? 'text-white' : item.color || 'text-gray-400 group-hover:text-orange-500'}`} />
                                    <span className={`text-[11px] font-black uppercase tracking-[0.15em] ${item.active ? 'text-white' : 'text-gray-900'}`}>{item.label}</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 ${item.active ? 'text-white' : 'text-gray-300 group-hover:text-orange-500'}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Side: Identity Form */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden">
                        {/* Form HUD Header */}
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <User className="w-6 h-6 text-orange-500" /> Identity Matrix
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Authenticated Write</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            {/* Input Fields */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">Name / Callsign</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                                    <input name="name" value={formData.name} onChange={handleChange} className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">Mobile / Comm</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">Base Sector / Address</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                                    <input name="address" value={formData.address} onChange={handleChange} className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">City / Coordinate</label>
                                <div className="relative group">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-orange-500 transition-colors" />
                                    <input name="city" value={formData.city} onChange={handleChange} className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all" />
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-8 flex items-center justify-between border-t border-gray-50 mt-4">
                                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest italic">
                                    Identity Verification Sequence Active
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={saving}
                                    type="submit"
                                    className={`relative px-12 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl transition-all flex items-center gap-3
                                        ${saved 
                                            ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                                            : 'bg-gray-900 text-white hover:bg-orange-600 shadow-gray-900/10'}`}
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : saved ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {saving ? 'Processing...' : saved ? 'Credentials Saved' : 'Sync Identity'}
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
