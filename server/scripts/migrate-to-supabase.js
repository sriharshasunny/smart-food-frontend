const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

// -- CONFIG --
const MONGO_URI = process.env.MONGO_URI;
// Credentials provided by user - normally put in .env but using directly here for the script as requested in prompt context
const SUPABASE_URL = 'https://ltxivswtwwixvwwylfae.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eGl2c3d0d3dpeHZ3d3lsZmFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE0OTUwNSwiZXhwIjoyMDg0NzI1NTA1fQ.ojzJKPZsVIv3gOtl6VWSyva5u1GoTr6-aCtF3dQI_y0';

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env');
    process.exit(1);
}

// -- MONGO MODELS --
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');

// -- SUPABASE CLIENT --
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// -- MAPS --
const userMap = new Map(); // MongoID -> SupabaseUUID
const restaurantMap = new Map(); // MongoID -> SupabaseUUID
const foodMap = new Map(); // MongoID -> SupabaseUUID

async function migrate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. MIGRATE USERS
        console.log('\n--- Migrating Users ---');
        const users = await User.find();
        console.log(`Found ${users.length} users in MongoDB.`);

        for (const user of users) {
            const { data, error } = await supabase
                .from('users')
                .insert({
                    mongo_id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    auth_provider: user.authProvider,
                    firebase_uid: user.firebaseUid
                })
                .select()
                .single();

            if (error) {
                console.error(`❌ Failed to migrate user ${user.email}:`, error.message);
            } else {
                userMap.set(user._id.toString(), data.id);
                // Migrate Addresses
                if (user.addresses && user.addresses.length > 0) {
                    const addressesToInsert = user.addresses.map(addr => ({
                        user_id: data.id,
                        label: addr.label,
                        street: addr.street,
                        city: addr.city,
                        state: addr.state,
                        zip: addr.zip,
                        country: addr.country,
                        is_default: addr.isDefault
                    }));
                    const { error: addrError } = await supabase.from('addresses').insert(addressesToInsert);
                    if (addrError) console.error(`  ⚠️ Failed to migrate addresses for ${user.email}:`, addrError.message);
                }
            }
        }
        console.log(`✅ Migrated Users. Mapped ${userMap.size} IDs.`);


        // 2. MIGRATE RESTAURANTS
        console.log('\n--- Migrating Restaurants ---');
        const restaurants = await Restaurant.find();
        console.log(`Found ${restaurants.length} restaurants in MongoDB.`);

        for (const rest of restaurants) {
            const { data, error } = await supabase
                .from('restaurants')
                .insert({
                    mongo_id: rest._id.toString(),
                    name: rest.name,
                    description: rest.description,
                    image: rest.image,
                    rating: rest.rating,
                    reviews_count: rest.reviewsCount,
                    cuisine: rest.cuisine,
                    delivery_time: rest.deliveryTime,
                    price_for_two: rest.priceForTwo,
                    delivery_fee: rest.deliveryFee,
                    // Check if location exists and has coordinates
                    latitude: rest.location?.coordinates?.[1] || null,
                    longitude: rest.location?.coordinates?.[0] || null,
                    address: rest.location?.address || '',
                    is_promoted: rest.isPromoted
                })
                .select()
                .single();

            if (error) {
                console.error(`❌ Failed to migrate restaurant ${rest.name}:`, error.message);
            } else {
                restaurantMap.set(rest._id.toString(), data.id);
            }
        }
        console.log(`✅ Migrated Restaurants. Mapped ${restaurantMap.size} IDs.`);


        // 3. MIGRATE FOOD ITEMS
        console.log('\n--- Migrating Food Items ---');
        const foods = await FoodItem.find();
        console.log(`Found ${foods.length} food items in MongoDB.`);

        const foodInserts = [];
        // Process in chunks or one by one? One by one allows ID mapping easily.
        for (const food of foods) {
            const newRestId = restaurantMap.get(food.restaurantId?.toString());
            if (!newRestId) {
                console.warn(`  ⚠️ Skipping food "${food.name}" - Restaurant ID ${food.restaurantId} not found in map.`);
                continue;
            }

            const { data, error } = await supabase
                .from('foods')
                .insert({
                    mongo_id: food._id.toString(),
                    restaurant_id: newRestId,
                    name: food.name,
                    description: food.description,
                    price: food.price,
                    image: food.image,
                    category: food.category,
                    is_veg: food.isVeg,
                    is_available: food.isAvailable,
                    rating: food.rating,
                    votes: food.votes
                })
                .select()
                .single();

            if (error) {
                console.error(`❌ Failed to migrate food ${food.name}:`, error.message);
            } else {
                foodMap.set(food._id.toString(), data.id);
            }
        }
        console.log(`✅ Migrated Food Items. Mapped ${foodMap.size} IDs.`);


        // 4. MIGRATE ORDERS
        console.log('\n--- Migrating Orders ---');
        const orders = await Order.find();
        console.log(`Found ${orders.length} orders in MongoDB.`);

        for (const order of orders) {
            const newUserId = userMap.get(order.userId?.toString());
            const newRestId = restaurantMap.get(order.restaurantId?.toString());

            // Order items needs resolving
            const orderItems = [];
            // Skip order items logic? Ideally we need a 'snapshot' in Order Items table.

            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    mongo_id: order._id.toString(),
                    user_id: newUserId || null, // Allow null for guest orders if logic supports
                    restaurant_id: newRestId || null,
                    guest_info: order.guestInfo,
                    total_amount: order.totalAmount,
                    currency: order.currency,
                    delivery_address: order.deliveryAddress,
                    payment_id: order.paymentId,
                    payment_status: order.paymentStatus,
                    order_status: order.orderStatus,
                    payment_link: order.paymentLink,
                    metadata: order.metadata,
                    created_at: order.createdAt,
                    delivered_at: order.deliveredAt
                })
                .select()
                .single();

            if (orderError) {
                console.error(`❌ Failed to migrate order ${order._id}:`, orderError.message);
                continue;
            }

            // Migrate Order Items
            if (order.items && order.items.length > 0) {
                const itemsToInsert = order.items.map(item => {
                    // Try to link to a live food item if possible, else null
                    const linkedFoodId = foodMap.get(item.product?.toString());
                    return {
                        order_id: orderData.id,
                        food_id: linkedFoodId || null,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.image
                    };
                });

                const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
                if (itemsError) {
                    console.error(`  ⚠️ Failed to migrate items for order ${order._id}:`, itemsError.message);
                }
            }
        }
        console.log(`✅ Migrated Orders.`);

        console.log('\n✨ MIGRATION COMPLETE ✨');
        process.exit(0);

    } catch (err) {
        console.error('FATAL ERROR:', err);
        process.exit(1);
    }
}

migrate();
