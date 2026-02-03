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
        <div className="min-h-screen w-full bg-black text-white font-sans relative overflow-x-hidden flex items-center justify-center p-4">

            {/* 1. Fast CSS Background (No Canvas, No heavy blobs) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black z-0" />

            {/* 2. Static CSS Stars (Twinkling) - Zero JS Overhead */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {stars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute bg-white rounded-full animate-pulse"
                        style={{
                            top: star.top,
                            left: star.left,
                            width: star.size,
                            height: star.size,
                            opacity: Math.random() * 0.7 + 0.3,
                            animationDuration: `${star.delay + 2}s`
                        }}
                    />
                ))}
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
                {/* Left Panel: Avatar & Info */}
                <div className="md:w-1/3 bg-gradient-to-br from-gray-900 to-black p-8 flex flex-col items-center justify-center text-center relative border-r border-white/5">
                    <button onClick={() => navigate(-1)} className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-gray-300 hover:text-white">
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-orange-500 to-rose-600 shadow-lg shadow-orange-500/20">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-5xl font-black text-white">
                                {formData.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-white text-black p-2 rounded-full border-4 border-black shadow-lg">
                            <Camera className="w-4 h-4" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-1">{formData.name || 'User'}</h2>
                    <p className="text-gray-400 text-sm mb-8 break-all">{formData.email}</p>

                    <button
                        onClick={logout}
                        className="w-full py-3 bg-red-500/10 border border-red-500/50 text-red-400 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>

                {/* Right Panel: Form */}
                <div className="md:w-2/3 p-8 md:p-10 bg-black/20">
                    <div className="mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-orange-400" />
                        <h1 className="text-2xl font-bold">Edit Profile</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-3">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl font-medium text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all text-sm"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-3">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        readOnly
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl font-medium text-gray-500 cursor-not-allowed text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-3">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl font-medium text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all text-sm"
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-3">Delivery Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full pl-10 pr-32 py-3 bg-white/5 border border-white/10 rounded-xl font-medium text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all resize-none text-sm leading-relaxed"
                                    placeholder="Enter your address..."
                                />
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    disabled={loadingLocation}
                                    className="absolute right-2 bottom-2 bg-gradient-to-r from-orange-500 to-rose-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    <MapPin className="w-3 h-3" />
                                    {loadingLocation ? 'Locating...' : 'Locate Me'}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full py-3.5 bg-white text-black font-extrabold rounded-xl hover:bg-gray-200 shadow-lg shadow-white/5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
