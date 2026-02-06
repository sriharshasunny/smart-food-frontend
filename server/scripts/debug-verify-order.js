const supabase = require('../utils/supabase');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

// Load Env
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function runTest() {
    console.log("Starting Verification Debug Test used id:", crypto.randomUUID());

    const testOrderId = crypto.randomUUID();
    const testPaymentId = "pay_" + crypto.randomUUID();

    // 1. Create a Dummy Order
    console.log("Creating dummy order...");
    const { data: order, error: createError } = await supabase
        .from('orders')
        .insert({
            id: testOrderId,
            user_id: null,
            guest_info: { key: 'value', email: 'test@example.com' }, // Ensure valid JSONB
            total_amount: 100,
            currency: 'INR',
            payment_status: 'Pending',
            order_status: 'Placed'
        })
        .select()
        .single();

    if (createError) {
        console.error("Failed to create dummy order:", createError);
        return;
    }
    console.log("Dummy Order Created:", order.id);

    // 2. Simulate Verify Request (Directly Calling Controller Logic mostly)
    // Actually, let's call the endpoint using fetch to test full stack if server is running? 
    // Or just invoke logic. To reproduce specific bug, let's try to mimic controller logic manually first 
    // or send request to localhost if running. 
    // Since I can't rely on server running, I will import controller? 
    // Controller imports emailService etc. proper context needed.
    // Let's just use fetch if port 5000 is likely active.

    try {
        console.log("Sending Verify Request to http://localhost:5000/api/orders/verify...");
        const res = await fetch('http://localhost:5000/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: testOrderId,
                paymentId: testPaymentId
            })
        });

        const data = await res.json();
        console.log("Response Status:", res.status);
        console.log("Response Body:", JSON.stringify(data, null, 2));

        if (!res.ok) {
            console.error("Verification failed from API perspective.");
        } else {
            console.log("Verification SUCCESS!");
        }

    } catch (e) {
        console.error("Fetch failed (Server might not be running):", e.message);

        // Fallback: Test logic directly via Supabase if fetch fails
        console.log("--- Fallback: Testing DB Update directly ---");
        const { data: verifyUpdate, error: verifyError } = await supabase
            .from('orders')
            .update({
                payment_status: 'Completed',
                order_status: 'Confirmed',
                payment_id: testPaymentId
            })
            .eq('id', testOrderId)
            .select()
            .single();

        if (verifyError) console.error("Direct DB Update Error:", verifyError);
        else console.log("Direct DB Update Success:", verifyUpdate);
    }

    // Cleanup
    console.log("Cleaning up...");
    await supabase.from('orders').delete().eq('id', testOrderId);
}

runTest();
