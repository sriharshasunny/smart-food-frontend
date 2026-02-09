require('dotenv').config({ path: '../../.env' });
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Ensure proper env loading
const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Key for writes

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const MENU_TEMPLATES = {
    'Indian': [
        { name: "Butter Chicken", price: 350, description: "Creamy tomato gravy with tender chicken", category: "Main Course", is_veg: false, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=60" },
        { name: "Paneer Tikka Masala", price: 280, description: "Cottage cheese in spiced curry", category: "Main Course", is_veg: true, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=500&q=60" },
        { name: "Garlic Naan", price: 60, description: "Clay oven baked bread with garlic", category: "Breads", is_veg: true, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=500&q=60" },
        { name: "Chicken Biryani", price: 320, description: "Aromatic basmati rice with chicken", category: "Rice", is_veg: false, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=500&q=60" },
        { name: "Dal Makhani", price: 240, description: "Slow cooked black lentils", category: "Main Course", is_veg: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=60" },
        { name: "Tandoori Chicken", price: 400, description: "Roasted chicken marinated in yogurt", category: "Starters", is_veg: false, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=500&q=60" },
        { name: "Gulab Jamun", price: 120, description: "Sweet milk solids in sugar syrup", category: "Dessert", is_veg: true, image: "https://images.unsplash.com/photo-1616031036573-200799442a8b?auto=format&fit=crop&w=500&q=60" },
        { name: "Mango Lassi", price: 90, description: "Yogurt based mango drink", category: "Beverages", is_veg: true, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=500&q=60" },
        { name: "Samosa", price: 40, description: "Fried pastry with savory filling", category: "Starters", is_veg: true, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=60" },
        { name: "Raita", price: 60, description: "Yogurt side dish", category: "Sides", is_veg: true, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=500&q=60" }
    ],
    'Chinese': [
        { name: "Hakka Noodles", price: 210, description: "Stir fried noodles with veggies", category: "Noodles", is_veg: true, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=60" },
        { name: "Kung Pao Chicken", price: 320, description: "Spicy stir-fry with peanuts", category: "Main Course", is_veg: false, image: "https://images.unsplash.com/photo-1525755662778-989d977990dd?auto=format&fit=crop&w=500&q=60" },
        { name: "Spring Rolls", price: 180, description: "Crispy rolls with veggie filling", category: "Starters", is_veg: true, image: "https://images.unsplash.com/photo-1544025162-d76690b67f11?auto=format&fit=crop&w=500&q=60" },
        { name: "Fried Rice", price: 220, description: "Wok tossed rice with veggies", category: "Rice", is_veg: true, image: "https://images.unsplash.com/photo-1603133872878-684f571b70f2?auto=format&fit=crop&w=500&q=60" },
        { name: "Manchurian", price: 240, description: "Veggie balls in soy garlic sauce", category: "Main Course", is_veg: true, image: "https://images.unsplash.com/photo-1567332205023-baaca046b63d?auto=format&fit=crop&w=500&q=60" },
        { name: "Dim Sims", price: 200, description: "Steamed dumplings", category: "Starters", is_veg: false, image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=500&q=60" },
        { name: "Sweet Corn Soup", price: 140, description: "Creamy corn soup", category: "Soups", is_veg: true, image: "https://images.unsplash.com/photo-1547592166-23acbe346499?auto=format&fit=crop&w=500&q=60" },
        { name: "Chili Chicken", price: 290, description: "Spicy crispy chicken", category: "Starters", is_veg: false, image: "https://images.unsplash.com/photo-1617692855027-33b14f061079?auto=format&fit=crop&w=500&q=60" },
        { name: "Szechuan Beef", price: 350, description: "Tender beef in spicy sauce", category: "Main Course", is_veg: false, image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=500&q=60" },
        { name: "Fortune Cookie", price: 20, description: "Crispy cookie with a message", category: "Dessert", is_veg: true, image: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=500&q=60" }
    ],
    'American': [
        { name: "Cheeseburger", price: 250, description: "Juicy beef patty with cheese", category: "Burgers", is_veg: false, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60" },
        { name: "Pepperoni Pizza", price: 450, description: "Classic pizza with pepperoni slices", category: "Pizza", is_veg: false, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=60" },
        { name: "French Fries", price: 120, description: "Golden crispy potato fries", category: "Sides", is_veg: true, image: "https://images.unsplash.com/photo-1630384060421-a4323ceca90d?auto=format&fit=crop&w=500&q=60" },
        { name: "Buffalo Wings", price: 300, description: "Spicy chicken wings", category: "Starters", is_veg: false, image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=500&q=60" },
        { name: "Mac and Cheese", price: 220, description: "Pasta in creamy cheese sauce", category: "Main Course", is_veg: true, image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=500&q=60" },
        { name: "Caesar Salad", price: 190, description: "Lettuce with caesar dressing", category: "Salads", is_veg: true, image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=500&q=60" },
        { name: "Grilled Cheese", price: 150, description: "Toasted bread with melted cheese", category: "Sandwiches", is_veg: true, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=500&q=60" },
        { name: "Hot Dog", price: 180, description: "Sausage in a bun", category: "Fast Food", is_veg: false, image: "https://images.unsplash.com/photo-1612392062631-94dd858cba88?auto=format&fit=crop&w=500&q=60" },
        { name: "Chocolate Brownie", price: 140, description: "Rich chocolate dessert", category: "Dessert", is_veg: true, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476d?auto=format&fit=crop&w=500&q=60" },
        { name: "Cola", price: 60, description: "Chilled soda", category: "Beverages", is_veg: true, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=60" }
    ],
    // Default fallback
    'Multi-Cuisine': [
        { name: "Mixed Veg Curry", price: 240, description: "Seasonal vegetables in gravy", category: "Main Course", is_veg: true, image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=60" },
        { name: "Chicken Sandwich", price: 180, description: "Grilled chicken in sandwich bread", category: "Sandwiches", is_veg: false, image: "https://images.unsplash.com/photo-1606756817165-1cdd164785b6?auto=format&fit=crop&w=500&q=60" },
        { name: "Veg Burger", price: 160, description: "Vegetable patty burger", category: "Burgers", is_veg: true, image: "https://images.unsplash.com/photo-1550547660-d94a5e013a7c?auto=format&fit=crop&w=500&q=60" },
        { name: "Pasta Alfredo", price: 290, description: "White sauce pasta", category: "Main Course", is_veg: true, image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=500&q=60" },
        { name: "Chocolate Cake", price: 150, description: "Slice of rich chocolate cake", category: "Dessert", is_veg: true, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=60" },
        { name: "Coffee", price: 80, description: "Hot brewed coffee", category: "Beverages", is_veg: true, image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=500&q=60" },
        { name: "Omelette", price: 100, description: "Egg omelette with veggies", category: "Breakfast", is_veg: false, image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=500&q=60" },
        { name: "Pancakes", price: 180, description: "Fluffy pancakes with syrup", category: "Breakfast", is_veg: true, image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=500&q=60" },
        { name: "Fish and Chips", price: 380, description: "Fried fish with fries", category: "Main Course", is_veg: false, image: "https://images.unsplash.com/photo-1579208530378-8f6274211507?auto=format&fit=crop&w=500&q=60" },
        { name: "Ice Cream", price: 120, description: "Vanilla scoop", category: "Dessert", is_veg: true, image: "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?auto=format&fit=crop&w=500&q=60" }
    ]
};

async function seedMenus() {
    console.log("🌱 Starting menu seeding...");

    try {
        // 1. Get All Restaurants
        const { data: restaurants, error: rError } = await supabase
            .from('restaurants')
            .select('id, name, cuisine, is_active');

        if (rError) throw rError;
        console.log(`🔎 Found ${restaurants.length} restaurants to inspect.`);

        let totalAdded = 0;

        for (const rest of restaurants) {
            // 2. Check existing menu count
            const { count, error: cError } = await supabase
                .from('foods')
                .select('*', { count: 'exact', head: true })
                .eq('restaurant_id', rest.id);

            if (cError) continue;

            if (count >= 5) {
                console.log(`⏩ Skipping ${rest.name}: Already has ${count} items.`);
                continue;
            }

            console.log(`🍽️ Seeding menu for ${rest.name} (${rest.cuisine})...`);

            // 3. Determine Template
            let templateName = 'Multi-Cuisine';
            // Simple match for cuisine keywords
            const cuisineLower = (Array.isArray(rest.cuisine) ? rest.cuisine.join(' ') : rest.cuisine || '').toLowerCase();
            if (cuisineLower.includes('indian')) templateName = 'Indian';
            else if (cuisineLower.includes('chinese') || cuisineLower.includes('asian')) templateName = 'Chinese';
            else if (cuisineLower.includes('burger') || cuisineLower.includes('pizza') || cuisineLower.includes('fast')) templateName = 'American';

            const itemsToAdd = MENU_TEMPLATES[templateName].map(item => ({
                restaurant_id: rest.id,
                ...item,
                available: true
            }));

            const { error: insertError } = await supabase
                .from('foods')
                .insert(itemsToAdd);

            if (insertError) {
                console.error(`❌ Failed to seed ${rest.name}:`, insertError.message);
            } else {
                console.log(`✅ Added ${itemsToAdd.length} items to ${rest.name}`);
                totalAdded += itemsToAdd.length;
            }
        }

        console.log(`✨ Seeding complete! Added ${totalAdded} new food items.`);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
    }
}

seedMenus();
