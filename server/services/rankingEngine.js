/**
 * rankingEngine.js
 * Core scoring formula for food recommendation ranking.
 * Fully deterministic pure functions — no DB calls here.
 *
 * Score = cuisineMatch(0.30) + orderSimilarity(0.25) + rating(0.15)
 *       + popularity(0.10) + distanceScore(0.10) + priceMatch(0.10)
 */

/**
 * Haversine distance between two lat/lng points in km.
 */
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Normalize a value to [0,1] given a known max.
 */
function normalize(value, max) {
  if (!max || max === 0) return 0;
  return Math.min(value / max, 1);
}

/**
 * cuisineMatchScore — how well does this food match the user's cuisine preferences?
 * @param {Object} food     - { cuisine, category }
 * @param {Object} prefs    - user_preferences row
 * @returns {number} 0–1
 */
function cuisineMatchScore(food, prefs) {
  if (!prefs || !prefs.cuisine_scores) return 0;

  const scores = prefs.cuisine_scores;
  const foodCuisine = (food.cuisine || '').toLowerCase();
  const foodCategory = (food.category || '').toLowerCase();

  const maxScore = Math.max(...Object.values(scores), 1);

  let score = 0;
  // Exact cuisine match
  const cuisineVal = scores[foodCuisine] || scores[food.cuisine] || 0;
  score += cuisineVal;

  // Category match (bonus)
  const categoryScores = prefs.category_scores || {};
  const categoryVal = categoryScores[foodCategory] || categoryScores[food.category] || 0;
  score += categoryVal * 0.5;

  return normalize(score, maxScore * 1.5);
}

/**
 * orderSimilarityScore — was this restaurant previously ordered from?
 * @param {Object} food
 * @param {Object} prefs
 * @returns {number} 0–1
 */
function orderSimilarityScore(food, prefs) {
  if (!prefs || !prefs.top_restaurants) return 0;
  const topRests = prefs.top_restaurants || [];
  const rank = topRests.indexOf(food.restaurant_id);
  if (rank === -1) return 0;
  // Top restaurant -> 1.0, 2nd -> 0.8, etc.
  return Math.max(0, 1 - rank * 0.2);
}

/**
 * ratingScore — normalised food rating (0–5 → 0–1).
 * @param {Object} food
 * @returns {number} 0–1
 */
function ratingScore(food) {
  const r = parseFloat(food.rating) || 0;
  return normalize(r, 5);
}

/**
 * popularityScore — normalised food popularity_score.
 * @param {Object} food
 * @param {number} maxPopularity — max across the candidate set
 * @returns {number} 0–1
 */
function popularityScore(food, maxPopularity) {
  return normalize(parseFloat(food.popularity_score) || 0, maxPopularity || 1);
}

/**
 * distanceScore — closer restaurants score higher (max useful range: 10 km).
 * @param {Object} restaurant - { latitude, longitude }
 * @param {Object|null} userCoords - { lat, lng }
 * @returns {number} 0–1
 */
function distanceScore(restaurant, userCoords) {
  if (!userCoords || !restaurant.latitude || !restaurant.longitude) return 0.5; // neutral
  const distKm = haversineDistanceKm(
    userCoords.lat,
    userCoords.lng,
    parseFloat(restaurant.latitude),
    parseFloat(restaurant.longitude)
  );
  // 0 km → 1.0, 10 km → 0.0 (linear decay)
  return Math.max(0, 1 - distKm / 10);
}

/**
 * priceMatchScore — does the food price fall in the user's preferred range?
 * @param {Object} food  - { price }
 * @param {Object} prefs - { price_min, price_max, avg_order_price }
 * @returns {number} 0–1
 */
function priceMatchScore(food, prefs) {
  if (!prefs) return 0.5;
  const price = parseFloat(food.price) || 0;
  const pMin = prefs.price_min || 0;
  const pMax = prefs.price_max || 9999;
  const avg = prefs.avg_order_price || (pMin + pMax) / 2 || 200;

  if (price >= pMin && price <= pMax) {
    // Inside range: score by proximity to average
    const deviation = Math.abs(price - avg);
    const range = pMax - pMin || 1;
    return 1 - normalize(deviation, range);
  }
  // Outside range: partial score by how far outside
  const excess = price < pMin ? pMin - price : price - pMax;
  return Math.max(0, 0.5 - normalize(excess, avg || 200));
}

/**
 * behaviorBonusScore — bonus for previously interacted items.
 * @param {Object} food
 * @param {Object} prefs — now includes food_scores map
 */
function behaviorBonusScore(food, prefs) {
  if (!prefs || !prefs.food_scores) return 0;
  const foodId = food.id || food._id;
  const affinity = prefs.food_scores[foodId] || 0;
  // Cap at 0.1 bonus (10 behavior points)
  return Math.min(affinity * 0.01, 0.1);
}

/**
 * vegMatchBonus — add a bonus if veg preference matches food type.
 * @returns {number} 0 | 0.05
 */
function vegMatchBonus(food, prefs) {
  if (!prefs || prefs.veg_preference === 'any') return 0;
  const isVeg = food.is_veg === true || food.is_veg === 'true';
  if (prefs.veg_preference === 'veg' && isVeg) return 0.05;
  if (prefs.veg_preference === 'non_veg' && !isVeg) return 0.05;
  // Mismatch penalty
  if (prefs.veg_preference === 'veg' && !isVeg) return -0.1;
  return 0;
}

/**
 * mealTypeBonus — time-of-day meal type alignment.
 * @param {Object} food
 * @param {string} currentMealType - 'breakfast'|'lunch'|'dinner'|'snack'
 * @returns {number}
 */
function mealTypeBonus(food, currentMealType) {
  if (!currentMealType || food.meal_type === 'any' || !food.meal_type) return 0;
  return food.meal_type === currentMealType ? 0.1 : -0.05;
}

/**
 * MAIN: rankFoods
 * Score and sort an array of food+restaurant objects.
 *
 * @param {Array} foods     — each item: { ...food fields, restaurant: {...} }
 * @param {Object|null} prefs — user_preferences row (null = cold start)
 * @param {Object} options  — { userCoords: {lat, lng}, mealType: string, limit: number }
 * @returns {Array}         — sorted foods with `_score` and `_scoreBreakdown` attached
 */
function rankFoods(foods, prefs, options = {}) {
  const { userCoords = null, mealType = null, limit = 20 } = options;

  // Pre-compute max popularity for normalization
  const maxPop = Math.max(...foods.map(f => parseFloat(f.popularity_score) || 0), 1);

  const scored = foods.map(food => {
    const restaurant = food.restaurant || food.restaurants || {};

    const w1 = 0.30; // cuisine match
    const w2 = 0.25; // order similarity
    const w3 = 0.15; // rating
    const w4 = 0.10; // popularity
    const w5 = 0.10; // distance
    const w6 = 0.10; // price match

    const s1 = cuisineMatchScore(food, prefs);
    const s2 = orderSimilarityScore(food, prefs);
    const s3 = ratingScore(food);
    const s4 = popularityScore(food, maxPop);
    const s5 = distanceScore(restaurant, userCoords);
    const s6 = priceMatchScore(food, prefs);
    const s7 = behaviorBonusScore(food, prefs);
    const bonus = vegMatchBonus(food, prefs) + mealTypeBonus(food, mealType);

    // Calculate match percentage (0-100)
    // weights sum to 1.0, and individual scores are 0-100.
    // bonuses (s7, bonus) can push it higher, so we cap at 98 for "room to grow"
    const rawMatch = (w1*s1 + w2*s2 + w3*s3 + w4*s4 + w5*s5 + w6*s6);
    const boost = s7 + bonus;
    let percent = Math.min(99, Math.max(30, Math.round(rawMatch + boost)));

    return {
      ...food,
      _score: percent,
      _scoreBreakdown: {
        cuisineMatch: parseFloat((w1 * s1).toFixed(3)),
        orderSimilarity: parseFloat((w2 * s2).toFixed(3)),
        rating: parseFloat((w3 * s3).toFixed(3)),
        popularity: parseFloat((w4 * s4).toFixed(3)),
        distance: parseFloat((w5 * s5).toFixed(3)),
        priceMatch: parseFloat((w6 * s6).toFixed(3)),
        behavior: parseFloat(s7.toFixed(3)),
        bonuses: parseFloat(bonus.toFixed(3)),
      },
    };
  });

  return scored
    .sort((a, b) => b._score - a._score)
    .slice(0, limit);
}

module.exports = { rankFoods, haversineDistanceKm };
