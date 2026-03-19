const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require('../utils/supabase');

// ── Retry helper ─────────────────────────────────────────────────────────────
async function generateWithRetry(model, prompt, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await model.generateContent(prompt);
        } catch (err) {
            const msg = err?.message || '';
            const is503 = err?.status === 503 || msg.includes('503');
            const is429 = err?.status === 429 || msg.includes('429') || msg.includes('Too Many Requests');
            const retryMatch = msg.match(/retry in (\d+(?:\.\d+)?)s/);
            if ((is503 || is429) && attempt < maxRetries) {
                const delay = retryMatch ? Math.min(parseFloat(retryMatch[1]) * 1000, 8000) : attempt * 1500;
                console.warn(`[Chat] Gemini ${err?.status} attempt ${attempt}, retry in ${delay}ms`);
                await new Promise(r => setTimeout(r, delay));
            } else throw err;
        }
    }
}

// ── Extract price limit from text ("under 200", "below 300", "less than 150") ──
function extractPriceMax(text) {
    const m = text.match(/(?:under|below|less than|max|upto|within|at most)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
    return m ? parseInt(m[1]) : null;
}

// ── Extract numeric limit from text ("top 10", "5 best", "show 12") ──
function extractLimit(text) {
    const m = text.match(/\b(?:top|best|show|get|around|first)?\s*(\d{1,2})\b/i);
    return m ? parseInt(m[1]) : null;
}

// ── Broader food keyword list ─────────────────────────────────────────────────
const { rankFoods } = require('../services/rankingEngine');
const { getUserPreferences } = require('../services/preferenceEngine');

// ── LOCAL KEYWORD FAST-PATH (Instant) ─────────────────────
function detectIntentLocally(message) {
    const m = message.toLowerCase();
    
    // Food keywords for instant search
    const foodKeywords = [
        'biryani', 'pizza', 'burger', 'chicken', 'rice', 'noodles', 'mandi', 'kabab',
        'kebab', 'shawarma', 'sandwich', 'pasta', 'sushi', 'roll', 'veg', 'non-veg',
        'paneer', 'thali', 'dosa', 'idli', 'breakfast', 'lunch', 'dinner', 'snack'
    ];

    for (const kw of foodKeywords) {
        if (m.includes(kw)) {
            return {
                intent: 'search_food',
                filters: {
                    food_name: kw,
                    price_max: extractPriceMax(message),
                    limit: extractLimit(message) || 12
                }
            };
        }
    }

    // Non-food strictly utility intents
    if (/my order|past order|order history|previous order|reorder|what did i order|show order/i.test(m))
        return { intent: 'get_orders', filters: {} };
    if (/open now|open today|open at night|what.?s open/i.test(m))
        return { intent: 'open_now', filters: {} };
    if (/\boffer|deal|discount|coupon|promo|sale\b/i.test(m))
        return { intent: 'get_offers', filters: {} };

    return null; // Go to Gemini for complex queries
}

// ── Friendly message for each intent (no Gemini needed) ─────────────────────
function getFastMessage(intent, filters, resultCount) {
    if (resultCount === 0) {
        return "Hmm, I couldn't find anything matching that right now. Try a different search! 🔍";
    }
    if (intent === 'trending_items') return `Here's what's trending right now 🔥 — ${resultCount} hot picks for you!`;
    if (intent === 'get_offers') return `Found ${resultCount} great deals for you! 🏷️ Grab them before they're gone.`;
    if (intent === 'get_orders') return `Here are your recent orders 📦. Want to reorder something?`;
    if (intent === 'open_now') return `These restaurants are open right now! 🏪`;
    if (intent === 'search_food') {
        const name = filters?.food_name ? `**${filters.food_name}**` : 'top-rated food';
        const vegLabel = filters?.veg === true ? 'veg' : filters?.veg === false ? 'non-veg' : '';
        const priceLabel = filters?.price_max ? ` under ₹${filters.price_max}` : '';
        
        return `Found ${resultCount} ${vegLabel} ${name} options${priceLabel} 🍽️ — hope you find something tasty!`;
    }
    return `Here are ${resultCount} results for your request! 👋`;
}

// ── Save to Supabase (best-effort) ───────────────────────────────────────────
async function saveChatHistory(userId, role, content) {
    if (!userId) return;
    try {
        await supabase.from('chat_history').insert({
            user_id: userId, role, content,
            created_at: new Date().toISOString()
        });
    } catch (_) { }
}

// ── GET /api/chat/history ────────────────────────────────────────────────────
exports.getChatHistory = async (req, res) => {
    const { userId, date } = req.query;
    if (!userId) return res.json([]);
    try {
        let query = supabase.from('chat_history').select('*').eq('user_id', userId).order('created_at', { ascending: true });
        if (date) {
            query = query.gte('created_at', `${date}T00:00:00.000Z`).lte('created_at', `${date}T23:59:59.999Z`);
        } else {
            query = query.limit(200);
        }
        const { data, error } = await query;
        if (error) throw error;
        return res.json(data || []);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// ── POST /api/chat ───────────────────────────────────────────────────────────
exports.processChatRequest = async (req, res) => {
    try {
        const { message, userId, history = [] } = req.body;
        if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });

        saveChatHistory(userId, 'user', message); // non-blocking

        // ── Step 1: Try local detection first (instant) ───────────────────
        let localIntent = detectIntentLocally(message);
        let intent, filters;

        if (localIntent) {
            // Fast path: no Gemini call needed for intent
            intent = localIntent.intent;
            filters = localIntent.filters;
            console.log('[Chat] Fast-path intent:', intent, filters);
        } else {
            // ── Step 2: Use Gemini for personalized intent + response ──
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) return res.json({ type: 'text', message: 'AI service unavailable. Please contact support.' });

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: { responseMimeType: 'application/json' }
            });

            // Gemini context (no personalization needed now)
            const tasteVector = "Manual search (No recommendation influence)";

            const ctx = history.length > 0
                ? history.slice(-4).map(m => `${m.sender === 'user' ? 'User' : 'Bot'}: ${m.content || m.message}`).join('\n')
                : '';

            const combinedPrompt = `
You are an AI query understanding engine for a professional food delivery platform.
Your only job is to convert the user message into structured query JSON for database search.

Return ONLY JSON. No text explanation. No markdown. No comments. STRICT JSON ONLY.

DATABASE STRUCTURE:
foods { id, name, category, price, rating, restaurant, location, is_veg, is_available, popularity }
restaurants { id, name, location, rating, delivery_time }

SUPPORTED INTENTS:
food_search, mixed_food_search, recommendation, restaurant_search, price_filter, rating_filter, location_filter, category_filter, availability_check, sort_query, combo_search, comparison, greeting, unknown

SUPPORTED FILTERS:
foods (array), category (veg|nonveg|dessert|drinks), price_max (num), price_min (num), rating_min (num), location, restaurant, sort_by (rating|price_low|price_high|popularity|distance), availability (available|out_of_stock), delivery_time_max (num), quantity (num)

RULES:
- best/top -> sort_by: rating
- cheap/budget -> sort_by: price_low
- veg -> category: veg
- non veg -> category: nonveg
- Spelling: biryni->biryani, piza->pizza, frid rice->fried rice. 
- "I am hungry" -> intent: recommendation
- Assume user continues previous query if incomplete.

OUTPUT FORMAT:
{
"intent":"",
"foods":[],
"category":null,
"price_max":null,
"price_min":null,
"rating_min":null,
"restaurant":null,
"location":null,
"sort_by":null,
"availability":null,
"delivery_time_max":null,
"quantity":null
}

User Query: ${ctx ? `(Context: ${ctx})\n` : ''}"${message}"`.trim();

            try {
                const result = await generateWithRetry(model, combinedPrompt);
                const raw = result.response.text().replace(/```json|```/g, '').trim();
                const parsed = JSON.parse(raw);
                
                // Map the new structured JSON to internal filters
                intent = parsed.intent;
                filters = {
                    food_name: (parsed.foods && parsed.foods.length > 0) ? parsed.foods.join(', ') : null,
                    price_max: parseInt(parsed.price_max) || null,
                    price_min: parseInt(parsed.price_min) || null,
                    rating_min: parseFloat(parsed.rating_min) || null,
                    location: parsed.location,
                    restaurant: parsed.restaurant,
                    sort_by: parsed.sort_by,
                    veg: parsed.category === 'veg' ? true : parsed.category === 'nonveg' ? false : null,
                    limit: 8 // STRICT LIMIT 8
                };

                if (intent === 'greeting') {
                    const reply = "Hey! 👋 I'm **SmartBot** — your AI food guide. What are you craving today?";
                    saveChatHistory(userId, 'assistant', reply);
                    return res.json({ type: 'text', message: reply });
                }

                // Map specific intents to DB intents
                if (['food_search', 'mixed_food_search', 'recommendation', 'price_filter', 'rating_filter', 'category_filter', 'sort_query', 'combo_search', 'comparison'].includes(intent)) {
                    intent = 'search_food';
                } else if (intent === 'restaurant_search') {
                    intent = 'search_restaurant';
                } else if (intent === 'availability_check') {
                    intent = 'open_now';
                }
            } catch (aiErr) {
                console.error('[Chat] Gemini error:', aiErr.message);
                intent = 'trending_items';
                filters = { limit: 6 };
            }
        }

        // ── Step 3: Database query + Ranking ────────────────────────
        let dbResult = { available: [], unavailable: [], similar: [] };
        if (intent === 'search_food') dbResult = await advancedSearchFood(filters);
        else if (intent === 'search_restaurant') dbResult.available = await searchRestaurants(filters);
        else if (intent === 'get_orders') dbResult = await advancedGetOrders(userId, filters);
        else if (intent === 'get_offers') dbResult.available = await getOffers(filters);
        else if (intent === 'trending_items') dbResult.available = await getTrendingItems(filters);
        else if (intent === 'open_now') dbResult.available = await searchRestaurants({ ...filters, open_now: true });

        // ── Step 4: Display Data Directly ──
        let finalData = [...dbResult.available, ...dbResult.similar];
        // Hard-enforce the limit again just in case helper returned more
        finalData = finalData.slice(0, filters.limit || 8);

        const finalMessage = getFastMessage(intent, filters, finalData.length);

        saveChatHistory(userId, 'assistant', finalMessage);
        return res.json({ type: intent, data: finalData, message: finalMessage });

    } catch (error) {
        console.error('[Chat] Unhandled error:', error.stack || error.message);
        return res.status(500).json({ type: 'text', message: "Something went wrong. Please try again! 🙏" });
    }
};

// ── Database helpers ──────────────────────────────────────────────────────────

async function advancedSearchFood(filters) {
    // !inner join ensures we only get foods where a restaurant exists and matches our inner filter
    let query = supabase.from('foods').select('*, restaurant:restaurants!inner(*)');

    // Filter by restaurant activity first
    query = query.eq('restaurant.is_active', true);

    if (filters.food_name) {
        const words = filters.food_name.split(',').map(w => w.replace(/[^a-zA-Z0-9 ]/g, '').trim()).filter(Boolean);
        const orConditions = words.flatMap(w => [
            `name.ilike.%${w}%`, `category.ilike.%${w}%`, `description.ilike.%${w}%`
        ]);
        if (orConditions.length) query = query.or(orConditions.join(','));
    }

    if (filters.price_max) query = query.lte('price', filters.price_max);
    if (filters.price_min) query = query.gte('price', filters.price_min);
    if (typeof filters.veg === 'boolean') query = query.eq('is_veg', filters.veg);

    // Strictly show ONLY available items
    query = query.eq('available', true);

    // Handle explicit sort from AI
    if (filters.sort_by === 'rating') {
        query = query.order('rating', { ascending: false });
    } else if (filters.sort_by === 'price') {
        query = query.order('price', { ascending: true });
    } else {
        // Default: sort by rating to get high-quality candidates
        query = query.order('rating', { ascending: false });
    }

    // Fetch only exactly what's needed
    let { data, error } = await query.limit(filters.limit || 12);
    if (error && error.message?.includes('rating')) {
        // rating column not yet added; fall back
        ({ data, error } = await supabase.from('foods').select('*, restaurant:restaurants!inner(*)')
            .eq('restaurant.is_active', true).eq('available', true).order('created_at', { ascending: false }).limit(50));
    }
    if (error) throw error;

    if (error) throw error;

    // Return only available items
    return { available: data || [], unavailable: [], similar: [] };
}

async function advancedGetOrders(userId, filters) {
    if (!userId) return { available: [], unavailable: [], similar: [], empty_reason: 'Not logged in.' };
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*, food:foods(*, restaurant:restaurants(*)))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
    if (error) throw error;
    if (!orders?.length) return { available: [], unavailable: [], similar: [], original_orders: [] };

    const available = [], unavailable = [], cats = new Set(), rests = new Set();
    orders.forEach(o => (o.items || []).forEach(({ food }) => {
        if (!food) return;
        if (food.available === false) {
            if (!unavailable.find(f => f.id === food.id)) {
                unavailable.push(food);
                if (food.category) cats.add(food.category);
                if (food.restaurant?.id) rests.add(food.restaurant.id);
            }
        } else if (!available.find(f => f.id === food.id)) available.push(food);
    }));

    let similar = [];
    if (unavailable.length > 0) {
        // Check activity of restaurant in similar items too
        let q = supabase.from('foods').select('*, restaurant:restaurants!inner(*)').eq('available', true).eq('restaurant.is_active', true);
        const conds = [];
        if (cats.size) conds.push(`category.in.(${[...cats].join(',')})`);
        if (rests.size) conds.push(`restaurant_id.in.(${[...rests].join(',')})`);
        if (conds.length) q = q.or(conds.join(','));
        const { data: sim } = await q.order('created_at', { ascending: false }).limit(6);
        similar = (sim || []).filter(i => !avSet.has(i.id));
    }
    return { available, unavailable: [], similar, original_orders: orders };
}

async function searchRestaurants(filters = {}) {
    const limit = filters.limit || 6;
    let query = supabase.from('restaurants').select('*, foods(*)').eq('is_active', true);
    if (filters.restaurant_name) query = query.ilike('name', `%${filters.restaurant_name}%`);
    if (filters.location) query = query.ilike('address', `%${filters.location}%`);

    // Sort logic: by rating
    const { data: rests, error } = await query
        .order('rating', { ascending: false, nullsLast: true })
        .limit(limit);

    if (error) throw error;
    (rests || []).forEach(r => {
        if (Array.isArray(r.foods)) {
            // Show ONLY available food items for the restaurant
            r.foods = r.foods
                .filter(f => f.available !== false)
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 10);
        }
    });
    return rests || [];
}

async function getOffers(filters = {}) {
    const limit = filters.limit || 6;
    // Show ONLY available items from ACTIVE restaurants sorted by rating
    let { data, error } = await supabase.from('foods').select('*, restaurant:restaurants!inner(*)')
        .eq('available', true)
        .eq('restaurant.is_active', true)
        .order('rating', { ascending: false, nullsLast: true }).limit(limit);
    if (error && error.message?.includes('rating')) {
        ({ data, error } = await supabase.from('foods').select('*, restaurant:restaurants!inner(*)')
            .eq('available', true)
            .eq('restaurant.is_active', true)
            .order('created_at', { ascending: false }).limit(limit));
    }
    if (error) throw error;
    return data || [];
}

async function getTrendingItems(filters = {}) {
    const limit = filters.limit || 6;
    // Show ONLY available items from ACTIVE restaurants, best rated first
    let { data, error } = await supabase.from('foods').select('*, restaurant:restaurants!inner(*)')
        .eq('available', true)
        .eq('restaurant.is_active', true)
        .order('rating', { ascending: false, nullsLast: true }).limit(limit);
    if (error && error.message?.includes('rating')) {
        ({ data, error } = await supabase.from('foods').select('*, restaurant:restaurants!inner(*)')
            .eq('available', true)
            .eq('restaurant.is_active', true)
            .order('created_at', { ascending: false }).limit(limit));
    }
    if (error) throw error;
    return data || [];
}
