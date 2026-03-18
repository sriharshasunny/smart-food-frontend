/**
 * recommendationEngine.js
 * Master orchestrator — coordinates all sub-engines to produce a
 * ranked, explained recommendation list for a given user.
 *
 * Strategies:
 *   - 'personalized'  : user has preferences → hybrid ranking
 *   - 'cold_start'    : no history → trending + high-rated fallback
 *   - 'trending'      : explicit trending request
 *   - 'location'      : location-overridden personalized
 */

const { getUserPreferences }  = require('./preferenceEngine');
const { rankFoods }           = require('./rankingEngine');
const { getFoodsInCity }      = require('./locationEngine');
const { getTrendingFoods, getColdStartFoods, getCurrentMealType } = require('./trendingEngine');
const { generateExplanation } = require('./geminiExplainer');
const cache                   = require('../utils/cache');

const REC_CACHE_TTL = 5 * 60 * 1000; // 5 minutes per-user cache

/**
 * getRecommendations — main entry point.
 *
 * @param {string} userId
 * @param {Object} options
 *   - city          {string}  override location
 *   - userCoords    { lat, lng }
 *   - limit         {number}  max results (default 20)
 *   - page          {number}  pagination offset page (default 1)
 *   - forceStrategy {string}  force 'cold_start'|'trending'
 * @returns {Object} { recommendations, explanation, strategy, meta }
 */
async function getRecommendations(userId, options = {}) {
  const {
    city = null,
    userCoords = null,
    limit = 20,
    page = 1,
    forceStrategy = null,
  } = options;

  const cacheKey = `rec:${userId}:${city || 'any'}:${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const mealType = getCurrentMealType();
  let strategy = forceStrategy || 'personalized';
  let explanation = '';
  let recommendations = [];

  // 1. Load user preferences
  const prefs = forceStrategy ? null : await getUserPreferences(userId);
  const hasSufficientHistory = prefs && prefs.total_interactions >= 3;

  if (!hasSufficientHistory || strategy === 'cold_start') {
    strategy = 'cold_start';
  }

  if (strategy === 'personalized') {
    // ── Personalised path ──────────────────────────────────────────
    const candidateFoods = await getFoodsInCity(city, { limit: 300 });

    if (candidateFoods.length === 0) {
      // No local foods — fallback to cold start
      strategy = 'cold_start';
    } else {
      // Apply veg filter early if strict preference
      let filtered = candidateFoods;
      if (prefs.veg_preference === 'veg') {
        filtered = candidateFoods.filter(f => f.is_veg === true);
        if (filtered.length < 10) filtered = candidateFoods; // relax if too few
      } else if (prefs.veg_preference === 'non_veg') {
        filtered = candidateFoods.filter(f => f.is_veg === false);
        if (filtered.length < 10) filtered = candidateFoods;
      }

      const ranked = rankFoods(filtered, prefs, {
        userCoords,
        mealType,
        limit: limit * 3, // rank generously, paginate after
      });

      const offset = (page - 1) * limit;
      recommendations = ranked.slice(offset, offset + limit);
    }
  }

  // Cold start or trending fallback
  if (strategy === 'cold_start' || recommendations.length < 5) {
    const trending = await getTrendingFoods(city, limit, page);
    const cold = await getColdStartFoods(city, limit, page);

    // Merge: dedupe by id, trending first
    const seen = new Set();
    const merged = [];
    for (const f of [...trending, ...cold]) {
      if (!seen.has(f.id)) { seen.add(f.id); merged.push(f); }
      if (merged.length >= limit) break;
    }
    recommendations = merged;
    strategy = 'cold_start';
  }

  // 2. Generate Gemini explanation (async, non-blocking)
  explanation = await generateExplanation(
    hasSufficientHistory ? prefs : null,
    recommendations,
    strategy
  );

  const result = {
    recommendations,
    explanation,
    strategy,
    mealType,
    meta: {
      userId,
      city: city || 'all',
      page,
      count: recommendations.length,
      hasPreferences: hasSufficientHistory,
    },
  };

  // Cache result (don't cache cold_start for long — 2 min)
  const ttl = strategy === 'cold_start' ? 2 * 60 * 1000 : REC_CACHE_TTL;
  cache.set(cacheKey, result, ttl);

  return result;
}

/**
 * getLocationRecommendations — location-overridden entry point.
 * Convenience wrapper that passes city explicitly.
 */
async function getLocationRecommendations(userId, city, options = {}) {
  return getRecommendations(userId, { ...options, city });
}

/**
 * getUFOMessage — Generates a short quirky message for the UFO assistant.
 */
async function getUFOMessage(userId) {
  const cacheKey = `ufo:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // 1. Get history and current recommendations to provide context
  const prefs = await getUserPreferences(userId);
  const { recommendations, strategy } = await getRecommendations(userId, { limit: 10 });

  // 2. Generate quirky message
  const { generateUFOMessage } = require('./geminiExplainer');
  const message = await generateUFOMessage(prefs, recommendations);

  // Cache for 2 hours (quippy messages don't need to change constantly)
  cache.set(cacheKey, { message, strategy }, 2 * 60 * 60 * 1000);

  return { message, strategy };
}

module.exports = { getRecommendations, getLocationRecommendations, getUFOMessage };
