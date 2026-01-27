import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { User, Mail, Phone, MapPin, Save, LogOut, ChevronLeft, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    // Initialize form with Context Data or Defaults
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || 'Detecting location...' // Default to detecting or empty
    });

    // 1. Fetch latest DB data if logged in
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
                            // If DB has address, use it, otherwise keep current (which might be GPS)
                            address: data.user.addresses?.find(a => a.isDefault)?.street || data.user.addresses?.[0]?.street || prev.address
                        }));
                    }
                })
                .catch(err => console.error("Failed to fetch profile:", err));
        }
    }, [user]);

    // 2. Dynamic Address: Auto-fetch location on mount if address is empty
    useEffect(() => {
        if (!formData.address || formData.address === 'Detecting location...') {
            handleGetLocation();
        }
    }, []);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            if (formData.address === 'Detecting location...') {
                setFormData(prev => ({ ...prev, address: '' }));
            }
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                    headers: { 'User-Agent': 'SmartFoodDeliveryApp/1.0' }
                });
                const data = await response.json();
                if (data.address) {
                    // Manually construct a more specific address
                    // Expanding keys to capture "Mangalpally" (likely hamlet/locality)
                    const addr = data.address;
                    const parts = [];

                    // Specific places
                    if (addr.amenity) parts.push(addr.amenity);
                    if (addr.house_number) parts.push(addr.house_number);
                    if (addr.building) parts.push(addr.building);
                    if (addr.road) parts.push(addr.road);

                    // Small localities - THIS IS KEY for Mangalpally
                    if (addr.hamlet) parts.push(addr.hamlet);
                    if (addr.locality) parts.push(addr.locality);
                    if (addr.village) parts.push(addr.village);
                    if (addr.suburb) parts.push(addr.suburb);
                    if (addr.neighbourhood) parts.push(addr.neighbourhood);

                    // Administrative areas
                    if (addr.city_district) parts.push(addr.city_district);
                    if (addr.city || addr.town || addr.county) parts.push(addr.city || addr.town || addr.county);

                    if (addr.state) parts.push(addr.state);
                    if (addr.postcode) parts.push(addr.postcode);

                    // Filter unique parts and join
                    const uniqueParts = [...new Set(parts)];
                    const locationString = uniqueParts.length > 0 ? uniqueParts.join(', ') : data.display_name;

                    setFormData(prev => ({ ...prev, address: locationString }));
                } else if (data.display_name) {
                    setFormData(prev => ({ ...prev, address: data.display_name }));
                }
            } catch (error) {
                console.error('Geocoding error:', error);
                alert('Failed to get address from coordinates');
            }
        }, (error) => {
            console.error('Geolocation error:', error);
            alert('Unable to retrieve your location');
            if (formData.address === 'Detecting location...') {
                setFormData(prev => ({ ...prev, address: '' }));
            }
        }, options);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
            // We DO send address to update it in DB as "current location"
            address: formData.address
        };

        try {
            // Priority: Try updating by ID if available
            let url = `${API_URL}/api/user/profile/${currentUser._id}`;
            let method = 'PUT';

            // Fallback/User Request: If for some reason we want to force update by email (or if ID is missing but we have email)
            // But here we just use the ID route if we have ID.
            // If the user specifically wants "update based on mail", we can use the new endpoint.
            // Let's use the new endpoint if we have email, as requested.

            if (payload.email) {
                url = `${API_URL}/api/user/profile-by-email`;
                // Payload already has email
            }

            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                // Update local context
                const updatedUser = { ...currentUser, ...data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.location.reload();
                alert('Profile updated successfully!');
            } else {
                alert(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error("Profile update error:", error);
            alert('Error updating profile: ' + (error.message || 'Unknown network error'));
        }
    };

    // Unconditional Render - No Loading Spinner Blocking, No Redirects
    const displayUser = user || { name: 'Guest', email: 'guest@example.com' };

    return (
        <div className="h-screen w-screen bg-gray-50/50 relative overflow-hidden flex items-center justify-center">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <motion.div
                    animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-200/30 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-200/30 rounded-full blur-[100px]"
                />
            </div>

            <div className="relative z-10 w-full max-w-5xl h-full p-6 flex flex-col justify-center">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-orange-500/10 border border-white/60 overflow-hidden flex flex-col md:flex-row h-auto max-h-[90vh]"
                >
                    {/* Left Panel: Avatar & Info */}
                    <div className="md:w-1/3 bg-gradient-to-br from-orange-50 to-rose-50 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

                        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 p-2 bg-white/50 hover:bg-white rounded-full transition-all text-gray-600">
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-xl">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-5xl font-black text-white">
                                    {formData.name?.[0] || 'U'}
                                </div>
                            </div>
                            <div className="absolute bottom-1 right-1 bg-gray-900 text-white p-2 rounded-full border-4 border-white shadow-lg">
                                <Camera className="w-4 h-4" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-1">{formData.name || 'User'}</h2>
                        <p className="text-gray-500 font-medium text-sm mb-6">{formData.email}</p>

                        <div className="w-full space-y-3">
                            <button
                                type="button"
                                onClick={logout}
                                className="w-full py-3 bg-white border border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50 hover:shadow-md transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Compact Form */}
                    <div className="md:w-2/3 p-8 md:p-10 flex flex-col justify-center bg-white">
                        <div className="mb-6">
                            <h1 className="text-2xl font-black text-gray-900">Edit Profile</h1>
                            <p className="text-gray-400 text-sm">Update your personal details below.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-3">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all text-sm"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-3">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            readOnly
                                            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-xl font-bold text-gray-500 cursor-not-allowed focus:ring-0 focus:bg-gray-100 transition-all text-sm"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-3">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all text-sm"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-3">Delivery Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all resize-none text-sm leading-relaxed"
                                        placeholder="Enter your full address..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!navigator.geolocation) {
                                                alert('Geolocation is not supported by your browser');
                                                return;
                                            }
                                            navigator.geolocation.getCurrentPosition(async (position) => {
                                                const { latitude, longitude } = position.coords;
                                                try {
                                                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                                                        headers: { 'User-Agent': 'SmartFoodDeliveryApp/1.0' }
                                                    });
                                                    const data = await response.json();
                                                    if (data.display_name) {
                                                        setFormData(prev => ({ ...prev, address: data.display_name }));
                                                    }
                                                } catch (error) {
                                                    console.error('Geocoding error:', error);
                                                    alert('Failed to get address from coordinates');
                                                }
                                            }, (error) => {
                                                console.error('Geolocation error:', error);
                                                alert('Unable to retrieve your location');
                                            });
                                        }}
                                        className="absolute right-2 bottom-2 bg-white shadow-sm text-gray-600 text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 border border-gray-100"
                                    >
                                        <MapPin className="w-3 h-3 text-orange-500" />
                                        Locate
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
