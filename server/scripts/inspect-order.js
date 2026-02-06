const supabase = require('../utils/supabase');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function inspectOrder() {
    console.log("=== Inspecting Specific Order ===");

    // We search for the ID start shown in screenshot
    const prefix = 'd06bc167';

    // 1. Get full ID (using cast to text for like query)
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .textSearch('id', prefix, { type: 'websearch', config: 'english' }) // TextSearch might not work for UUIDs directly either
    // Better: List all and find in JS for debugging strictly, OR cast

    // Actually, Supabase doesn't easily support casting in JS client without RPC.
    // Let's just fetch recent orders and find it.

    const { data: recentOrders, error: listError } = await supabase
        .from('orders')
        .select('*')
        .limit(20)
        .order('created_at', { ascending: false });

    if (listError) { console.error(listError); return; }

    const targetOrder = recentOrders.find(o => o.id.includes(prefix));

    if (!targetOrder) {
        console.log(`No order found starting with ${prefix} in recent 20 orders.`);
        return;
    }
    console.log(`Found Order: ${targetOrder.id}`);
    console.log(`User: ${targetOrder.user_id}`);
    console.log(`Total: ${targetOrder.total_amount}`);

    // 2. Check Items
    const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', targetOrder.id);

    if (itemsError) {
        console.log("Error fetching items:", itemsError);
    } else {
        console.log(`Item Count: ${items.length}`);
        if (items.length > 0) {
            items.forEach(i => console.log(` - ${i.name} (Qty: ${i.quantity})`));
        } else {
            console.log("⚠️ THIS ORDER HAS NO ITEMS IN DB.");
        }
    }
}

inspectOrder();
