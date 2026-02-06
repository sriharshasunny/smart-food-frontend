// Native fetch:
const fetchNative = global.fetch;

async function testEmail() {
    console.log("=== Testing Order Confirmation Email ===");

    // Use the order ID from the successful simulation
    const orderId = 'd06bc167-7e57-4ce3-9715-047b3bedb015';

    try {
        const response = await fetchNative('http://localhost:5000/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: orderId,
                paymentId: 'mock-payment-id-for-email-test'
            })
        });

        if (response.ok) {
            console.log("✅ API Called Successfully. Check SERVER LOGS for Email Output.");
        } else {
            console.error("❌ Verification Failed:", await response.text());
        }
    } catch (e) {
        console.error("❌ Network Error:", e.message);
    }
}

testEmail();
