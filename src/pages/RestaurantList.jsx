import React, { useState, useEffect, useMemo } from 'react';
import RestaurantCard from '../components/RestaurantCard';
import { Filter, Search, MapPin } from 'lucide-react';
import { API_URL } from '../config';

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const res = await fetch(`${API_URL}/api/restaurant/active/list`);
                if (!res.ok) throw new Error('Failed to fetch restaurants');
                const data = await res.json();
                setRestaurants(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("rating");
    const [vegOnly, setVegOnly] = useState(false);

    const filteredRestaurants = useMemo(() => {
        let result = [...restaurants];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(r => {
                const nameMatch = (r.name || '').toLowerCase().includes(q);
                const cuisineStr = Array.isArray(r.cuisine) ? r.cuisine.join(' ') : (r.cuisine || '');
                const cuisineMatch = cuisineStr.toLowerCase().includes(q);
                return nameMatch || cuisineMatch;
            });
        }

        if (vegOnly) {
            result = result.filter(r => {
                const cuisineStr = Array.isArray(r.cuisine) ? r.cuisine.join(' ') : (r.cuisine || '');
                return cuisineStr.toLowerCase().includes('veg') ||
                    (r.tags && (r.tags.includes('Vegetarian') || r.tags.includes('Pure Veg')));
            });
        }

        if (sortBy === 'rating') {
            result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === 'delivery') {
            result.sort((a, b) => (parseInt(a.deliveryTime) || 99) - (parseInt(b.deliveryTime) || 99));
        }

        return result;
    }, [restaurants, searchQuery, sortBy, vegOnly]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-bold animate-pulse">Finding best places...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Unavailable</h2>
                <p className="text-gray-500">Could not load restaurants. Please try again later.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fcfcfd] relative overflow-hidden">
            {/* Premium Mesh Background Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100/30 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-red-50/40 blur-[100px] rounded-full" />
            </div>

            {/* Sticky Glassmorphism Header */}
            <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-8 h-1 bg-orange-500 rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600/60">Discovery Hub</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
                                Top Rated <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Kitchens</span>
                            </h1>
                            <p className="text-gray-400 text-xs md:text-sm mt-2 font-bold uppercase tracking-widest opacity-70">
                                {filteredRestaurants.length} premium locations available today
                            </p>
                        </div>

                        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-center">
                            {/* Search Bar - Premium Style */}
                            <div className="relative group w-full sm:w-80">
                                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                <div className="relative flex items-center bg-white rounded-full border border-gray-100 shadow-sm focus-within:shadow-xl transition-all h-12 pr-2">
                                    <Search className="ml-5 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or cuisine..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1 pl-3 pr-4 bg-transparent text-gray-800 text-sm font-bold outline-none placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar - Sub Header */}
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => setVegOnly(!vegOnly)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border
                                ${vegOnly 
                                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-200/50' 
                                    : 'bg-white border-gray-100 hover:border-orange-200 text-gray-600'}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${vegOnly ? 'bg-white' : 'bg-emerald-500'} animate-pulse`} />
                            {vegOnly ? 'Pure Veg Active' : 'Filter Veg Only'}
                        </button>

                        <div className="h-4 w-px bg-gray-200 mx-2 hidden sm:block" />

                        <div className="relative flex items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">Sort by:</span>
                            <div className="bg-white border border-gray-100 rounded-full px-4 py-2 flex items-center gap-2 hover:border-orange-200 transition-colors cursor-pointer shadow-sm">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-transparent text-[10px] font-black uppercase tracking-widest text-gray-700 outline-none cursor-pointer pr-4"
                                >
                                    <option value="rating">Highest Rating</option>
                                    <option value="delivery">Fastest Delivery</option>
                                </select>
                                <svg className="w-3 h-3 text-orange-500 pointer-events-none absolute right-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                {filteredRestaurants.length === 0 ? (
                    <div className="text-center py-32 bg-white/50 backdrop-blur-md rounded-[3rem] border border-gray-100 shadow-inner">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">No results matched</h3>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Try adjusting your filters or search terms</p>
                        <button 
                            onClick={() => { setSearchQuery(""); setVegOnly(false); }}
                            className="mt-8 px-8 py-3 bg-gray-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-orange-600 transition-colors shadow-lg shadow-gray-200"
                        >
                            Reset Discovery
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-32">
                        {filteredRestaurants.map((restaurant, idx) => (
                            <RestaurantCard key={restaurant.id || idx} restaurant={restaurant} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default RestaurantList;
