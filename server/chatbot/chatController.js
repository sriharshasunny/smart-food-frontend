const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require('../utils/supabase');
const recommendationEngine = require('../recommendation/recommendationEngine');

// ── Helpers ──
async function generateWithRetry(model, prompt, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await model.generateContent(prompt);
        } catch (err) {
            const msg = err?.message || '';
            const is503 = err?.status === 503 || msg.includes('503');
            const is429 = err?.status === 429 || msg.includes('Too Many Requests');
            const retryMatch = msg.match(/retry in (\d+(?:\.\d+)?)s/);
            if ((is503 || is429) && attempt < maxRetries) {
                const delay = retryMatch ? Math.min(parseFloat(retryMatch[1]) * 1000, 8000) : attempt * 1500;
                console.warn(`[Chat] Gemini ${err?.status} try ${attempt}, retry in ${delay}ms`);
                await new Promise(r => setTimeout(r, delay));
            } else throw err;
        }
    }
}

function extractPriceMax(text) {
    const m = text.match(/(?:under|below|less than|max|upto|within|at most)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
    return m ? parseInt(m[1]) : null;
}

function extractLimitString(text) {
    const m = text.match(/\b(?:top|best|show|get|around|first)?\s*(\d{1,2})\b/i);
    return m ? parseInt(m[1]) : null;
}

const FOOD_TERMS = {
    'ice cream': 'ice cream', 'icecream': 'ice cream', 
    'biryani': 'biryani','biriyani': 'biryani', 'birynain': 'biryani', 'birynains': 'biryani', 'birayni': 'biryani', 'biraynis': 'biryani',
    'burger':'burger','pizza':'pizza','pasta':'pasta','noodles':'noodles',
    'dosa':'dosa','idli':'idli','sandwich':'sandwich','roll':'roll',
    'momos':'momos','fried rice':'fried rice','manchurian':'manchurian',
    'paneer':'paneer','sushi':'sushi','tacos':'tacos','ramen':'ramen',
    'soup':'soup','waffles':'waffles','salad':'salad','wrap':'wrap',
    'cake':'cake','dessert':'dessert','coffee':'coffee','chai':'chai',
    'tea':'tea','dal':'dal','roti':'roti','paratha':'paratha',
    'chicken':'chicken','mutton':'mutton','fish':'fish','prawn':'prawn',
    'meat':'meat','kebab':'kebab','tikka':'tikka','curry':'curry',
    'samosa':'samosa','chaat':'chaat','halwa':'halwa','kheer':'kheer',
    'lassi':'lassi','shake':'shake','smoothie':'smoothie','fries':'fries',
    'wings':'wings','steak':'steak','shawarma':'shawarma','toast':'toast',
    'omelette':'omelette','pancake':'pancake','muffin':'muffin',
    'cookie':'cookie','brownie':'brownie','pav bhaji':'pav bhaji',
    'vada':'vada','upma':'upma','poha':'poha'
};

function extractFoodNamesLocally(text) {
    const lower = text.toLowerCase();
    const found = new Set();
    const terms = Object.keys(FOOD_TERMS).sort((a, b) => b.length - a.length);
    for (const term of terms) {
        if (lower.includes(term)) found.add(FOOD_TERMS[term]);
    }
    return Array.from(found);
}

function detectIntentLocally(message) {
    const m = message.toLowerCase();
    const isCombo = /(?:suggest|best|top|popular|recommend|tasty|and|with)/i.test(m);

    // RESTAURANTS
    if (/\b(?:restuarant|restaurant|place|hotel|cafe|eatery)s?\b/i.test(m)) {
        return { 
            intent: 'search_restaurant', 
            foods_requested: [], 
            filters: { limit: extractLimitString(message) || 5 }, 
            search_strategy: { primary_source: "database" } 
        };
    }

    // ORDERS
    if (/(?:my order|past order|order history|previous order|reorder|what did i order|show order)/i.test(m)) {
        return { intent: 'get_orders', foods_requested: [], filters: {}, search_strategy: { primary_source: "database" } };
    }

    // OPEN NOW
    if (/(?:open now|open today|open at night|what.?s open)/i.test(m)) {
        return { intent: 'open_now', foods_requested: [], filters: {}, search_strategy: { primary_source: "database" } };
    }

    // OFFERS
    if (/\b(?:offer|deal|discount|coupon|promo|sale)\b/i.test(m)) {
        return { intent: 'get_offers', foods_requested: [], filters: {}, search_strategy: { primary_source: "database" } };
    }

    const terms = Object.keys(FOOD_TERMS).sort((a, b) => b.length - a.length);
    for (const kw of terms) {
        if (m.includes(kw) && !isCombo) {
            return {
                intent: 'food_search',
                foods_requested: [FOOD_TERMS[kw]],
                filters: {
                    price: extractPriceMax(message) || null,
                    diet: null,
                    rating: null,
                    location: null,
                    limit: extractLimitString(message) || 5
                },
                search_strategy: { primary_source: "database", secondary_source: "recommendation", ranking_needed: true },
                reason: "Fast-path exact food match"
            };
        }
    }

    return null; 
}

function getDynamicMessage(parsed, resultCount) {
    if (resultCount === 0) return "Hmm, I couldn't find anything matching that right now. Try adjusting your search! 🔍";
    const intent = parsed.intent;
    const filters = parsed.filters || {};
    
    if (intent === 'get_offers') return `Found ${resultCount} great deals for you! 🏷️ Grab them before they're gone.`;
    if (intent === 'get_orders') return `Here are your recent orders 📦. Want to reorder something?`;
    if (intent === 'open_now' || intent === 'search_restaurant') return `Found ${resultCount} restaurants for you! 🏪`;
    
    const foods = Array.isArray(parsed.foods_requested) && parsed.foods_requested.length > 0 ? parsed.foods_requested.join(' and ') : '';
    const name = foods.length > 0 ? `**${foods}** ` : 'options ';
    const vegLabel = filters.diet === 'veg' ? 'veg ' : (filters.diet === 'nonveg' ? 'non-veg ' : '');
    const priceLabel = filters.price ? `under ₹${filters.price} ` : '';
    
    if (intent === 'recommendation' || parsed.reason?.toLowerCase().includes('recommendation')) {
         return `Here are ${resultCount} great ${vegLabel}${name}suggestions tailored just for you! ✨`;
    }
    return `Found ${resultCount} ${vegLabel}${name}${priceLabel}🍽️ — enjoy!`;
}

async function saveChatHistory(userId, role, content) {
    if (!userId) return;
    try {
        await supabase.from('chat_history').insert({
            user_id: userId, role, content,
            created_at: new Date().toISOString()
        });
    } catch (_) { }
}

exports.getChatHistory = async (req, res) => {
    const { userId, date } = req.query;
    if (!userId) return res.json([]);
    try {
        let query = supabase.from('chat_history').select('*').eq('user_id', userId).order('created_at', { ascending: true });
        if (date) query = query.gte('created_at', `${date}T00:00:00.000Z`).lte('created_at', `${date}T23:59:59.999Z`);
        else query = query.limit(200);
        const { data, error } = await query;
        if (error) throw error;
        return res.json(data || []);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.processChatRequest = async (req, res) => {
    try {
        const { message, userId, history = [] } = req.body;
        if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });

        saveChatHistory(userId, 'user', message);

        let parsedData = detectIntentLocally(message);

        if (!parsedData) {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) return res.json({ type: 'text', message: 'AI service offline.' });

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: { responseMimeType: 'application/json' }
            });

            const combinedPrompt = `You are a strict food delivery AI routing queries to our database and ML recommendation systems.

Your responsibilities:
STEP 1 Understand the query deeply. Extract ALL food items requested.
STEP 2 Auto-correct typos AGGRESSIVELY (e.g. "biraynis" -> "biryani", "ice craems" -> "ice cream", "birynains" -> "biryani", "restuarants" -> "restaurant"). If it sounds like a food, correct it to the nearest real food name.
STEP 3 Extract limit and price exactly as mentioned by user.
STEP 4 Return EXACT JSON structure.

DECISION RULES:
- If user asks for RESTAURANTS, PLACES, HOTELS, or CAFES (e.g., "top 3 restuarants", "best places to eat"): intent MUST be "search_restaurant". foods_requested must be [].
- If user lists multiple foods ("ice creams and biryani"): foods_requested must be ["ice cream", "biryani"].
- If user asks specifically ("give top 5 birynains"): foods_requested MUST have ["biryani"].
- If user asks general "find me biryani": primary_source is "database", secondary is "recommendation".
- If user asks generic "give me top food items", "what is good", "im hungry" with NO specific food name: foods_requested is []. intent MUST be "recommendation".
- WARNING: NEVER leave foods_requested empty if the user mentioned ANY specific noun resembling food. You MUST correct it and include it.

OUTPUT STRUCTURE:
{
"intent":"food_search" | "recommendation" | "get_orders" | "search_restaurant",
"foods_requested":["item1", "item2"],
"filters":{
  "price":null,
  "diet":null,
  "rating":null,
  "location":null,
  "limit":5
},
"search_strategy":{
  "primary_source":"database" | "recommendation" | "hybrid",
  "secondary_source":"database" | "recommendation" | null,
  "ranking_needed":true
},
"reason":"Why you chose this strategy"
}

User query:
"${message}"`;

            try {
                const result = await generateWithRetry(model, combinedPrompt);
                let textResult = result.response.text();
                textResult = textResult.replace(/```json/gi, '').replace(/```/g, '').trim();
                parsedData = JSON.parse(textResult);
            } catch (aiErr) {
                console.error('[Chat] Gemini error:', aiErr.message);
                parsedData = {
                    intent: 'recommendation',
                    foods_requested: extractFoodNamesLocally(message),
                    filters: { limit: extractLimitString(message) || 5, price: extractPriceMax(message) },
                    search_strategy: { primary_source: "database", secondary_source: "recommendation" },
                    reason: "Fallback due to AI parse error"
                };
            }
        }

        // Apply fallback limits & fixes
        if (!parsedData.filters) parsedData.filters = {};
        if (!parsedData.filters.limit) parsedData.filters.limit = extractLimitString(message) || 5;
        
        // Strict local fallback if Gemini missed food names completely
        if (!parsedData.foods_requested || parsedData.foods_requested.length === 0) {
            const localFoods = extractFoodNamesLocally(message);
            if (localFoods.length > 0) parsedData.foods_requested = localFoods;
        }

        const foods_requested = parsedData.foods_requested || [];
        const intent = parsedData.intent || 'food_search';
        const search_strategy = parsedData.search_strategy || { primary_source: "database" };
        const filters = parsedData.filters;

        let finalData = [];
        
        // UTILITY INTENTS
        if (intent === 'get_orders') {
            const dbResult = await advancedGetOrders(userId, filters);
            finalData = dbResult.available;
        } else if (intent === 'get_offers') {
            finalData = await getOffers();
        } else if (intent === 'open_now' || intent === 'search_restaurant') {
            finalData = await searchRestaurants({ open_now: true, limit: filters.limit });
        } else {
            // FOOD SEARCH LOGIC
            // Ensure per-item limiting
            const perItemLimit = Math.min(filters.limit, 20);
            const totalTargetLimit = foods_requested.length > 0 ? perItemLimit * foods_requested.length : perItemLimit;

            const fetchFromDb = async () => {
                let dbResults = [];
                if (foods_requested.length > 0) {
                    for (const food of foods_requested) {
                        const res = await advancedSearchFood({ ...filters, food_name: food, limit: perItemLimit });
                        dbResults = [...dbResults, ...res.available];
                    }
                } else {
                    const res = await advancedSearchFood({ ...filters, limit: totalTargetLimit });
                    dbResults = [...dbResults, ...res.available];
                }
                return dbResults;
            };

            const fetchFromRec = async (count = totalTargetLimit) => {
                try {
                    let recs = await recommendationEngine.getRecommendations(userId || 'guest', {
                        limit: count * 4 // fetch 4x for strict filtering
                    });
                    
                    // The STRICT FILTERING LAYER user requested
                    if (foods_requested.length > 0) {
                        recs = recs.filter(f => {
                            const n = (f.name || '').toLowerCase();
                            const c = (f.category || '').toLowerCase();
                            return foods_requested.some(term => n.includes(term.toLowerCase()) || c.includes(term.toLowerCase()));
                        });
                    }
                    if (filters.price) recs = recs.filter(f => f.price <= filters.price);
                    if (filters.diet === 'veg') recs = recs.filter(f => f.is_veg === true);
                    else if (filters.diet === 'nonveg') recs = recs.filter(f => f.is_veg === false);
                    
                    // Trim per item if multiple specified
                    if (foods_requested.length > 1) {
                         let finalRecs = [];
                         for (const food of foods_requested) {
                             const matches = recs.filter(f => (f.name||'').toLowerCase().includes(food.toLowerCase()) || (f.category||'').toLowerCase().includes(food.toLowerCase()));
                             finalRecs = [...finalRecs, ...matches.slice(0, perItemLimit)];
                         }
                         return finalRecs;
                    }
                    return recs.slice(0, count);
                } catch (err) {
                    console.error('[Chat] Rec Engine Error:', err.message);
                    return [];
                }
            };
            
            const primary = search_strategy.primary_source || "database";
            
            if (primary === 'hybrid') {
                const recItems = await fetchFromRec(totalTargetLimit);
                const dbItems = await fetchFromDb();
                finalData = [...recItems, ...dbItems];
            } else if (primary === 'recommendation') {
                finalData = await fetchFromRec(totalTargetLimit);
                if (finalData.length < (foods_requested.length * 2 || 3)) {
                     const dbItems = await fetchFromDb();
                     finalData = [...finalData, ...dbItems];
                }
            } else { 
                finalData = await fetchFromDb();
                if (finalData.length < (foods_requested.length * 2 || 3) && search_strategy.secondary_source !== null) {
                     const recItems = await fetchFromRec(totalTargetLimit - finalData.length);
                     finalData = [...finalData, ...recItems];
                }
            }
            
            // final massive deduplication & double check strict layer
            const uniqueMap = new Map();
            finalData.forEach(item => { if (item && item.id) uniqueMap.set(item.id, item); });
            let definitiveList = Array.from(uniqueMap.values());
            
            // Absolute strict pass for "Samosa/Grilled Cheese" bug
            if (foods_requested.length > 0) {
                definitiveList = definitiveList.filter(f => {
                    const n = (f.name || '').toLowerCase();
                    const c = (f.category || '').toLowerCase();
                    return foods_requested.some(term => n.includes(term.toLowerCase()) || c.includes(term.toLowerCase()));
                });
            }
            if (filters.price) definitiveList = definitiveList.filter(f => f.price <= filters.price);

            // Respect limits per item explicitly (return 1 item list after another as user requested)
            if (foods_requested.length > 1) {
                finalData = [];
                for (const food of foods_requested) {
                    const matches = definitiveList.filter(f => (f.name||'').toLowerCase().includes(food.toLowerCase()) || (f.category||'').toLowerCase().includes(food.toLowerCase()));
                    finalData = [...finalData, ...matches.slice(0, perItemLimit)];
                }
            } else {
                finalData = definitiveList.slice(0, totalTargetLimit);
            }
        }

        const finalMessage = getDynamicMessage(parsedData, finalData.length);
        saveChatHistory(userId, 'assistant', finalMessage);
        
        let returnType = 'search_food';
        if (intent === 'get_orders') returnType = 'get_orders';
        else if (intent === 'open_now' || intent === 'search_restaurant') returnType = 'search_restaurant';
        
        return res.json({
            type: returnType,
            data: finalData,
            message: finalMessage
        });

    } catch (error) {
        console.error('[Chat] Error:', error.message);
        return res.status(500).json({ type: 'text', message: "Sorry, I hit a snag while processing that. Try again? 🙏" });
    }
};

// ── Database Query Helpers ──
async function advancedSearchFood(baseFilters) {
    let query = supabase.from('foods').select('id, name, price, is_veg, rating, description, image, available, category, restaurant:restaurants!inner(id, name, city, rating)').eq('restaurant.is_active', true).eq('available', true);
    
    if (baseFilters.food_name) {
        const words = baseFilters.food_name.split(',').map(w => w.trim()).filter(Boolean);
        const orStr = words.flatMap(w => [`name.ilike.%${w}%`, `category.ilike.%${w}%`]).join(',');
        if (orStr) query = query.or(orStr);
    }
    
    const maxPrice = baseFilters.price_max || parseInt(baseFilters.price);
    if (!isNaN(maxPrice) && maxPrice > 0) query = query.lte('price', maxPrice);
    
    const isVeg = baseFilters.veg !== undefined ? baseFilters.veg : (baseFilters.diet === 'veg' ? true : (baseFilters.diet === 'nonveg' ? false : null));
    if (isVeg !== null) query = query.eq('is_veg', isVeg);
    
    if (baseFilters.rating) {
        const minRating = parseFloat(baseFilters.rating);
        if (!isNaN(minRating) && minRating > 0) query = query.gte('rating', minRating);
    }
    
    if (baseFilters.location) {
        query = query.ilike('restaurant.city', `%${baseFilters.location}%`);
    }

    const { data, error } = await query.order('rating', { ascending: false }).limit(baseFilters.limit || 5);
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
    const finalLimit = filters.limit ? Math.min(filters.limit, 10) : 6;
    const { data, error } = await query.order('rating', { ascending: false }).limit(finalLimit);
    if (error) throw error;
    (data || []).forEach(r => { if (r.foods) r.foods = r.foods.filter(f => f.available !== false).slice(0, 3); });
    return data || [];
}

async function getOffers() {
    const { data, error } = await supabase.from('foods').select('id, name, price, is_veg, rating, description, image, available, category, restaurant:restaurants!inner(id, name, city, rating)')
        .eq('available', true).eq('restaurant.is_active', true).order('rating', { ascending: false }).limit(8);
    if (error) throw error;
    return data || [];
}
