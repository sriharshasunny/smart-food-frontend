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
            if ((is503 || is429) && attempt < maxRetries) {
                const delay = attempt * 1500;
                await new Promise(r => setTimeout(r, delay));
            } else throw err;
        }
    }
}

// ── Intent-driven messaging ──────────────────────────────────────────────────
function getIntentMessage(intent, filters, count) {
    if (count === 0) return "I couldn't find anything matching your request right now. Try another search! 🔍";
    
    switch (intent) {
        case 'food_search':
        case 'mixed_food_search':
        case 'recommendation':
            const name = filters.food_name ? `**${filters.food_name}**` : 'food';
            const price = filters.price_max ? ` under ₹${filters.price_max}` : '';
            return `Found ${count} ${name} options${price} for you! 🍽️`;
        case 'restaurant_search':
            return `Here are ${count} restaurants that match your search! 🏪`;
        case 'get_offers':
            return `Found ${count} great deals! 🏷️ Grab them while they last.`;
        case 'trending_items':
            return `Here's what's hot right now! 🔥 (${count} items)`;
        case 'get_orders':
            return `Here are your recent orders 📦. Want to reorder?`;
        case 'open_now':
            return `These spots are open and serving right now! 🏪`;
        default:
            return `Here are ${count} results for your request! 👋`;
    }
}

// ── Database Cleanup ────────────────────────────────────────────────────────
async function saveChatHistory(userId, role, content) {
    if (!userId) return;
    try {
        await supabase.from('chat_history').insert({
            user_id: userId, role, content: typeof content === 'string' ? content : JSON.stringify(content),
            created_at: new Date().toISOString()
        });
    } catch (_) {}
}

// ── Controller: MAIN PIPELINE ──────────────────────────────────────────────
exports.processChatRequest = async (req, res) => {
    try {
        const { message, userId, history = [] } = req.body;
        if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });

        saveChatHistory(userId, 'user', message);

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.json({ type: 'text', message: 'AI service offline.' });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { responseMimeType: 'application/json' }
        });

        const ctx = history.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
        
        const systemPrompt = `
You are an AI food query engine. Convert the user message into structured JSON for database search.
Return ONLY JSON. STRICT JSON ONLY. No text. No explanations.

DATABASE: foods (name, price, rating, category, location, is_veg), restaurants (name, rating, location)

INTENTS: food_search, restaurant_search, recommendation, get_orders, get_offers, trending_items, greeting, unknown

OUTPUT SCHEMA:
{
  "intent": "food_search" | "restaurant_search" | "get_orders" | "get_offers" | "trending_items" | "greeting",
  "foods": [],
  "category": "veg" | "nonveg" | null,
  "price_max": number | null,
  "rating_min": number | null,
  "location": string | null,
  "sort_by": "rating" | "price_low" | "popularity" | null
}

RULES:
- "best", "top" -> sort_by: "rating"
- "cheap" -> sort_by: "price_low"
- "veg" -> category: "veg"
- Incomplete query? Use Context: ${ctx}

User Query: "${message}"`;

        let intent, filters;
        try {
            const result = await generateWithRetry(model, systemPrompt);
            const parsed = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
            
            if (parsed.intent === 'greeting') {
                const msg = "Hey! 👋 I'm **SmartBot**. What are you craving today?";
                saveChatHistory(userId, 'assistant', msg);
                return res.json({ type: 'text', message: msg });
            }

            intent = parsed.intent;
            filters = {
                food_name: (parsed.foods || []).join(', '),
                category: parsed.category,
                price_max: parseInt(parsed.price_max) || null,
                rating_min: parseFloat(parsed.rating_min) || null,
                sort_by: parsed.sort_by,
                limit: 8
            };
        } catch (aiErr) {
            console.error('[Chat] Gemini fail:', aiErr.message);
            intent = 'trending_items';
            filters = { limit: 6 };
        }

        // ── DB EXECUTION ──
        let results = [];
        if (intent === 'food_search' || intent === 'recommendation') {
            let q = supabase.from('foods').select('*, restaurant:restaurants!inner(*)').eq('available', true).eq('restaurant.is_active', true);
            if (filters.food_name) {
                const words = filters.food_name.split(',').map(w => w.trim()).filter(Boolean);
                const orStr = words.flatMap(w => [`name.ilike.%${w}%`, `category.ilike.%${w}%`]).join(',');
                if (orStr) q = q.or(orStr);
            }
            if (filters.price_max) q = q.lte('price', filters.price_max);
            if (filters.category === 'veg') q = q.eq('is_veg', true);
            if (filters.category === 'nonveg') q = q.eq('is_veg', false);
            
            if (filters.sort_by === 'rating') q = q.order('rating', { ascending: false });
            else if (filters.sort_by === 'price_low') q = q.order('price', { ascending: true });
            else q = q.order('popularity', { ascending: false });

            const { data } = await q.limit(8);
            results = data || [];
        } else if (intent === 'restaurant_search') {
            let q = supabase.from('restaurants').select('*').eq('is_active', true);
            if (filters.sort_by === 'rating') q = q.order('rating', { ascending: false });
            const { data } = await q.limit(8);
            results = data || [];
        } else if (intent === 'get_offers' || intent === 'trending_items') {
            const { data } = await supabase.from('foods').select('*, restaurant:restaurants!inner(*)')
                .eq('available', true).eq('restaurant.is_active', true)
                .order('rating', { ascending: false }).limit(6);
            results = data || [];
        } else if (intent === 'get_orders') {
            const { data } = await supabase.from('orders')
                .select('*, items:order_items(*, food:foods(*, restaurant:restaurants(*)))')
                .eq('user_id', userId).order('created_at', { ascending: false }).limit(5);
            // Transform orders to a renderable format
            intent = 'get_orders';
            results = data || [];
        }

        const msg = getIntentMessage(intent, filters, results.length);
        saveChatHistory(userId, 'assistant', msg);
        
        return res.json({
            type: intent === 'get_orders' ? 'get_orders' : (intent === 'restaurant_search' ? 'search_restaurant' : 'search_food'),
            data: results,
            message: msg
        });

    } catch (err) {
        console.error('[Chat] Final Error:', err.message);
        return res.status(500).json({ type: 'text', message: "Something went wrong. Try again later! 🙏" });
    }
};

exports.getChatHistory = async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.json([]);
    const { data } = await supabase.from('chat_history').select('*').eq('user_id', userId).order('created_at', { ascending: true }).limit(100);
    return res.json(data || []);
};
