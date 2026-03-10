const supabase = require('./utils/supabase');

async function migrate() {
    console.log("🚀 Starting Database Migration: Order Items Enhancement");

    // We can't run raw SQL easily via JS client without RPC.
    // However, we can try to use a "kitchen sink" approach if they have a generic RPC,
    // or we'll have to ask the user to run the SQL in the dashboard.

    const sql = `
        -- Step 1: Add restaurant_id to order_items
        ALTER TABLE order_items ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id);
        
        -- Step 2: Add preparation_status to order_items
        ALTER TABLE order_items ADD COLUMN IF NOT EXISTS preparation_status TEXT DEFAULT 'Placed';
        
        -- Step 3: Populate restaurant_id for existing items where possible
        UPDATE order_items 
        SET restaurant_id = foods.restaurant_id
        FROM foods 
        WHERE order_items.food_id = foods.id 
        AND order_items.restaurant_id IS NULL;
    `;

    console.log("Please run the following SQL in your Supabase SQL Editor:");
    console.log("---------------------------------------------------------");
    console.log(sql);
    console.log("---------------------------------------------------------");
}

migrate();
