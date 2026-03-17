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
    0% { transform: translate(-150%, 50%) rotate(20deg); opacity: 0; }
    15% { transform: translate(10%, 10%) rotate(0deg); opacity: 1; }
    85% { transform: translate(15%, 15%) rotate(-5deg); opacity: 1; }
    100% { transform: translate(200%, -50%) rotate(-20deg); opacity: 0; }
  }
  @keyframes bubble-pop {
    0% { transform: scale(0); opacity: 0; }
    5% { transform: scale(1.1); opacity: 1; }
    10%, 90% { transform: scale(1); opacity: 1; }
    100% { transform: scale(0); opacity: 0; }
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
    // Show every 45 seconds for 10 seconds
    const interval = setInterval(() => {
      fetchMsg();
      setActive(true);
      setTimeout(() => setActive(false), 10000);
    }, 45000);

    // Initial show after 5s
    const initial = setTimeout(() => {
      fetchMsg();
      setActive(true);
      setTimeout(() => setActive(false), 10000);
    }, 5000);

    return () => { clearInterval(interval); clearTimeout(initial); };
  }, [fetchMsg]);

  if (!active || !data) return null;

  return (
    <div 
      className="fixed bottom-10 left-10 z-[100] pointer-events-none"
      style={{ animation: 'ufo-peek 10s ease-in-out forwards' }}
    >
      {/* Speech Bubble */}
      <div className="mb-4 ml-6 ufo-bubble opacity-0">
        <div className="bg-white text-gray-900 px-4 py-2 rounded-2xl rounded-bl-sm shadow-2xl relative border-2 border-orange-500 max-w-[200px]">
          <p className="text-[11px] font-bold leading-tight">
            {data.message}
          </p>
          <div className="absolute -bottom-2 left-0 w-4 h-4 bg-white border-b-2 border-l-2 border-orange-500 rotate-45" />
        </div>
      </div>

      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_10px_rgba(255,140,0,0.5)]">
        <path d="M12 4C8.68629 4 6 5.79086 6 8C6 8.52554 6.15552 9.02324 6.4344 9.46781C4.42173 10.1064 3 11.3916 3 12.875C3 15.1532 7.02944 17 12 17C16.9706 17 21 15.1532 21 12.875C21 11.3916 19.5783 10.1064 17.5656 9.46781C17.8445 9.02324 18 8.52554 18 8C18 5.79086 15.3137 4 12 4Z" fill="#ff6b00" fillOpacity="0.3" stroke="#ff8c00" strokeWidth="1"/>
        <path d="M8 8C8 6.89543 9.79086 6 12 6C14.2091 6 16 6.89543 16 8" stroke="#ff8c00" strokeWidth="1"/>
        <circle cx="8" cy="13" r="1.5" fill="#ffcc00">
          <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="12" cy="13" r="1.5" fill="#ffcc00">
          <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="16" cy="13" r="1.5" fill="#ffcc00">
          <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite" />
        </circle>
      </svg>
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

  // Apply client-side filters on the loaded set
  const filtered = foods.filter(f => {
    const isVeg = f.is_veg === true || f.is_veg === 'true';
    if (vegFilter === 'veg' && !isVeg) return false;
    if (vegFilter === 'non_veg' && isVeg) return false;
    if (mealFilter !== 'all' && f.meal_type && f.meal_type !== 'any' && f.meal_type !== mealFilter) return false;
    return true;
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

          {/* Combined Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip label="All" active={vegFilter === 'all'} onClick={() => setVegFilter('all')} />
            <FilterChip label="Veg" active={vegFilter === 'veg'} onClick={() => setVegFilter('veg')} />
            <div className="w-px h-4 bg-white/10 mx-1" />
            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                <button
                  key={type}
                  onClick={() => setMealFilter(p => p === type ? 'all' : type)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all border ${mealFilter === type ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/5 text-gray-400'}`}
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
