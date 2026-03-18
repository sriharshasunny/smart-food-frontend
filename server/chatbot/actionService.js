/**
 * Determines and triggers backend actions based on the classified intent and entities.
 */
class ActionService {
    /**
     * Decides what actions to embed in the Chatbot response payload.
     * Some intents may automatically trigger backend operations (like adding to cart).
     * For now, we return actionable buttons for the frontend.
     */
    determineActions(intent, data = []) {
        const actions = [];

        switch (intent) {
            case 'recommend_food':
            case 'search_food':
            case 'filter_food':
                if (data.length > 0) {
                    actions.push({ type: 'ADD_TO_CART', label: 'Add to Cart Quick' });
                    actions.push({ type: 'VIEW_RESTAURANT', label: 'View Restaurants' });
                }
                break;
            case 'add_to_cart':
                // In a true headless setup, we could directly modify DB cart here.
                // But typically frontend handles local cart state for non-logged-in users.
                actions.push({ type: 'CHECKOUT', label: 'Go to Checkout' });
                break;
            case 'track_order':
                actions.push({ type: 'VIEW_ORDERS', label: 'Check My Orders' });
                break;
            case 'order_help':
                actions.push({ type: 'REORDER', label: 'Reorder' });
                actions.push({ type: 'SUPPORT', label: 'Contact Support' });
                break;
            default:
                break;
        }

        // Always provide a fallback general action
        if (actions.length === 0) {
            actions.push({ type: 'SUGGEST_FOOD', label: 'Show me what\'s popular' });
        }

        return actions;
    }
}

module.exports = new ActionService();
