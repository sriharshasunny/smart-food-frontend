const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Extracts structured entities from user messages to formulate DB query filters.
 */
class EntityExtractor {
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

    /**
     * @param {string} message - Current user message
     * @param {string} contextString - Past interaction context
     * @returns {Object} Extracted filters
     */
    async extractFilters(message, contextString = "") {
        if (!this.model) return {};

        const prompt = `
Extract structured data from the user's latest query as JSON.
Data to extract:
- food_name (string: e.g., 'chicken', 'biryani', 'pizza', default null)
- cuisine (string: e.g., 'indian', 'chinese', default null)
- price_max (number: e.g., 'under 300' -> 300, default null)
- veg (boolean: true if explicitly asking for vegetarian, false if non-veg/meat/chicken, default null)
- spice_level (string: 'low', 'medium', 'high', default null)
- location (string: e.g., 'current' if near me, default null)
- rating (number: e.g., 'top rated', 'rating > 4' -> 4, default null)
- time (string: 'breakfast', 'lunch', 'dinner', default null)
- limit (number: default 6, if user asks for top 10 -> 10)

Past Context:
${contextString}

Latest Query: "${message}"

Output ONLY a JSON configuration combining the context and the latest query.
Example Output:
{
  "food_name": "chicken",
  "price_max": 300,
  "spice_level": "high",
  "location": "current"
}
`;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/g, '').trim();
            const filters = JSON.parse(text);
            
            // Cleanup null values so they don't override previous filters during merge
            Object.keys(filters).forEach(key => {
                if (filters[key] === null) delete filters[key];
            });
            return filters;
        } catch (error) {
            console.error('[EntityExtractor] Gemini error:', error.message);
            return {};
        }
    }
}

module.exports = new EntityExtractor();
