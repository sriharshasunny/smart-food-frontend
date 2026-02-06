const supabase = require('../utils/supabase');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testInvoiceEndpoint() {
    console.log("=== Testing Invoice API Endpoint ===");

    // 1. Fetch a real order ID from DB to test with
    const { data: orders, error } = await supabase
        .from('orders')
        .select('id')
        .limit(1);

    if (error || !orders || orders.length === 0) {
        console.error("❌ No orders found in DB to test with. Please create an order first.");
        return;
    }

    const testOrderId = orders[0].id; // Should be UUID
    console.log(`Using Order ID: ${testOrderId}`);

    // 2. Fetch from API
    try {
        // Native fetch in Node 18+
        const response = await fetch(`http://localhost:5000/api/orders/${testOrderId}`);

        console.log(`Response Status: ${response.status}`);

        if (response.ok) {
            const data = await response.json();
            console.log("✅ API Success! Returned Order Data:");
            console.log(`   - ID: ${data.id}`);
            console.log(`   - Total: ${data.total_amount}`);
            if (data.order_items && data.order_items.length > 0) {
                console.log("   - Item Names:");
                data.order_items.forEach(item => console.log(`     * ${item.name} (Qty: ${item.quantity})`));
            } else {
                console.log("   - No items found.");
            }
        } else {
            console.error("❌ API Failed:", await response.text());
        }

    } catch (e) {
        console.error("❌ Network/Fetch Error:", e.message);
    }
}

testInvoiceEndpoint();
