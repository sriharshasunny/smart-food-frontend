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
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // 1. Construct the Prompt (The "Brain")
        // 1. Construct the Prompt (The "Brain")
        const prompt = `
            You are "SmartBot", the official AI assistant for Smart Food Delivery.
            
            SYSTEM INFORMATION (Your Knowledge Base):
            - **Name:** Smart Food Delivery
            - **Service:** We deliver food from top local restaurants to students and locals.
            - **Hours:** We operate 24/7.
            - **Delivery Time:** Usually 30-45 minutes.
            - **Refund Policy:** No refunds once food is prepared. Contact support for issues.
            - **Contact:** Email support@smartfood.com.
            - **Location:** Based in your local campus area.

            Your job is ONLY to:
            1. Understand the user's message.
            2. Extract the correct intent.
            3. Extract structured filters.
            4. Return ONLY valid JSON.

            You must NOT:
            - Generate SQL queries.
            - Access any database directly.
            - Modify data.
            - Add extra text outside JSON.

            Supported intents:
            - search_food (User looking for specific dish/cuisine)
            - search_restaurant (User looking for a place)
            - get_orders (User wants to see their past/current orders)
            - get_offers (User asking for deals/discounts)
            - trending_items (User asking what's popular)
            - open_now (User specifically asking what is open)
            - general_info (User asks general questions like "who are you", "delivery time", "how to order")

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
            
            For general_info intent, return:
             - message (string): The answer to the user's question based on the SYSTEM INFORMATION above.

            Rules:
            - If a value is not present, return null.
            - price_max should be extracted from phrases like "under 200", "below 300".
            - price_min should be extracted from phrases like "above 100", "more than 150".
            - veg should be true if user says "veg", false if "non-veg".
            - rating_min from phrases like "above 4 rating".
            - open_now true if user says "open now" or "late night".
            - If user asks about "order status" or "where is my food", intent is 'get_orders'.

            Return strictly this JSON format:
            {
              "intent": "intent_name",
              "filters": {},
              "message": "Answer string if intent is general_info, else null"
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
            ai_summary: structuredData // Optional: for debugging
        });

    } catch (error) {
        console.error("Chat Controller Error:", error);

        // Handle Quota/Rate Limits gracefully
        if (error.message.includes('429') || error.message.includes('Quota')) {
            return res.status(429).json({
                message: "I'm receiving too many requests right now (Daily Quota Exceeded). Please try again later or use a different API Key."
            });
        }

        res.status(500).json({ message: "I'm having trouble thinking right now. Please try again." });
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
