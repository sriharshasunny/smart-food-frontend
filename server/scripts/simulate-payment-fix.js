// Native fetch:
const fetchNative = global.fetch;

async function simulatePayment() {
    console.log("=== Simulating Payment with Integer IDs ===");

    const payload = {
        amount: 500,
        currency: 'INR',
        user: {
            name: 'Test Bot',
            email: 'testbot@example.com',
            _id: null // Use null to avoid UUID error, simulate guest
        },
        cart: [
            {
                id: 101, // Integer ID (The Problem Case)
                name: 'Test Veggie Burger',
                price: 250,
                quantity: 2,
                image: 'http://example.com/burger.jpg'
            }
        ]
    };

    try {
        const response = await fetchNative('http://localhost:5000/api/payment/create-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            console.log("✅ Payment Init Success.");
            console.log(`   Order ID: ${data.order_id}`);
        } else {
            console.error("❌ Payment Failed:", await response.text());
        }
    } catch (e) {
        console.error("❌ Network Error:", e.message);
    }
}

simulatePayment();
