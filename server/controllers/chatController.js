const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require('../utils/supabase');

exports.processChatRequest = async (req, res) => {
    try {
        const { message, userId, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing in environment variables.");
            return res.json({
                type: 'text',
                message: "API Key missing. Please tell the developer!",
                sender: 'ai'
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }); // Using flash for speed and context

        const conversationContext = history && history.length > 0
            ? history.map(msg => `${msg.sender === 'user' ? 'User' : 'SmartBot'}: ${msg.content || msg.message || ''}`).join('\n')
            : "No previous conversation.";

        // --- PASS 1: INTENT & FILTER EXTRACTION ---
        const pass1Prompt = `
            You are the "Intent Analyzer" for Smart Food Delivery.
            Extract the correct intent and JSON filters from the user's message based on conversation context.

            Supported intents:
            - search_food (User looking for specific dish/cuisine)
            - search_restaurant (User looking for a specific place)
            - get_orders (User wants to see their past orders, reorder, or check order history)
            - get_offers (User asking for deals)
            - trending_items (User asking what's popular)
            - open_now (User specifically asking what is open)
            - general_info (Answering general questions, asking for clarification when "I am hungry" or vague).

            If intent is 'search_food', possible filters: food_name (string), price_max (num), price_min (num), veg (boolean), limit (num).
            If intent is 'search_restaurant', possible filters: restaurant_name (string), location (string).

            Return ONLY valid JSON:
            {
              "intent": "intent_name",
              "filters": {},
              "clarification_question": "If intent is general_info, write the conversation response here. Else null."
            }

            Context:
            ${conversationContext}

            Current User Message: "${message}"
        `;

        const pass1Result = await model.generateContent(pass1Prompt);
        const pass1Text = pass1Result.response.text();

        let structuredData;
        try {
            structuredData = JSON.parse(pass1Text.replace(/```json/g, '').replace(/```/g, '').trim());
        } catch (e) {
            console.error("Pass 1 JSON Parse Error:", pass1Text);
            return res.status(500).json({ error: "Failed to understand query" });
        }

        console.log("Pass 1 Intent:", structuredData);

        // --- DATABASE EXECUTION ---
        let dbResult = { available: [], unavailable: [], similar: [] };
        const filters = structuredData.filters || {};
        const intent = structuredData.intent;

        if (intent === 'search_food') {
            dbResult = await advancedSearchFood(filters);
        } else if (intent === 'search_restaurant') {
            dbResult.available = await searchRestaurants(filters);
        } else if (intent === 'get_orders') {
            dbResult = await advancedGetOrders(userId, filters);
        } else if (intent === 'get_offers') {
            dbResult.available = await getOffers();
        } else if (intent === 'trending_items') {
            dbResult.available = await getTrendingItems();
        } else if (intent === 'open_now') {
            dbResult.available = await searchRestaurants({ open_now: true });
        } else if (intent === 'general_info') {
            return res.json({
                type: 'text',
                message: structuredData.clarification_question || "I'm here to help with your food needs!"
            });
        }

        // Handle cases where intent requires items but nothing was found at all
        if (intent !== 'general_info' && dbResult.available.length === 0 && dbResult.unavailable.length === 0 && dbResult.similar.length === 0) {
            if (intent === 'get_orders') {
                // Might actually have no past orders
                dbResult.empty_reason = "No past orders found in the database.";
            } else {
                dbResult.empty_reason = "No items matched the criteria.";
            }
        }

        // --- PASS 2: DYNAMIC GENERATION ---
        // We tell the AI what the DB actually found, so it can write a highly personalized message.
        const dbSummary = {
            intent: intent,
            found_available_items: dbResult.available.map(i => i.name || (i.foods ? i.name + ' (Restaurant)' : 'Order Item')),
            found_unavailable_items: dbResult.unavailable.map(i => i.name || 'Unknown'),
            found_similar_items: dbResult.similar.map(i => i.name || 'Unknown'),
            empty_reason: dbResult.empty_reason
        };

        const pass2Prompt = `
            You are "SmartBot", the highly intelligent, extremely supportive, empathetic, and human-like AI assistant for Smart Food Delivery.
            You have access to the user's conversation history and the physical database results retrieved for their latest query.

            User's original query: "${message}"

            What the database actually found based on that query: 
            ${JSON.stringify(dbSummary, null, 2)}

            YOUR TASK:
            Write a natural, conversational response back to the user (as "SmartBot"). 

            CRITICAL RULES:
            1. If the user asked for Past Orders ('get_orders'), and some items in their past orders are UNAVAILABLE (found_unavailable_items), you MUST explicitly say: "I checked your past orders, but it looks like the [Item Name] is currently out of stock." Then, warmly suggest the SIMILAR available items ("However, I found some similar items you might love...").
            2. If unavailable items exist for 'search_food', mention they are out of stock and offer the available alternatives.
            3. Do NOT list out all the items in text like a catalog. The cards will be displayed visually beneath your message. Just provide the conversational intro/bridge! 
            4. Keep it concise, incredibly supportive, friendly, and "ChatGPT-like". 

            Only return the raw conversational text string. No JSON, no markdown formatting.
        `;

        const pass2Result = await model.generateContent(pass2Prompt);
        const finalMessage = pass2Result.response.text().trim();

        console.log("Pass 2 Response:", finalMessage);

        // --- FINAL RESPONSE ASSEMBLY ---
        // Combine the available past order items and the similar items to be shown in the UI cards
        let finalDataToDisplay = [];

        if (intent === 'get_orders') {
            // For get_orders, if they just want orders, returning orders array.
            // If we had unavailable items and fetched similar foods, we should probably output intent as 'search_food' so the frontend shows food cards for the similar items, 
            // OR send the raw original orders (if we still want to render the order card) AND a list of similar items.
            // Given the frontend expecting array of items for 'search_food', returning 'search_food' intent if we are suggesting similar items makes sense, 
            // but let's stick to the intent they asked, but pass the data suitably.

            // If we had to find similar items because of out-of-stock, let's change type to 'search_food' so the UI renders clickable food cards for suggested items.
            if (dbResult.unavailable.length > 0 && dbResult.similar.length > 0) {
                finalDataToDisplay = [...dbResult.available, ...dbResult.similar];
                // Override intent so frontend renders food cards instead of past order blobs
                structuredData.intent = 'search_food';
            } else {
                finalDataToDisplay = dbResult.original_orders || dbResult.available;
            }
        } else {
            finalDataToDisplay = [...dbResult.available, ...dbResult.similar];
        }

        res.json({
            type: structuredData.intent,
            data: finalDataToDisplay,
            message: finalMessage
        });

    } catch (error) {
        console.error("Chat Controller Error Trace:", error.stack || error);
        res.status(500).json({ message: "I encountered a slight technical hiccup. Could you please try again?" });
    }
};

// --- Advanced Database Logic ---

async function advancedSearchFood(filters) {
    let query = supabase.from('foods').select('*, restaurant:restaurants(*)');

    if (filters.food_name) {
        // Handle potential comma-separated lists from AI safely to prevent Supabase OR syntax errors
        const words = filters.food_name.split(',').map(w => w.trim()).filter(Boolean);
        const orConditions = [];
        words.forEach(word => {
            const safeWord = word.replace(/[^a-zA-Z0-9 ]/g, '').trim();
            if (safeWord) {
                // If the value has spaces, Supabase might still complain unless quoted, but % matches around it
                orConditions.push(`name.ilike.%${safeWord}%,category.ilike.%${safeWord}%,description.ilike.%${safeWord}%`);
            }
        });
        if (orConditions.length > 0) {
            query = query.or(orConditions.join(','));
        }
    }
    if (filters.price_max) query = query.lte('price', filters.price_max);
    if (filters.price_min) query = query.gte('price', filters.price_min);
    if (typeof filters.veg === 'boolean') query = query.eq('is_veg', filters.veg);
    if (filters.rating_min) query = query.gte('rating', filters.rating_min);

    const resultLimit = filters.limit ? Math.min(filters.limit, 20) : 10;
    query = query.limit(resultLimit);

    const { data, error } = await query;
    if (error) throw error;

    // Split into available and unavailable
    const available = [];
    const unavailable = [];

    (data || []).forEach(item => {
        // Handle boolean is_available 
        if (item.is_available === true || item.is_available === null || typeof item.is_available === 'undefined') {
            available.push(item);
        } else {
            unavailable.push(item);
        }
    });

    return { available, unavailable, similar: [] };
}

async function advancedGetOrders(userId, filters) {
    if (!userId) return { available: [], unavailable: [], similar: [], empty_reason: "User not logged in." };

    // Fetch the recent orders and their items with joined food data
    let query = supabase
        .from('orders')
        .select('*, items:order_items(*, food:foods(*, restaurant:restaurants(*)))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(filters.limit || 5);

    const { data: orders, error } = await query;
    if (error) throw error;

    if (!orders || orders.length === 0) {
        return { available: [], unavailable: [], similar: [], original_orders: [] };
    }

    const availableFoods = [];
    const unavailableFoods = [];
    const categoriesToSearch = new Set();
    const restaurantsToSearch = new Set();

    // Analyze order items for availability
    orders.forEach(order => {
        (order.items || []).forEach(orderItem => {
            const food = orderItem.food;
            if (food) {
                if (food.is_available === false) {
                    // Keep track of unique unavailable items to prevent spamming
                    if (!unavailableFoods.find(f => f.id === food.id)) {
                        unavailableFoods.push(food);
                        if (food.category) categoriesToSearch.add(food.category);
                        if (food.restaurant && food.restaurant.id) restaurantsToSearch.add(food.restaurant.id);
                    }
                } else {
                    if (!availableFoods.find(f => f.id === food.id)) {
                        availableFoods.push(food);
                    }
                }
            }
        });
    });

    let similarItems = [];
    // If we have unavailable items, fetch similar alternatives!
    if (unavailableFoods.length > 0) {
        let similarQuery = supabase.from('foods').select('*, restaurant:restaurants(*)').eq('is_available', true);

        const orConditions = [];
        if (categoriesToSearch.size > 0) {
            const catArray = Array.from(categoriesToSearch);
            orConditions.push(`category.in.(${catArray.join(',')})`);
        }
        if (restaurantsToSearch.size > 0) {
            const restArray = Array.from(restaurantsToSearch);
            orConditions.push(`restaurant_id.in.(${restArray.join(',')})`);
        }

        if (orConditions.length > 0) {
            similarQuery = similarQuery.or(orConditions.join(','));
        }

        // Only get a few top rated alternatives
        similarQuery = similarQuery.order('rating', { ascending: false }).limit(6);
        const { data: similarData } = await similarQuery;

        if (similarData) {
            // Exclude items already in availableFoods
            const availableSet = new Set(availableFoods.map(f => f.id));
            similarItems = similarData.filter(item => !availableSet.has(item.id));
        }
    }

    return {
        available: availableFoods,
        unavailable: unavailableFoods,
        similar: similarItems,
        original_orders: orders // Keep original orders if we just want to display them normally
    };
}

async function searchRestaurants(filters) {
    let query = supabase.from('restaurants').select('*, foods(*)');

    if (filters.restaurant_name) query = query.ilike('name', `%${filters.restaurant_name}%`);
    if (filters.location) query = query.ilike('address', `%${filters.location}%`);
    if (filters.rating_min) query = query.gte('rating', filters.rating_min);

    const resultLimit = filters.limit ? Math.min(filters.limit, 20) : 5;
    query = query.limit(resultLimit);

    const { data, error } = await query;
    if (error) throw error;

    if (data) {
        data.forEach(rest => {
            if (rest.foods && Array.isArray(rest.foods)) {
                // Return ONLY available foods for restaurants
                rest.foods = rest.foods
                    .filter(f => f.is_available !== false)
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, filters.item_limit || 3);
            }
        });
    }

    return data;
}

async function getOffers() {
    const { data, error } = await supabase.from('foods').select('*, restaurant:restaurants(*)').eq('is_available', true).limit(5);
    if (error) throw error;
    return data;
}

async function getTrendingItems() {
    const { data, error } = await supabase.from('foods').select('*, restaurant:restaurants(*)').eq('is_available', true).order('rating', { ascending: false }).limit(5);
    if (error) throw error;
    return data;
}
