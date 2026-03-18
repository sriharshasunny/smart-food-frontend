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
                const searchResults = await queryService.searchFood(dataFilters.foodItem || queryText, 15);
                return { type: 'search_food', data: searchResults };

            case 'order_history':
                const orders = await orderService.getUserOrders(userId, 5);
                return { type: 'order_history', data: orders };

            case 'food_question':
            case 'restaurant_info':
            case 'general_chat':
                return { type: 'text', data: null, intentCategory: intent };

            case 'add_to_cart':
            case 'track_order':
            case 'help':
                return { type: 'action', actionType: intent, data: null };

            default:
                // Default fallback if we cannot determine intent
                return { type: 'text', data: null, intentCategory: 'unknown' };
        }
    }
}

module.exports = new ToolRouter();
