import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import {
    LayoutDashboard, Plus, Package, DollarSign, Image as ImageIcon,
    X, Trash2, Edit2, LogOut, TrendingUp, Utensils, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RestaurantDashboard = () => {
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [stats, setStats] = useState({ totalItems: 0, activeOrders: 0, revenue: 0 });
    const [foods, setFoods] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Variant: Add Edit Logic
    const [editItem, setEditItem] = useState(null);
    const [newItem, setNewItem] = useState({ name: '', price: '', description: '', category: 'Main Course', image: '', isVeg: true });

    // 120fps Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    const fetchDashboardData = async (restId) => {
        try {
            // If no restId provided, try to get from local storage or previous state
            const id = restId || localStorage.getItem('restaurant_id');
            if (!id) {
                navigate('/login');
                return;
            }

            const [restRes, foodsRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/api/restaurant/${id}`),
                fetch(`${API_URL}/api/food/restaurant/${id}`),
                fetch(`${API_URL}/api/restaurant/${id}/stats`)
            ]);

            if (restRes.ok) {
                const restData = await restRes.json();
                setRestaurant(restData);
                localStorage.setItem('restaurant_id', restData._id || restData.id);
            }

            if (foodsRes.ok) {
                const foodsData = await foodsRes.json();
                setFoods(foodsData);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const storedId = localStorage.getItem('restaurant_id');
        if (storedId) {
            fetchDashboardData(storedId);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('restaurant_id');
        localStorage.removeItem('restaurant_token');
        navigate('/login');
    };

    const handleDeleteItem = async (foodId) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            const res = await fetch(`${API_URL}/api/food/${foodId}`, { method: 'DELETE' });
            if (res.ok) {
                setFoods(prev => prev.filter(f => (f._id || f.id) !== foodId));
                // Update stats locally or refetch
                setStats(prev => ({ ...prev, totalItems: prev.totalItems - 1 }));
            } else {
                alert("Failed to delete item");
            }
        } catch (error) {
            console.error("Delete Error:", error);
        }
    };

    const handleToggleStock = async (foodId, currentStatus) => {
        try {
            const res = await fetch(`${API_URL}/api/food/${foodId}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ available: !currentStatus })
            });
            if (res.ok) {
                setFoods(prev => prev.map(f => (f._id || f.id) === foodId ? { ...f, available: !currentStatus } : f));
            }
        } catch (error) {
            console.error("Toggle Stock Error:", error);
        }
    };

    const handleEditClick = (item) => {
        setNewItem({
            ...item,
            isVeg: item.is_veg !== undefined ? item.is_veg : item.isVeg
        });
        setEditItem(item); // Track editing state
        setShowAddModal(true);
    };

    const handleModalClose = () => {
        setShowAddModal(false);
        setEditItem(null);
        setNewItem({ name: '', price: '', description: '', category: 'Main Course', image: '', isVeg: true });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const url = editItem
            ? `${API_URL}/api/food/${editItem.id}`
            : `${API_URL}/api/food/add`;

        const method = editItem ? 'PUT' : 'POST';

        const body = editItem
            ? { ...newItem, price: parseFloat(newItem.price) }
            : {
                restaurantId: restaurant._id || restaurant.id,
                ...newItem,
                price: parseFloat(newItem.price)
            };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                handleModalClose();
                fetchDashboardData(restaurant._id || restaurant.id);
            } else {
                const err = await res.json();
                alert(err.message || 'Operation failed');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!restaurant) return null;

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-gray-900 selection:bg-orange-100 selection:text-orange-900">
            {/* Sidebar - Pro Glass Effect */}
            <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-gray-100 hidden md:flex flex-col fixed h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div className="p-8 pb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
                        <Utensils className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900">
                        Partner<span className="text-orange-600">Hub</span>
                    </h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Restaurant Console</p>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-6">
                    <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-orange-50 text-orange-700 font-bold rounded-2xl transition-all shadow-sm ring-1 ring-orange-100">
                        <LayoutDashboard className="w-5 h-5" />
                        Overview
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3.5 text-gray-500 font-bold hover:bg-white hover:text-gray-900 rounded-2xl transition-all hover:shadow-md hover:ring-1 hover:ring-gray-100 group">
                        <Package className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
                        Live Orders
                        <span className="ml-auto bg-gray-100 group-hover:bg-orange-100 text-gray-500 group-hover:text-orange-600 px-2 rounded-lg text-[10px] font-black py-0.5 transition-colors">BETA</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3.5 text-gray-500 font-bold hover:bg-white hover:text-gray-900 rounded-2xl transition-all hover:shadow-md hover:ring-1 hover:ring-gray-100 group">
                        <DollarSign className="w-5 h-5 group-hover:text-green-500 transition-colors" />
                        Finances
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3.5 text-gray-500 font-bold hover:bg-white hover:text-gray-900 rounded-2xl transition-all hover:shadow-md hover:ring-1 hover:ring-gray-100 group">
                        <ImageIcon className="w-5 h-5 group-hover:text-purple-500 transition-colors" />
                        Media Library
                    </button>
                </nav>

                <div className="p-4 m-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold">
                            {restaurant.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{restaurant.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 truncate">{restaurant.address}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-600 font-bold text-xs py-2 hover:bg-red-50 rounded-xl transition-colors">
                        <LogOut className="w-3 h-3" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-72 p-4 md:p-8 overflow-y-auto">
                {/* Topbar */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h2>
                        <p className="text-gray-500 font-medium">Here's what's happening today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="bg-white border border-gray-200 text-gray-600 font-bold px-4 py-2.5 rounded-xl text-sm shadow-sm hover:bg-gray-50 transition-colors">
                            Help Center
                        </button>
                        <button
                            onClick={() => {
                                setNewItem({ name: '', price: '', description: '', category: 'Main Course', image: '', isVeg: true });
                                setShowAddModal(true);
                            }}
                            className="bg-black text-white hover:bg-gray-900 font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-gray-200 flex items-center gap-2 transition-transform active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> Add New Item
                        </button>
                    </div>
                </header>

                {/* Stats Grid - 120fps entry */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
                >
                    <div className="relative overflow-hidden bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <Utensils className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                <Utensils className="w-6 h-6" />
                            </div>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-1">Total Menu Items</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-black text-gray-900">{stats.totalItems}</p>
                                <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+2 new</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <TrendingUp className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-1">Total Revenue</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-black text-gray-900">₹{stats.revenue.toLocaleString()}</p>
                                <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                            <Package className="w-24 h-24" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                                <Package className="w-6 h-6" />
                            </div>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-1">Active Orders</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-black text-gray-900">{stats.activeOrders}</p>
                                <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Processing</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Menu Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-gray-900">Menu Overview</h3>
                        <div className="flex gap-2">
                            <select className="bg-white border border-gray-200 text-sm font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                                <option>All Categories</option>
                                <option>Main Course</option>
                                <option>Starter</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-[2rem] h-40 animate-pulse border border-gray-100"></div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20"
                        >
                            {foods.map((food) => (
                                <motion.div
                                    variants={itemVariants}
                                    key={food.id}
                                    className={`group bg-white rounded-[2rem] border transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 relative overflow-hidden ${food.available ? 'border-gray-100 opacity-100' : 'border-gray-200 bg-gray-50 opacity-75 grayscale-[0.8] hover:grayscale-0'}`}
                                >
                                    <div className="flex gap-5">
                                        <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-gray-50 shadow-inner">
                                            {food.image ? (
                                                <img
                                                    src={food.image}
                                                    alt={food.name}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Utensils className="w-8 h-8 opacity-50" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-lg text-gray-900 truncate pr-2 group-hover:text-orange-600 transition-colors">{food.name}</h4>
                                                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${food.is_veg ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_currentColor]`} />
                                                </div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mt-1">{food.category}</p>
                                            </div>

                                            <div className="flex items-end justify-between mt-auto">
                                                <span className="font-black text-xl text-gray-900">₹{food.price}</span>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                                    <button onClick={() => handleEditClick(food)} className="p-2 rounded-xl bg-gray-100 hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteItem(food.id)} className="p-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stock Toggle as a Badge */}
                                    <div className="mt-4 pt-4 border-t border-dashed border-gray-100 flex items-center justify-between">
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${food.available ? 'text-green-600' : 'text-gray-400'}`}>
                                            {food.available ? '● Available Now' : '○ Currently Unavailable'}
                                        </span>
                                        <button
                                            onClick={() => handleToggleStock(food.id, food.available)}
                                            className={`w-10 h-6 rounded-full flex items-center transition-colors px-1 ${food.available ? 'bg-green-500 justify-end' : 'bg-gray-200 justify-start'}`}
                                        >
                                            <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={handleModalClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-white rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl relative border border-white/20"
                            onClick={e => e.stopPropagation()}
                        >
                            <button onClick={handleModalClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-8">
                                <h2 className="text-3xl font-black text-gray-900 mb-2">{editItem ? 'Edit Dish' : 'New Dish'}</h2>
                                <p className="text-gray-500 font-medium">{editItem ? 'Update your menu item details below.' : 'Add a delicious new item to your menu.'}</p>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Item Name</label>
                                        <input
                                            type="text" required placeholder="e.g. Signature Truffle Burger"
                                            value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Price (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                            <input
                                                type="number" required placeholder="0.00"
                                                value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-5 py-4 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Category</label>
                                        <select
                                            value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none"
                                        >
                                            <option>Starter</option>
                                            <option>Main Course</option>
                                            <option>Dessert</option>
                                            <option>Beverage</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Image URL</label>
                                        <input
                                            type="text" placeholder="https://..."
                                            value={newItem.image} onChange={e => setNewItem({ ...newItem, image: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-medium text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Description</label>
                                        <textarea
                                            rows="3" placeholder="Describe the ingredients and taste..."
                                            value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-medium text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4">
                                    <label className="flex items-center gap-3 cursor-pointer select-none group px-2">
                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${newItem.isVeg ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
                                            {newItem.isVeg && <CheckCircle className="w-4 h-4 text-white" />}
                                        </div>
                                        <input
                                            type="checkbox" className="hidden"
                                            checked={newItem.isVeg}
                                            onChange={e => setNewItem({ ...newItem, isVeg: e.target.checked })}
                                        />
                                        <span className="font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Vegetarian Dish</span>
                                    </label>

                                    <button
                                        type="submit"
                                        className="bg-black text-white hover:bg-gray-900 font-bold px-8 py-4 rounded-2xl text-base shadow-xl shadow-gray-300 transition-transform active:scale-95"
                                    >
                                        {editItem ? 'Save Changes' : 'Add to Menu'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RestaurantDashboard;
