import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { API_URL } from '../config';
import { trackAddToCart } from '../utils/trackActivity';
import { Rocket, Sparkles, Zap, ShieldCheck, ChevronRight, Info, MapPin, Star, Bot, Clock, Heart } from 'lucide-react';

// ─── CSS Visual Effects ──────────────────────────────────────────────────────
const SPACE_CSS = `
  @keyframes stars-scroll {
    from { transform: translateY(0); }
    to { transform: translateY(-1000px); }
  }
  @keyframes nebula-flow {
    0% { transform: translate(0, 0) scale(1); opacity: 0.4; }
    50% { transform: translate(5%, 5%) scale(1.1); opacity: 0.6; }
    100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
  }
  @keyframes scan-hud {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  .star-layer-1 {
    animation: stars-scroll 120s linear infinite;
    background-image: radial-gradient(1px 1px at 20px 30px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 70px, rgba(255,255,255,0.8), rgba(0,0,0,0));
    background-size: 400px 400px;
  }
  .star-layer-2 {
    animation: stars-scroll 80s linear infinite;
    background-image: radial-gradient(1.5px 1.5px at 100px 100px, #fff, rgba(0,0,0,0)), radial-gradient(1px 1px at 150px 200px, rgba(255,255,255,0.6), rgba(0,0,0,0));
    background-size: 600px 600px;
  }
  .star-layer-3 {
    animation: stars-scroll 40s linear infinite;
    background-image: radial-gradient(2px 2px at 300px 300px, #fff, rgba(0,0,0,0));
    background-size: 800px 800px;
  }
  .hud-grid {
    background-image: linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .premium-glass-hud {
    background: rgba(10, 10, 18, 0.6);
    backdrop-filter: blur(25px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.9);
  }
  .text-hud {
    font-family: 'JetBrains Mono', 'IBM Plex Mono', monospace;
    letter-spacing: 0.05em;
  }
  .scanner-line {
    animation: scan-hud 8s ease-in-out infinite;
    background: linear-gradient(to bottom, transparent, rgba(34, 211, 238, 0.1), transparent);
  }
`;

const StarField = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#02040a]">
    {/* Parallax Stars */}
    <div className="absolute inset-0 star-layer-1 opacity-20" />
    <div className="absolute inset-0 star-layer-2 opacity-30 scale-125" />
    <div className="absolute inset-0 star-layer-3 opacity-40 scale-150 rotate-6" />

    {/* HUD Elements */}
    <div className="absolute inset-0 hud-grid opacity-[0.03]" />
    <div className="absolute inset-0 scanner-line h-[400px] w-full opacity-20" />

    {/* Nebula / Glow Effects */}
    <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-cyan-500/10 blur-[140px] rounded-full animate-[nebula-flow_40s_ease-in-out_infinite]" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-indigo-500/15 blur-[160px] rounded-full animate-[nebula-flow_35s_ease-in-out_infinite_reverse]" />
    <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full animate-[nebula-flow_45s_ease-in-out_infinite]" />

    {/* Vignette */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#02040a] via-transparent to-[#02040a] opacity-80" />
  </div>
);

// UFOAssistant removed for a more professional HUD theme



// ─── Skeleton ───────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 animate-pulse">
    <div className="h-48 bg-white/10" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
      <div className="flex justify-between items-center mt-4">
        <div className="h-5 bg-white/10 rounded w-16" />
        <div className="h-8 bg-themeAccent-500/20 rounded-xl w-20" />
      </div>
    </div>
  </div>
);

// ─── Food Grid Card ──────────────────────────────────────────────────────────
const FoodGridCard = ({ food, userId, onAdd }) => {
  const isVeg = food.is_veg === true || food.is_veg === 'true' || food.isVeg;
  const rating = parseFloat(food.rating) || 4.2;
  const score = (food._score !== undefined && food._score !== null) ? Math.round(food._score) : null;

  return (
    <div
      className="group relative bg-[#0a0a14]/40 backdrop-blur-2xl rounded-2xl overflow-hidden 
                 border border-white/10 hover:border-themeAccent-500/50
                 transition-all duration-500 ease-out flex flex-col h-full
                 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]"
    >
      {/* HUD Scanner Animation on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-30">
        <div className="absolute inset-x-0 h-px bg-themeAccent-400/30 blur-[2px] animate-[scan-hud_2s_linear_infinite]" />
      </div>

      <div className="relative h-40 overflow-hidden">
        {food.image ? (
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover transition-all duration-1000 brightness-[0.7] group-hover:brightness-90 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#05050a]">
            <Zap size={32} className="text-white/10" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent opacity-90" />
        
        {/* HUD Match Badge */}
        {score && (
          <div className="absolute top-4 right-4 z-40">
            <div className="premium-glass-hud border-themeAccent-500/40 px-3 py-1.5 rounded-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-themeAccent-400 animate-pulse" />
              <span className="text-hud text-themeAccent-400 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                Match {score}%
              </span>
            </div>
          </div>
        )}

        {/* Tactical Diet Indicator */}
        <div className="absolute bottom-4 left-4 z-40">
            <div className={`px-2 py-0.5 rounded-sm border text-[9px] font-black uppercase tracking-widest ${isVeg ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                {isVeg ? 'VEG' : 'NON-VEG'}
            </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow relative z-10">
        <div className="mb-1">
          <h3 className="text-white font-black text-base tracking-tight group-hover:text-themeAccent-400 transition-colors line-clamp-1 uppercase text-hud">
            {food.name}
          </h3>
        </div>

        <div className="flex items-center gap-3 mb-2 border-b border-white/5 pb-2">
             <div className="flex items-center gap-1 text-yellow-500 font-bold text-[10px] text-hud">
                <Star size={10} className="fill-current" />
                {rating}
             </div>
             <div className="w-px h-2.5 bg-white/10" />
             <div className="text-white/40 text-[9px] font-black uppercase tracking-wider text-hud">
                {food.category || 'Specialty'}
             </div>
        </div>

        <p className="text-gray-400 text-xs font-medium line-clamp-2 mb-6 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
          {food.description || `Tactical precision in every bite. Prepared by ${food.restaurant?.name || 'Central Command'}.`}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] text-themeAccent-500/60 font-black uppercase tracking-[0.2em] text-hud">Credit cost</span>
            <span className="font-black text-xl text-white tracking-tight text-hud">₹{food.price}</span>
          </div>
          <button
            onClick={() => { trackAddToCart(userId, food); onAdd(food); }}
            className="px-6 py-2.5 bg-themeAccent-600/10 hover:bg-themeAccent-500 text-themeAccent-400 hover:text-black font-black rounded-sm text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border border-themeAccent-500/30 active:scale-95 text-hud"
          >
            Initiate
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
    className={`px-5 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all duration-300 border text-hud
      ${active
        ? 'bg-themeAccent-500/20 border-themeAccent-500 text-themeAccent-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
        : 'bg-white/5 border-white/10 text-gray-500 hover:border-themeAccent-500/40 hover:text-white'
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
      setFoods(prev => {
        const combined = reset ? newFoods : [...prev, ...newFoods];
        const uniqueMap = new Map();
        combined.forEach(item => {
          const id = item.id || item._id;
          if (id && !uniqueMap.has(id)) {
            uniqueMap.set(id, item);
          }
        });
        return Array.from(uniqueMap.values());
      });
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
      <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        <StarField />
        <div className="relative z-10 bg-[#0a0a14]/60 backdrop-blur-3xl p-12 rounded-2xl border border-white/10 max-w-md w-full">
          <div className="bg-themeAccent-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-themeAccent-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <ShieldCheck size={40} className="text-themeAccent-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter text-hud">Authentication Required</h2>
          <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed">
            AI-driven results are locked to authorized personnel. Please initiate login sequence to view your personalized food recommendations.
          </p>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-themeAccent-500 w-1/3 animate-[stars-scroll_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02040a] pb-32 relative overflow-hidden">
      <style>{SPACE_CSS}</style>
      
      {/* Visual Backdrop */}
      <StarField />

      {/* Scanning Light Effect */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="absolute inset-x-0 h-1 bg-themeAccent-500/10 shadow-[0_0_20px_rgba(34,211,238,0.2)] opacity-0 animate-[scan_15s_linear_infinite]" />
      </div>

      <div className="relative z-20">
      {/* Page Header - Thinned Down */}
      <div className="px-4 md:px-8 pt-8 pb-3 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="relative group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-themeAccent-500 animate-pulse" />
              <span className="text-themeAccent-500 font-black tracking-[0.3em] text-[10px] uppercase text-hud opacity-80">
                Strategic Intelligence Linked
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase text-hud">
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
                className="bg-white/5 border border-white/10 text-gray-300 text-[11px] font-bold rounded-lg px-2 py-1 outline-none focus:border-themeAccent-500 transition-colors"
              >
                <option value="match" className="bg-[#050510]">Best Match</option>
                <option value="rating" className="bg-[#050510]">Rating</option>
                <option value="price_lo" className="bg-[#050510]">Price: Low-High</option>
                <option value="price_hi" className="bg-[#050510]">Price: High-Low</option>
              </select>
            </div>
            
            <div className="w-full md:w-auto flex gap-2 overflow-x-auto hide-scrollbar pt-2 md:pt-0">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                <button
                  key={type}
                  onClick={() => setMealFilter(p => p === type ? 'all' : type)}
                  className={`px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border text-hud ${mealFilter === type ? 'bg-themeAccent-500/20 border-themeAccent-500 text-themeAccent-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-white/5 border-white/5 text-gray-500'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Explainer - Thinned */}
        {explanation && (
          <div className="mt-8 relative group max-w-4xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-themeAccent-500/20 to-transparent blur-md opacity-50" />
            <div className="relative premium-glass-hud border-themeAccent-500/20 p-5 rounded-sm flex items-center gap-4 overflow-hidden">
               <div className="w-1 h-12 bg-themeAccent-500/40" />
              <p className="text-gray-300 text-xs md:text-sm font-bold leading-relaxed tracking-wide text-hud italic">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
          <div className="py-32 text-center relative z-10">
            <div className="bg-themeAccent-500/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                <Bot size={40} className="text-white/20" />
            </div>
            <p className="text-white/40 text-lg font-black uppercase tracking-widest text-hud">System Zero Match</p>
            <p className="text-gray-500 text-sm font-medium mt-2">Adjust tactical filters to recalibrate recommendation stream.</p>
            <button
              onClick={() => { setVegFilter('all'); setMealFilter('all'); }}
              className="mt-8 text-themeAccent-400 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors text-hud"
            >
              Recalibrate Settings
            </button>
          </div>
        )}

        {/* Load More */}
        {!loading && hasMore && (
          <div className="text-center mt-16">
            <button
              onClick={handleLoadMore}
              className="bg-themeAccent-600/10 hover:bg-themeAccent-500 text-themeAccent-400 hover:text-black
                         border border-themeAccent-500/40 hover:border-white
                         px-12 py-4 rounded-sm font-black transition-all duration-500 uppercase tracking-[0.4em] text-[10px] shadow-2xl text-hud"
            >
              Expand Stream Depth
            </button>
          </div>
        )}

        {/* Loading more spinner */}
        {loading && foods.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="w-8 h-8 border-4 border-themeAccent-500/30 border-t-themeAccent-500 rounded-full animate-spin" />
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Recommendations;
