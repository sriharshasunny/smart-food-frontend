/**
 * SimilarFoods.jsx
 * Shows similar food suggestions when a user is viewing a food item.
 * Renders as a compact horizontal strip with similarity reasoning.
 */

import React, { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { trackClick } from '../utils/trackActivity';

const SimilarFoods = ({ foodId, foodName }) => {
  const { user } = useAuth();
  const { addToCart } = useShop();
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!foodId) return;

    const fetchSimilar = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/recommendations/similar/${foodId}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setSimilar(data.recommendations || []);
      } catch {
        setSimilar([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [foodId]);

  if (!loading && similar.length === 0) return null;

  return (
    <section className="mt-6 pt-6 border-t border-white/10">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-white">
          🍜 Similar to <span className="text-orange-400">{foodName}</span>
        </h3>
        <p className="text-gray-400 text-xs mt-0.5">
          Same cuisine · Similar price · Highly rated
        </p>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-40 h-40 rounded-xl bg-white/5 animate-pulse border border-white/10"
              />
            ))
          : similar.map(food => {
              const isVeg = food.is_veg === true || food.is_veg === 'true';
              return (
                <div
                  key={food.id}
                  onClick={() => trackClick(userId, food)}
                  className="flex-shrink-0 w-40 rounded-xl overflow-hidden bg-white/5
                             border border-white/10 hover:border-orange-500/40 hover:bg-white/10
                             transition-all cursor-pointer group"
                >
                  {/* Image */}
                  <div className="relative h-24 bg-gray-800 overflow-hidden">
                    {food.image ? (
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                    )}
                    <span
                      className={`absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded font-bold
                        ${isVeg ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                    >
                      {isVeg ? 'V' : 'NV'}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-white text-xs font-semibold truncate">{food.name}</p>
                    <p className="text-gray-500 text-[10px] truncate">
                      {food.restaurant?.name || 'Restaurant'}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-orange-400 text-xs font-bold">₹{food.price}</span>
                      <button
                        onClick={e => { e.stopPropagation(); addToCart(food); }}
                        className="text-[10px] bg-orange-500 hover:bg-orange-400 text-white px-2 py-0.5
                                   rounded-md transition-colors font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
        }
      </div>
    </section>
  );
};

export default SimilarFoods;
