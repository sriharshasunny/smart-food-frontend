const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase Credentials (checked SUPABASE_URL, and KEYS)");
    console.log("Env Path used:", path.join(__dirname, '../../.env'));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const setupTables = async () => {
    console.log("Attempting to set up tables via SQL RPC (if available) or checking access...");

    // Note: Standard Supabase JS client CANNOT create tables directly without a custom Postgres Function (RPC).
    // However, we can try to inspect if tables exist or just log the SQL needed.
    // If we have a 'query' rpc, we can use it.

    const sql = `
    -- 1. Create Restaurants Table
    create table if not exists restaurants (
        id uuid default gen_random_uuid() primary key,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        name text not null,
        email text unique not null,
        password text not null, -- Plaintext for demo/legacy consistency
        address text,
        cuisine text,
        rating numeric default 0,
        image text
    );

    -- 2. Create Foods Table
    create table if not exists foods (
        id uuid default gen_random_uuid() primary key,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        restaurant_id uuid references restaurants(id) on delete cascade not null,
        name text not null,
        price numeric not null,
        description text,
        image text,
        category text,
        is_veg boolean default true,
        available boolean default true
    );
    `;

    console.log("----------------------------------------------------------------");
    console.log("IMPORTANT: Please run the following SQL in your Supabase SQL Editor:");
    console.log("----------------------------------------------------------------");
    console.log(sql);
    console.log("----------------------------------------------------------------");

    // Try to run a dummy select to see if they already exist
    const { error: rError } = await supabase.from('restaurants').select('count').limit(1);
    const { error: fError } = await supabase.from('foods').select('count').limit(1);

    if (rError) console.log("Restaurants table likely does not exist or not accessible.");
    else console.log("Restaurants table exists.");

    if (fError) console.log("Foods table likely does not exist or not accessible.");
    else console.log("Foods table exists.");
};

setupTables();
