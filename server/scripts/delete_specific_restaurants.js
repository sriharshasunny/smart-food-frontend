const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials in .env");
    console.error("URL:", supabaseUrl ? "Found" : "Missing");
    console.error("Key:", supabaseKey ? "Found" : "Missing");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const emailsToDelete = [
    'VerifyTest_1770643150168@gmail.com',
    'restaurant_d3a0ca46-1975-40c7-b72a-5232652e140c@example.com',
    'restaurant_f9ee75d2-918b-4f57-a48c-1fd3775633b8@example.com',
    'restaurant_febeaa61-0b4c-4479-b3f3-0529c6f2dcdd@example.com'
];

async function deleteSpecificRestaurants() {
    console.log("🧹 Starting targeted cleanup...");

    try {
        // 1. Find them first to confirm validity
        const { data: found, error: findError } = await supabase
            .from('restaurants')
            .select('id, name, email')
            .in('email', emailsToDelete);

        if (findError) throw findError;

        if (!found || found.length === 0) {
            console.log("ℹ️ None of the specified restaurants were found.");
            return;
        }

        console.log(`🔎 Found ${found.length} restaurants to delete:`);
        found.forEach(r => console.log(`   - ${r.name} (${r.email})`));

        // 2. Delete
        const idsToDelete = found.map(r => r.id);
        const { error: deleteError } = await supabase
            .from('restaurants')
            .delete()
            .in('id', idsToDelete);

        if (deleteError) throw deleteError;

        console.log(`✅ Successfully deleted ${found.length} restaurants.`);

    } catch (error) {
        console.error("❌ Cleanup failed:", error.message);
    }
}

deleteSpecificRestaurants();
