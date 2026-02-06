require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addActiveColumn() {
    console.log("Checking 'restaurants' table for 'is_active' column...");

    try {
        // 1. Try to select it to see if it exists
        const { data, error } = await supabase.from('restaurants').select('is_active').limit(1);

        if (error || !data) {
            console.log("Column likely missing or query failed. Attempting to add via raw SQL is not supported comfortably here without RLS bypass or stored proc.");
            console.log("NOTE: Supabase JS Client cannot alter table schema directly.");
            console.log("Please run this SQL in Supabase Dashboard SQL Editor:");
            console.log(`
                ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
            `);
        } else {
            console.log("Column 'is_active' seems to exist.");
        }

        // ALTERNATIVE: Since we can't run DDL via JS Client easily, we have to rely on the user or existing schema.
        // However, if we are in 'postgres' role we might connect via pg driver. 
        // For this environment, I will assume I might need to just instruct the user if I can't do it.
        // BUT, I can try to use a "rpc" if one exists, or just hope the previous setup did it.

        // Let's try to just INSERT with is_active and see if it fails.
    } catch (e) {
        console.error(e);
    }
}

// Actually, I can't easily ALTER table from here without a postgres connection string (which I might not have, only HTTP API).
// I will SKIP the script execution and just UPDATING the backend to handle "undefined" as active.
// Or I'll verify if I can Update the schema. 
// Plan B: I will update the Implementation Plan to note that 'is_active' is assumed.
// Wait, if I can't add the column, the feature won't persist.
// Most Supabase setups allow Schema edit in Dashboard.
// I will implement the code expecting it. If it fails, I'll notify user.

console.log("Migration check skipped. Please ensure 'is_active' boolean column exists in 'restaurants' table.");
