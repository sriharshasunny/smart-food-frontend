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
        if (/\b(?:my orders|history|past orders)\b/i.test(m)) return 'order_history';
        if (/restaurant.*near|top restaurants|best restaurants/i.test(m)) return 'restaurant_info';
        return null;
    }

    /**
     * Detects intent using Gemini with context awareness.
     * Supported intents: recommend_food, search_food, filter_food, restaurant_info, add_to_cart, order_history, track_order, general_chat, food_question
     */
    async detectIntent(message, contextString = "") {
        if (!this.model) return { intent: this.detectLocalIntent(message) || 'general_chat' };

        const prompt = `
You are a classification layer for a food delivery app.
Classify the user's latest message into exactly ONE of these intents:
- recommend_food (asking for recommendations)
- search_food (searching for a specific food)
- filter_food (adding filters)
- restaurant_info
- add_to_cart
- order_history
- track_order
- food_question
- general_chat

If the user is asking for recommendations or searching for food, but their query is too vague (e.g. "Suggest food"), 
you MUST ask a brief clarifying question (e.g. "Veg or non veg?", "What's your budget?", "Any specific cuisine?").
If it's already specific enough, set requires_clarification to false.

Recent Context:
${contextString}

Latest User Message: "${message}"

Respond strictly with JSON format:
{
  "intent": "detected_intent_here",
  "requires_clarification": boolean,
  "clarification_question": "Short question here if needed, else null"
}
`;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(text);
            return parsed; // Returns { intent, requires_clarification, clarification_question }
        } catch (error) {
            console.error('[IntentService] Gemini error:', error.message);
            return { intent: this.detectLocalIntent(message) || 'general_chat' };
        }
    }
}

module.exports = new IntentService();
