const supabase = require('../utils/supabase');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const updates = [
    { name: 'Chicken Royale', image: '/assets/food/chicken_royale.png' },
    { name: 'Carbonara Pasta', image: '/assets/food/carbonara_pasta.png' },
    { name: 'Lasagna', image: '/assets/food/lasagna.png' },
    { name: 'Veggie Spring Rolls', image: '/assets/food/veggie_spring_rolls.png' },
    { name: 'Rava Dosa', image: '/assets/food/rava_dosa.png' },
    { name: 'Avocado Toast', image: '/assets/food/avocado_toast.png' },
    { name: 'Green Smoothie', image: '/assets/food/green_smoothie.png' },
    { name: 'Fruit Parfait', image: '/assets/food/fruit_parfait.png' }
];

async function updateImages() {
    console.log(`Starting update for ${updates.length} items...`);

    // We need to prepend the CLIENT_URL if we want full URLs, 
    // or just use relative paths if the frontend handles it.
    // Given the previous setup, the DB likely stores full URLs for external images.
    // For local assets, relative paths are better if the frontend is the consumer.
    // However, if we want them to "appear", and they are on the frontend domain...
    // Let's rely on relative paths and assume frontend <img src={...} /> allows it.
    // OR, better, use the full Vercel URL.

    // Let's use relative for now, as it's cleaner for same-domain hosting.
    // But wait, the backend might handle it? No, frontend renders it.

    for (const item of updates) {
        // Need to find by name - names might not be unique globally but unique per restaurant?
        // Let's try to update all instances with this name.

        const { data, error } = await supabase
            .from('foods')
            .update({ image: item.image })
            .ilike('name', item.name) // Case insensitive match
            .select();

        if (error) {
            console.error(`Error updating ${item.name}:`, error.message);
        } else if (data.length === 0) {
            console.warn(`No items found for ${item.name}`);
        } else {
            console.log(`Updated ${data.length} items for ${item.name} -> ${item.image}`);
        }
    }
}

updateImages();
