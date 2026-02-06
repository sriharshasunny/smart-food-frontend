const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;
const SUPABASE_URL = 'https://ltxivswtwwixvwwylfae.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eGl2c3d0d3dpeHZ3d3lsZmFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE0OTUwNSwiZXhwIjoyMDg0NzI1NTA1fQ.ojzJKPZsVIv3gOtl6VWSyva5u1GoTr6-aCtF3dQI_y0';

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verify() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n--- VERIFICATION REPORT ---');

        // Users
        const mongoUsers = await User.countDocuments();
        const { count: supabaseUsers, error: uErr } = await supabase.from('users').select('*', { count: 'exact', head: true });
        console.log(`Users: Mongo(${mongoUsers}) vs Supabase(${supabaseUsers}) -> ${mongoUsers === supabaseUsers ? '✅ MATCH' : '❌ MISMATCH'}`);
        if (uErr) console.error(uErr);

        // Restaurants
        const mongoRest = await Restaurant.countDocuments();
        const { count: supabaseRest, error: rErr } = await supabase.from('restaurants').select('*', { count: 'exact', head: true });
        console.log(`Restaurants: Mongo(${mongoRest}) vs Supabase(${supabaseRest}) -> ${mongoRest === supabaseRest ? '✅ MATCH' : '❌ MISMATCH'}`);

        // Food Items
        const mongoFood = await FoodItem.countDocuments();
        const { count: supabaseFood, error: fErr } = await supabase.from('food_items').select('*', { count: 'exact', head: true });
        console.log(`Food Items: Mongo(${mongoFood}) vs Supabase(${supabaseFood}) -> ${mongoFood === supabaseFood ? '✅ MATCH' : '❌ MISMATCH'}`);

        // Orders
        const mongoOrder = await Order.countDocuments();
        const { count: supabaseOrder, error: oErr } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        console.log(`Orders: Mongo(${mongoOrder}) vs Supabase(${supabaseOrder}) -> ${mongoOrder === supabaseOrder ? '✅ MATCH' : '❌ MISMATCH'}`);

        console.log('\n---------------------------');
        process.exit(0);

    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
}

verify();
