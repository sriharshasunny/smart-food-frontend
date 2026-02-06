const orderController = require('../controllers/orderController');
const supabase = require('../utils/supabase');
const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Mock req, res
const mockReq = {
    body: {
        orderId: '', // Set later
        paymentId: 'PAYMENT_ID_TEST'
    }
};

const mockRes = {
    statusCode: 200,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(data) {
        console.log(`[MockRes] JSON Response (${this.statusCode}):`, JSON.stringify(data, null, 2));
    }
};

async function runTest() {
    console.log("=== Testing VerifyOrder Controller Logic ===");

    // 1. Create a Dummy Order in DB
    const id = crypto.randomUUID();
    mockReq.body.orderId = id;

    console.log("Creating dummy order:", id);
    const { data: order, error: insertError } = await supabase.from('orders').insert({
        id,
        user_id: null,
        guest_info: { name: 'Test User', email: 'test@example.com' },
        total_amount: 500,
        currency: 'INR',
        payment_status: 'Placed',
        order_status: 'Placed'
    }).select().single();

    if (insertError) {
        console.error("Setup failed:", insertError);
        return;
    }

    try {
        // 2. Invoke Controller
        console.log("Invoking orderController.verifyOrder...");
        await orderController.verifyOrder(mockReq, mockRes);

        console.log("Controller invocation complete.");
    } catch (e) {
        console.error("Controller crashed:", e);
    } finally {
        // 3. Cleanup
        console.log("Cleaning up...");
        await supabase.from('orders').delete().eq('id', id);
    }
}

runTest();
