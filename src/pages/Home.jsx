import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import FilterBar from '../components/FilterBar';
import FoodCard from '../components/FoodCard';
import RestaurantCard from '../components/RestaurantCard';
import { useShop } from '../context/ShopContext';
import { mockRestaurants, mockDishes, categories } from '../data/mockData';
import { Search, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';

import { API_URL } from '../config';  // Import Config

const Home = () => {
    const { addToCart } = useShop();
    const navigate = useNavigate();

    // Data State
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

    const [searchQuery, setSearchQuery] = useState('');
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
        const handleScroll = () => {
            if (filterRef.current) {
                const rect = filterRef.current.getBoundingClientRect();
                // Show sticky bar only when the main filter bar has almost scrolled out of view (e.g. bottom touches top nav)
                // rect.bottom <= 64 (Navbar height) + some buffer if needed
                setShowStickyFilters(rect.bottom <= 100);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    // Location Widget Logic within Render
    const locationWidget = (
        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md p-2 pl-3 pr-4 rounded-full border border-white/10 shadow-xl transition-transform hover:scale-105 cursor-pointer group" onClick={detectLocation}>
            <button
                className="bg-orange-500 p-2 rounded-full shadow-lg shadow-orange-500/20 group-hover:bg-orange-600 transition-colors"
                title="Detect My Location"
            >
                <MapPin className={`text-white w-4 h-4 ${loadingLocation ? 'animate-bounce' : ''}`} />
            </button>
            <div className="flex flex-col items-start">
                <h2 className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-none mb-0.5">Delivering to</h2>
                <h1 className="text-sm font-black text-white leading-none drop-shadow-md group-hover:text-orange-400 transition-colors max-w-[150px] truncate">
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
        <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
            {/* Minimal Padding for Full Screen Feel */}
            <div className="w-full px-2 sm:px-3 pt-2 space-y-3 mx-auto">

                {/* Hero Banner (Offers) WITH Location Widget Embedded */}
                <ErrorBoundary key="hero">
                    <HeroBanner topRightContent={locationWidget} />
                </ErrorBoundary>

                {/* --- Content Sections --- */}

                {/* Split Top Section: Restaurants (Large Left) + Quick Recs (Small Right) */}
                <div className="flex flex-col xl:flex-row gap-3 h-auto xl:h-[480px]">

                    {/* Left: Top Content (Restaurants) */}
                    <div className="flex-1 min-w-0 bg-white rounded-[1.5rem] p-3 border border-orange-100 shadow-sm relative overflow-hidden flex flex-col h-[320px] xl:h-full group transition-transform duration-300 transform-gpu">
                        {/* ... (rest of Left content same) ... */}
                        {/* Background Blob */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-50/50 rounded-full -translate-x-1/3 -translate-y-1/3 opacity-50" />

                        {/* Scroll Buttons (Restaurant - Horizontal) */}
                        <button
                            onClick={() => scrollContainer(restaurantContainerRef, 'left')}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/80 hover:bg-black hover:text-white text-gray-700 rounded-full shadow-lg backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 active:scale-95 border border-gray-100"
                        >
                            <ChevronRight className="rotate-180 w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scrollContainer(restaurantContainerRef, 'right')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/80 hover:bg-black hover:text-white text-gray-700 rounded-full shadow-lg backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 active:scale-95 border border-gray-100"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="relative z-10 flex flex-row items-center justify-between mb-2 pt-1 px-1 shrink-0 gap-2 h-10">
                            {/* Toggle Switcher - Compact */}
                            <div className="flex items-center bg-gray-100 p-0.5 rounded-full relative shrink-0">
                                <button
                                    onClick={() => setViewMode('restaurants')}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide transition-all z-10 ${viewMode === 'restaurants' ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Restaurants
                                </button>
                                <button
                                    onClick={() => setViewMode('recs')}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide transition-all z-10 ${viewMode === 'recs' ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    AI Picks
                                </button>

                                {/* Sliding Background */}
                                <div className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-black rounded-full transition-all duration-300 ease-spring ${viewMode === 'restaurants' ? 'left-0.5' : 'left-[calc(50%+1px)]'}`} />
                            </div>

                            {/* Filters (Only visible for Restaurants view) - Same Row */}
                            {viewMode === 'restaurants' && (
                                <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-1 justify-end items-center h-full">
                                    <button onClick={() => setRestaurantFilters(prev => ({ ...prev, fastDelivery: !prev.fastDelivery }))} className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[9px] font-bold transition-all border shrink-0 ${restaurantFilters.fastDelivery ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200'}`}>Fast Delivery</button>
                                    <button onClick={() => setRestaurantFilters(prev => ({ ...prev, topRated: !prev.topRated }))} className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[9px] font-bold transition-all border shrink-0 ${restaurantFilters.topRated ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}>Top Rated</button>
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        <ErrorBoundary key={viewMode}>
                            <div ref={restaurantContainerRef} className="w-full overflow-x-auto overflow-y-hidden pb-6 pt-2 hide-scrollbar flex snap-x scroll-pl-4 gap-4 relative z-10 h-full items-center px-1 scroll-smooth touch-pan-x overscroll-contain">
                                {viewMode === 'restaurants' ? (
                                    filteredData.restaurants.map((restaurant) => (
                                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                                    ))
                                ) : (
                                    filteredData.dishes.slice(0, 8).map((dish) => (
                                        <div key={dish.id} className="min-w-[200px] snap-start">
                                            <FoodCard food={dish} onAdd={handleAddToCart} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </ErrorBoundary>
                    </div>


                    {/* Right: Quick Recommendations (Adjusted Width - Flexible on mobile) */}
                    <div className="w-full xl:w-[420px] shrink-0 bg-white rounded-[1.5rem] p-3 border border-yellow-100 shadow-sm relative overflow-hidden group flex flex-col h-[320px] xl:h-full">
                        {/* Background Decoration - Optimized */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50/50 rounded-full translate-x-1/3 -translate-y-1/3 opacity-50" />

                        {/* Scroll Buttons (Trending - Vertical) */}
                        <button
                            onClick={() => scrollContainer(trendingContainerRef, 'up')}
                            className="absolute right-4 top-14 z-20 w-8 h-8 bg-white/80 hover:bg-orange-500 hover:text-white text-gray-700 rounded-full shadow-lg backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 active:scale-95 border border-gray-100"
                        >
                            <ChevronRight className="-rotate-90 w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scrollContainer(trendingContainerRef, 'down')}
                            className="absolute right-4 bottom-4 z-20 w-8 h-8 bg-white/80 hover:bg-orange-500 hover:text-white text-gray-700 rounded-full shadow-lg backdrop-blur-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 active:scale-95 border border-gray-100"
                        >
                            <ChevronRight className="rotate-90 w-5 h-5" />
                        </button>

                        <div className="flex justify-between items-center mb-2 relative z-10 shrink-0">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-md text-[10px] shadow-sm uppercase tracking-wider">Trending</span>
                                    Picks ⚡
                                </h2>
                            </div>
                            <button
                                onClick={() => navigate('/recommendations')}
                                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors bg-orange-50 px-2.5 py-1.5 rounded-full"
                            >
                                View All <ChevronRight size={14} />
                            </button>
                        </div>

                        {/* Quick Grid (Vertical Scroll) - Simple Rainbow Cards */}
                        <div ref={trendingContainerRef} className="flex flex-col overflow-y-auto pr-1 scrollbar-none gap-2 relative z-10 h-full pt-1 scroll-smooth touch-pan-y overscroll-contain">


                            {filteredData.dishes.slice(0, 6).map((dish) => (
                                <div
                                    key={dish.id}
                                    className="bg-white relative overflow-hidden rounded-[1.25rem] p-2 flex gap-3 transition-transform duration-200 cursor-pointer border border-gray-100 hover:border-orange-200 hover:-translate-y-0.5 group/item items-center shrink-0 shadow-sm"
                                >
                                    {/* Glossy Border Overlay */}
                                    <div className="absolute inset-0 rounded-[1.25rem] border border-white/50 pointer-events-none z-20" />
                                    {/* Image with Floating Badge */}
                                    <div className="h-[4.5rem] w-[4.5rem] rounded-2xl overflow-hidden relative shrink-0 shadow-sm group-hover/item:shadow-md transition-all duration-500">
                                        <img src={dish.image} alt={dish.name} loading="lazy" className="w-full h-full object-cover transform group-hover/item:scale-110 transition-transform duration-700 ease-out" />
                                        {/* Rating Badge Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 pt-4 flex justify-center">
                                            <div className="flex items-center gap-0.5 text-[8px] font-bold text-white">
                                                <span>⭐</span> {dish.rating || 4.5}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5 gap-2">
                                        <div>
                                            {/* Tag */}
                                            {dish.price > 300 && <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md mb-1 inline-block tracking-wider uppercase">Bestseller</span>}

                                            <h4 className="font-bold text-gray-800 text-[15px] leading-tight line-clamp-1 group-hover/item:text-orange-600 transition-colors">{dish.name}</h4>
                                            <p className="text-[10px] text-gray-400 font-medium line-clamp-1 mt-0.5">{dish.category} • {dish.isVeg ? 'Veg' : 'Non-Veg'}</p>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400 line-through decoration-orange-300/50 decoration-2">₹{Math.round(dish.price * 1.2)}</span>
                                                <span className="text-gray-900 font-black text-sm leading-none">₹{dish.price}</span>
                                            </div>

                                            {/* Premium Add Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(dish);
                                                }}
                                                className="h-8 px-4 rounded-full bg-gray-50 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 text-gray-600 hover:text-white text-xs font-bold transition-all shadow-sm hover:shadow-orange-200 hover:shadow-lg active:scale-95 flex items-center gap-1 group/btn border border-gray-100 hover:border-transparent"
                                            >
                                                ADD <span className="text-sm font-extrabold group-hover/btn:rotate-90 transition-transform duration-300 ml-0.5">+</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div> {/* Close Recs + Top Section */}


                {/* --- MENU PARTITION --- */}

                {/* 1. Premium Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-1" />

                {/* 2. Menu Section Header (Professional Single Line) */}
                <div ref={sectionHeaderRef} className="flex items-center justify-between mb-1 relative">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="px-4 text-sm font-bold tracking-[0.2em] text-gray-400 uppercase">Explore Food Items</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
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

                    {/* B. Sticky Filter Bar (Text Mode) - Slides down when main is gone */}
                    <div className={`fixed top-[64px] left-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-md transition-all duration-300 transform ${showStickyFilters ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                        <FilterBar
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                            subFilters={subFilters}
                            setSubFilters={setSubFilters}
                            isSticky={true} // Always Compact Text
                        />
                    </div>
                </div>

                {/* 4. Popular Food Items Section (Bottom) */}
                <section className="min-h-[500px] content-visibility-auto contain-layout pt-4">
                    {/* Food Grid */}
                    <ErrorBoundary key="food-grid">
                        {/* Error State for API Failure */}
                        {realRestaurants.length === 0 && !loadingData && (
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
                        )}

                        {filteredData.dishes.length > 0 ? (
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
                            // Only show "No items found" if we actually have restaurants properly loaded but filtered out
                            realRestaurants.length > 0 && (
                                <div className="text-center py-24 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                                    <div className="bg-gray-50 p-6 rounded-full mb-4">
                                        <Search size={48} className="text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-700">No items found</h3>
                                    <p className="text-gray-500 mt-2">Try changing your filters or search term.</p>
                                </div>
                            )
                        )}
                    </ErrorBoundary>
                </section>

            </div>
        </div>
    );
};

export default Home;
