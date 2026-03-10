// Seed ratings into foods table using JS client (no DDL needed).
// This script assumes the 'rating' column already exists (created via Supabase SQL Editor).
// Run this AFTER running the SQL in Supabase:
//   ALTER TABLE foods ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1);
//   ALTER TABLE foods ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

require('dotenv').config({ path: '../.env' });
const supabase = require('../utils/supabase');

async function seedRatings() {
    const { data: foods, error } = await supabase.from('foods').select('id, name');
    if (error) { console.error('Error fetching foods:', error.message); return; }

    console.log(`Seeding ratings for ${foods.length} food items...`);
    let done = 0;

    for (const food of foods) {
        const rating = parseFloat((3.5 + Math.random() * 1.4).toFixed(1)); // 3.5 – 4.9
        const reviews = Math.floor(50 + Math.random() * 950);
        const { error: ue } = await supabase.from('foods').update({ rating, reviews_count: reviews }).eq('id', food.id);
        if (ue) console.warn(`  ✗ ${food.name}:`, ue.message);
        else { console.log(`  ✓ ${food.name} → ${rating} ⭐ (${reviews} reviews)`); done++; }
    }

    console.log(`\nDone! Seeded ${done}/${foods.length} items.`);
}

seedRatings();
