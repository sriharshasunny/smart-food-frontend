import React, { useState, useEffect, useMemo } from 'react';
import RestaurantCard from '../components/RestaurantCard';
import { Filter, Search, MapPin, Mic, MicOff } from 'lucide-react';
import { API_URL } from '../config';
import useVoiceRecognition from '../hooks/useVoiceRecognition';

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

    const { isListening, supported, startListening, stopListening } = useVoiceRecognition((text) => {
        setSearchQuery(text);
    });

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 min-h-screen bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">Restaurants Near You</h1>
                    <p className="text-gray-500 text-xs md:text-sm mt-0.5 font-medium">Found {filteredRestaurants.length} premium places</p>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                    {/* Search Bar */}
                    <div className={`relative flex-1 sm:flex-none flex items-center bg-white rounded-full border transition-all ${isListening ? 'border-orange-500 shadow-orange-500/20 shadow-md' : 'border-gray-200 focus-within:border-orange-500 hover:bg-gray-50'}`}>
                        <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={isListening ? "Listening..." : "Search name or cuisine..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full sm:w-64 pl-9 ${supported ? 'pr-9' : 'pr-4'} py-2 bg-transparent text-gray-700 text-xs font-semibold outline-none transition-all placeholder:text-gray-400`}
                        />
                        {supported && (
                            <button
                                onClick={isListening ? stopListening : startListening}
                                className={`absolute right-1.5 p-1 rounded-full transition-all flex items-center justify-center ${isListening
                                        ? 'bg-red-50 text-red-500 animate-pulse'
                                        : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
                                    }`}
                                title={isListening ? "Stop listening" : "Search with voice"}
                            >
                                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                                {isListening && (
                                    <span className="absolute flex h-full w-full">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></span>
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setVegOnly(!vegOnly)}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 ${vegOnly ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Veg Only
                        </button>
                        <div className="relative flex-1 sm:flex-none">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full appearance-none px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-700 text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                            >
                                <option value="rating">Sort by Rating</option>
                                <option value="delivery">Delivery Time</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {filteredRestaurants.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No restaurants found</h3>
                    <p className="text-gray-500">We couldn't find any active restaurants matching your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-20 content-visibility-auto contain-layout">
                    {filteredRestaurants.map((restaurant) => (
                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default RestaurantList;
