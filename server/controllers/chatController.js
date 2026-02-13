const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require('../utils/supabase'); // Assuming this is where your supabase client is

exports.processChatRequest = async (req, res) => {
    try {
        const { message, userId } = req.body;

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
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // 1. Construct the Prompt (The "Brain")
        const prompt = `
            You are an AI assistant for a student food delivery platform.
            Your job is ONLY to:
            1. Understand the user's message.
            2. Extract the correct intent.
            3. Extract structured filters.
            4. Return ONLY valid JSON.

            You must NOT:
            - Generate SQL queries.
            - Access any database.
            - Modify data.
            - Explain anything.
            - Add extra text outside JSON.

            Supported intents:
            - search_food
            - search_restaurant
            - get_orders
            - get_offers
            - trending_items
            - open_now

            For search_food intent, extract these possible filters:
            - food_name (string or null)
            - price_max (number or null)
            - price_min (number or null)
            - veg (true/false/null)
            - location (string or null)
            - rating_min (number or null)
            - open_now (true/false/null)

            For search_restaurant intent, extract:
            - restaurant_name (string or null)
            - location (string or null)
            - rating_min (number or null)
            - open_now (true/false/null)
            
            For get_orders intent, extract:
             - limit (number, default 5)

            Rules:
            - If a value is not present, return null.
            - price_max should be extracted from phrases like "under 200", "below 300".
            - price_min should be extracted from phrases like "above 100", "more than 150".
            - veg should be true if user says "veg", false if "non-veg".
            - rating_min from phrases like "above 4 rating".
            - open_now true if user says "open now" or "late night".

            Return strictly this JSON format:
            {
              "intent": "",
              "filters": {}
            }

            User Message: "${message}"
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
            ai_summary: structuredData // Optional: for debugging
        });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// --- Helper Functions (Database Logic) ---

async function searchFood(filters) {
    let query = supabase.from('foods').select('*, restaurant:restaurants(*)');

    if (filters.food_name) {
        query = query.ilike('name', `%${filters.food_name}%`);
    }
    if (filters.price_max) {
        query = query.lte('price', filters.price_max);
    }
    if (filters.price_min) {
        query = query.gte('price', filters.price_min);
    }
    if (filters.veg !== null) {
        query = query.eq('is_veg', filters.veg);
    }
    if (filters.rating_min) {
        query = query.gte('rating', filters.rating_min);
    }
    // Note: 'location' and 'open_now' might need joins with restaurant table if not denormalized

    // Limit results
    query = query.limit(10);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

async function searchRestaurants(filters) {
    let query = supabase.from('restaurants').select('*');

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

    query = query.limit(5);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

async function getOrders(userId, filters) {
    if (!userId) return { message: "Please log in to see your orders." };

    let query = supabase
        .from('orders')
        .select('*, items:order_items(*, food:foods(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(filters.limit || 5);

    const { data, error } = await query;
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
