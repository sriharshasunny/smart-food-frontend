const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require('../utils/supabase'); // Assuming this is where your supabase client is

exports.processChatRequest = async (req, res) => {
    try {
        const { message, userId, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Initialize Gemini AI only when needed and check for key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing in environment variables.");
            return res.json({
                type: 'text',
                message: "I'm currently undergoing maintenance (API Key missing). Please tell the developer to check the server logs!",
                sender: 'ai'
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Format conversation history for Gemini context
        const conversationContext = history && history.length > 0
            ? history.map(msg => `${msg.sender === 'user' ? 'User' : 'SmartBot'}: ${msg.content || msg.message || ''}`).join('\n')
            : "No previous conversation.";

        // 1. Construct the Prompt (The "Brain")
        const prompt = `
            You are "SmartBot", a highly professional, polite, and extremely interactive AI assistant for Smart Food Delivery (like Gemini 3.1).
            You are proactive, empathetic, and you ask clarifying questions to understand the user's exact preferences before blindly searching.

            SYSTEM INFORMATION (Your Knowledge Base):
            - **Name:** Smart Food Delivery
            - **Service:** We deliver delicious food from top local restaurants to students and locals.
            - **Hours:** We operate 24/7.
            - **Delivery Time:** Usually 30-45 minutes.
            - **Refund Policy:** No refunds once food is prepared. Contact support for issues.
            - **Contact:** Email support@smartfood.com.
            - **Location:** Based in your local campus area.

            Your job is ONLY to:
            1. Understand the user's message and the ongoing conversation context.
            2. Decide if you need to ask a clarifying question OR if you have enough info to execute a search.
            3. Extract the correct intent.
            4. Extract structured filters.
            5. Return ONLY valid JSON.

            You must NOT:
            - Generate SQL queries.
            - Access any database directly.
            - Add extra text outside JSON.

            Supported intents:
            - search_food (User looking for specific dish/cuisine and HAS provided enough context to search)
            - search_restaurant (User looking for a specific place)
            - get_orders (User wants to see their past/current orders)
            - get_offers (User asking for deals/discounts)
            - trending_items (User asking what's popular)
            - open_now (User specifically asking what is open)
            - general_info (Use this to answer general questions OR to ASK CLARIFYING QUESTIONS if the user's request is too broad, like "I am hungry" or "Suggest food").

            CRITICAL BEHAVIORAL RULE:
            - If a user makes a broad request (e.g., "I'm hungry", "What should I eat?", "Suggest something"), DO NOT trigger search_food immediately. Instead, use the 'general_info' intent to ask an engaging, conversational question to narrow it down (e.g., "I'd love to help! Are you in the mood for something healthy like a salad, or maybe a hearty burger? And do you prefer Veg or Non-Veg?").
            - Build upon the CONVERSATION CONTEXT. If you previously asked if they want Veg or Non-Veg, and they reply "Veg", you must combine that with their previous desire to eat, and NOW trigger 'search_food' with veg=true.

            For search_food intent, extract these possible filters:
            - food_name (string or null): MUST be a generic food type or name (e.g., "burger", "pizza", "biryani", "chicken", "paneer"). Do NOT include adjectives like "spicy", "delicious", "hot" or "best". If the user only says adjectives without a specific food noun, leave this as null.
            - price_max (number or null)
            - price_min (number or null)
            - veg (true/false/null): Set to true ONLY if user explicitly says "veg" or "vegetarian" OR if the context implies it. Set to false ONLY if explicit. Otherwise null.
            - location (string or null)
            - rating_min (number or null)
            - open_now (true/false/null)
            - limit (number or null): The maximum number of items the user requested (e.g., "top 3", "5 items").

            For search_restaurant intent, extract:
            - restaurant_name (string or null)
            - location (string or null)
            - rating_min (number or null)
            - open_now (true/false/null)
            - limit (number or null): The maximum number of items the user requested.
            - item_limit (number or null): The maximum number of food items to show per restaurant.
            
            For get_orders intent, extract:
             - limit (number or null): Number of past orders to retrieve.
             - item_limit (number or null): Limit of items per order.
            
            For general_info intent, return:
             - message (string): The answer to the user's query, OR your engaging clarifying question.

            Rules:
            - Professionalism: Your responses must be warm, perfect grammar, and exceptionally helpful, matching the tone of a premium AI.
            - If a value is not present or cannot be determined reliably, you MUST return null.
            - price_max from "under 200", price_min from "above 100".
            - rating_min from "above 4 rating".
            - open_now true if user says "open now" or "late night".
            - If user asks about "order status" or "where is my food", intent is 'get_orders'.
            - Pay attention to CONVERSATION CONTEXT to understand follow-up questions. If a user previously asked for burgers and now asks for "spicy ones", you should infer they mean spicy burgers and keep the food_name as "burger".

            Return strictly this JSON format EVERY TIME:
            {
              "reply": "A friendly, conversational text response. (REQUIRED for all intents, e.g., 'Sure, here are some tasty veg burgers for you!'. If intent is general_info, you can leave this empty and put your text in 'message'.)",
              "intent": "intent_name",
              "filters": {},
              "message": "Answer string or clarifying question if intent is general_info, else null"
            }

            --- CONVERSATION CONTEXT (History) ---
            ${conversationContext}

            Current User Message: "${message}"
        `;

        // 2. Get AI Response
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 3. Parse JSON safely
        let structuredData;
        try {
            // Remove markdown code blocks if present
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            structuredData = JSON.parse(cleanJson);
        } catch (e) {
            console.error("AI JSON Parse Error:", responseText);
            return res.status(500).json({ error: "Failed to understand query", raw: responseText });
        }

        console.log("AI Intent:", structuredData);

        // 4. Execute Logic based on Intent
        let dbResult = null;
        switch (structuredData.intent) {
            case 'search_food':
                dbResult = await searchFood(structuredData.filters);
                break;
            case 'search_restaurant':
                dbResult = await searchRestaurants(structuredData.filters);
                break;
            case 'get_orders':
                dbResult = await getOrders(userId, structuredData.filters);
                break;
            case 'get_offers':
                dbResult = await getOffers();
                break;
            case 'trending_items':
                dbResult = await getTrendingItems();
                break;
            case 'open_now':
                dbResult = await searchRestaurants({ open_now: true });
                break;
            case 'general_info':
                return res.json({
                    type: 'text',
                    message: structuredData.message || "I'm not sure, please check our FAQ."
                });
            default:
                return res.json({
                    type: 'text',
                    message: "I'm not sure how to help with that yet. Try asking for food, restaurants, or your orders!"
                });
        }

        // 5. Return Result
        res.json({
            type: structuredData.intent,
            data: dbResult,
            message: structuredData.reply || structuredData.message || "Here's what I found!",
            ai_summary: structuredData // Optional: for debugging
        });

    } catch (error) {
        console.error("Chat Controller Error Trace:", error.stack || error);

        // Handle Quota/Rate Limits gracefully
        if (error.message && (error.message.includes('429') || error.message.includes('Quota'))) {
            return res.status(429).json({
                message: "I'm receiving too many requests right now (Daily Quota Exceeded). Please try again later or use a different API Key."
            });
        }

        res.status(500).json({ message: "I'm having trouble thinking right now. Please try again.", debug_error: error.message, debug_stack: error.stack });
    }
};

// --- Helper Functions (Database Logic) ---

async function searchFood(filters) {
    let query = supabase.from('foods').select('*, restaurant:restaurants(*)');

    if (filters.food_name) {
        // Use an OR query to match name, category, or description securely
        query = query.or(`name.ilike.%${filters.food_name}%,category.ilike.%${filters.food_name}%,description.ilike.%${filters.food_name}%`);
    }
    if (filters.price_max) {
        query = query.lte('price', filters.price_max);
    }
    if (filters.price_min) {
        query = query.gte('price', filters.price_min);
    }
    if (typeof filters.veg === 'boolean') { // Safer check
        query = query.eq('is_veg', filters.veg);
    }
    if (filters.rating_min) {
        query = query.gte('rating', filters.rating_min);
    }
    // Note: 'location' and 'open_now' might need joins with restaurant table if not denormalized

    // Limit results
    const resultLimit = filters.limit ? Math.min(filters.limit, 20) : 10;
    query = query.limit(resultLimit);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

async function searchRestaurants(filters) {
    let query = supabase.from('restaurants').select('*, foods(*)');

    if (filters.restaurant_name) {
        query = query.ilike('name', `%${filters.restaurant_name}%`);
    }
    if (filters.location) {
        query = query.ilike('address', `%${filters.location}%`); // Simple fuzzy match
    }
    if (filters.rating_min) {
        query = query.gte('rating', filters.rating_min);
    }
    // open_now logic depends on how you store hours. 
    // Assuming simple boolean for now or omitted.

    const resultLimit = filters.limit ? Math.min(filters.limit, 20) : 5;
    query = query.limit(resultLimit);

    const { data, error } = await query;
    if (error) throw error;

    // Sort and limit foods per restaurant
    if (data) {
        data.forEach(rest => {
            if (rest.foods && Array.isArray(rest.foods)) {
                rest.foods = rest.foods.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, filters.item_limit || 3);
            }
        });
    }

    return data;
}

async function getOrders(userId, filters) {
    if (!userId) return { message: "Please log in to see your orders." };

    let query = supabase
        .from('orders')
        .select('*, items:order_items(*, food:foods(*, restaurant:restaurants(*)))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(filters.limit || 5);

    const { data, error } = await query;

    // Process item_limit if requested
    if (data && filters.item_limit) {
        data.forEach(order => {
            if (order.items && order.items.length > filters.item_limit) {
                order.items = order.items.slice(0, filters.item_limit);
            }
        });
    }
    if (error) throw error;
    return data;
}

async function getOffers() {
    // Assuming 'discount_price' exists or 'original_price' > 'price'
    // Or you have an 'is_offer' flag. 
    // Let's assume looking for items with a discount field > 0
    // Adjust based on your schema. For now, just random foods.

    const { data, error } = await supabase
        .from('foods')
        .select('*, restaurant:restaurants(*)')
        .limit(5); // Placeholder logic

    if (error) throw error;
    return data;
}

async function getTrendingItems() {
    const { data, error } = await supabase
        .from('foods')
        .select('*, restaurant:restaurants(*)')
        .order('rating', { ascending: false })
        .limit(5);

    if (error) throw error;
    return data;
}
