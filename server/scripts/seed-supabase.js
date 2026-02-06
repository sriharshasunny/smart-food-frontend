const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials!');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const restaurants = [
    { name: "Spice Garden", description: "Authentic Indian Spices", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", rating: 4.5, cuisine: ["Indian", "Mughlai"], delivery_time: "30-40 min", price_for_two: 500, address: "Koramangala, Bangalore" },
    { name: "Sushi Master", description: "Best Sushi in Town", image: "/assets/generated/rest_sushi_bar_1767519652742.png", rating: 4.8, cuisine: ["Japanese", "Sushi"], delivery_time: "45-60 min", price_for_two: 1200, address: "UB City, Bangalore" },
    { name: "Burger King", description: "Flame Grilled Burgers", image: "/assets/generated/rest_modern_diner_1767519597763.png", rating: 4.2, cuisine: ["Burgers", "Fast Food"], delivery_time: "20-35 min", price_for_two: 400, address: "Indiranagar, Bangalore" },
    { name: "Italian Delight", description: "Authentic Italian Pizza & Pasta", image: "/assets/generated/rest_pizzeria_1767519676316.png", rating: 4.7, cuisine: ["Italian", "Pizza"], delivery_time: "40-55 min", price_for_two: 900, address: "Whitefield, Bangalore" },
    { name: "Wok & Roll", description: "Asian Stir Fry & Dim Sum", image: "/assets/generated/rest_modern_diner_1767519597763.png", rating: 4.4, cuisine: ["Chinese", "Asian"], delivery_time: "25-40 min", price_for_two: 700, address: "HSR Layout, Bangalore" },
    { name: "Dosa Plaza", description: "Crispy Dosas & South Indian", image: "/assets/generated/rest_cozy_cafe_retry_1767519775895.png", rating: 4.3, cuisine: ["South Indian", "Veg"], delivery_time: "25-40 min", price_for_two: 300, address: "Jayanagar, Bangalore" },
    { name: "Pizza Hut", description: "Pizzas, Wings & Pasta", image: "/assets/generated/rest_pizzeria_1767519676316.png", rating: 4.1, cuisine: ["Pizza", "Fast Food"], delivery_time: "30-45 min", price_for_two: 500, address: "MG Road, Bangalore" },
    { name: "Healthy Bites", description: "Salads, Smoothies & Bowls", image: "/assets/generated/rest_cozy_cafe_retry_1767519775895.png", rating: 4.6, cuisine: ["Healthy", "Salads"], delivery_time: "20-30 min", price_for_two: 550, address: "Kormangala, Bangalore" }
];

const foodItems = [
    // Spice Garden
    { restaurant: "Spice Garden", name: "Hyderabadi Chicken Biryani", price: 320, description: "Aromatic basmati rice cooked with tender chicken and spices.", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80", category: "Biryani", rating: 4.8, is_veg: false },
    { restaurant: "Spice Garden", name: "Butter Chicken", price: 290, description: "Creamy tomato curry with tender chicken pieces.", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80", category: "Curry", rating: 4.7, is_veg: false },

    // Sushi Master
    { restaurant: "Sushi Master", name: "Salmon Nigiri", price: 450, description: "Fresh salmon over pressed vinegared rice.", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80", category: "Sushi", rating: 4.9, is_veg: false },
    { restaurant: "Sushi Master", name: "California Roll", price: 380, description: "Crab, avocado, and cucumber roll.", image: "/assets/food/california_roll.png", category: "Sushi", rating: 4.6, is_veg: false },

    // Burger King
    { restaurant: "Burger King", name: "Chicken Royale", price: 190, description: "Crispy chicken breast with lettuce.", image: "/assets/food/chicken_royale.png", category: "Burger", rating: 4.4, is_veg: false },
    { restaurant: "Burger King", name: "Veggie Burger", price: 170, description: "Plant-based patty with fresh veggies.", image: "/assets/food/veggie_burger.png", category: "Burger", rating: 4.3, is_veg: true },

    // Italian Delight
    { restaurant: "Italian Delight", name: "Carbonara Pasta", price: 420, description: "Creamy pasta with bacon and egg.", image: "/assets/food/carbonara_pasta.png", category: "Pasta", rating: 4.7, is_veg: false },
    { restaurant: "Italian Delight", name: "Lasagna", price: 480, description: "Layered pasta with meat sauce and cheese.", image: "/assets/food/lasagna.png", category: "Pasta", rating: 4.8, is_veg: false },

    // Wok & Roll
    { restaurant: "Wok & Roll", name: "Veggie Spring Rolls", price: 180, description: "Crispy rolls filled with vegetables.", image: "/assets/food/veggie_spring_rolls.png", category: "Starters", rating: 4.4, is_veg: true },

    // Dosa Plaza
    { restaurant: "Dosa Plaza", name: "Rava Dosa", price: 130, description: "Crispy semolina crepe with spices.", image: "/assets/food/rava_dosa.png", category: "Dosa", rating: 4.7, is_veg: true },
    { restaurant: "Dosa Plaza", name: "Masala Dosa", price: 120, description: "Crispy crepe filled with potato masala.", image: "/assets/food/masala_dosa.png", category: "Dosa", rating: 4.8, is_veg: true },

    // Pizza Hut
    { restaurant: "Pizza Hut", name: "Veggie Supreme", price: 420, description: "Loaded with fresh vegetables.", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80", category: "Pizza", rating: 4.5, is_veg: true },

    // Healthy Bites
    { restaurant: "Healthy Bites", name: "Avocado Toast", price: 250, description: "Toasted bread with mashed avocado.", image: "/assets/food/avocado_toast.png", category: "Breakfast", rating: 4.8, is_veg: true },
    { restaurant: "Healthy Bites", name: "Green Smoothie", price: 180, description: "Blend of spinach, apple, and ginger.", image: "/assets/food/green_smoothie.png", category: "Smoothie", rating: 4.6, is_veg: true },
    { restaurant: "Healthy Bites", name: "Fruit Parfait", price: 160, description: "Yogurt layered with fresh berries.", image: "/assets/food/fruit_parfait.png", category: "Dessert", rating: 4.8, is_veg: true }
];

async function seed() {
    console.log('🌱 Seeding Supabase...');

    for (const rest of restaurants) {
        // 1. Check if restaurant exists
        let { data: existingRest, error: fetchError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('name', rest.name)
            .single();

        let restId;

        if (existingRest) {
            console.log(`ℹ️  Restaurant exists: ${rest.name}`);
            restId = existingRest.id;
        } else {
            const { data: newRest, error: insertError } = await supabase
                .from('restaurants')
                .insert(rest)
                .select()
                .single();

            if (insertError) {
                console.error(`❌ Error inserting restaurant ${rest.name}:`, insertError.message);
                continue;
            }
            console.log(`✅ Created Restaurant: ${rest.name}`);
            restId = newRest.id;
        }

        // 2. Process Food Items
        const items = foodItems.filter(f => f.restaurant === rest.name);
        for (const item of items) {
            const { restaurant, ...foodData } = item;

            // Check if food exists
            const { data: existingFood } = await supabase
                .from('food_items')
                .select('id')
                .eq('name', item.name)
                .eq('restaurant_id', restId)
                .single();

            if (existingFood) {
                await supabase
                    .from('food_items')
                    .update({ ...foodData, restaurant_id: restId })
                    .eq('id', existingFood.id);
                console.log(`  Updated Food: ${item.name}`);
            } else {
                const { error: foodError } = await supabase
                    .from('food_items')
                    .insert({ ...foodData, restaurant_id: restId });

                if (foodError) {
                    console.error(`  ❌ Error inserting food ${item.name}:`, foodError.message);
                } else {
                    console.log(`  🍔 Created Food: ${item.name}`);
                }
            }
        }
    }

    console.log('✨ Seeding complete.');
}

seed();
