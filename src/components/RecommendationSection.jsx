/**
 * RecommendationSection.jsx
 * A full-width horizontal-scroll recommendation strip for the home page.
 * Shows personalized (or cold-start) recommendations with Gemini AI explanation.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { API_URL } from '../config';
import { trackAddToCart, trackView } from '../utils/trackActivity';

// ── Skeleton loader card ────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex-shrink-0 w-44 rounded-2xl overflow-hidden bg-white/5 animate-pulse border border-white/10">
    <div className="h-32 bg-white/10" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
      <div className="h-6 bg-orange-500/20 rounded-lg mt-3" />
    </div>
  </div>
);

// ── Single food card ────────────────────────────────────────────────────────
const RecFoodCard = ({ food, onAdd, userId }) => {
  const navigate = useNavigate();

  const handleView = () => {
    trackView(userId, food);
    navigate(`/restaurants`);
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    trackAddToCart(userId, food);
    onAdd(food);
  };

  const isVeg = food.is_veg === true || food.is_veg === 'true' || food.isVeg;
  const rating = parseFloat(food.rating) || 4.0;
  const price = parseFloat(food.price) || 0;

  return (
    <div
      onClick={handleView}
      className="flex-shrink-0 w-44 rounded-2xl overflow-hidden bg-white/5 border border-white/10
                 hover:border-orange-500/40 hover:bg-white/10 transition-all duration-300 cursor-pointer
                 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 group"
    >
      {/* Image */}
      <div className="relative h-32 overflow-hidden bg-gray-800">
        {food.image ? (
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
        )}
        {/* Veg/Non-veg badge */}
        <span
          className={`absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded font-semibold
            ${isVeg ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}
        >
          {isVeg ? '🟢 Veg' : '🔴 Non-veg'}
        </span>
        {/* Rating badge */}
        {rating >= 4.0 && (
          <span className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs px-1.5 py-0.5 rounded font-semibold">
            ★ {rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-white text-sm font-semibold truncate">{food.name}</p>
        <p className="text-gray-400 text-xs truncate mt-0.5">
          {food.restaurant?.name || food.restaurantName || 'Restaurant'}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-orange-400 text-sm font-bold">₹{price}</span>
          <button
            onClick={handleAdd}
            className="text-xs bg-orange-500 hover:bg-orange-400 text-white px-2 py-1 rounded-lg
                       transition-colors duration-200 font-medium active:scale-95"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────
const RecommendationSection = ({ city = null, title = 'Recommended for You' }) => {
  const { user } = useAuth();
  const { addToCart } = useShop();
  const [recs, setRecs] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [strategy, setStrategy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = user?._id || user?.id;

  const fetchRecommendations = useCallback(async () => {
    if (!userId) { setLoading(false); return; }

    try {
      setLoading(true);
      const cityParam = city ? `&city=${encodeURIComponent(city)}` : '';
      const res = await fetch(`${API_URL}/api/recommendations/${userId}?limit=20${cityParam}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setRecs(data.recommendations || []);
      setExplanation(data.explanation || '');
      setStrategy(data.strategy || '');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId, city]);

  useEffect(() => { fetchRecommendations(); }, [fetchRecommendations]);

  if (!userId) return null; // Not logged in — don't show section
  if (!loading && recs.length === 0) return null; // No recommendations at all

  const strategyLabel = strategy === 'cold_start'
    ? '🔥 Trending Near You'
    : strategy === 'personalized'
    ? '✨ Personalised For You'
    : title;

  return (
    <section className="py-6 px-4 md:px-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl md:text-2xl font-bold text-white">{strategyLabel}</h2>
          {strategy === 'personalized' && (
            <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30
                             px-2 py-0.5 rounded-full font-medium">
              AI-Powered
            </span>
          )}
        </div>
        {explanation && (
          <p className="text-gray-400 text-sm italic max-w-2xl leading-relaxed">
            <span className="text-orange-400">💡</span> {explanation}
          </p>
        )}
      </div>

      {/* Horizontal scroll strip */}
      <div
        className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-white/10
                   scrollbar-track-transparent"
        style={{ scrollbarWidth: 'thin' }}
      >
        {loading
          ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : recs.map(food => (
              <RecFoodCard
                key={food.id}
                food={food}
                userId={userId}
                onAdd={addToCart}
              />
            ))
        }
      </div>

      {error && (
        <p className="text-red-400 text-xs mt-2">{error}</p>
      )}
    </section>
  );
};

export default RecommendationSection;
