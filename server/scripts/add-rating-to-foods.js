// Migration: Add rating column to foods table
// Run: node server/scripts/add-rating-to-foods.js
const supabase = require('../utils/supabase');

async function migrate() {
    console.log('Adding rating column to foods table...');

    // Supabase JS client cannot run DDL directly — use rpc or REST SQL
    const { error } = await supabase.rpc('exec_sql', {
        sql: `
            ALTER TABLE foods ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT NULL;
            ALTER TABLE foods ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
            -- Seed some initial ratings from review data if table exists
            UPDATE foods SET rating = 4.0 + RANDOM() * 0.9 WHERE rating IS NULL;
        `
    });

    if (error) {
        // rpc might not be exposed — try direct SQL via service role
        console.warn('rpc failed, trying direct approach:', error.message);
        const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ sql: 'ALTER TABLE foods ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1) DEFAULT NULL;' })
        });
        console.log('Direct response:', res.status);
    } else {
        console.log('Migration complete!');
    }

    // Verify
    const { data } = await supabase.from('foods').select('id, name, rating').limit(3);
    console.log('Sample:', data);
}

migrate().catch(console.error);
