/**
 * trendingEngine.js
 * Detects trending foods from recent activity and handles cold-start scenarios.
 */

const supabase = require('../utils/supabase');
const cache = require('../utils/cache');

const TRENDING_WINDOW_HOURS = 48; // last 48 hours for trending
const TRENDING_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * getTrendingFoodIds — aggregate activity counts to find trending food IDs.
 * @param {string|null} city
 * @param {number} limit
 * @returns {string[]} food IDs ordered by trend score
 */
async function getTrendingFoodIds(city = null, limit = 50) {
  const cacheKey = `trending_ids:${city || 'global'}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const since = new Date(Date.now() - TRENDING_WINDOW_HOURS * 60 * 60 * 1000).toISOString();

  // Action weights for trending score
  const actionWeights = { order: 10, cart: 5, wishlist: 3, click: 2, view: 1 };

  const { data: activities, error } = await supabase
    .from('user_activity')
    .select('food_id, action_type, created_at')
    .gte('created_at', since)
    .not('food_id', 'is', null)
    .limit(5000);

  if (error) {
    console.error('[TrendingEngine] Activity fetch error:', error.message);
    return [];
  }

  // Aggregate weighted scores per food_id
  const scores = {};
  for (const act of activities || []) {
    if (!act.food_id) continue;
    const w = actionWeights[act.action_type] || 1;
    scores[act.food_id] = (scores[act.food_id] || 0) + w;
  }

  const topIds = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  cache.set(cacheKey, topIds, TRENDING_CACHE_TTL);
  return topIds;
}

/**
 * getTrendingFoods — return full food objects for trending items in a city.
 * @param {string|null} city
 * @param {number} limit
 * @returns {Array}
 */
async function getTrendingFoods(city = null, limit = 20, page = 1) {
  const cacheKey = `trending_foods:${city || 'global'}:${limit}:${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const trendingIds = await getTrendingFoodIds(city, 100);

  let query = supabase
    .from('foods')
    .select(`
      id, name, price, image, description, category, cuisine,
      is_veg, spice_level, meal_type, rating, popularity_score,
      available, restaurant_id,
      restaurants!inner ( id, name, city, rating, is_active, price_tier )
    `)
    .eq('available', true)
    .eq('restaurants.is_active', true)
    .order('popularity_score', { ascending: false })
    .limit(limit * 3); // over-fetch then filter

  if (city) {
    query = query.ilike('restaurants.city', `%${city.toLowerCase()}%`);
  }

  if (trendingIds.length > 0) {
    query = query.in('id', trendingIds.slice(0, 100));
  }

  const { data: foods, error } = await query;
  if (error) {
    console.error('[TrendingEngine] Trending foods fetch error:', error.message);
    return await getColdStartFoods(city, limit); // fallback
  }

  // Sort by trend score, falling back to rating+popularity
  const scoredFoods = (foods || []).map(f => {
    const trendRank = trendingIds.indexOf(f.id);
    const trendScore = trendRank === -1 ? 0 : 1 - trendRank / trendingIds.length;
    return {
      ...f,
      restaurant: f.restaurants,
      _trendScore: trendScore,
      _score: trendScore * 0.6 + (parseFloat(f.rating) / 5) * 0.4,
    };
  });

    const offset = (page - 1) * limit;
    const result = scoredFoods
      .sort((a, b) => b._score - a._score)
      .slice(offset, offset + limit);

  cache.set(cacheKey, result, TRENDING_CACHE_TTL);
  return result;
}

/**
 * getColdStartFoods — highly-rated, popular foods for new users (no history).
 * Blends highest rating + highest popularity_score.
 * @param {string|null} city
 * @param {number} limit
 * @returns {Array}
 */
async function getColdStartFoods(city = null, limit = 20, page = 1) {
  const cacheKey = `cold_start:${city || 'global'}:${limit}:${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('foods')
    .select(`
      id, name, price, image, description, category, cuisine,
      is_veg, spice_level, meal_type, rating, popularity_score,
      available, restaurant_id,
      restaurants!inner ( id, name, city, rating, is_active, price_tier )
    `)
    .eq('available', true)
    .eq('restaurants.is_active', true)
    .gte('rating', 4.0)
    .order('rating', { ascending: false })
    .limit(limit * 2);

  if (city) {
    query = query.ilike('restaurants.city', `%${city.toLowerCase()}%`);
  }

  const { data: foods, error } = await query;
  if (error) {
    console.error('[TrendingEngine] Cold start fetch error:', error.message);
    return [];
  }

  // Blend rating + popularity
  const maxPop = Math.max(...(foods || []).map(f => parseFloat(f.popularity_score) || 0), 1);
    const offset = (page - 1) * limit;
    const result = (foods || [])
      .map(f => ({
        ...f,
        restaurant: f.restaurants,
        _score: (parseFloat(f.rating) / 5) * 0.6 + (parseFloat(f.popularity_score) / maxPop) * 0.4,
      }))
      .sort((a, b) => b._score - a._score)
      .slice(offset, offset + limit);

  cache.set(cacheKey, result, TRENDING_CACHE_TTL);
  return result;
}

/**
 * getCurrentMealType — determine meal type based on current time.
 * @param {Date} [now]
 * @returns {'breakfast'|'lunch'|'dinner'|'snack'}
 */
function getCurrentMealType(now = new Date()) {
  const hour = now.getHours();
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 19 && hour < 23) return 'dinner';
  return 'snack';
}

module.exports = { getTrendingFoods, getColdStartFoods, getCurrentMealType, getTrendingFoodIds };
