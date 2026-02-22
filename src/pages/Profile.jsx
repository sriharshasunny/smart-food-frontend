import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../config';
import { User, Mail, Phone, MapPin, Save, LogOut, ChevronLeft, Camera, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Initialize form
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || 'Detecting location...'
    });

    const [loadingLocation, setLoadingLocation] = useState(false);

    // CSS Stars Generation (Memorized for performance)
    const stars = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 3
    })), []);

    // 1. Fetch latest DB data
    useEffect(() => {
        if (user?._id) {
            fetch(`${API_URL}/api/user/${user._id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        setFormData(prev => ({
                            ...prev,
                            name: data.user.name || prev.name,
                            email: data.user.email || prev.email,
                            phone: data.user.phone || prev.phone,
                            address: data.user.addresses?.find(a => a.isDefault)?.street || data.user.addresses?.[0]?.street || prev.address
                        }));
                    }
                })
                .catch(err => console.error("Failed to fetch profile:", err));
        }
    }, [user]);

    // 2. Auto-fetch location if empty
    useEffect(() => {
        if (!formData.address || formData.address === 'Detecting location...') {
            handleGetLocation();
        }
    }, []);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            if (formData.address === 'Detecting location...') setFormData(prev => ({ ...prev, address: '' }));
            return;
        }

        setLoadingLocation(true);
        const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                    headers: { 'User-Agent': 'SmartFoodDeliveryApp/1.0' }
                });
                const data = await response.json();
                if (data.address) {
                    const addr = data.address;
                    const parts = [];
                    // Build logical address string
                    const keys = ['amenity', 'house_number', 'building', 'road', 'hamlet', 'locality', 'village', 'suburb', 'neighbourhood', 'city_district', 'city', 'town', 'state', 'postcode'];
                    keys.forEach(k => { if (addr[k]) parts.push(addr[k]); });

                    const uniqueParts = [...new Set(parts)];
                    const locationString = uniqueParts.length > 0 ? uniqueParts.join(', ') : data.display_name;
                    setFormData(prev => ({ ...prev, address: locationString }));
                } else if (data.display_name) {
                    setFormData(prev => ({ ...prev, address: data.display_name }));
                }
            } catch (error) {
                console.error('Geocoding error:', error);
            } finally {
                setLoadingLocation(false);
            }
        }, (error) => {
            console.error('Geolocation error:', error);
            setLoadingLocation(false);
            if (formData.address === 'Detecting location...') setFormData(prev => ({ ...prev, address: '' }));
        }, options);
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Try to get user from Context OR LocalStorage (Fallback)
        let currentUser = user;
        if (!currentUser || !currentUser._id) {
            const stored = localStorage.getItem('user');
            if (stored) {
                try {
                    currentUser = JSON.parse(stored);
                } catch (e) {
                    console.error("Parse error", e);
                }
            }
        }

        if (!currentUser || !currentUser._id) {
            alert('Unable to identify user. Please login again.');
            return;
        }

        const payload = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address
        };

        try {
            let url = `${API_URL}/api/user/profile/${currentUser._id}`;
            let method = 'PUT';

            if (payload.email) {
                url = `${API_URL}/api/user/profile-by-email`;
            }

            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                const updatedUser = { ...currentUser, ...data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.location.reload();
                alert('Profile updated successfully!');
            } else {
                alert(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error("Profile update error:", error);
            alert('Error updating profile');
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 text-gray-800 font-sans relative flex items-center justify-center p-4 sm:p-6 lg:p-8">

            {/* Main Content Wrapper */}
            <div className="w-full max-w-5xl">

                {/* Header / Back Button section */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 bg-white text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full shadow-sm border border-gray-100 transition-all active:scale-95 flex items-center justify-center"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Account Settings</h1>
                </div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col md:flex-row relative z-10"
                >
                    {/* Left Panel: Avatar & Info */}
                    <div className="md:w-1/3 bg-gradient-to-br from-white to-gray-50 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100 relative">

                        {/* Decorative Background Element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full opacity-50 pointer-events-none" />

                        <div className="relative mb-6 group">
                            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-orange-400 to-orange-600 shadow-xl shadow-orange-500/20 transition-transform duration-300 group-hover:scale-105">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-5xl font-black text-orange-500 overflow-hidden relative">
                                    <span className="relative z-10">{formData.name?.[0]?.toUpperCase() || 'U'}</span>
                                    {/* Subtle internal gradient for depth */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
                                </div>
                            </div>
                            <button className="absolute bottom-1 right-1 bg-white text-gray-700 hover:text-orange-600 p-2.5 rounded-full border-2 border-white shadow-lg shadow-gray-200 transition-all hover:scale-110 active:scale-95 cursor-pointer z-20">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{formData.name || 'User'}</h2>
                        <p className="text-gray-500 text-sm mb-8 font-medium truncate w-full px-4">{formData.email}</p>

                        <button
                            onClick={logout}
                            className="w-full py-3.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group shadow-sm hover:shadow-md hover:shadow-red-500/20"
                        >
                            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Sign Out
                        </button>
                    </div>

                    {/* Right Panel: Form */}
                    <div className="md:w-2/3 p-8 md:p-10 bg-white">
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">Manage your details & delivery addresses</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-focus-within:bg-orange-50 transition-colors">
                                            <User className="w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-14 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm shadow-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                {/* Email Input (Readonly) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 ml-1">Email <span className="text-gray-400 font-normal ml-1">(Read-only)</span></label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            readOnly
                                            className="w-full pl-14 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-500 cursor-not-allowed text-sm shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Phone Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 ml-1">Phone Number</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-focus-within:bg-orange-50 transition-colors">
                                        <Phone className="w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-14 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm shadow-sm"
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                            </div>

                            {/* Address Input */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-xs font-bold text-gray-700">Delivery Address</label>
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        disabled={loadingLocation}
                                        className="text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <MapPin className="w-3 h-3" />
                                        {loadingLocation ? 'Locating...' : 'Auto Detect'}
                                    </button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-focus-within:bg-orange-50 transition-colors">
                                        <MapPin className="w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                    </div>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full pl-14 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all resize-none text-sm leading-relaxed shadow-sm block"
                                        placeholder="123 Main Street, Apt 4B, City, Country"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm tracking-wide rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Profile Details
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Decorative Elements outside card */}
                <div className="fixed top-20 right-20 w-64 h-64 bg-orange-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none" />
                <div className="fixed bottom-20 left-20 w-64 h-64 bg-rose-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none" />
            </div>
        </div>
    );
};

export default Profile;
