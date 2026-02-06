const BASE_URL = 'http://127.0.0.1:5001/api';

const runTest = async () => {
    try {
        // 1. Register User
        const email = `testuser_${Date.now()}@example.com`;
        console.log(`Registering user: ${email}`);

        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email, password: 'password123' })
        });
        const regData = await regRes.json();

        if (!regRes.ok) throw new Error(regData.message || 'Registration failed');

        const userId = regData.user._id;
        console.log(`User Registered: ${userId}`);

        // 2. Sync Cart
        console.log('Syncing Cart...');
        // Use a dummy ObjectId
        const fakeFoodId = '654321654321654321654321';

        const cartRes = await fetch(`${BASE_URL}/user/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                cart: [{ foodId: fakeFoodId, quantity: 2, notes: 'Spicy' }]
            })
        });

        const cartText = await cartRes.text();
        let cartData;
        try {
            cartData = JSON.parse(cartText);
        } catch (e) {
            console.error('Failed to parse Cart Response:', cartText);
            throw new Error('Non-JSON response from server');
        }

        if (!cartRes.ok) {
            console.error('Cart Sync Error Response:', JSON.stringify(cartData, null, 2));
            throw new Error(cartData.message || 'Cart sync failed');
        }
        console.log('Cart Synced. Items:', cartData.cart?.length);

        // 3. Toggle Wishlist
        console.log('Toggling Wishlist...');
        const wishRes1 = await fetch(`${BASE_URL}/user/wishlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId, foodId: fakeFoodId })
        });
        const wishData = await wishRes1.json();
        console.log('Wishlist Added. Items:', wishData.wishlist?.length);

        console.log('✅ Backend Sync Tests Passed');

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
};

runTest();
