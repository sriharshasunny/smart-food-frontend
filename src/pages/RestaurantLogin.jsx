import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { ChefHat, Store, MapPin, Mail, Lock, ArrowRight, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

const RestaurantLogin = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/restaurant/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                // Store Restaurant Data
                const restData = data.restaurant;
                localStorage.setItem('restaurant', JSON.stringify(restData));
                localStorage.setItem('restaurant_id', restData._id || restData.id);
                if (data.token) localStorage.setItem('restaurant_token', data.token);

                navigate('/dashboard');
            } else {
                alert(data.message || 'Authentication failed');
            }
        } catch (error) {
            console.error(error);
            alert('Server error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black opacity-80" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 md:p-12 w-full max-w-lg shadow-2xl relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 transform rotate-3">
                        <ChefHat className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                        Restaurant Partner
                    </h1>
                    <p className="text-gray-400 font-medium">
                        Login to your dashboard
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Restaurant Login ID (Email)"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? (
                            <Loader className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                Login
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer - Admin Link Hint */}
                <div className="mt-8 text-center text-sm font-medium text-gray-500">
                    <p>
                        Need an account? Contact Admin.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default RestaurantLogin;
