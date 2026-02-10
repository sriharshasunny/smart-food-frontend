import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { API_URL } from '../config';

// import { mockRestaurants as restaurants, mockDishes as foodItems } from '../data/mockData'; // REMOVED MOCK
import FoodCard from '../components/FoodCard';
import { Star, Clock, MapPin, ChevronLeft, Search, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RestaurantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [vegOnly, setVegOnly] = useState(false);
    const { toggleWishlist, isInWishlist } = useShop();


    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                // Parallel Fetch: Restaurant Details + Menu
                const [restRes, menuRes] = await Promise.all([
                    fetch(`${API_URL}/api/restaurant/${id}`),
                    fetch(`${API_URL}/api/food/restaurant/${id}`)
                ]);

                if (!restRes.ok) {
                    if (restRes.status === 404) throw new Error("Restaurant not found");
                    throw new Error("Failed to load restaurant");
                }

                const restData = await restRes.json();
                const menuData = await menuRes.json();

                // Ensure defaults
                setRestaurant({
                    ...restData,
                    image: restData.image || '/placeholder-restaurant.jpg',
                    cuisine: Array.isArray(restData.cuisine) ? restData.cuisine.join(', ') : (restData.cuisine || 'Multi-Cuisine'),
                    rating: restData.rating || 0,
                    deliveryTime: restData.deliveryTime || '30-40 mins', // Backend doesn't have this yet, maybe add col later
                    costForTwo: restData.costForTwo || '₹400',
                    address: restData.address || 'Location not available'
                });

                // Format menu if needed (backend matches frontend mostly)
                setMenu(menuData.map(item => ({
                    ...item,
                    isVeg: item.is_veg, // Map snake_case to camelCase
                    rating: 4.2 // Default rating for items if missing
                })));

            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetails();
    }, [id]);

    // Grouping & Filtering Logic
    const filteredMenu = useMemo(() => {
        let items = menu;
        if (vegOnly) {
            items = items.filter(item => item.isVeg);
        }
        return items;
    }, [menu, vegOnly]);

    const groupedMenu = useMemo(() => {
        return filteredMenu.reduce((acc, item) => {
            const cat = item.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});
    }, [filteredMenu]);

    const displayItems = useMemo(() => {
        let items = filteredMenu;
        if (activeCategory !== 'All') {
            items = items.filter(item => item.category === activeCategory);
        }
        // ONLY SHOW AVAILABLE ITEMS TO CUSTOMERS
        items = items.filter(item => item.available !== false);

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            items = items.filter(item =>
                (item.name || '').toLowerCase().includes(lowerQuery) ||
                (item.category || '').toLowerCase().includes(lowerQuery)
            );
        }
        return items;
    }, [filteredMenu, activeCategory, searchQuery]);

    const displayGroups = useMemo(() => {
        return displayItems.reduce((acc, item) => {
            const cat = item.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(item);
            return acc;
        }, {});
    }, [displayItems]);

    // --- Loading / Error States ---
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold animate-pulse">Loading Menu...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-red-500 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Oops!</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={() => navigate('/home')}
                    className="bg-black text-white font-bold py-3 px-8 rounded-xl hover:scale-105 transition-transform"
                >
                    Go Home
                </button>
            </div>
        </div>
    );

    if (!restaurant) return null; // Should be handled by loading/error

    const categories = ['All', ...Object.keys(groupedMenu)];

    return (
        <div className="bg-gray-50 min-h-screen pb-24 font-sans selection:bg-orange-100 selection:text-orange-900">
            {/* 1. Immersive Full-Width Banner */}
            <div className="relative h-80 md:h-[450px] w-full group overflow-hidden">
                <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover brightness-[0.85]"
                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop'} // Fallback
                />
                {/* Enhanced Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                {/* Back Button */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-white/90 hover:bg-white text-gray-900 rounded-2xl p-3 transition-all duration-300 group/btn border border-white/20 hover:border-white shadow-lg hover:shadow-xl"
                    >
                        <ChevronLeft className="w-6 h-6 group-hover/btn:-translate-x-0.5 transition-transform" />
                    </button>
                </div>

                {/* Restaurant Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 pb-24 md:pb-28 text-white z-10 max-w-7xl mx-auto w-full">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        {/* Cuisine Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-orange-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                {restaurant.cuisine}
                            </span>
                            {restaurant.rating >= 4.5 && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 rounded-lg text-xs font-bold text-gray-900 shadow-md">
                                    <Star className="w-3 h-3 fill-current" />
                                    Top Rated
                                </span>
                            )}
                            {/* Suspended Badge if needed, though we filter active */}
                            {!restaurant.is_active && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 rounded-lg text-xs font-bold text-white shadow-md">
                                    <AlertCircle className="w-3 h-3" />
                                    Temporarily Closed
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-2xl leading-none">{restaurant.name}</h1>
                        <p className="text-lg md:text-xl font-medium text-gray-100 opacity-95 max-w-2xl flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-orange-400" />
                            {restaurant.address}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* 2. Enhanced Info Card - Floating */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-20 -mt-20">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                >
                    {/* Gradient Border */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 rounded-[2rem] p-[2px] shadow-2xl">
                        <div className="h-full w-full bg-white rounded-[calc(2rem-2px)]"></div>
                    </div>

                    <div className="relative bg-white rounded-[2rem] p-6 md:p-8 flex flex-wrap items-center justify-between gap-8">
                        <div className="flex items-center gap-10 md:gap-16 w-full md:w-auto justify-around md:justify-start">
                            {/* Rating */}
                            <div className="flex flex-col items-center md:items-start gap-2">
                                <div className="flex items-center gap-2 text-gray-900">
                                    <div className="p-2 bg-yellow-50 rounded-xl">
                                        <Star className="w-6 h-6 text-yellow-500 fill-current" />
                                    </div>
                                    <span className="font-black text-3xl">{restaurant.rating || "New"}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rating</span>
                            </div>

                            <div className="w-px h-12 bg-gray-100 hidden md:block"></div>

                            {/* Delivery Time */}
                            <div className="flex flex-col items-center md:items-start gap-2">
                                <div className="flex items-center gap-2 text-gray-900">
                                    <div className="p-2 bg-orange-50 rounded-xl">
                                        <Clock className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <span className="font-black text-3xl">{restaurant.deliveryTime}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Delivery Time</span>
                            </div>

                            <div className="w-px h-12 bg-gray-100 hidden md:block"></div>

                            {/* Cost */}
                            <div className="flex flex-col items-center md:items-start gap-2">
                                <div className="flex items-center gap-2 text-gray-900">
                                    <span className="font-black text-3xl">{restaurant.costForTwo}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cost for Two</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 3. Detailed Menu Section */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Categories Sidebar - Compact */}
                    <div className="hidden lg:block lg:col-span-2 sticky top-28 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                        <h3 className="font-black text-gray-900 text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                            Menu <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-pulse"></span>
                        </h3>
                        <div className="space-y-1 relative">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 flex justify-between items-center group relative overflow-hidden"
                                >
                                    {/* Liquid Background Animation */}
                                    {activeCategory === category && (
                                        <motion.div
                                            layoutId="activeCategory"
                                            className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-md shadow-orange-500/25"
                                            transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.8 }}
                                        />
                                    )}
                                    <span className={`relative z-10 transition-colors ${activeCategory === category ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
                                        }`}>{category}</span>
                                    <span className={`relative z-10 text-[10px] font-black px-2 py-0.5 rounded-md transition-colors ${activeCategory === category ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                                        }`}>
                                        {groupedMenu[category]?.length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Menu Items - More Space */}
                    <div className="col-span-12 lg:col-span-10">
                        {/* Search & Filter Bar */}
                        <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between mb-8 sticky top-24 z-30">
                            <div className="flex-1 flex items-center px-4 gap-3">
                                <Search className="w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search in menu..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-900 placeholder:text-gray-400 h-10"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="w-px h-8 bg-gray-200 mx-2"></div>
                            <button
                                onClick={() => setVegOnly(!vegOnly)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${vegOnly
                                    ? 'bg-green-500 text-white shadow-md shadow-green-500/25'
                                    : 'hover:bg-gray-50 text-gray-500'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${vegOnly ? 'bg-white' : 'bg-green-500'}`}></span>
                                Veg
                            </button>
                        </div>

                        {/* Items Grid */}
                        <div className="space-y-10">
                            {Object.keys(displayGroups).length > 0 ? (
                                Object.keys(displayGroups).map((category) => (
                                    <motion.div
                                        key={category}
                                        id={category}
                                        className="scroll-mt-32 content-visibility-auto contain-layout"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{category}</h3>
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 font-bold text-xs rounded-full">
                                                {displayGroups[category].length}
                                            </span>
                                            <div className="flex-1 h-px bg-gradient-to-l from-gray-200 to-transparent"></div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-auto grid-flow-dense px-1">
                                            {displayGroups[category].map((item, index) => {
                                                // Simplified Grid: Uniform sizing for all cards
                                                return (
                                                    <div key={item.id} className="col-span-1 h-full">
                                                        <FoodCard food={item} isFeatured={false} restaurantName={restaurant.name} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">No dishes found</h3>
                                    <p className="text-gray-500">Try changing your filters or checking back later.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetails;
