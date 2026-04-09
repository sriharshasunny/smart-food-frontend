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
            intent: 'mixed_query', 
            tasks: [{ type: 'restaurant', name: 'restaurant', intent: 'search_restaurant', quantity: extractLimitString(message) || 5, filters: {}, primary_source: 'database' }]
        };
    }

    // ORDERS
    if (/(?:my order|past order|order history|previous order|reorder|what did i order|show order)/i.test(m)) {
        return { intent: 'mixed_query', tasks: [{ type: 'get_orders', name: 'orders', intent: 'get_orders', quantity: 10, filters: {}, primary_source: "database" }] };
    }

    // OPEN NOW
    if (/(?:open now|open today|open at night|what.?s open)/i.test(m)) {
        return { intent: 'mixed_query', tasks: [{ type: 'restaurant', name: 'restaurant', intent: 'open_now', quantity: 10, filters: {}, primary_source: "database" }] };
    }

    // OFFERS
    if (/\b(?:offer|deal|discount|coupon|promo|sale)\b/i.test(m)) {
        return { intent: 'mixed_query', tasks: [{ type: 'food', name: 'offers', intent: 'get_offers', quantity: 10, filters: {}, primary_source: "database" }] };
    }

    const terms = Object.keys(FOOD_TERMS).sort((a, b) => b.length - a.length);
    for (const kw of terms) {
        if (m.includes(kw) && !isCombo) {
            return {
                intent: 'mixed_query',
                tasks: [{
                    type: 'food',
                    name: FOOD_TERMS[kw],
                    intent: 'food_search',
                    quantity: extractLimitString(message) || 5,
                    filters: { price: extractPriceMax(message) || null, diet: null, rating: null, location: null },
                    primary_source: "database", 
                    secondary_source: "recommendation"
                }],
                reason: "Fast-path exact food match"
            };
        }
    }

    return null; 
}

function getDynamicMessage(parsed, resultCount) {
    if (resultCount === 0) return "Hmm, I couldn't find anything matching that right now. Try adjusting your search! 🔍";
    const overallIntent = parsed.intent;
    let hasRests = false;
    let hasFoods = false;
    let foodNames = [];
    if (parsed.tasks) {
        parsed.tasks.forEach(t => {
            if (t.type === 'restaurant') hasRests = true;
            if (t.type === 'food' && t.name && t.name !== 'food' && t.name !== 'foods') foodNames.push(t.name);
            if (t.type === 'food') hasFoods = true;
        });
    }
    
    // Quick specific intents based on raw intent string or first task
    const primaryTaskIntent = parsed.tasks && parsed.tasks.length > 0 ? parsed.tasks[0].intent : '';
    
    if (overallIntent === 'get_offers' || primaryTaskIntent === 'get_offers') return `Found ${resultCount} great deals for you! 🏷️ Grab them before they're gone.`;
    if (overallIntent === 'get_orders' || primaryTaskIntent === 'get_orders') return `Here are your recent orders 📦. Want to reorder something?`;
    if (overallIntent === 'open_now' || primaryTaskIntent === 'open_now') return `Found ${resultCount} restaurants open right now! 🏪`;
    
    if (hasRests && !hasFoods) return `Found ${resultCount} restaurants for you! 🏪`;
    if (hasRests && hasFoods) return `Found ${resultCount} results including both great food and top restaurants! 🍽️🏪`;
    
    const nameStr = foodNames.length > 0 ? `**${foodNames.join(' and ')}** ` : 'options ';
    
    if (overallIntent === 'recommendation' || primaryTaskIntent === 'recommendation' || primaryTaskIntent === 'food_recommendation') {
         return `Here are ${resultCount} great ${nameStr}suggestions tailored just for you! ✨`;
    }
    return `Found ${resultCount} ${nameStr}🍽️ — enjoy!`;
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

        let parsedData = null;
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.warn('[Chat] No Gemini API key found, bypassing AI and using robust local fallback.');
            parsedData = detectIntentLocally(message);
        } else {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: { responseMimeType: 'application/json' }
            });

            const combinedPrompt = `You are the intelligence engine of a professional food delivery chatbot similar to Zomato or Swiggy.

Your job is NOT to randomly recommend foods.

Your job is to:
Understand user queries deeply
Split mixed queries correctly
Extract structured intent
Decide correct data source
Help backend fetch correct results
Handle complex mixed requests

SYSTEM DATA SOURCES:

DATABASE:
Contains exact food items
Restaurant data
Price
Rating
Location
Availability
Category
Diet type

RECOMMENDATION SYSTEM:
Contains:
Popular foods
Top rated foods
Similar foods
Trending foods
Personalized foods

CORE THINKING PROCESS:
STEP 1: Understand query completely.
STEP 2: Detect if query contains multiple requests.
STEP 3: Split into independent tasks.
STEP 4: Extract entities (food name, restaurant name, category, filters, quantity)
STEP 5: Decide search strategy.
STEP 6: Return structured JSON.

INTENT TYPES:
food_search
food_recommendation
restaurant_search
restaurant_recommendation
menu_query
price_query
availability_query
comparison
mixed_query

ENTITY TYPES:
food
restaurant
category

FILTER TYPES:
price low medium high
diet veg nonveg vegan
rating
location nearby
category
availability

SEARCH DECISION RULES:
If user asks specific food: Use database first.
If user asks top or best: Use recommendation first.
If exact matches found: Return exact matches.
If few matches: Fill with recommendation results.
If no matches: Use recommendation.
If mixed query: Use hybrid search.
If user gives filters: Apply filters first.

QUANTITY RULE:
If user says top 3, top five, suggest 10, best 20 -> Extract quantity. Default quantity = 10.

MIXED QUERY RULES:
You MUST split correctly. Never merge tasks. Never drop tasks. Never ignore filters.

OUTPUT STRUCTURE:
Return JSON ONLY:
{
"intent":"mixed_query",
"tasks":[
  {
  "type":"food | restaurant | get_orders",
  "name":"",
  "intent":"food_search | food_recommendation | restaurant_search | get_orders",
  "quantity":10,
  "filters":{
    "price":null,
    "diet":null,
    "rating":null,
    "location":null
  },
  "primary_source":"database | recommendation | hybrid",
  "secondary_source":""
  }
]
}

User query to analyze:
${message} (If user asks "what did I order" or "past food items", use intent "get_orders")`;

            try {
                const result = await generateWithRetry(model, combinedPrompt);
                let textResult = result.response.text();
                textResult = textResult.replace(/```json/gi, '').replace(/```/g, '').trim();
                parsedData = JSON.parse(textResult);
            } catch (aiErr) {
                console.error('[Chat] Gemini error:', aiErr.message);
                parsedData = detectIntentLocally(message);
            }
        }
        
        // Final ultimate fallback if both Gemini and the local detection completely crashed or didn't yield
        if (!parsedData || !parsedData.tasks || !Array.isArray(parsedData.tasks)) {
            let limit = extractLimitString(message) || 10;
            let foods = extractFoodNamesLocally(message);
            if(foods.length === 0) foods = ["food"];

            parsedData = {
                intent: 'mixed_query',
                tasks: foods.map(f => ({
                    type: 'food', name: f, intent: 'food_recommendation', quantity: limit,
                    filters: { price: extractPriceMax(message) },
                    primary_source: 'database', secondary_source: 'recommendation'
                })),
                reason: "Absolute fallback"
            };
        }

        let finalData = [];
        let rType = 'search_food';
        
        for (const task of parsedData.tasks) {
            const tIntent = task.intent || task.type;
            const filters = task.filters || {};
            let quantity = Number(task.quantity) || 10;
            if(isNaN(quantity) || quantity <= 0) quantity = 10;
            const searchStrategy = { primary_source: task.primary_source || "database", secondary_source: task.secondary_source };

            if (tIntent === 'get_orders' || task.type === 'get_orders') {
                const dbResult = await advancedGetOrders(userId, filters);
                finalData = [...finalData, ...dbResult.available];
                rType = 'get_orders';
            } else if (tIntent === 'get_offers' || task.type === 'get_offers') {
                const offers = await getOffers();
                finalData = [...finalData, ...offers];
                rType = 'search_food';
            } else if (tIntent === 'open_now' || task.type === 'restaurant' || tIntent.includes('restaurant')) {
                const rests = await searchRestaurants({ open_now: tIntent === 'open_now' || filters.availability === 'open', limit: quantity, restaurant_name: (task.name && task.name !== 'restaurant' && task.name !== 'restaurants') ? task.name : null });
                finalData = [...finalData, ...rests];
                if (rType !== 'mixed') {
                   rType = finalData.length > rests.length ? 'mixed' : 'search_restaurant';
                }
            } else {
                // FOOD SEARCH LOGIC for this specific task
                const perItemLimit = Math.min(quantity, 20);

                const fetchFromDb = async () => {
                    const res = await advancedSearchFood({ ...filters, food_name: task.name, limit: perItemLimit });
                    return res.available;
                };

                const fetchFromRec = async (count = perItemLimit) => {
                    try {
                        let recs = await recommendationEngine.getRecommendations(userId || 'guest', {
                            limit: count * 4
                        });
                        
                        if (task.name && task.name.toLowerCase() !== 'food' && task.name.toLowerCase() !== 'foods') {
                            recs = recs.filter(f => {
                                const n = (f.name || '').toLowerCase();
                                const c = (f.category || '').toLowerCase();
                                return n.includes(task.name.toLowerCase()) || c.includes(task.name.toLowerCase());
                            });
                        }
                        if (filters.price) {
                            const maxP = typeof filters.price === 'number' ? filters.price : (filters.price.includes('low') || filters.price.includes('cheap') ? 250 : (filters.price.includes('medium') ? 500 : 9999));
                            recs = recs.filter(f => f.price <= maxP);
                        }
                        if (filters.diet && typeof filters.diet === 'string') {
                            const d = filters.diet.toLowerCase();
                            if (d.includes('veg') && !d.includes('non')) recs = recs.filter(f => f.is_veg === true);
                            else if (d.includes('non') || d.includes('meat')) recs = recs.filter(f => f.is_veg === false);
                        }
                        return recs.slice(0, count);
                    } catch (err) {
                        console.error('[Chat] Rec Engine Error:', err.message);
                        return [];
                    }
                };
                
                let taskData = [];
                const primary = searchStrategy.primary_source || "database";
                
                if (primary === 'hybrid') {
                    const recItems = await fetchFromRec(perItemLimit);
                    const dbItems = await fetchFromDb();
                    taskData = [...recItems, ...dbItems];
                } else if (primary === 'recommendation') {
                    taskData = await fetchFromRec(perItemLimit);
                    if (taskData.length < 3) {
                         const dbItems = await fetchFromDb();
                         taskData = [...taskData, ...dbItems];
                    }
                } else { 
                    taskData = await fetchFromDb();
                    if (taskData.length < 3 && searchStrategy.secondary_source !== null && searchStrategy.secondary_source !== "") {
                         const recItems = await fetchFromRec(perItemLimit - taskData.length);
                         taskData = [...taskData, ...recItems];
                    }
                }
                
                // Final strict pass for this task
                if (task.name && task.name.toLowerCase() !== 'food' && task.name.toLowerCase() !== 'foods') {
                    taskData = taskData.filter(f => {
                        if (!f.name && !f.category) return false;
                        const n = (f.name || '').toLowerCase();
                        const c = (f.category || '').toLowerCase();
                        return n.includes(task.name.toLowerCase()) || c.includes(task.name.toLowerCase());
                    });
                }
                if (filters.price) {
                    const maxP = typeof filters.price === 'number' ? filters.price : (filters.price.includes('low') || filters.price.includes('cheap') ? 250 : (filters.price.includes('medium') ? 500 : 9999));
                    taskData = taskData.filter(f => f.price <= maxP);
                }

                finalData = [...finalData, ...taskData.slice(0, perItemLimit)];
            }
        }

        // final massive deduplication
        const uniqueMap = new Map();
        finalData.forEach(item => { if (item && item.id) uniqueMap.set(item.id, item); });
        finalData = Array.from(uniqueMap.values());

        const finalMessage = getDynamicMessage(parsedData, finalData.length);
        saveChatHistory(userId, 'assistant', finalMessage);
        
        return res.json({
            type: rType,
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
    
    if (baseFilters.food_name && baseFilters.food_name.toLowerCase() !== 'food' && baseFilters.food_name.toLowerCase() !== 'foods') {
        const words = baseFilters.food_name.split(',').map(w => w.trim()).filter(Boolean);
        const orStr = words.flatMap(w => [`name.ilike.%${w}%`, `category.ilike.%${w}%`]).join(',');
        if (orStr) query = query.or(orStr);
    }
    
    let maxPrice = null;
    if (typeof baseFilters.price === 'number') maxPrice = baseFilters.price;
    else if (typeof baseFilters.price === 'string') {
        if (baseFilters.price.includes('low') || baseFilters.price.includes('cheap')) maxPrice = 250;
        else if (baseFilters.price.includes('medium')) maxPrice = 500;
        else maxPrice = extractPriceMax(baseFilters.price);
    }
    if (baseFilters.price_max) maxPrice = baseFilters.price_max;
    if (maxPrice > 0) query = query.lte('price', maxPrice);
    
    let isVeg = null;
    if (baseFilters.veg !== undefined) isVeg = baseFilters.veg;
    else if (baseFilters.diet && typeof baseFilters.diet === 'string') {
        const d = baseFilters.diet.toLowerCase();
        if (d.includes('veg') && !d.includes('non')) isVeg = true;
        else if (d.includes('non') || d.includes('meat')) isVeg = false;
    }
    if (isVeg !== null) query = query.eq('is_veg', isVeg);
    
    if (baseFilters.rating) {
        const minRating = parseFloat(baseFilters.rating);
        if (!isNaN(minRating) && minRating > 0) query = query.gte('rating', minRating);
    }
    
    if (baseFilters.location) {
        query = query.ilike('restaurant.city', `%${baseFilters.location}%`);
    }

    const { data, error } = await query.order('rating', { ascending: false }).limit(baseFilters.limit || 10);
    if (error) throw error;
    return { available: data || [], unavailable: [], similar: [] };
}

async function advancedGetOrders(userId, filters) {
    if (!userId || userId === 'guest') return { available: [], unavailable: [], similar: [], original_orders: [] };
    
    // Fetch recent 10 orders to get a good history span
    const { data: orders, error } = await supabase.from('orders')
        .select('*, items:order_items(*, food:foods(*, restaurant:restaurants(*)))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('[Chat] History Fetch Error:', error.message);
        throw error;
    }

    if (!orders?.length) return { available: [], unavailable: [], similar: [] };

    const allItems = [];
    const seenFoodIds = new Set();
    const seenNames = new Set();

    orders.forEach(order => {
        (order.items || []).forEach(item => {
            const food = item.food;
            
            // Availability Logic:
            // 1. If food record exists and available is true -> Available
            // 2. Otherwise (food deleted, or available: false) -> Unavailable
            const isAvailableNow = food && food.available !== false;

            // Use Order Item snapshots (name, price, image) as fallback if food record is missing
            const itemData = {
                id: food?.id || `historical_${item.id}`,
                name: food?.name || item.name || 'Unknown Item',
                price: food?.price || item.price || 0,
                image: food?.image || item.image || '',
                is_veg: food?.is_veg ?? true,
                rating: food?.rating || 4.0,
                available: isAvailableNow, // Current availability
                was_ordered: true,
                order_date: order.created_at,
                is_history: true
            };

            // Deduplicate: same food item or same name (if food deleted)
            const key = food?.id || item.name;
            if (!seenFoodIds.has(food?.id) && !seenNames.has(item.name)) {
                if (food?.id) seenFoodIds.add(food.id);
                seenNames.add(item.name);
                allItems.push(itemData);
            }
        });
    });

    // Split based on availability as requested
    const available = allItems.filter(i => i.available);
    const unavailable = allItems.filter(i => !i.available);

    return { 
        available: [...available, ...unavailable], // Standard result set
        original_orders: orders 
    };
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
