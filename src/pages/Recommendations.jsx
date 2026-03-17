import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { API_URL } from '../config';
import { trackAddToCart } from '../utils/trackActivity';
import { Rocket, Sparkles, Zap, ShieldCheck, ChevronRight, Info } from 'lucide-react';

// ─── CSS Visual Effects ──────────────────────────────────────────────────────
const SPACE_CSS = `
  @keyframes stars {
    from { transform: translateY(0); }
    to { transform: translateY(-50%); }
  }
  @keyframes scan {
    0% { transform: translateY(-100%); opacity: 0; }
    50% { opacity: 0.5; }
    100% { transform: translateY(1000%); opacity: 0; }
  }
  @keyframes ufo-peek {
    0% { transform: translate(-100px, 80%) rotate(10deg); opacity: 0; }
    5% { opacity: 0.8; }
    15% { transform: translate(15vw, 15vh) rotate(0deg); }
    30% { transform: translate(60vw, 20vh) rotate(-5deg); }
    50% { transform: translate(75vw, 50vh) rotate(5deg); }
    70% { transform: translate(30vw, 60vh) rotate(-2deg); }
    85% { transform: translate(10vw, 30vh) rotate(0deg); }
    95% { opacity: 0.8; }
    100% { transform: translate(-100px, 10vh) rotate(-10deg); opacity: 0; }
  }
  @keyframes bubble-pop {
    0% { transform: scale(0); opacity: 0; }
    5% { transform: scale(1.1); opacity: 1; }
    10%, 90% { transform: scale(1); opacity: 1; }
    100% { transform: scale(0); opacity: 0; }
  }
  @keyframes ufo-light-spin {
    from { opacity: 0.3; }
    to { opacity: 1; }
  }
  .star-field {
    animation: stars 120s linear infinite;
    background-image: 
      radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)),
      radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
      radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)),
      radial-gradient(1.5px 1.5px at 90px 40px, #fff, rgba(0,0,0,0));
    background-size: 200px 200px;
    opacity: 0.3;
  }
  .glass-card {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
  .match-glow {
    box-shadow: 0 0 15px rgba(249, 115, 22, 0.4);
  }
  .ufo-bubble {
    animation: bubble-pop 10s ease-in-out forwards;
  }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const StarField = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050510]">
    <div className="absolute inset-0 star-field" />
    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-orange-900/10" />
  </div>
);

const UFOAssistant = ({ userId }) => {
  const [data, setData] = useState(null);
  const [active, setActive] = useState(false);

  const fetchMsg = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/recommendations/ufo-message/${userId}`);
      const json = await res.json();
      if (json.success) setData(json);
    } catch (e) {
      console.warn('UFO failed to fetch message');
    }
  }, [userId]);

  useEffect(() => {
    // Show every 70 seconds for 25 seconds
    const interval = setInterval(() => {
      fetchMsg();
      setActive(true);
      setTimeout(() => setActive(false), 25000);
    }, 70000);

    // Initial show after 2s
    const initial = setTimeout(() => {
      fetchMsg();
      setActive(true);
      setTimeout(() => setActive(false), 25000);
    }, 2000);

    return () => { clearInterval(interval); clearTimeout(initial); };
  }, [fetchMsg]);

  if (!active || !data) return null;

  return (
    <div 
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      <div 
        className="absolute bottom-10 left-10"
        style={{ 
          animation: 'ufo-peek 25s ease-in-out forwards',
          opacity: 0.6 // More subtle when moving over items
        }}
      >
      {/* Speech Bubble */}
      <div className="mb-4 ml-8 ufo-bubble opacity-0">
        <div className="glass-card bg-black/80 text-white px-5 py-3 rounded-2xl rounded-bl-sm shadow-2xl relative border border-orange-500/50 max-w-[220px]">
          <p className="text-[12px] font-bold leading-tight drop-shadow-md">
            {data.message}
          </p>
          <div className="absolute -bottom-2.5 left-0 w-5 h-5 bg-black/80 border-b border-l border-orange-500/50 rotate-45" />
        </div>
      </div>

      {/* 3D Realistic UFO */}
      <svg width="100" height="70" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_20px_40px_rgba(255,140,0,0.3)] opacity-90 transition-opacity duration-1000">
        <defs>
          <radialGradient id="ufoGlass" cx="50%" cy="50%" r="50%" fx="40%" fy="30%">
            <stop offset="0%" stopColor="#88CCFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#003366" stopOpacity="0.9" />
          </radialGradient>
          <linearGradient id="ufoBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0e0e0" />
            <stop offset="50%" stopColor="#999999" />
            <stop offset="100%" stopColor="#444444" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Cockpit Shell */}
        <path d="M30 35C30 25 38.9543 18 50 18C61.0457 18 70 25 70 35H30Z" fill="url(#ufoGlass)" stroke="#AADDFF" strokeWidth="0.5" />
        <ellipse cx="50" cy="30" rx="12" ry="6" fill="white" fillOpacity="0.2" />

        {/* Main Body (The Rim) */}
        <path d="M10 40C10 32 27.9086 28 50 28C72.0914 28 90 32 90 40C90 48 72.0914 52 50 52C27.9086 52 10 48 10 40Z" fill="url(#ufoBody)" stroke="#333" strokeWidth="1" />
        
        {/* Base / Bottom Dome */}
        <path d="M35 48C35 55 41.7157 60 50 60C58.2843 60 65 55 65 48H35Z" fill="#333" />
        
        {/* Lights */}
        <circle cx="25" cy="42" r="2.5" fill="#FFD700" filter="url(#glow)">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="0.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="45" r="3" fill="#FF5500" filter="url(#glow)">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="75" cy="42" r="2.5" fill="#FFD700" filter="url(#glow)">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1s" repeatCount="indefinite" />
        </circle>

        {/* Tractor beam - subtle */}
        <path d="M40 60 L30 150 L70 150 L60 60 Z" fill="url(#beamGrad)" opacity="0.1" />
        <defs>
          <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFCC00" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    </div>
  );
};



// ─── Skeleton ───────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 animate-pulse">
    <div className="h-48 bg-white/10" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
      <div className="flex justify-between items-center mt-4">
        <div className="h-5 bg-white/10 rounded w-16" />
        <div className="h-8 bg-orange-500/20 rounded-xl w-20" />
      </div>
    </div>
  </div>
);

// ─── Food Grid Card ──────────────────────────────────────────────────────────
const FoodGridCard = ({ food, userId, onAdd }) => {
  const isVeg = food.is_veg === true || food.is_veg === 'true' || food.isVeg;
  const rating = parseFloat(food.rating) || 4.2;
  const score = food._score ? (food._score * 100).toFixed(0) : null;

  return (
    <div
      className="group relative glass-card rounded-[1.5rem] overflow-hidden
                 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 ease-out flex flex-col h-full"
    >
      {/* Sync with Home: Image Section (h-44) */}
      <div className="relative h-44 overflow-hidden bg-[#0a0a15]">
        {food.image ? (
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-105"
            loading="lazy"
            onError={e => { e.target.onerror = null; e.target.src = ''; e.target.style.display='none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-900 shadow-inner">🍽️</div>
        )}

        {/* Dynamic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90" />
        
        {/* Rating Badge - Same as Home */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-black/60 px-2.5 py-1.5 rounded-lg text-yellow-400 text-[11px] font-black">
          {rating.toFixed(1)} <Sparkles size={12} className="fill-yellow-400" />
        </div>

        {/* Match Score - Keep it but make it subtle */}
        {score && (
          <div className="absolute top-3 right-3">
            <div className="bg-orange-500 text-white px-2 py-0.5 rounded-md font-black text-[9px] shadow-lg animate-pulse tracking-tighter">
              {score}% MATCH
            </div>
          </div>
        )}
      </div>

      {/* Info Section - Sync with Home layout */}
      <div className="p-4 flex flex-col flex-grow bg-white/5 border-t border-white/5">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="text-gray-100 font-bold text-[15px] leading-tight group-hover:text-orange-400 transition-colors line-clamp-1">
            {food.name}
          </h3>
          <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 mt-0.5 ${isVeg ? 'border-green-600' : 'border-red-600'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
          </div>
        </div>

        <p className="text-gray-400 text-[11px] font-medium line-clamp-2 mb-4 leading-relaxed">
          {food.description || `Special selection from ${food.restaurant?.name || 'Galactic Kitchen'}`}
        </p>

        {/* Price and Add - Sync with Home */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/5">
          <span className="font-black text-lg text-white">₹{food.price}</span>
          <button
            onClick={() => { trackAddToCart(userId, food); onAdd(food); }}
            className="bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white font-bold py-1.5 px-4 rounded-xl text-[11px] uppercase tracking-wider transition-all border border-orange-500/20"
          >
            ADD +
          </button>
        </div>
      </div>
    </div>
  );
};


// ─── Filter Bar ───────────────────────────────────────────────────────────────
const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border
      ${active
        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
        : 'bg-white/5 border-white/10 text-gray-400 hover:border-orange-500/40 hover:text-white'
      }`}
  >
    {label}
  </button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const Recommendations = () => {
  const { user } = useAuth();
  const { addToCart } = useShop();

  const [foods, setFoods] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [strategy, setStrategy] = useState('');
  const [mealType, setMealType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [vegFilter, setVegFilter] = useState('all'); // 'all' | 'veg' | 'non_veg'
  const [mealFilter, setMealFilter] = useState('all'); // 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'
  const [sortBy, setSortBy] = useState('match'); // 'match', 'rating', 'price_lo', 'price_hi'

  const userId = user?._id || user?.id;
  const loadingRef = useRef(false);

  const fetchPage = useCallback(async (pageNum = 1, reset = false) => {
    if (!userId || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const url = `${API_URL}/api/recommendations/${userId}?limit=20&page=${pageNum}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      const newFoods = data.recommendations || [];
      setFoods(prev => reset ? newFoods : [...prev, ...newFoods]);
      setExplanation(data.explanation || '');
      setStrategy(data.strategy || '');
      setMealType(data.mealType || '');
      setHasMore(newFoods.length === 20);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    setPage(1);
    fetchPage(1, true);
  }, [fetchPage]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, false);
  };

  // Apply client-side filters & sorting on the loaded set
  const filtered = foods
    .filter(f => {
      const isVeg = f.is_veg === true || f.is_veg === 'true' || f.isVeg;
      if (vegFilter === 'veg' && !isVeg) return false;
      if (vegFilter === 'non_veg' && isVeg) return false;
      if (mealFilter !== 'all' && f.meal_type && f.meal_type !== 'any' && f.meal_type !== mealFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
      if (sortBy === 'price_lo') return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
      if (sortBy === 'price_hi') return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
      return (b._score || 0) - (a._score || 0); // Default: match score
    });

  const strategyLabel = strategy === 'cold_start'
    ? '🔥 Trending Near You'
    : '✨ Personalised For You';

  const mealIcon = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍿' };

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center text-center px-6">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-2">Login to see recommendations</h2>
        <p className="text-gray-400 text-sm">Your personal food recommendations appear here after you log in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020205] pb-24 relative overflow-hidden">
      <style>{SPACE_CSS}</style>
      
      {/* Visual Backdrop */}
      <StarField />
      <UFOAssistant userId={userId} />

      {/* Scanning Light Effect */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="absolute inset-x-0 h-1 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.3)] opacity-0 animate-[scan_15s_linear_infinite]" />
      </div>

      <div className="relative z-20">
      {/* Page Header - Thinned Down */}
      <div className="px-4 md:px-8 pt-8 pb-3 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-orange-500 font-black tracking-tighter text-[9px] uppercase opacity-70">
              <Zap size={12} className="fill-orange-500" /> Engine Active
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
              {strategyLabel.split(' ').slice(1).join(' ')}
            </h1>
          </div>

          {/* Combined Filters & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white/5 rounded-lg border border-white/5 p-0.5">
              <FilterChip label="All" active={vegFilter === 'all'} onClick={() => setVegFilter('all')} />
              <FilterChip label="Veg" active={vegFilter === 'veg'} onClick={() => setVegFilter('veg')} />
              <FilterChip label="Non-Veg" active={vegFilter === 'non_veg'} onClick={() => setVegFilter('non_veg')} />
            </div>

            <div className="w-px h-6 bg-white/10 mx-1 hidden md:block" />

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-500 uppercase">Sort:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/10 text-gray-300 text-[11px] font-bold rounded-lg px-2 py-1 outline-none focus:border-orange-500 transition-colors"
              >
                <option value="match" className="bg-[#050510]">Best Match</option>
                <option value="rating" className="bg-[#050510]">Rating</option>
                <option value="price_lo" className="bg-[#050510]">Price: Low-High</option>
                <option value="price_hi" className="bg-[#050510]">Price: High-Low</option>
              </select>
            </div>
            
            <div className="w-full md:w-auto flex gap-1.5 overflow-x-auto hide-scrollbar pt-2 md:pt-0">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                <button
                  key={type}
                  onClick={() => setMealFilter(p => p === type ? 'all' : type)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all border ${mealFilter === type ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'bg-white/5 border-white/5 text-gray-400'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Explainer - Thinned */}
        {explanation && (
          <div className="mt-6 relative group max-w-3xl">
            <div className="relative glass-card border-orange-500/10 p-4 rounded-xl flex items-center gap-3 overflow-hidden">
              <div className="bg-orange-500/10 p-2 rounded-lg text-orange-400 shrink-0">
                <Info size={18} />
              </div>
              <p className="text-gray-300 text-xs md:text-sm italic leading-relaxed font-medium">
                "{explanation}"
              </p>
            </div>
          </div>
        )}
      </div>


      {/* Error */}
      {error && (
        <div className="mx-4 md:mx-8 mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">⚠️ {error} — Showing available data.</p>
        </div>
      )}

      {/* Results count */}
      {!loading && filtered.length > 0 && (
        <p className="px-4 md:px-8 text-gray-500 text-sm mb-4">
          Showing {filtered.length} recommendation{filtered.length !== 1 ? 's' : ''}
          {vegFilter !== 'all' || mealFilter !== 'all' ? ' (filtered)' : ''}
        </p>
      )}

      {/* Grid */}
      <div className="px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading && foods.length === 0
            ? Array(8).fill(0).map((_, i) => <Skeleton key={i} />)
            : filtered.map(food => (
                <FoodGridCard
                  key={food.id}
                  food={food}
                  userId={userId}
                  onAdd={f => { addToCart(f); trackAddToCart(userId, f); }}
                />
              ))
          }
        </div>

        {/* No results after filter */}
        {!loading && filtered.length === 0 && (
          <div className="py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400 text-base">No foods match your current filters.</p>
            <button
              onClick={() => { setVegFilter('all'); setMealFilter('all'); }}
              className="mt-4 text-orange-400 text-sm underline hover:text-orange-300"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Load More */}
        {!loading && hasMore && filtered.length >= 20 && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              className="bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white
                         border border-orange-500/50 hover:border-orange-500
                         px-8 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Load More Recommendations
            </button>
          </div>
        )}

        {/* Loading more spinner */}
        {loading && foods.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Recommendations;
