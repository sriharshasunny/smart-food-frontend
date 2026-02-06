const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require('../utils/supabase');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.askChatbot = async (req, res) => {
    try {
        const { userId, message } = req.body;
        console.log("Chat Request:", { userId, message });

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        // 1. Gather Context (RAG)
        let contextData = {};

        // A. User Details & Cart
        if (userId) {
            // Fetch User, Cart (with food), Wishlist (with food)
            // Supabase deep-select syntax
            const { data: user } = await supabase
                .from('users')
                .select(`
                    name, 
                    email, 
                    cart_items (
                        quantity,
                        notes,
                        food_items ( name )
                    ),
                    wishlist_items (
                        food_items ( name )
                    )
                `)
                .eq('id', userId)
                .single();

            if (user) {
                contextData.user = {
                    name: user.name,
                    email: user.email,
                    cart: user.cart_items?.map(item => ({
                        item: item.food_items?.name || "Unknown Item",
                        quantity: item.quantity,
                        notes: item.notes
                    })) || [],
                    wishlist: user.wishlist_items?.map(item => item.food_items?.name || "Unknown Item") || []
                };
            }

            // B. Recent Orders
            const { data: recentOrders } = await supabase
                .from('orders')
                .select(`
                    id, 
                    order_status, 
                    total_amount, 
                    created_at,
                    order_items ( name )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (recentOrders) {
                contextData.orders = recentOrders.map(order => ({
                    id: order.id,
                    status: order.order_status,
                    total: order.total_amount,
                    date: order.created_at,
                    items: order.order_items?.map(i => i.name) || [],
                    invoice: `http://localhost:5173/orders/${order.id}/invoice`
                }));
            }
        }

        // C. Top Restaurants (General Knowledge)
        const { data: topRestaurants } = await supabase
            .from('restaurants')
            .select('name, cuisine, rating, delivery_time, price_for_two, address')
            .order('rating', { ascending: false })
            .limit(5);

        contextData.topRestaurants = topRestaurants || [];

        // D. Food Menu (All Items for now, limit to 50)
        const { data: foodMenu } = await supabase
            .from('food_items')
            .select(`
                name, 
                price, 
                description, 
                is_veg, 
                rating, 
                restaurants ( name )
            `)
            .order('rating', { ascending: false })
            .limit(50);

        contextData.menu = foodMenu?.map(item => ({
            item: item.name,
            price: item.price,
            veg: item.is_veg,
            rating: item.rating,
            restaurant: item.restaurants?.name || "Unknown",
            desc: item.description
        })) || [];

        // E. Context Prompts
        const systemInstruction = `
            You are "FoodieBot", the AI assistant for SmartFood Delivery.
            Your role is to help users with their food delivery needs, check order status, and recommend restaurants.
            
            Use the provided JSON context to answer the user's question.
            
            CONTEXT:
            ${JSON.stringify(contextData, null, 2)}
            
            GUIDELINES:
            - Be friendly, concise, and helpful.
            - If asking about order status, look at the 'orders' context.
            - You can provide the invoice link from the 'orders' context if requested.
            - If asking about wishlist, look at 'user.wishlist'.
            - If asking for recommendations, look at 'menu' first (suggest specific dishes), then 'topRestaurants'.
            - When suggesting food, mention the Restaurant Name and Price.
            - If asking about specific food items, provide details from 'menu' context.
            - If the user asks something you don't know (not in context), gently say you can't help with that specific detail but offer general help.
            - Do not expose raw IDs or technical JSON structure to the user.
            - Format your response in clean Markdown (bold for names, lists for items).
            - Note: The current time is ${new Date().toLocaleString()}.
        `;

        console.log(`[ChatBot] Context prepared. Menu Items: ${contextData.menu?.length || 0}`);

        // 2. Call Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("[ChatBot] Missing GEMINI_API_KEY");
            return res.status(500).json({ message: "Server misconfiguration: Missing API Key" });
        }

        const modelName = "gemini-pro"; // Reverting to stable model for testing
        const model = genAI.getGenerativeModel({ model: modelName });

        try {
            console.log(`[ChatBot] Sending request to ${modelName}...`);
            const result = await model.generateContent([
                systemInstruction,
                `User: ${message} `
            ]);
            const responseText = result.response.text();
            console.log("[ChatBot] Success!");
            res.json({ reply: responseText });
        } catch (apiError) {
            console.error("[ChatBot] Gemini Error:", apiError.message);
            // Fallback logic could go here, but omitted for brevity in refactor
            res.status(500).json({ message: "AI Service Error", error: apiError.message });
        }

    } catch (error) {
        console.error("Chatbot Final Error:", error);
        res.status(500).json({ message: "Error processing chat request", error: error.message });
    }
};
