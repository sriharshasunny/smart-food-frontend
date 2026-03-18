const contextManager = require('./contextManager');
const intentService = require('./intentService');
const entityExtractor = require('./entityExtractor');
const recommendationConnector = require('./recommendationConnector');
const actionService = require('./actionService');
const responseBuilder = require('./responseBuilder');
const toolRouter = require('./toolRouter');

exports.processChatRequest = async (req, res) => {
    try {
        const { message, userId } = req.body;
        if (!message?.trim()) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        // 1. Context & Memory
        contextManager.saveMessage(userId, 'user', message);
        const historyData = await contextManager.getRecentHistory(userId, 5);
        const contextString = contextManager.buildContextString(historyData);

        // 2. Intent Detection
        const intentResult = await intentService.detectIntent(message, contextString);
        // intentResult could be old string from fast-path or object from Gemini
        const intent = typeof intentResult === 'object' ? intentResult.intent : intentResult;
        console.log(`[ChatController] Detected Intent: ${intent}`);

        // Handle Conversational Intelligence Follow-ups
        if (typeof intentResult === 'object' && intentResult.requires_clarification && intentResult.clarification_question) {
             contextManager.saveMessage(userId, 'assistant', intentResult.clarification_question);
             return res.json(responseBuilder.build(intent, [], intentResult.clarification_question, []));
        }

        // 3. Entity Extraction
        const filters = await entityExtractor.extractFilters(message, contextString);

        // 4. Recommendation Integration / Action Execution via Tool Router
        const routerResponse = await toolRouter.route(intent, userId, filters, message);
        let data = routerResponse.data || [];
        let friendlyMessage = "";

        // 5. Build Actions
        const actions = actionService.determineActions(intent, data);

        // 6. Response Building & Gemini Professional Tone Generation (for top levels)
        if (intent === 'general_chat' || intent === 'food_question') {
            friendlyMessage = "I am your intelligent food delivery assistant! Let me know if you want recommendations, want to search for food, or need help with a past order.";
        } else if (intent === 'order_history') {
            friendlyMessage = data.length > 0 ? "Here are your recent orders." : "I couldn't find any recent orders.";
        } else if (intent === 'recommend_food') {
            friendlyMessage = "Based on your preferences and recent history, here are some great matches available right now.";
        } else if (intent === 'search_food') {
            friendlyMessage = "Here is what I found based on your search.";
        } else if (intent === 'restaurant_info') {
            friendlyMessage = "Here are some top restaurants.";
        }

        const finalResponsePayload = responseBuilder.build(
            routerResponse.type === 'action' ? 'action' : routerResponse.type, 
            data, 
            friendlyMessage, 
            actions, 
            { appliedFilters: Object.keys(filters).length ? filters : undefined }
        );

        contextManager.saveMessage(userId, 'assistant', finalResponsePayload.message);
        return res.json(finalResponsePayload);

    } catch (error) {
        console.error('[ChatController] Unhandled error:', error.stack || error.message);
        return res.status(500).json({ intent: 'error', message: "Something went wrong. Please try again! 🙏" });
    }
};

exports.getChatHistory = async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.json([]);
    try {
        const history = await contextManager.getRecentHistory(userId, 50);
        return res.json(history);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
