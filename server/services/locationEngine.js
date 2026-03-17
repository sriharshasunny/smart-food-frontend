/**
 * locationEngine.js
 * Fetches restaurants and food items available in a given location/city.
 * Uses the same FK-based join syntax as the existing foodRoutes.js to ensure
 * Supabase PostgREST compatibility.
 */

const supabase = require('../utils/supabase');
const cache = require('../utils/cache');

const LOCATION_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// ─── Shared select string (FK column name 'restaurant_id!inner' — matches existing codebase) ───
const FOOD_SELECT = `
  id,
  name,
  price,
  image,
  description,
  category,
  cuisine,
  is_veg,
  spice_level,
  meal_type,
  rating,
  popularity_score,
  order_count,
  available,
  restaurant_id,
  restaurant_id!inner (
    id,
    name,
    city,
    location,
    latitude,
    longitude,
    rating,
    cuisine_tags,
    price_tier,
    popularity_score,
    is_active
  )
`;

/**
 * Enrich: flatten the restaurant_id join onto a 'restaurant' property.
 * Supabase returns the join data under 'restaurant_id' when using FK-name syntax.
 */
function enrich(foods) {
  return (foods || []).map(f => ({
    ...f,
    restaurant: f.restaurant_id, // re-map to 'restaurant' key for ranking engine
  }));
}

/**
 * getFoodsInCity — returns all available foods from active restaurants in a city.
 * @param {string} city
 * @param {Object} options  — { limit: number }
 * @returns {Array}
 */
async function getFoodsInCity(city, options = {}) {
  if (!city) return getAllActiveFoods(options);

  const normalizedCity = city.trim().toLowerCase();
  const cacheKey = `foods_city:${normalizedCity}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { limit = 300 } = options;

  const { data: foods, error } = await supabase
    .from('foods')
    .select(FOOD_SELECT)
    .eq('available', true)
    .eq('restaurant_id.is_active', true)
    .ilike('restaurant_id.city', `%${normalizedCity}%`)
    .limit(limit);

  if (error) {
    console.error('[LocationEngine] City foods fetch error:', error.message);
    return getAllActiveFoods(options); // fallback
  }

  const enriched = enrich(foods);
  cache.set(cacheKey, enriched, LOCATION_CACHE_TTL);
  return enriched;
}

/**
 * getAllActiveFoods — fallback when no city is given.
 * @param {Object} options
 */
async function getAllActiveFoods(options = {}) {
  const { limit = 200 } = options;
  const cacheKey = 'foods_all_active';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { data: foods, error } = await supabase
    .from('foods')
    .select(FOOD_SELECT)
    .eq('available', true)
    .eq('restaurant_id.is_active', true)
    .order('popularity_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[LocationEngine] All foods fetch error:', error.message);
    // Last resort: fetch without the join filter
    const { data: fallbackFoods } = await supabase
      .from('foods')
      .select('id, name, price, image, description, category, cuisine, is_veg, spice_level, meal_type, rating, popularity_score, available, restaurant_id')
      .eq('available', true)
      .order('rating', { ascending: false })
      .limit(limit);
    return (fallbackFoods || []).map(f => ({ ...f, restaurant: {} }));
  }

  const enriched = enrich(foods);
  cache.set(cacheKey, enriched, LOCATION_CACHE_TTL);
  return enriched;
}

/**
 * getSimilarFoods — foods with same cuisine/category, price within ±40%.
 * @param {string} foodId
 * @returns {Array}
 */
async function getSimilarFoods(foodId) {
  const cacheKey = `similar:${foodId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Get the target food
  const { data: target, error: targetErr } = await supabase
    .from('foods')
    .select('id, cuisine, category, price, is_veg, restaurant_id')
    .eq('id', foodId)
    .single();

  if (targetErr || !target) {
    console.error('[LocationEngine] Target food not found:', targetErr?.message);
    return [];
  }

  const priceMin = target.price * 0.6;
  const priceMax = target.price * 1.4;

  const { data: candidates, error: candErr } = await supabase
    .from('foods')
    .select(`
      id, name, price, image, description, category, cuisine,
      is_veg, spice_level, meal_type, rating, popularity_score, available,
      restaurant_id,
      restaurant_id!inner ( id, name, city, rating, is_active )
    `)
    .neq('id', foodId)
    .eq('available', true)
    .eq('restaurant_id.is_active', true)
    .gte('price', priceMin)
    .lte('price', priceMax)
    .order('rating', { ascending: false })
    .limit(30);

  if (candErr) {
    console.error('[LocationEngine] Similar foods error:', candErr.message);
    return [];
  }

  // Score by similarity
  const scored = (candidates || [])
    .map(f => {
      let sim = 0;
      if (f.cuisine && target.cuisine && f.cuisine.toLowerCase() === target.cuisine.toLowerCase()) sim += 3;
      if (f.category && target.category && f.category.toLowerCase() === target.category.toLowerCase()) sim += 2;
      if (f.is_veg === target.is_veg) sim += 1;
      return { ...f, restaurant: f.restaurant_id, _similarity: sim };
    })
    .filter(f => f._similarity >= 2)
    .sort((a, b) => b._similarity - a._similarity || b.rating - a.rating)
    .slice(0, 12);

  cache.set(cacheKey, scored, 15 * 60 * 1000);
  return scored;
}

module.exports = { getFoodsInCity, getAllActiveFoods, getSimilarFoods };
