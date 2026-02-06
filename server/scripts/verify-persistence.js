const supabase = require('../utils/supabase');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function runTest() {
    console.log("=== Persistence Verification Check ===");

    // 1. Pick a User (Vinny or Harsha or similar)
    // Let's create a temporary user to be safe
    const email = `test_persist_${Date.now()}@example.com`;
    const { data: user, error: userError } = await supabase.from('users').insert({
        email, name: 'Persistence Tester', auth_provider: 'local'
    }).select().single();

    if (userError) {
        console.error("User Create Failed:", userError);
        return;
    }
    console.log(`Created User: ${user.name} (${user.email}) ID: ${user.id}`);

    // 2. Add Item to Cart (Simulate API Call)
    // Need a food item first
    const { data: food } = await supabase.from('food_items').select('id').limit(1).single();
    if (!food) {
        console.error("No food items found to test with.");
        return;
    }
    console.log(`Testing with Food Item: ${food.id}`);

    console.log("-- Syncing Cart --");
    // Simulate what userController.syncCart does
    const cartPayload = [{ food_id: food.id, quantity: 2, notes: 'Test Note', user_id: user.id }];
    const { error: cartError } = await supabase.from('cart_items').insert(cartPayload);

    if (cartError) console.error("Cart Sync Failed:", cartError);
    else console.log("Cart synced to DB.");

    // 3. Add Item to Wishlist
    console.log("-- Toggling Wishlist --");
    const { error: wishError } = await supabase.from('wishlist_items').insert({ user_id: user.id, food_id: food.id });
    if (wishError) console.error("Wishlist Sync Failed:", wishError);
    else console.log("Wishlist synced to DB.");

    // 4. VERIFY: Read back from DB
    console.log("... Reading back data ...");

    const { data: savedCart } = await supabase.from('cart_items').select('*').eq('user_id', user.id);
    const { data: savedWish } = await supabase.from('wishlist_items').select('*').eq('user_id', user.id);

    console.log(`Cart Items Found: ${savedCart.length}`);
    console.log(`Wishlist Items Found: ${savedWish.length}`);

    if (savedCart.length > 0 && savedWish.length > 0) {
        console.log("✅ PERSISTENCE CONFIRMED: Items are safely stored in DB linked to User ID.");
    } else {
        console.error("❌ PERSISTENCE FAILED: Data not found.");
    }

    // Cleanup
    await supabase.from('users').delete().eq('id', user.id);
}

runTest();
