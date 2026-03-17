/**
 * trackActivity.js
 * Fire-and-forget client-side activity tracker.
 * Sends user behaviour events to /api/recommendations/track.
 * Never blocks the UI — all calls are non-awaited.
 */

import { API_URL } from '../config';

/**
 * Valid action types.
 * @type {('view'|'click'|'cart'|'order'|'wishlist'|'rate')[]}
 */
const VALID_ACTIONS = ['view', 'click', 'cart', 'order', 'wishlist', 'rate'];

/**
 * trackEvent — send a user activity event to the backend.
 *
 * @param {string} userId         — user._id from AuthContext
 * @param {string} action         — one of VALID_ACTIONS
 * @param {string|null} foodId    — the food item ID
 * @param {string|null} restaurantId — the restaurant ID
 * @param {Object} metadata       — { price, cuisine, category, spice_level, is_veg, meal_type }
 */
export function trackEvent(userId, action, foodId = null, restaurantId = null, metadata = {}) {
  if (!userId || !VALID_ACTIONS.includes(action)) return;

  // Fire and forget — no await
  fetch(`${API_URL}/api/recommendations/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, action, foodId, restaurantId, metadata }),
  }).catch(() => {
    // Silently fail — tracking should never break the UI
  });
}

/**
 * Convenience helpers
 */
export const trackView      = (userId, food) => trackEvent(userId, 'view',     food?.id, food?.restaurantId, buildMeta(food));
export const trackClick     = (userId, food) => trackEvent(userId, 'click',    food?.id, food?.restaurantId, buildMeta(food));
export const trackAddToCart = (userId, food) => trackEvent(userId, 'cart',     food?.id, food?.restaurantId, buildMeta(food));
export const trackOrder     = (userId, food) => trackEvent(userId, 'order',    food?.id, food?.restaurantId, buildMeta(food));
export const trackWishlist  = (userId, food) => trackEvent(userId, 'wishlist', food?.id, food?.restaurantId, buildMeta(food));

/** Build metadata payload from a food object (from either API shape). */
function buildMeta(food) {
  if (!food) return {};
  return {
    price:       food.price,
    cuisine:     food.cuisine,
    category:    food.category,
    spice_level: food.spiceLevel ?? food.spice_level,
    is_veg:      food.isVeg ?? food.is_veg,
    meal_type:   food.mealType ?? food.meal_type,
  };
}
