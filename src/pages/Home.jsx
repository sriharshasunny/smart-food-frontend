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

const Home = () => {
    const { addToCart } = useShop();
    const navigate = useNavigate();

    // Geolocation State
    const [locationName, setLocationName] = useState('Sunnyvale, CA');
    const [loadingLocation, setLoadingLocation] = useState(false);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            console.error("Geolocation not supported");
            return;
        }
        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    if (data && data.address) {
                        const addr = data.address;
                        // Prioritize: Neighborhood/Suburb/Village > City/Town
                        // e.g. "LB Nagar" or "Madhapur"
                        const localArea = addr.neighbourhood || addr.suburb || addr.village || addr.residential || addr.road;

                        // Main City/District
                        const mainCity = addr.city || addr.town || addr.county || addr.state_district || addr.state;

                        let formattedLocation = "Unknown Location";

                        if (localArea) {
                            // If we have a specific area, try to append city: "LB Nagar, Hyderabad"
                            formattedLocation = mainCity ? `${localArea}, ${mainCity}` : localArea;
                        } else {
                            // Fallback to just city
                            formattedLocation = mainCity || "Unknown Location";
                        }

                        setLocationName(formattedLocation);
                    }
                } catch (e) {
                    console.error(e);
                    setLocationName("Location Error");
                } finally {
                    setLoadingLocation(false);
                }
            },
            (error) => {
                console.error("Geo error:", error);
                setLoadingLocation(false);
            }
        );
    };

    // Auto-detect on mount (optional, or just rely on manual click to avoid permissions annoyance immediately, but user asked for it)
    React.useEffect(() => {
        // Check if we already have a location saved or just run it
        detectLocation();
    }, []);

    const [activeCategory, setActiveCategory] = useState('All');
    // New specific filters for restaurants only
    const [restaurantFilters, setRestaurantFilters] = useState({
        veg: false,
        fastDelivery: false,
        topRated: false
    });
    // SubFilters (from original) - We might deprecate these or keep them for FOOD ONLY if needed.
    // Ideally, let's keep subFilters for FOOD only consistency if that was the intent,
    // but user asked for "other filters for restaurants".
    const [subFilters, setSubFilters] = useState({
        rating45Plus: false,
        rating4Plus: false,
        rating35Plus: false,
        vegOnly: false,
        priceLow: false,
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isSticky, setIsSticky] = useState(false);
    const filterRef = React.useRef(null);
    const sectionHeaderRef = React.useRef(null); // Track the "Explore Food Items" text

    // Filter Bar Sticky Observer - Precise 75%/50% synchronization
    React.useEffect(() => {
        const handleScroll = () => {
            if (filterRef.current) {
                const rect = filterRef.current.getBoundingClientRect();
                const navbarHeight = window.innerWidth >= 768 ? 70 : 54;
                const filterHeight = rect.height;

                // Calculate the position thresholds
                // Sticky appears when 75% of the filter is hidden (top + 75% of height crosses navbar bottom)
                const appearThreshold = rect.top + (filterHeight * 0.75);
                // Sticky disappears when 50% of the filter is visible (top + 50% of height is above navbar bottom)
                const disappearThreshold = rect.top + (filterHeight * 0.5);

                // Show sticky when filter is 75% hidden behind navbar
                // Hide sticky when filter is 50% or more visible
                if (appearThreshold <= navbarHeight) {
                    setIsSticky(true);
                } else if (disappearThreshold > navbarHeight) {
                    setIsSticky(false);
                }
            }
        };

        // Initial check
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll); // Recalculate on resize
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    // --- Filtering Logic ---
    const filteredData = useMemo(() => {
        let dishes = mockDishes;
        let restaurants = mockRestaurants;

        // 1. Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            dishes = dishes.filter(d => (d.name?.toLowerCase() || '').includes(query) || (d.category?.toLowerCase() || '').includes(query));
            restaurants = restaurants.filter(r => (r.name?.toLowerCase() || '').includes(query) || (r.cuisine?.toLowerCase() || '').includes(query));
        }

        // 2. Category Filter (Biryani, Sushi, etc) - ONLY FOR DISHES
        if (activeCategory !== 'All') {
            dishes = dishes.filter(d => d.category === activeCategory || d.name.includes(activeCategory));
            // restaurants NOT filtered by activeCategory anymore
        }

        // 3. Sub Filters (applies to FOOD/DISHES)
        if (subFilters.rating45Plus) {
            dishes = dishes.filter(d => d.rating >= 4.5);
        }
        if (subFilters.rating4Plus) {
            dishes = dishes.filter(d => d.rating >= 4.0);
        }
        if (subFilters.rating35Plus) {
            dishes = dishes.filter(d => d.rating >= 3.5);
        }
        if (subFilters.vegOnly) {
            dishes = dishes.filter(d => d.isVeg);
        }
        if (subFilters.priceLow) {
            dishes = dishes.filter(d => d.price <= 10);
        }
        // Restaurant Filters (Separate Logic)
        if (restaurantFilters.topRated) {
            restaurants = restaurants.filter(r => r.rating >= 4.5);
        }
        if (restaurantFilters.veg) {
            restaurants = restaurants.filter(r => r.tags.includes('Vegetarian') || r.tags.includes('Pure Veg') || r.cuisine === 'South Indian');
        }
        if (restaurantFilters.fastDelivery) {
            restaurants = restaurants.filter(r => parseInt(r.deliveryTime) <= 30);
        }

        return { dishes, restaurants };
    }, [searchQuery, activeCategory, subFilters, restaurantFilters]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
            {/* Increased Horizontal padding (approx 30px+) */}
            <div className="w-full px-8 md:px-10 lg:px-12 pt-6 space-y-8 max-w-[1600px] mx-auto">

                {/* Header / Search */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-0 pb-1">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={detectLocation}
                            className="bg-orange-500 p-1.5 rounded-full shadow-lg shadow-orange-200 hover:scale-110 transition-transform active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                            title="Detect My Location"
                        >
                            <MapPin className={`text-white w-3.5 h-3.5 ${loadingLocation ? 'animate-bounce' : ''}`} />
                        </button>
                        <div onClick={detectLocation} className="cursor-pointer group flex flex-col items-start">
                            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight group-hover:text-orange-500 transition-colors">Delivering to</h2>
                            <h1 className="text-lg font-black text-gray-800 leading-none group-hover:text-orange-600 transition-colors">
                                {loadingLocation ? "Locating..." : locationName}
                            </h1>
                        </div>
                    </div>
                </div>



                {/* Hero Banner (Offers) */}
                <ErrorBoundary key="hero">
                    <HeroBanner />
                </ErrorBoundary>

                {/* --- Content Sections --- */}

                {/* Split Top Section: Restaurants (Large Left) + Quick Recs (Small Right) */}
                <div className="flex flex-col xl:flex-row gap-4 mb-0 h-[400px]">

                    {/* Left: Top Restaurants (Flexible to fill space) */}
                    <div className="flex-1 min-w-0 bg-gradient-to-br from-white to-orange-50/30 rounded-[2rem] p-4 border border-orange-200 shadow-sm hover:shadow-orange-100/50 relative overflow-hidden flex flex-col justify-center h-full group hover:shadow-md transition-shadow duration-500">
                        {/* Background Blob */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-50 rounded-full -translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50" />

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end md:items-center mb-2 pt-1 px-1 shrink-0 gap-2">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                    Top Restaurants <Sparkles className="w-4 h-4 text-orange-500 fill-orange-500" />
                                </h2>
                                <p className="text-gray-500 font-medium text-xs mt-0.5">Premium places near you</p>
                            </div>

                            {/* NEW Restaurant Specific Filters */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setRestaurantFilters(prev => ({ ...prev, fastDelivery: !prev.fastDelivery }))}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${restaurantFilters.fastDelivery
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    Fast Delivery
                                </button>
                                <button
                                    onClick={() => setRestaurantFilters(prev => ({ ...prev, veg: !prev.veg }))}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${restaurantFilters.veg
                                        ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    <span className="mr-1">🥦</span> Pure Veg
                                </button>
                                <button
                                    onClick={() => setRestaurantFilters(prev => ({ ...prev, topRated: !prev.topRated }))}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${restaurantFilters.topRated
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    Top Rated
                                </button>
                            </div>
                        </div>

                        {/* Extended Horizontal Scroll */}
                        <ErrorBoundary key="restaurants">
                            <div className="w-full overflow-x-auto overflow-y-hidden pb-6 pt-2 hide-scrollbar flex snap-x scroll-pl-4 gap-4 relative z-10 h-full items-center px-1">
                                {filteredData.restaurants.map((restaurant) => (
                                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                                ))}
                            </div>
                        </ErrorBoundary>
                    </div>


                    {/* Right: Quick Recommendations (Adjusted Width - 410px) */}
                    <div className="w-full xl:w-[410px] shrink-0 bg-white rounded-[2rem] p-4 border border-yellow-200 shadow-sm hover:shadow-yellow-100/50 relative overflow-hidden group flex flex-col h-full">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50" />

                        <div className="flex justify-between items-center mb-3 relative z-10 shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
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
                        <div className="flex flex-col overflow-y-auto pr-1 scrollbar-none gap-3 relative z-10 h-full pt-1">
                            {filteredData.dishes.slice(0, 6).map((dish) => (
                                <div
                                    key={dish.id}
                                    className="bg-white/40 backdrop-blur-xl relative overflow-hidden rounded-[1.25rem] p-2 flex gap-3 transition-all duration-500 cursor-pointer border border-white/60 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)] hover:bg-white/80 hover:border-orange-200 hover:-translate-y-0.5 group/item items-center shrink-0"
                                >
                                    {/* Glossy Border Overlay */}
                                    <div className="absolute inset-0 rounded-[1.25rem] border border-white/50 pointer-events-none z-20" />
                                    {/* Image with Floating Badge */}
                                    <div className="h-[4.5rem] w-[4.5rem] rounded-2xl overflow-hidden relative shrink-0 shadow-sm group-hover/item:shadow-md transition-all duration-500">
                                        <img src={dish.image} alt={dish.name} className="w-full h-full object-cover transform group-hover/item:scale-110 transition-transform duration-700 ease-out" />
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

                {/* Instance 1: Static (Scrolls with page) */}
                <div ref={filterRef} className="w-full bg-transparent py-0 mb-1 z-10 relative">
                    <FilterBar
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        subFilters={subFilters}
                        setSubFilters={setSubFilters}
                        isSticky={false}
                    />
                </div>

                {/* Instance 2: Sticky Sentinel (Zero Height, Anchor) */}
                {/* This div sticks to the top, but has 0 height. It acts as an anchor for the absolute child. */}
                <div className="sticky top-[54px] md:top-[70px] z-40 h-0 w-full -mx-8 md:-mx-10 lg:-mx-12 px-8 md:px-10 lg:px-12 pointer-events-none">
                    {/* Floating Filter (Fixed Position - Viewport Relative with 15px gaps) */}
                    <div className={`fixed top-[54px] md:top-[70px] left-[15px] right-[15px] z-40 w-auto transition-all duration-200 ease-out ${isSticky ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                        <FilterBar
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                            subFilters={subFilters}
                            setSubFilters={setSubFilters}
                            isSticky={true}
                        />
                    </div>
                </div>

                {/* 2. Popular Food Items Section (Bottom) */}
                <section className="min-h-[500px]">
                    {/* Food Grid */}
                    <ErrorBoundary key="food-grid">
                        {filteredData.dishes.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 gap-y-10">
                                {filteredData.dishes.map((dish) => {
                                    const restaurant = mockRestaurants.find(r => r.id === dish.restaurantId);
                                    return (
                                        <FoodCard
                                            key={dish.id}
                                            food={dish}
                                            restaurantName={restaurant?.name}
                                            onAdd={addToCart}
                                        />
                                    );
                                })}
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
