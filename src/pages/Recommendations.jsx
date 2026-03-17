/**
 * Recommendations.jsx — Full production recommendations page
 * Shows personalized food picks with: AI explanation, filters (Veg/NonVeg, meal type),
 * strategy badge, pagination, and similar food discovery.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { API_URL } from '../config';
import { trackAddToCart, trackView } from '../utils/trackActivity';

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
  const rating = parseFloat(food.rating) || 4.0;
  const score = food._score ? `${(food._score * 100).toFixed(0)}%` : null;

  return (
    <div
      className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden
                 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-500/10
                 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-800">
        {food.image ? (
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={e => { e.target.onerror = null; e.target.src = ''; e.target.style.display='none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-800">🍽️</div>
        )}

        {/* Badges overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span
          className={`absolute top-3 left-3 text-[11px] px-2 py-0.5 rounded-md font-bold
            ${isVeg ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
        >
          {isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
        </span>

        {/* Match score badge */}
        {score && (
          <span className="absolute top-3 right-3 bg-orange-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            {score} match
          </span>
        )}

        {/* Rating */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          <span className="text-yellow-400 text-xs font-bold">★ {rating.toFixed(1)}</span>
          {food.meal_type && food.meal_type !== 'any' && (
            <span className="text-gray-300 text-[10px] bg-black/50 px-1.5 py-0.5 rounded capitalize">
              {food.meal_type}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-white font-semibold truncate text-base">{food.name}</p>
        <p className="text-gray-400 text-sm truncate mt-0.5">
          {food.restaurant?.name || food.restaurantName || 'Restaurant'}
        </p>
        {food.cuisine && (
          <span className="inline-block mt-1 text-[11px] text-orange-400 bg-orange-500/10
                           border border-orange-500/20 px-2 py-0.5 rounded-full capitalize">
            {food.cuisine}
          </span>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-orange-400 text-lg font-bold">₹{food.price}</span>
          <button
            onClick={() => { trackAddToCart(userId, food); onAdd(food); }}
            className="bg-orange-500 hover:bg-orange-400 active:scale-95 text-white text-sm
                       font-semibold px-4 py-1.5 rounded-xl transition-all duration-200"
          >
            + Add
          </button>
        </div>

        {/* Score breakdown tooltip on hover */}
        {food._scoreBreakdown && (
          <div className="mt-2 pt-2 border-t border-white/5 hidden group-hover:block">
            <p className="text-[10px] text-gray-500 font-mono">
              🍽️ {(food._scoreBreakdown.cuisineMatch * 100).toFixed(0)}%
              ・⭐ {(food._scoreBreakdown.rating * 100).toFixed(0)}%
              ・📍 {(food._scoreBreakdown.distance * 100).toFixed(0)}%
              ・💰 {(food._scoreBreakdown.priceMatch * 100).toFixed(0)}%
            </p>
          </div>
        )}
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
    <div className="min-h-screen bg-[#020205] pb-16">
      {/* Page Header */}
      <div className="px-4 md:px-8 pt-8 pb-4">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{strategyLabel}</h1>
          {strategy === 'personalized' && (
            <span className="text-sm bg-orange-500/20 border border-orange-500/30 text-orange-400
                             px-3 py-1 rounded-full font-medium">
              AI-Powered
            </span>
          )}
          {mealType && mealIcon[mealType] && (
            <span className="text-sm bg-white/5 border border-white/10 text-gray-300
                             px-3 py-1 rounded-full">
              {mealIcon[mealType]} {mealType.charAt(0).toUpperCase() + mealType.slice(1)} picks
            </span>
          )}
        </div>

        {explanation && (
          <p className="text-gray-400 text-sm italic max-w-2xl leading-relaxed">
            <span className="text-orange-400 not-italic font-semibold">💡 </span>
            {explanation}
          </p>
        )}
      </div>

      {/* Filter Bar */}
      <div className="px-4 md:px-8 mb-6">
        <div className="flex flex-wrap gap-2">
          <FilterChip label="All" active={vegFilter === 'all'} onClick={() => setVegFilter('all')} />
          <FilterChip label="🟢 Veg" active={vegFilter === 'veg'} onClick={() => setVegFilter('veg')} />
          <FilterChip label="🔴 Non-Veg" active={vegFilter === 'non_veg'} onClick={() => setVegFilter('non_veg')} />
          <div className="w-px bg-white/10 mx-1 self-stretch" />
          <FilterChip label="🌅 Breakfast" active={mealFilter === 'breakfast'} onClick={() => setMealFilter(p => p === 'breakfast' ? 'all' : 'breakfast')} />
          <FilterChip label="☀️ Lunch"     active={mealFilter === 'lunch'}     onClick={() => setMealFilter(p => p === 'lunch' ? 'all' : 'lunch')} />
          <FilterChip label="🌙 Dinner"    active={mealFilter === 'dinner'}    onClick={() => setMealFilter(p => p === 'dinner' ? 'all' : 'dinner')} />
          <FilterChip label="🍿 Snack"     active={mealFilter === 'snack'}     onClick={() => setMealFilter(p => p === 'snack' ? 'all' : 'snack')} />
        </div>
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
  );
};

export default Recommendations;
