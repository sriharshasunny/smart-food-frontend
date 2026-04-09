import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';
import {
    User, Mail, Phone, MapPin, Save, LogOut, ChevronRight,
    Camera, Check, Package, Heart, Building, Settings, Bell, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    const [activeTab, setActiveTab] = useState('profile'); // profile, orders, settings

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
            
            const finalImage = avatarPreview === 'REMOVE' 
                ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop" 
                : (avatarPreview || user?.profile_image);

            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: formData.name, 
                    email: formData.email, 
                    phone: formData.phone, 
                    address: formData.address,
                    city: formData.city,
                    profile_image: finalImage
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

    // UI Helpers
    const InputField = ({ icon: Icon, label, name, type = "text", ...props }) => (
        <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                    {...props}
                />
            </div>
        </div>
    );

    const MenuButton = ({ icon: Icon, label, onClick, danger, active }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 ${
                active 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-lg shadow-orange-500/20 border border-orange-500/50'
                    : 'hover:bg-white bg-transparent text-gray-600 border border-transparent hover:border-gray-200 hover:shadow-sm'
            }`}
        >
            <div className="flex items-center gap-3.5">
                <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : danger ? 'bg-red-50 text-red-500' : 'bg-white shadow-sm border border-gray-100/50'}`}>
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : danger ? 'text-red-500' : 'text-gray-500'}`} />
                </div>
                <span className={`text-[13px] font-black tracking-wide ${active ? 'text-white' : danger ? 'text-red-600' : 'text-gray-700'}`}>{label}</span>
            </div>
            <ChevronRight className={`w-4 h-4 ${active ? 'text-white' : danger ? 'text-red-300' : 'text-gray-300'}`} />
        </button>
    );

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-24 pt-8 md:pt-12 font-sans relative overflow-hidden">
            {/* Soft Background Elements */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-white to-transparent pointer-events-none" />
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-orange-100 rounded-full blur-[120px] pointer-events-none opacity-50" />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Header */}
                <div className="mb-8 md:mb-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Account Settings</h1>
                    <p className="text-gray-500 font-medium mt-2">Manage your professional profile and application preferences.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                    
                    {/* Left Sidebar Menu */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Profile Mini Card */}
                        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex items-center gap-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent blur-2xl -translate-y-1/2 translate-x-1/4" />
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 bg-gray-100">
                                <img
                                    src={(avatarPreview || user?.profile_image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop")}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0 relative z-10">
                                <h3 className="font-black text-gray-900 text-lg truncate">{formData.name || "User"}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Verified User</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-3 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col gap-1">
                            <MenuButton icon={User} label="Profile Information" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                            <MenuButton icon={Package} label="Order History" onClick={() => navigate('/orders')} />
                            <MenuButton icon={Heart} label="Saved Items" onClick={() => navigate('/wishlist')} />
                            <MenuButton icon={Settings} label="Preferences" onClick={() => navigate('/settings')} />
                            <div className="h-px bg-gray-100 my-2 mx-4" />
                            <MenuButton icon={LogOut} label="Log Out" danger onClick={handleLogout} />
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {activeTab === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.03)] overflow-hidden"
                                >
                                    <div className="p-8 md:p-10 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-orange-500">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Personal Details</h2>
                                                <p className="text-sm text-gray-500 font-medium">Update your photo and personal configurations.</p>
                                            </div>
                                        </div>

                                        {/* Avatar Upload Area */}
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mt-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                                            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="relative shrink-0">
                                                <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden border-4 border-gray-50 shadow-inner bg-gray-100">
                                                    <img
                                                        src={(avatarPreview || user?.profile_image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop")}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-orange-500 hover:border-orange-200 transition-colors"
                                                >
                                                    <Camera className="w-4 h-4" />
                                                </button>
                                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                                            </div>
                                            <div className="text-center sm:text-left flex-1">
                                                <h4 className="text-sm font-black text-gray-900 mb-1">Profile Photo</h4>
                                                <p className="text-xs text-gray-500 mb-4 max-w-xs">Recommended: Square image, at least 400x400px. JPG or PNG format.</p>
                                                <div className="flex justify-center sm:justify-start gap-3">
                                                    <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 shadow-md transition-colors">
                                                        Upload New
                                                    </button>
                                                    <button onClick={() => setAvatarPreview('REMOVE')} className="px-5 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 hover:text-red-500 shadow-sm transition-colors">
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-8 md:p-10 bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                            <InputField icon={User} label="Full Name" name="name" placeholder="John Doe" />
                                            <InputField icon={Mail} label="Email Address" name="email" type="email" placeholder="john@example.com" readOnly className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 cursor-not-allowed opacity-70" />
                                            <InputField icon={Phone} label="Phone Number" name="phone" placeholder="+91 9876543210" />
                                            <InputField icon={Building} label="City" name="city" placeholder="Bangalore" />
                                            <div className="md:col-span-2">
                                                <InputField icon={MapPin} label="Complete Address" name="address" placeholder="123 Street Name, Area..." />
                                            </div>
                                        </div>

                                        <div className="mt-10 flex items-center justify-between pt-8 border-t border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                                                Changes apply immediately
                                            </p>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className={`px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg w-full sm:w-auto justify-center
                                                    ${saved 
                                                        ? 'bg-green-500 text-white shadow-green-500/20 hover:bg-green-600' 
                                                        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-orange-500/20 border border-orange-600/50'}`}
                                            >
                                                {saving ? (
                                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                ) : saved ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                {saving ? 'Saving...' : saved ? 'Saved Successfully' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
