const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require('../utils/supabase');

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function extractPriceMax(text) {
    const m = text.match(/(?:under|below|less than|max|upto|within|at most)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
    return m ? parseInt(m[1]) : null;
}

function extractUserLimit(text) {
    // Match "top 10", "give 5", "show 7" etc. — NOT the price number
    const m = text.match(/(?:^|\s)(?:top|give|show|get|best|find|fetch|list)\s+(\d+)\b/i)
        || text.match(/\b(\d+)\s+(?:best|top|great|good|tasty|popular)\b/i);
    return m ? Math.min(parseInt(m[1]), 20) : null;
}

function extractVeg(text) {
    if (/\bpure\s*veg\b|\bonly\s*veg\b|\bveg\b(?!etable)|\bvegetarian\b/i.test(text) && !/non.?veg/i.test(text)) return true;
    if (/\bnon.?veg\b|\bchicken\b|\bmutton\b|\bfish\b|\bprawn\b|\begg\b|\bmeat\b|\bbeef\b/i.test(text)) return false;
    return null;
}

const FOOD_KEYWORDS = [
    'biryani', 'biriyani', 'burger', 'pizza', 'pasta', 'noodles',
    'dosa', 'idli', 'sandwich', 'roll', 'momos', 'fried rice',
    'manchurian', 'paneer', 'sushi', 'tacos', 'ramen', 'soup',
    'waffles', 'ice cream', 'icecream', 'salad', 'wrap', 'cake',
    'dessert', 'coffee', 'chai', 'tea', 'dal', 'roti', 'paratha',
    'chicken', 'mutton', 'fish', 'prawn', 'kebab', 'tikka', 'curry',
    'samosa', 'chaat', 'bhel', 'pav bhaji', 'vada', 'upma', 'poha',
    'halwa', 'kheer', 'gulab jamun', 'lassi', 'shake', 'smoothie',
    'fries', 'wings', 'steak', 'shawarma', 'falafel', 'hummus',
    'pad thai', 'sushi', 'ramen', 'dim sum', 'spring roll', 'toast',
    'omelette', 'pancake', 'waffle', 'muffin', 'cookie', 'brownie'
];

function extractFoodName(text) {
    const lower = text.toLowerCase();
    // Multi-word food names first
    for (const food of FOOD_KEYWORDS.sort((a, b) => b.length - a.length)) {
        if (lower.includes(food)) {
            // Singularize basic plurals
            return food.replace(/s$/, '') === food ? food : food;
        }
    }
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: LOCAL INTENT DETECTION — fast, no API, keyword based
// ─────────────────────────────────────────────────────────────────────────────
function detectLocalIntent(message) {
    const m = message.toLowerCase().trim();

    const priceMax = extractPriceMax(m);
    const veg = extractVeg(m);
    const foodName = extractFoodName(m);
    const limit = extractUserLimit(m) || 8;

    // Order history
    if (/\b(my order|past order|order history|previous order|show order|reorder|what did i order)\b/i.test(m)) {
        return { intent: 'order_history', filters: { limit } };
    }

    // Restaurant search
    if (/\b(show restaurant|find restaurant|top restaurant|best restaurant|restaurant near|open restaurant)\b/i.test(m)) {
        return { intent: 'restaurant_search', filters: { limit } };
    }

    // If a specific food is mentioned — ALWAYS search_food
    if (foodName) {
        return { intent: 'search_food', filters: { food_name: foodName, price_max: priceMax, veg, limit } };
    }

    // Price capped food search ("food under 200", "items under 150")
    if (priceMax && /\b(food|item|eat|meal|dish|snack|option)\b/i.test(m)) {
        return { intent: 'search_food', filters: { food_name: null, price_max: priceMax, veg, limit } };
    }

    // Veg/non-veg only
    if (veg !== null) {
        return { intent: 'search_food', filters: { food_name: null, price_max: priceMax, veg, limit } };
    }

    // Trending / popular
    if (/\b(trending|popular|hot|bestseller|most ordered|top food|top items|best food)\b/i.test(m)) {
        return { intent: 'trending', filters: { limit } };
    }

    // Deals / offers
    if (/\b(offer|deal|discount|cheap|budget|affordable)\b/i.test(m)) {
        return { intent: 'search_food', filters: { food_name: null, price_max: 200, veg, limit } };
    }

    return null; // needs Gemini
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1b: GEMINI FALLBACK — for queries that can't be locally detected
// ─────────────────────────────────────────────────────────────────────────────
async function detectWithGemini(message, contextString) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { intent: 'general_chat', filters: {} };

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: 'application/json' } });

    const prompt = `
You are the AI brain of a food delivery chatbot. Analyze the user message and return ONLY a raw JSON object.

Intents:
- search_food       → user wants specific food items
- restaurant_search → user wants restaurants
- restaurant_foods  → user wants food from a specific restaurant
- order_history     → user wants past orders
- trending          → user wants popular/trending items (no specific food mentioned)
- recommend_food    → user wants personalized suggestions (no food, price, or filter)
- general_chat      → greetings, app help, food questions, general
- unknown           → completely unrelated

Rules:
- food_name: ONLY if a specific food type is mentioned. Singularize. Comma-separate multiple foods.
- price_max: number if mentioned (e.g., "under 300" → 300)
- veg: true/false/null
- limit: how many results wanted (default 8, max 20)

Context: ${contextString || "None"}
User: "${message}"

Return ONLY:
{
  "intent": "...",
  "food_name": null,
  "price_max": null,
  "veg": null,
  "limit": 8,
  "restaurant_name": null
}`;

    try {
        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
        console.log('[ChatController] Gemini:', parsed);
        return { intent: parsed.intent || 'general_chat', filters: parsed };
    } catch (e) {
        console.error('[ChatController] Gemini error:', e.message);
        return { intent: 'general_chat', filters: {} };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: DIRECT DATABASE QUERY
// ─────────────────────────────────────────────────────────────────────────────
async function queryFoodsFromDB(filters) {
    const { food_name, price_max, veg, limit = 8 } = filters;

    const foodNames = food_name
        ? food_name.split(',').map(f => f.trim()).filter(Boolean)
        : [];

    const cap = Math.min(parseInt(limit) || 8, 20);

    if (foodNames.length === 0) {
        // No specific food — apply broad filters
        let q = supabase.from('foods')
            .select(`
                id, name, price, is_veg, rating, description, image,
                available, category,
                restaurant:restaurant_id(id, name, address, rating, image)
            `)
            .eq('available', true);

        if (typeof price_max === 'number') q = q.lte('price', price_max);
        if (typeof veg === 'boolean') q = q.eq('is_veg', veg);

        const { data, error } = await q.order('rating', { ascending: false, nullsLast: true }).limit(cap);
        if (error) console.error('[QueryFoods] DB error:', error.message);
        return data || [];
    }

    // Fetch each food name separately then merge
    const perName = Math.max(Math.ceil(cap / foodNames.length), 3);
    const results = [];
    const seen = new Set();

    for (const name of foodNames) {
        let q = supabase.from('foods')
            .select(`
                id, name, price, is_veg, rating, description, image,
                available, category,
                restaurant:restaurant_id(id, name, address, rating, image)
            `)
            .eq('available', true)
            .or(`name.ilike.%${name}%,category.ilike.%${name}%`);

        if (typeof price_max === 'number') q = q.lte('price', price_max);
        if (typeof veg === 'boolean') q = q.eq('is_veg', veg);

        const { data, error } = await q.order('rating', { ascending: false, nullsLast: true }).limit(perName);
        if (error) console.error(`[QueryFoods] Error for "${name}":`, error.message);

        for (const f of (data || [])) {
            if (!seen.has(f.id)) { seen.add(f.id); results.push(f); }
        }
    }

    return results.slice(0, cap);
}

async function queryRestaurantsFromDB(filters) {
    const { restaurant_name, limit = 8 } = filters;
    let q = supabase.from('restaurants')
        .select('id, name, address, rating, cuisine_type, image, is_active, foods(id, name, price, is_veg, rating)')
        .eq('is_active', true);

    if (restaurant_name) q = q.ilike('name', `%${restaurant_name}%`);

    const { data } = await q.order('rating', { ascending: false, nullsLast: true }).limit(Math.min(parseInt(limit) || 8, 15));
    return data || [];
}

async function queryOrdersFromDB(userId) {
    if (!userId) return [];
    const { data } = await supabase.from('orders')
        .select('*, items:order_items(*, food:foods(*, restaurant:restaurants(*)))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
    return data || [];
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: FRIENDLY MESSAGE via Gemini
// ─────────────────────────────────────────────────────────────────────────────
async function buildMessage(message, filters, resultCount) {
    if (resultCount === 0) {
        const what = filters.food_name ? `"${filters.food_name}"` : 'that';
        return `I couldn't find anything for ${what}. Try a broader search! 🔍`;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return buildFallbackMessage(filters, resultCount);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(
            `Food delivery chatbot. User asked: "${message}". Found ${resultCount} results. 
Write ONE warm, natural, concise sentence (max 12 words) introducing the results. No markdown, no emoji overload.`
        );
        return result.response.text().trim();
    } catch {
        return buildFallbackMessage(filters, resultCount);
    }
}

function buildFallbackMessage(filters, resultCount) {
    if (!resultCount) return "No results found. Try a different search! 🔍";
    if (filters.food_name) return `Found ${resultCount} great ${filters.food_name} options for you! 😋`;
    if (filters.price_max) return `Here are ${resultCount} options under ₹${filters.price_max}! 🎉`;
    if (filters.veg === true) return `Here are ${resultCount} veg options for you! 🥦`;
    if (filters.veg === false) return `Here are ${resultCount} non-veg options for you! 🍗`;
    return `Here are ${resultCount} top picks right now! 🔥`;
}

async function generateConversationalReply(message) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return "I'm your food delivery assistant! Ask me for food, restaurants, or orders.";

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(
            `You are a professional food delivery assistant. User said: "${message}".
Respond in 1-2 natural sentences. If food related, answer helpfully. If unrelated, politely redirect to ordering food.`
        );
        return result.response.text().trim();
    } catch {
        return "I'm here to help you find great food! What are you craving today? 🍴";
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────
exports.processChatRequest = async (req, res) => {
    try {
        const { message, userId, history = [] } = req.body;
        if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });

        const contextString = history.slice(-4)
            .map(m => `${m.sender === 'user' ? 'User' : 'Bot'}: ${m.content || m.message}`)
            .join('\n');

        // STEP 1: Detect intent — local first, Gemini fallback
        let intent, filters;
        const local = detectLocalIntent(message);
        if (local) {
            intent = local.intent;
            filters = local.filters;
            console.log(`[ChatController] Local intent: ${intent}`, filters);
        } else {
            const gemini = await detectWithGemini(message, contextString);
            intent = gemini.intent;
            filters = gemini.filters || {};
            console.log(`[ChatController] Gemini intent: ${intent}`, filters);
        }

        // Save user message
        if (userId) supabase.from('chat_history').insert({ user_id: userId, role: 'user', content: message, created_at: new Date().toISOString() }).then(() => {});

        // STEP 2: Execute the correct tool
        let type = 'text', data = [], replyMessage = '';

        switch (intent) {
            case 'search_food':
            case 'trending': {
                data = await queryFoodsFromDB(filters);
                replyMessage = await buildMessage(message, filters, data.length);
                type = 'search_food';
                break;
            }

            case 'recommend_food': {
                // For recommendations — fetch top-rated foods from DB (no recommendation engine)
                data = await queryFoodsFromDB({ ...filters, food_name: null, limit: filters.limit || 8 });
                replyMessage = data.length > 0
                    ? `Here are some top picks we think you'll love! ✨`
                    : "No recommendations found right now. Try searching something specific!";
                type = 'search_food';
                break;
            }

            case 'restaurant_search':
            case 'restaurant_foods': {
                data = await queryRestaurantsFromDB(filters);
                replyMessage = data.length > 0
                    ? `Found ${data.length} restaurants for you! 🏪`
                    : "No restaurants found. Try a broader search!";
                type = 'search_restaurant';
                break;
            }

            case 'order_history': {
                data = await queryOrdersFromDB(userId);
                replyMessage = data.length > 0
                    ? `Here are your recent ${data.length} orders! 📦`
                    : "I couldn't find any recent orders for your account.";
                type = 'get_orders';
                break;
            }

            default: {
                replyMessage = await generateConversationalReply(message);
                type = 'text';
                break;
            }
        }

        // Save bot reply
        if (userId) supabase.from('chat_history').insert({ user_id: userId, role: 'assistant', content: replyMessage, created_at: new Date().toISOString() }).then(() => {});

        return res.json({
            type,
            message: replyMessage,
            ...(data.length > 0 ? { data } : {})
        });

    } catch (error) {
        console.error('[ChatController] Error:', error.stack || error.message);
        return res.status(500).json({ type: 'text', message: "Something went wrong. Please try again! 🙏" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/chat/history
// ─────────────────────────────────────────────────────────────────────────────
exports.getChatHistory = async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.json([]);
    try {
        const { data } = await supabase.from('chat_history')
            .select('*').eq('user_id', userId)
            .order('created_at', { ascending: true }).limit(200);
        return res.json(data || []);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
