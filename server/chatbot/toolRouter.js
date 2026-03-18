const recommendationEngine = require('../recommendation/recommendationEngine');
const queryService = require('../database/queryService');
const orderService = require('../orders/orderService');

class ToolRouter {
    /**
     * Executes the appropriate tool/service based on Gemini's derived intent
     */
    async route(intent, userId, dataFilters = {}, queryText = "") {
        console.log(`[ToolRouter] Routing intent: ${intent}`);

        switch (intent) {
            case 'recommend_food':
                // Smart fallback limit: if strict filters are requested, cap lower, else go up to 10
                const recs = await recommendationEngine.getRecommendations(userId, dataFilters);
                return { type: 'recommend_food', data: recs };

            case 'filter_food':
            case 'search_food':
                const searchResults = await queryService.searchFood(dataFilters.food_name || dataFilters.foodItem || queryText, dataFilters.limit || 15, dataFilters);
                return { type: 'search_food', data: searchResults };

            case 'restaurant_search':
                // Return restaurant cards UI block
                const rests = await queryService.searchRestaurants(dataFilters, dataFilters.restaurantName || queryText, 15);
                return { type: 'search_restaurant', data: rests };

            case 'restaurant_foods':
                // Return food cards UI block specifically scoped from a restaurant
                const restFoods = await queryService.getFoodsByRestaurant(dataFilters.restaurantName || queryText, 50);
                return { type: 'search_food', data: restFoods }; // Renders the same dynamic food cards

            case 'order_history':
                const orders = await orderService.getUserOrders(userId, 10);
                return { type: 'order_history', data: orders };

            case 'food_question':
            case 'restaurant_question':
            case 'app_help':
            case 'general_chat':
            case 'unknown':
                return { type: 'text', data: null, intentCategory: intent };

            case 'add_to_cart':
            case 'remove_cart':
            case 'track_order':
            case 'help':
                return { type: 'action', actionType: intent, data: null };

            default:
                return { type: 'text', data: null, intentCategory: 'unknown' };
        }
    }
}

module.exports = new ToolRouter();
