
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const seedData = async () => {
    console.log("🌱 Seeding Supabase Database...");

    try {
        // 1. Define Demo Restaurants
        const restaurants = [
            {
                name: "Spicy House",
                email: "spicy@gmail.com",
                password: "spicy@gmail.com",
                address: "Koramangala, Bangalore",
                cuisine: "Indian, Mughlai",
                rating: 4.5,
                image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
                is_active: true
            },
            {
                name: "Pizza Paradise",
                email: "pizza@gmail.com",
                password: "pizza@gmail.com",
                address: "Indiranagar, Bangalore",
                cuisine: "Italian, Fast Food",
                rating: 4.2,
                image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
                is_active: true
            },
            {
                name: "Sushi Master",
                email: "sushi@gmail.com",
                password: "sushi@gmail.com",
                address: "Jubilee Hills, Hyderabad",
                cuisine: "Japanese, Asian",
                rating: 4.8,
                image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
                is_active: true
            }
        ];

        // 2. Insert Restaurants & Get IDs
        const createdRestaurants = [];

        for (const r of restaurants) {
            // Check if exists to avoid duplicate error
            const { data: existing } = await supabase.from('restaurants').select('id').eq('email', r.email).single();

            if (existing) {
                console.log(`⚠️  ${r.name} already exists. Skipping...`);
                createdRestaurants.push({ ...r, id: existing.id });
            } else {
                const { data: newRest, error } = await supabase.from('restaurants').insert(r).select().single();
                if (error) {
                    console.error(`❌ Error creating ${r.name}:`, error.message);
                } else {
                    console.log(`✅ Created Restaurant: ${r.name}`);
                    createdRestaurants.push(newRest);
                }
            }
        }

        // 3. Define Food Items
        const foodItems = [
            // Spicy House
            {
                restaurant_email: "spicy@gmail.com",
                name: "Hyderabadi Chicken Biryani",
                description: "Aromatic basmati rice with tender chicken and authentic spices.",
                price: 250,
                image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80",
                category: "Main Course",
                is_veg: false,
                available: true
            },
            {
                restaurant_email: "spicy@gmail.com",
                name: "Paneer Butter Masala",
                description: "Soft paneer cubes in a rich, creamy tomato gravy.",
                price: 220,
                image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80",
                category: "Main Course",
                is_veg: true,
                available: true
            },
            // Pizza Paradise
            {
                restaurant_email: "pizza@gmail.com",
                name: "Pepperoni Feast",
                description: "Loaded with crispy pepperoni and mozzarella cheese.",
                price: 450,
                image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80",
                category: "Pizza",
                is_veg: false,
                available: true
            },
            {
                restaurant_email: "pizza@gmail.com",
                name: "Farmhouse Veggie",
                description: "Fresh bell peppers, onions, corn, and mushrooms.",
                price: 350,
                image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
                category: "Pizza",
                is_veg: true,
                available: true
            },
            // Sushi Master
            {
                restaurant_email: "sushi@gmail.com",
                name: "Salmon Nigiri",
                description: "Fresh salmon slice over seasoned sushi rice.",
                price: 600,
                image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
                category: "Japanese",
                is_veg: false,
                available: true
            }
        ];

        // 4. Insert Food Items
        for (const food of foodItems) {
            // Find restaurant ID
            const rest = createdRestaurants.find(r => r.email === food.restaurant_email);
            if (!rest) continue;

            // Prepare object
            const foodData = {
                restaurant_id: rest.id,
                name: food.name,
                description: food.description,
                price: food.price,
                image: food.image,
                category: food.category,
                is_veg: food.is_veg,
                available: food.available
            };

            // Check duplicate (simple check by name + rest_id)
            const { data: existingFood } = await supabase
                .from('foods')
                .select('id')
                .eq('restaurant_id', rest.id)
                .eq('name', food.name)
                .single();

            if (!existingFood) {
                const { error } = await supabase.from('foods').insert(foodData);
                if (error) console.error(`❌ Error creating food ${food.name}:`, error.message);
                else console.log(`   ✅ Added Food: ${food.name}`);
            } else {
                console.log(`   ⚠️  Food ${food.name} already exists.`);
            }
        }

        console.log("\n✨ Seeding Completed! You can now login as:");
        console.log("   📧 spicy@gmail.com / spicy@gmail.com");
        console.log("   📧 pizza@gmail.com / pizza@gmail.com");
        console.log("   📧 sushi@gmail.com / sushi@gmail.com");

    } catch (error) {
        console.error("🔥 Critical Seeding Error:", error);
    }
};

seedData();
