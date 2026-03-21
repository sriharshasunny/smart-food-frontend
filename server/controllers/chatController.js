const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require('../utils/supabase');
const { getRecommendations } = require('../services/recommendationEngine');

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

// ── LOCAL KEYWORD FAST-PATH REMOVED ─────────────────────
// We now rely exclusively on Gemini for better intent and message generation.

// ── Friendly message for each intent ─────────────────────
function getDynamicMessage(parsed, resultCount) {
    if (resultCount === 0) {
        return "Hmm, I couldn't find anything matching that right now. Try adjusting your search! 🔍";
    }
    
    // If Gemini generated a smart, contextual bot message, use that directly
    if (parsed.bot_message && typeof parsed.bot_message === 'string') {
        return parsed.bot_message;
    }
    
    const intent = parsed.intent;
    const filters = parsed.filters || {};
    
    if (intent === 'recommendation' || parsed.reason?.toLowerCase().includes('recommendation')) {
         return `Here are ${resultCount} great suggestions tailored just for you! ✨`;
    }
    if (intent === 'get_offers') return `Found ${resultCount} great deals for you! 🏷️ Grab them before they're gone.`;
    if (intent === 'get_orders') return `Here are your recent orders 📦. Want to reorder something?`;
    if (intent === 'open_now') return `These restaurants are open right now! 🏪`;
    
    // Catch-all generic search
    const foods = Array.isArray(parsed.foods_requested) ? parsed.foods_requested.join(' and ') : 'food';
    const name = foods && foods.length > 0 ? `**${foods}**` : 'food options';
    const vegLabel = filters.diet === 'veg' ? 'veg ' : (filters.diet === 'nonveg' ? 'non-veg ' : '');
    const priceLabel = filters.price ? ` under ₹${filters.price}` : '';
    return `Found ${resultCount} ${vegLabel}${name}${priceLabel} 🍽️ — enjoy!`;
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

        // Local routing removed, use Gemini exclusively.
        let parsedData = null;

        if (!parsedData) {
            // ── Step 2: Gemini Intent Engine ──
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) return res.json({ type: 'text', message: 'AI service offline.' });

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: { responseMimeType: 'application/json' }
            });

            const combinedPrompt = `You are the intelligence engine of a professional food delivery chatbot.

Your goal is to understand the user query and decide how to use the existing system components:
1 Database search (exact food data)
2 Recommendation system (similar/popular foods)
3 Ranking logic (best matches)

You must THINK before answering.
Do not blindly use recommendations.
Always prioritize user intent.

Your responsibilities:
STEP 1 Understand the query deeply.
STEP 2 Extract user intent.
STEP 3 Decide data source priority.
STEP 4 Return structured decision output including a highly professional bot_message.

Available system data sources:
DATABASE: Contains exact food items, restaurants, price, rating, availability, location.
RECOMMENDATION SYSTEM: Contains similar foods, popular foods, personalized foods.

DECISION RULES:
If user explicitly asks for "top picks" or "recommendations": Set intent to 'recommendation' and primary_source to 'recommendation'.
If user asks for a specific food (e.g., "biryanis only under 400"): Set intent to 'food_search', primary_source to 'database'.
Always extract limit if provided by the user. If no limit is mentioned or implied, default limit MUST be 5.
If user mixes foods: Search each food separately.
If user gives filters: price, veg/nonveg, rating, location -> Apply filters before returning.
Never recommend unrelated foods. Always prioritize relevance over popularity.

Generate a highly professional, polite 'bot_message' that will be displayed right above the food cards. Complete sentences and professional tone.
Examples for bot_message: 
- "Here are some of the best biryanis tailored just for you! ✨"
- "Here are some top picks for that area! 🍽️"
- "I've found some great options under your budget limit! 💸"

OUTPUT STRUCTURE:
Return JSON:
{
"intent":"",
"foods_requested":[],
"filters":{
  "price":null,
  "diet":null,
  "rating":null,
  "location":null,
  "limit":5
},
"search_strategy":{
  "primary_source":"",
  "secondary_source":null,
  "ranking_needed":true
},
"bot_message":"A professional, tailored message introducing the results",
"reason":"short reason"
}

Search strategy values:
primary_source: "database", "recommendation", "hybrid"
secondary_source: "database", "recommendation", null

User query:
"${message}"
Think like a senior search engineer from Zomato or Swiggy designing food search ranking logic.`;

            try {
                const result = await generateWithRetry(model, combinedPrompt);
                let textResult = result.response.text();
                // Clean markdown blocking if applied
                textResult = textResult.replace(/```json/gi, '').replace(/```/g, '').trim();
                parsedData = JSON.parse(textResult);
            } catch (aiErr) {
                console.error('[Chat] Gemini error:', aiErr.message);
                parsedData = {
                    intent: 'recommendation', // safe fallback
                    foods_requested: [],
                    filters: { limit: 5 },
                    search_strategy: { primary_source: "recommendation", secondary_source: null },
                    bot_message: "Here are some top picks tailored just for you! ✨",
                    reason: "Fallback to recommendation due to AI parsing error"
                };
            }
        }

        // ── Step 3: Execute Search Strategy ──
        let finalData = [];
        const intent = parsedData.intent || 'food_search';
        const search_strategy = parsedData.search_strategy || { primary_source: 'database' };
        const filters = parsedData.filters || {};
        const foods_requested = parsedData.foods_requested || [];
        
        // Handle Utility Intents first
        if (intent === 'get_orders') {
            const dbResult = await advancedGetOrders(userId, filters);
            finalData = dbResult.available;
        } else if (intent === 'get_offers') {
            finalData = await getOffers();
        } else if (intent === 'open_now') {
            finalData = await searchRestaurants({ open_now: true });
        } else {
            // Data routing for food/recommendation queries
            const limit = filters.limit || 8;
            
            const fetchFromDb = async () => {
                let dbResults = [];
                if (foods_requested && foods_requested.length > 0) {
                    for (const food of foods_requested) {
                        const res = await advancedSearchFood({ ...filters, food_name: food, limit });
                        dbResults = [...dbResults, ...res.available];
                    }
                } else {
                    const res = await advancedSearchFood({ ...filters, limit });
                    dbResults = [...dbResults, ...res.available];
                }
                return dbResults;
            };

            const fetchFromRec = async (count = limit) => {
                try {
                    const loc = filters.location || null;
                    const res = await getRecommendations(userId || 'guest', {
                        city: loc,
                        limit: count
                    });
                    return res.recommendations || [];
                } catch (err) {
                    console.error('[Chat] Rec Engine Error:', err.message);
                    return [];
                }
            };
            
            const primary = search_strategy.primary_source || "database";
            
            if (primary === 'hybrid') {
                const dbItems = await fetchFromDb();
                if (dbItems.length < limit) {
                     const recItems = await fetchFromRec(limit - dbItems.length);
                     finalData = [...dbItems, ...recItems];
                } else {
                     finalData = dbItems;
                }
            } else if (primary === 'recommendation') {
                finalData = await fetchFromRec(limit);
                // Check secondary
                if (finalData.length < 3 && search_strategy.secondary_source === 'database') {
                     const dbItems = await fetchFromDb();
                     finalData = [...finalData, ...dbItems];
                }
            } else { 
                // default to database
                finalData = await fetchFromDb();
                // Check secondary source if few DB matches
                if (finalData.length < 3 && search_strategy.secondary_source === 'recommendation') {
                     const recItems = await fetchFromRec(limit - finalData.length);
                     finalData = [...finalData, ...recItems];
                }
            }
            
            // Deduplicate across results
            const uniqueMap = new Map();
            finalData.forEach(item => { if (item && item.id) uniqueMap.set(item.id, item); });
            finalData = Array.from(uniqueMap.values()).slice(0, limit);
        }

        // ── Step 4: Response Format ──
        const finalMessage = getDynamicMessage(parsedData, finalData.length);

        saveChatHistory(userId, 'assistant', finalMessage);
        
        let returnType = 'search_food';
        if (intent === 'get_orders') returnType = 'get_orders';
        else if (intent === 'open_now') returnType = 'search_restaurant';
        
        return res.json({
            type: returnType,
            data: finalData,
            message: finalMessage,
            _debug_intent: parsedData // Hidden debug
        });

    } catch (error) {
        console.error('[Chat] Error:', error.message);
        return res.status(500).json({ type: 'text', message: "Sorry, I hit a snag while processing that. Try again? 🙏" });
    }
};

// ── Helpers ──
async function advancedSearchFood(baseFilters) {
    let query = supabase.from('foods').select('*, restaurant:restaurants!inner(*)').eq('restaurant.is_active', true).eq('available', true);
    
    if (baseFilters.food_name) {
        const words = baseFilters.food_name.split(',').map(w => w.trim()).filter(Boolean);
        const orStr = words.flatMap(w => [`name.ilike.%${w}%`, `category.ilike.%${w}%`]).join(',');
        if (orStr) query = query.or(orStr);
    }
    
    // Support either old style price_max or new json 'price'
    const maxPrice = baseFilters.price_max || parseInt(baseFilters.price);
    if (!isNaN(maxPrice) && maxPrice > 0) query = query.lte('price', maxPrice);
    
    // Diet mapping
    const isVeg = baseFilters.veg !== undefined ? baseFilters.veg : (baseFilters.diet === 'veg' ? true : (baseFilters.diet === 'nonveg' ? false : null));
    if (isVeg !== null) query = query.eq('is_veg', isVeg);
    
    if (baseFilters.rating) {
        const minRating = parseFloat(baseFilters.rating);
        if (!isNaN(minRating) && minRating > 0) query = query.gte('rating', minRating);
    }
    
    if (baseFilters.location) {
        query = query.ilike('restaurant.city', `%${baseFilters.location}%`);
    }

    const { data, error } = await query.order('rating', { ascending: false }).limit(baseFilters.limit || 8);
    if (error) throw error;
    return { available: data || [], unavailable: [], similar: [] };
}

async function advancedGetOrders(userId, filters) {
    if (!userId || userId === 'guest') return { available: [], unavailable: [], similar: [], original_orders: [] };
    const { data: orders, error } = await supabase.from('orders')
        .select('*, items:order_items(*, food:foods(*, restaurant:restaurants(*)))')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(5);
    if (error) throw error;
    if (!orders?.length) return { available: [], unavailable: [], similar: [] };
    const available = [];
    orders.forEach(o => (o.items || []).forEach(({ food }) => {
        if (food && food.available !== false && !available.find(f => f.id === food.id)) available.push(food);
    }));
    return { available, unavailable: [], similar: [], original_orders: orders };
}

async function searchRestaurants(filters = {}) {
    let query = supabase.from('restaurants').select('*, foods(*)').eq('is_active', true);
    if (filters.restaurant_name) query = query.ilike('name', `%${filters.restaurant_name}%`);
    const { data, error } = await query.order('rating', { ascending: false }).limit(6);
    if (error) throw error;
    (data || []).forEach(r => { if (r.foods) r.foods = r.foods.filter(f => f.available !== false).slice(0, 3); });
    return data || [];
}

async function getOffers() {
    const { data, error } = await supabase.from('foods').select('*, restaurant:restaurants!inner(*)')
        .eq('available', true).eq('restaurant.is_active', true).order('rating', { ascending: false }).limit(8);
    if (error) throw error;
    return data || [];
}
