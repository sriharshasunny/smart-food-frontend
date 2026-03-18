const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Service to classify user intent.
 */
class IntentService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: { responseMimeType: 'application/json' }
            });
        }
    }

    // Fast-path intent detection without API calls
    detectLocalIntent(message) {
        const m = message.toLowerCase();
        if (/trending|popular|top rated|best rated|what.?s hot/i.test(m)) return 'recommend_food';
        if (/\b(?:cart|add to cart|order this|buy)\b/i.test(m)) return 'add_to_cart';
        if (/\b(?:track|where is my order|order status)\b/i.test(m)) return 'track_order';
        if (/\b(?:my orders|history|past orders)\b/i.test(m)) return 'order_help';
        if (/restaurant.*near|top restaurants|best restaurants/i.test(m)) return 'restaurant_info';
        return null;
    }

    /**
     * Detects intent using Gemini with context awareness.
     * Supported intents: recommend_food, search_food, filter_food, restaurant_info, add_to_cart, order_help, track_order, general_chat
     */
    async detectIntent(message, contextString = "") {
        const local = this.detectLocalIntent(message);
        if (local && !contextString) return local; // Optimistic return if no complex context

        if (!this.model) return local || 'general_chat';

        const prompt = `
You are a classification layer for a food delivery app.
Classify the user's latest message into exactly ONE of these intents:
- recommend_food (asking for trending, popular, or general recommendations)
- search_food (searching for a specific food, e.g., "biryani", "pizza", "show me veg food")
- filter_food (adding filters to a previous search, e.g., "under 200", "make it spicy")
- restaurant_info (asking about restaurants, "open now", "near me")
- add_to_cart (asking to add items to cart / prepare to buy)
- order_help (asking about previous orders, reordering)
- track_order (where is my active order)
- general_chat (greetings, off-topic, general queries like "I am hungry")

Recent Context:
${contextString}

Latest User Message: "${message}"

Respond strictly with JSON format: {"intent": "detected_intent_here"}
`;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(text);
            return parsed.intent || 'general_chat';
        } catch (error) {
            console.error('[IntentService] Gemini error:', error.message);
            return local || 'general_chat';
        }
    }
}

module.exports = new IntentService();
