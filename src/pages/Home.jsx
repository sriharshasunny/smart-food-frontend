import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import FilterBar from '../components/FilterBar';
import FoodCard from '../components/FoodCard';
import RestaurantCard from '../components/RestaurantCard';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { mockRestaurants, mockDishes, categories } from '../data/mockData';
import { Search, MapPin, ChevronRight, ChevronLeft, Sparkles, Flame, Zap, ChevronDown, Star, Plus } from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';
import SkeletonCard from '../components/SkeletonCard';
import { motion, AnimatePresence } from 'framer-motion';

import { API_URL } from '../config';  // Import Config

const Home = () => {
    const { addToCart, searchQuery, setSearchQuery } = useShop();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Recommendation state for Trending Picks panel
    const [trendingRecs, setTrendingRecs] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false); // New state for loading effect
    const [trendingVisible, setTrendingVisible] = useState(4); // How many to show
    const TRENDING_STEP = 4;

    // Fetch recommendations for logged-in users (same as AI Picks)
    React.useEffect(() => {
        const userId = user?._id || user?.id;
        if (!userId) return;
        setLoadingRecs(true);
        fetch(`${API_URL}/api/recommendations/${userId}?limit=20`)
            .then(r => r.json())
            .then(data => setTrendingRecs(data.recommendations || []))
            .catch(() => {})
            .finally(() => setLoadingRecs(false));
    }, [user]);

    // Data State
    const [dishes, setDishes] = useState([]);
    const [realRestaurants, setRealRestaurants] = useState([]); // Store real restaurants
    const [loadingData, setLoadingData] = useState(true);

    // Fetch Real Data (Foods AND Restaurants)
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel Fetch
                const [foodsRes, restsRes] = await Promise.all([
                    fetch(`${API_URL}/api/food/all`),
                    fetch(`${API_URL}/api/restaurant/active/list`) // Fetch ONLY active restaurants
                ]);

                const foodsData = await foodsRes.json();
                const restsData = await restsRes.json();

                if (Array.isArray(foodsData)) setDishes(foodsData);
                if (Array.isArray(restsData)) setRealRestaurants(restsData);

            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    // const [searchQuery, setSearchQuery] = useState(''); // REMOVED local state
    const [activeCategory, setActiveCategory] = useState('All');
    const [subFilters, setSubFilters] = useState({
        rating45Plus: false,
        rating4Plus: false,
        rating35Plus: false,
        vegOnly: false,
        maxPrice: 1000
    });
    const [restaurantFilters, setRestaurantFilters] = useState({
        topRated: false,
        veg: false,
        fastDelivery: false
    });
    const [viewMode, setViewMode] = useState('restaurants'); // 'restaurants' | 'recs'
    const [isSticky, setIsSticky] = useState(false);
    const filterRef = React.useRef(null);
    const observerTargetRef = React.useRef(null); // Invisible target for IntersectionObserver
    const sectionHeaderRef = React.useRef(null); // Track the "Explore Food Items" text

    // --- Geolocation State ---
    const [locationName, setLocationName] = useState("Detecting...");
    const [loadingLocation, setLoadingLocation] = useState(false);

    // --- Geolocation Logic ---
    const detectLocation = () => {
        if (!navigator.geolocation) {
            setLocationName("Not Supported");
            return;
        }

        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Reverse Geocoding (using a free API or mock)
                    // For demo, we'll use a mock response based on coords or just "Current Location"
                    // In real app -> fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)

                    // Simulating API delay
                    await new Promise(r => setTimeout(r, 1000));
                    setLocationName("Indiranagar, BLR"); // Mock result
                } catch (error) {
                    setLocationName("Unknown Location");
                } finally {
                    setLoadingLocation(false);
                }
            },
            () => {
                setLocationName("Permission Denied");
                setLoadingLocation(false);
            }
        );
    };

    // Auto-detect on mount
    React.useEffect(() => {
        detectLocation();
    }, []);

    // --- Sticky Scroll Logic ---
    const [showStickyFilters, setShowStickyFilters] = useState(false);

    React.useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-75px 0px 0px 0px', // Trigger exactly when the element goes under the ~70px navbar
            threshold: 0
        };

        const observerCallback = (entries) => {
            const [entry] = entries;
            // Show sticky filter ONLY if it's not intersecting AND it scrolled UP out of view (top < 75)
            // This prevents it from showing when it's off-screen at the bottom of the page initially
            const isScrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 75;
            setShowStickyFilters(isScrolledPast);
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        const currentTarget = filterRef.current; // Observe the actual filter bar container

        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
            observer.disconnect();
        };
    }, []);

    // --- Auto-Scroll on Search ---
    React.useEffect(() => {
        if (searchQuery && filterRef.current) {
            // Scroll a bit above the filters
            const offset = 100;
            const elementPosition = filterRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            // Also switch to 'recs' view if searching? No, filter logic handles both.
        }
    }, [searchQuery]);


    // --- Filtering Logic ---
    const filteredData = useMemo(() => {
        let filteredDishes = dishes;
        let filteredRestaurants = realRestaurants; // Use Real Restaurants

        // 1. Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredDishes = filteredDishes.filter(d => (d.name?.toLowerCase() || '').includes(query) || (d.category?.toLowerCase() || '').includes(query));
            filteredRestaurants = filteredRestaurants.filter(r => {
                const nameMatch = (r.name?.toLowerCase() || '').includes(query);
                const cuisineStr = Array.isArray(r.cuisine) ? r.cuisine.join(' ') : (r.cuisine || '');
                const cuisineMatch = cuisineStr.toLowerCase().includes(query);
                return nameMatch || cuisineMatch;
            });
        }

        // 2. Category Filter (Biryani, Sushi, etc) - ONLY FOR DISHES
        if (activeCategory !== 'All') {
            filteredDishes = filteredDishes.filter(d => d.category === activeCategory || (d.name && d.name.includes(activeCategory)));
        }

        // 3. Sub Filters (applies to FOOD/DISHES)
        if (subFilters.rating45Plus) {
            filteredDishes = filteredDishes.filter(d => (d.rating || 0) >= 4.5);
        }
        if (subFilters.rating4Plus) {
            filteredDishes = filteredDishes.filter(d => (d.rating || 0) >= 4.0);
        }
        if (subFilters.rating35Plus) {
            filteredDishes = filteredDishes.filter(d => (d.rating || 0) >= 3.5);
        }
        if (subFilters.vegOnly) {
            filteredDishes = filteredDishes.filter(d => d.isVeg);
        }
        if (subFilters.maxPrice < 1000) {
            filteredDishes = filteredDishes.filter(d => d.price <= subFilters.maxPrice);
        }
        // Restaurant Filters (Separate Logic)
        if (restaurantFilters.topRated) {
            filteredRestaurants = filteredRestaurants.filter(r => (r.rating || 0) >= 4.5);
        }
        if (restaurantFilters.veg) {
            // Check cuisine or tags if available
            filteredRestaurants = filteredRestaurants.filter(r => {
                const cuisineStr = Array.isArray(r.cuisine) ? r.cuisine.join(' ') : (r.cuisine || '');
                return cuisineStr.toLowerCase().includes('veg') ||
                    (r.tags && (r.tags.includes('Vegetarian') || r.tags.includes('Pure Veg')));
            });
        }
        if (restaurantFilters.fastDelivery) {
            // Prioritize reliable check
            filteredRestaurants = filteredRestaurants.filter(r => (parseInt(r.deliveryTime) || 99) <= 30);
        }

        return { dishes: filteredDishes, restaurants: filteredRestaurants };
    }, [searchQuery, activeCategory, subFilters, restaurantFilters, dishes, realRestaurants]);

    // High-End Glassmorphism Location Widget
    const locationWidget = (
        <div
            className="flex items-center gap-3 bg-white/10 backdrop-blur-2xl p-2 pl-3 pr-5 rounded-full border border-white/20 shadow-2xl transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-orange-500/20 cursor-pointer group relative overflow-hidden"
            onClick={detectLocation}
        >
            {/* Glossy highlight line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

            <button
                className="bg-gradient-to-br from-orange-400 to-red-500 p-2.5 rounded-full shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50 transition-all duration-300 relative"
                title="Detect My Location"
            >
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <MapPin size={16} className={`text-white w-4 h-4 ${loadingLocation ? 'animate-bounce' : ''}`} />
            </button>
            <div className="flex flex-col items-start pt-0.5">
                <h2 className="text-[10px] font-black text-orange-200 uppercase tracking-[0.2em] leading-none mb-1">Delivering to</h2>
                <h1 className="text-[15px] font-black text-white leading-none drop-shadow-md group-hover:text-orange-300 transition-colors max-w-[160px] truncate">
                    {loadingLocation ? "Locating..." : locationName}
                </h1>
            </div>
        </div>
    );

    // Memoized add handler to prevent prop thrashing on FoodCard
    const handleAddToCart = React.useCallback((food) => {
        addToCart(food);
    }, [addToCart]);

    // --- Scroll Logic ---
    const restaurantContainerRef = React.useRef(null);
    const trendingContainerRef = React.useRef(null);

    const scrollContainer = (ref, direction) => {
        if (ref.current) {
            const scrollAmount = direction === 'horizontal' ? 300 : 200; // Adjust scroll distance
            if (direction === 'left') ref.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            if (direction === 'right') ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            if (direction === 'up') ref.current.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
            if (direction === 'down') ref.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-500 pb-10 font-sans text-gray-900 dark:text-gray-100">
            {/* Main Content Area - with Padding */}
            <div className="w-full px-0 sm:px-1 pt-0 space-y-3 mx-auto">

                {/* Hero Banner (Offers) WITH Location Widget Embedded */}
                <ErrorBoundary key="hero">
                    <HeroBanner topRightContent={locationWidget} />
                </ErrorBoundary>

                {/* --- Content Sections --- */}

                {/* Split Top Section: Restaurants (Large Left) + Quick Recs (Small Right) */}
                <div className="flex flex-col xl:flex-row gap-3 h-auto xl:h-[410px] mb-6">

                    {/* Left: Top Content (Restaurants) */}
                    <div className="flex-1 min-w-0 bg-white rounded-[2rem] p-3 border border-orange-100/60 shadow-md relative overflow-hidden flex flex-col h-[350px] xl:h-full group transition-transform duration-300 transform-gpu" style={{boxShadow:'0 4px 24px rgba(249,115,22,0.06), 0 1px 4px rgba(0,0,0,0.05)'}}>
                        {/* Background Blob */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-50/50 rounded-full -translate-x-1/3 -translate-y-1/3 opacity-50" />

                        {/* Scroll Buttons (Restaurant - Horizontal) */}
                        <button
                            onClick={() => scrollContainer(restaurantContainerRef, 'left')}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/80 hover:bg-black hover:text-white text-gray-700 rounded-full shadow-lg backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 active:scale-95 border border-gray-100"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scrollContainer(restaurantContainerRef, 'right')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/80 hover:bg-black hover:text-white text-gray-700 rounded-full shadow-lg backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 active:scale-95 border border-gray-100"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="relative z-10 flex flex-row items-center justify-between mb-2 pt-1 px-1 shrink-0 gap-2 h-10">
                            {/* Toggle Switcher - Compact */}
                            <div className="flex items-center bg-gray-100 p-1 rounded-full relative shrink-0">
                                <button
                                    onClick={() => setViewMode('restaurants')}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide transition-all z-10 ${viewMode === 'restaurants' ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Restaurants
                                </button>
                                <button
                                    onClick={() => setViewMode('recs')}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide transition-all z-10 ${viewMode === 'recs' ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    AI Picks
                                </button>

                                {/* Sliding Background */}
                                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-black rounded-full transition-all duration-300 ease-spring ${viewMode === 'restaurants' ? 'left-1' : 'left-[calc(50%+1.5px)]'}`} />
                            </div>

                            {/* Filters (Only visible for Restaurants view) - Same Row */}
                            {viewMode === 'restaurants' && (
                                <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-1 justify-end items-center h-full">
                                    <button onClick={() => setRestaurantFilters(prev => ({ ...prev, fastDelivery: !prev.fastDelivery }))} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border shrink-0 ${restaurantFilters.fastDelivery ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'}`}>Fast Delivery</button>
                                    <button onClick={() => setRestaurantFilters(prev => ({ ...prev, topRated: !prev.topRated }))} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border shrink-0 ${restaurantFilters.topRated ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'}`}>Top Rated</button>
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        <ErrorBoundary key={viewMode}>
                            <div ref={restaurantContainerRef} data-lenis-prevent className="w-full overflow-x-auto overflow-y-hidden pb-3 pt-1 hide-scrollbar flex snap-x scroll-pl-3 gap-3 relative z-10 h-full items-stretch px-1 scroll-smooth overscroll-contain transform-gpu">
                                {loadingData ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <div key={`skel-${i}`} className="min-w-[255px] snap-start h-full">
                                            <SkeletonCard />
                                        </div>
                                    ))
                                ) : viewMode === 'restaurants' ? (
                                    filteredData.restaurants.map((restaurant) => (
                                        <div key={restaurant.id} className="min-w-[255px] snap-start h-full">
                                            <RestaurantCard restaurant={restaurant} />
                                        </div>
                                    ))
                                ) : (
                                    filteredData.dishes.slice(0, 12).map((dish) => (
                                        <div key={dish.id} className="min-w-[210px] snap-start h-full">
                                            <FoodCard food={dish} onAdd={handleAddToCart} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </ErrorBoundary>
                    </div>


                    {/* ══ Right: Trending Picks ══ */}
                    <div className="w-full xl:w-[440px] shrink-0 bg-white dark:bg-black rounded-[2rem] border border-orange-100/60 dark:border-gray-800 relative overflow-hidden flex flex-col h-[400px] xl:h-full transition-colors duration-500 shadow-sm">

                        {/* Subtle background blob */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/60 dark:bg-orange-500/10 rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none blur-3xl transition-colors duration-500" />

                        {/* ── Header (fixed) ── */}
                        <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-orange-50/50 dark:border-white/5 relative z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_4px_14px_rgba(249,115,22,0.4)]">
                                    <Flame className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-[14px] font-black text-gray-900 dark:text-white uppercase tracking-[0.08em] leading-tight flex items-center gap-2">
                                        Trending Picks
                                    </h2>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                        <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.15em]">AI Ranked Engine</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/recommendations')}
                                className="text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-1 px-4 py-2 rounded-full border transition-all duration-300 bg-orange-50 dark:bg-white/5 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-white/10 hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white hover:border-transparent"
                            >
                                View All <ChevronRight size={12} />
                            </button>
                        </div>

                        {/* ── Scrollable cards area ── */}
                        <div
                            ref={trendingContainerRef}
                            data-lenis-prevent
                            className="flex-1 overflow-y-auto px-3 pt-2 pb-2 flex flex-col gap-2 hide-scrollbar scroll-smooth overscroll-contain"
                        >
                            {(loadingData || loadingRecs) ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={`skel-h-${i}`} className="h-[82px] shrink-0">
                                        <SkeletonCard variant="horizontal" />
                                    </div>
                                ))
                            ) : (() => {
                                const sourceItems = trendingRecs.length > 0 ? trendingRecs : filteredData.dishes;
                                const visibleItems = sourceItems.slice(0, trendingVisible);

                                return (
                                    <>
                                        {visibleItems.map((dish, idx) => (
                                            <motion.div
                                                key={dish.id || dish._id || idx}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                                                className="group relative flex items-stretch gap-4 p-3 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-500/50 hover:shadow-lg dark:hover:shadow-orange-500/10 transition-all duration-300 w-full"
                                            >
                                                {/* Number Badge overlaying top left of the card */}
                                                <div className="absolute top-0 left-0">
                                                    <div className={`relative px-2 py-1.5 rounded-br-xl rounded-tl-2xl flex items-center justify-center -ml-[1px] -mt-[1px] z-20 shadow-sm ${idx < 3 ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white' : 'bg-gray-900 dark:bg-white text-white dark:text-black'}`}>
                                                        <span className="text-[10px] font-black w-4 text-center">#{idx + 1}</span>
                                                    </div>
                                                </div>

                                                {/* Image Container */}
                                                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-50 dark:bg-[#222]">
                                                    <img
                                                        src={dish.image}
                                                        alt={dish.name || 'Dish'}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                                    />
                                                </div>

                                                {/* Content Container */}
                                                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                                    {/* Top Half: Name & Description */}
                                                    <div>
                                                        <h4 className="font-extrabold text-gray-900 dark:text-white text-[15px] leading-tight truncate pr-2 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300">
                                                            {dish.name || 'Delicious Item'}
                                                        </h4>
                                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 font-medium pr-2">
                                                            {dish.description || 'Highly recommended by system.'}
                                                        </p>
                                                    </div>

                                                    {/* Bottom Half: Price, Rating & Add Button */}
                                                    <div className="flex items-center justify-between mt-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-extrabold text-gray-900 dark:text-white text-base">₹{dish.price}</span>
                                                            <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#222] px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700">
                                                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{dish.rating || 4.5}</span>
                                                                <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
                                                            </div>
                                                        </div>

                                                        {/* Sleek Add Button */}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); addToCart(dish); }}
                                                            className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all duration-300 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-500/30 hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white active:scale-95"
                                                        >
                                                            Add <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </>
                                );
                            })()}
                        </div>

                        {/* ── Load More Button ── */}
                        {!loadingData && !loadingRecs && (() => {
                            const sourceItems = trendingRecs.length > 0 ? trendingRecs : filteredData.dishes;
                            const hasMore = trendingVisible < sourceItems.length;
                            return hasMore ? (
                                <div className="px-3 pb-3 pt-1.5 shrink-0 relative z-10">
                                    <button
                                        onClick={() => {
                                            setLoadingMore(true);
                                            setTimeout(() => {
                                                setTrendingVisible(v => v + TRENDING_STEP);
                                                setLoadingMore(false);
                                            }, 600);
                                        }}
                                        disabled={loadingMore}
                                        className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 relative overflow-hidden group border border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-[#1a1c23] hover:bg-orange-500 dark:hover:bg-orange-500 text-orange-600 dark:text-orange-400 hover:text-white dark:hover:text-white hover:border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin transition-colors" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1" />
                                                Load More Picks
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : null;
                        })()}
                    </div>
                </div>


                {/* --- MENU PARTITION --- */}

                {/* 1. Premium Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />

                {/* 2. Menu Section Header (Glowing Gradient Line) */}
                <div ref={sectionHeaderRef} className="flex items-center justify-center relative py-6 md:py-8 overflow-hidden group">
                    <div className="h-px bg-gradient-to-r from-transparent via-orange-300 dark:via-orange-500/50 to-transparent flex-1 opacity-50"></div>

                    <div className="px-6 relative">
                        <span className="relative px-6 py-2 bg-white dark:bg-[#111] rounded-full border border-orange-100 dark:border-orange-500/30 text-sm md:text-base font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-600 uppercase shadow-sm">
                            Explore Food Items
                        </span>
                    </div>

                    <div className="h-px bg-gradient-to-r from-orange-300 via-pink-300 dark:via-orange-500 to-transparent flex-1 opacity-50"></div>
                </div>

                {/* 3. Filter Stack (MAIN + STICKY) */}
                <div className="relative">
                    {/* A. Main Filters (Visual Glossy Mode) - Scrolls away */}
                    <div ref={filterRef} className="w-full z-10 relative">
                        <FilterBar
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                            subFilters={subFilters}
                            setSubFilters={setSubFilters}
                            isSticky={false} // Always Glossy
                        />
                    </div>

                    {/* NEW: Secondary Search Bar Below FilterBar */}
                    <div className="mt-4 mb-2 relative w-full max-w-xl mx-auto px-2">
                        <div className="relative flex items-center bg-white rounded-full border shadow-sm focus-within:shadow-md transition-all border-gray-200 focus-within:border-orange-500">
                            <Search className="absolute left-4 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search dishes, restaurants..."
                                className="w-full pl-10 pr-12 py-2.5 rounded-full text-sm outline-none bg-transparent placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* B. Sticky Filter Bar (Text Mode) - Slides down when main is gone */}
                    <div className={`fixed top-[54px] md:top-[70px] left-0 w-full z-40 bg-white/95 backdrop-blur-md shadow-md transition-all duration-300 transform ${showStickyFilters ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                        <FilterBar
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                            subFilters={subFilters}
                            setSubFilters={setSubFilters}
                            isSticky={true} // Always Compact Text
                        />
                        {/* Optional: Add search bar to sticky header too? User said "under filters above to the food cards". Sticky is mostly filters. I'll leave it out for now to avoid clutter, or maybe add it if requested. */}
                    </div>
                </div>

                {/* 4. Popular Food Items Section (Bottom) */}
                <section className="min-h-[500px] content-visibility-auto contain-layout pt-2">
                    {/* Food Grid */}
                    <ErrorBoundary key="food-grid">
                        {loadingData ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 gap-y-10">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div key={`skel-g-${i}`} className="h-[320px]">
                                        <SkeletonCard />
                                    </div>
                                ))}
                            </div>
                        ) : realRestaurants.length === 0 ? (
                            <div className="w-full text-center py-20 flex flex-col items-center justify-center p-4">
                                <div className="bg-red-50 p-6 rounded-full mb-6 relative">
                                    <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20"></div>
                                    <span className="text-4xl">🔌</span>
                                </div>
                                <h3 className="text-2xl font-black text-gray-800 mb-2">Connection Issue</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
                                    We couldn't load the restaurants at the moment. The backend might be waking up or updating.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                                >
                                    Retry Connection
                                </button>
                            </div>
                        ) : filteredData.dishes.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 gap-y-10">
                                {filteredData.dishes.map((dish) => (
                                    <FoodCard
                                        key={dish.id}
                                        food={dish}
                                        restaurantName={dish.restaurantName}
                                        onAdd={handleAddToCart}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                                <div className="bg-gray-50 p-6 rounded-full mb-4">
                                    <Search size={48} className="text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-700">No items found</h3>
                                <p className="text-gray-500 mt-2">Try changing your filters or search term.</p>
                            </div>
                        )}
                    </ErrorBoundary>
                </section>

            </div>
        </div>
    );
};

export default Home;
