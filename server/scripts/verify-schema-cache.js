
const supabase = require('../utils/supabase');
require('dotenv').config({ path: '../.env' });

async function verifySchema() {
    console.log("🔍 Checking 'restaurants' table schema...");

    try {
        // Try to select the 'email' column specifically
        const { data, error } = await supabase
            .from('restaurants')
            .select('email')
            .limit(1);

        if (error) {
            console.error("❌ Error accessing 'email' column:", error);
            if (error.message.includes('schema cache')) {
                console.log("\n⚠️  CONFIRMED: The Database Schema Cache is stale.");
                console.log("👉 You MUST run the SQL command: NOTIFY pgrst, 'reload schema';");
            }
        } else {
            console.log("✅ 'email' column exists and is accessible locally.");
            console.log("If it fails on Render, it means Render's connection is hitting a stale cache node or the user needs to reload.");
        }

    } catch (e) {
        console.error("Unexpected error:", e);
    }
}

verifySchema();
