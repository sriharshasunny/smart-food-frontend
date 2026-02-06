import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import {
    LayoutDashboard, Plus, Package, DollarSign, Image as ImageIcon,
    X, Trash2, Edit2, LogOut, TrendingUp, Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RestaurantDashboard = () => {
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [stats, setStats] = useState({ totalItems: 0, activeOrders: 0, revenue: 0 });
    const [foods, setFoods] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [newItem, setNewItem] = useState({
        name: '',
        price: '',
        description: '',
        category: 'Main Course',
        image: '',
        isVeg: true
    });

    useEffect(() => {
        const stored = localStorage.getItem('restaurant');
        if (!stored) {
            navigate('/restaurant/login');
            return;
        }
        const parsed = JSON.parse(stored);
        setRestaurant(parsed);
        fetchDashboardData(parsed._id || parsed.id);
    }, []);

    const fetchDashboardData = async (id) => {
        setIsLoading(true);
        try {
            // 1. Fetch Stats
            const statsRes = await fetch(`${API_URL}/api/restaurant/${id}/dashboard`);
            const statsData = await statsRes.json();
            setStats(statsData);

            // 2. Fetch Menu
            const menuRes = await fetch(`${API_URL}/api/food/restaurant/${id}`);
            const menuData = await menuRes.json();
            setFoods(menuData);
        } catch (error) {
            console.error("Dashboard Load Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('restaurant');
        navigate('/restaurant/login');
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/food/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId: restaurant._id || restaurant.id,
                    ...newItem,
                    price: parseFloat(newItem.price)
                })
            });

            if (res.ok) {
                setShowAddModal(false);
                setNewItem({ name: '', price: '', description: '', category: 'Main Course', image: '', isVeg: true });
                fetchDashboardData(restaurant._id || restaurant.id);
            } else {
                const err = await res.json();
                alert(err.message || 'Error adding item');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await fetch(`${API_URL}/api/food/${id}`, { method: 'DELETE' });
            // Optimistic update
            setFoods(prev => prev.filter(item => item.id !== id));
            setStats(prev => ({ ...prev, totalItems: prev.totalItems - 1 }));
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleStock = async (id, currentStatus) => {
        const newStatus = !currentStatus;
        // Optimistic
        setFoods(prev => prev.map(f => f.id === id ? { ...f, available: newStatus } : f));

        try {
            await fetch(`${API_URL}/api/food/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ available: newStatus })
            });
        } catch (error) {
            console.error(error);
            fetchDashboardData(restaurant._id || restaurant.id); // Revert
        }
    };

    if (!restaurant) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
                <div className="p-8">
                    <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
                        <span className="text-orange-500">Partner</span>Hub
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 text-orange-700 font-bold rounded-xl transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
                        <Package className="w-5 h-5" />
                        Orders <span className="ml-auto bg-gray-100 text-gray-600 px-2 rounded-md text-xs py-0.5">Soon</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
                        <DollarSign className="w-5 h-5" />
                        Earnings
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-500 font-bold px-4 py-3 hover:bg-red-50 rounded-xl transition-colors">
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8">
                {/* Topbar */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Welcome, {restaurant.name}</h2>
                        <p className="text-gray-500 font-medium">Manage your restaurant and menu.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white px-4 py-2 rounded-full border border-gray-200 font-bold text-sm shadow-sm">
                            {restaurant.address}
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                            <Utensils className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">Total Items</p>
                            <p className="text-3xl font-black text-gray-900">{stats.totalItems}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-500 rounded-xl">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">Revenue</p>
                            <p className="text-3xl font-black text-gray-900">₹{stats.revenue}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
                        <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">Orders</p>
                            <p className="text-3xl font-black text-gray-900">{stats.activeOrders}</p>
                        </div>
                    </div>
                </div>

                {/* Menu Section */}
                <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900">Menu Items</h3>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-gray-200"
                        >
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                            <div className="text-center py-20 text-gray-400 font-medium">Loading menu...</div>
                        ) : foods.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Utensils className="w-8 h-8 text-gray-300" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">No items found</h4>
                                <p className="text-gray-500 text-sm mt-1">Start by adding your first dish!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {foods.map((food) => (
                                    <div key={food.id} className="group bg-white rounded-2xl border border-gray-200 p-3 flex gap-4 hover:shadow-xl hover:border-orange-200 transition-all duration-300 relative">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                                            {food.image && <img src={food.image} alt={food.name} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-gray-900 truncate pr-6">{food.name}</h4>
                                                    <button onClick={() => handleDeleteItem(food.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium line-clamp-1 mt-0.5">{food.category} • {food.is_veg ? 'Veg' : 'Non-Veg'}</p>
                                            </div>
                                            <div className="flex items-end justify-between gap-2 mt-4">
                                                <span className="font-black text-lg text-gray-900">₹{food.price}</span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleStock(food.id, food.available)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${food.available
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {food.available ? 'In Stock' : 'Out of Stock'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Add Item Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors">
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-2xl font-black text-gray-900 mb-6">Add New Item</h2>

                            <form onSubmit={handleAddItem} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Item Name</label>
                                    <input
                                        type="text" required
                                        value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Price (₹)</label>
                                        <input
                                            type="number" required
                                            value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                                        <select
                                            value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        >
                                            <option>Starter</option>
                                            <option>Main Course</option>
                                            <option>Dessert</option>
                                            <option>Beverage</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                                    <textarea
                                        rows="3"
                                        value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Image URL</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text" placeholder="https://..."
                                            value={newItem.image} onChange={e => setNewItem({ ...newItem, image: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer select-none group">
                                        <input
                                            type="checkbox"
                                            checked={newItem.isVeg}
                                            onChange={e => setNewItem({ ...newItem, isVeg: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                        />
                                        <span className="font-bold text-gray-700 group-hover:text-gray-900">Vegetarian</span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/25 mt-4 transition-all"
                                >
                                    Add Item to Menu
                                </button>

                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RestaurantDashboard;
