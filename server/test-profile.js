// Native fetch used in Node 18+

const BASE_URL = 'http://localhost:5001/api';

const runTest = async () => {
    try {
        console.log('🚧 Starting Profile Test...');

        // 1. Create a temporary user
        const email = `test_profile_${Date.now()}@example.com`;
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Profile Tester', email, password: 'password123' })
        });
        const regData = await regRes.json();

        if (!regRes.ok) throw new Error(`Registration failed: ${regData.message}`);
        const userId = regData.user._id;
        console.log(`✅ User Registered: ${userId}`);

        // 2. Initial Fetch
        const getRes = await fetch(`${BASE_URL}/user/${userId}`);
        const getData = await getRes.json();
        console.log(`Initial Address: ${getData.user.addresses?.length || 0}`);

        // 3. Update Profile
        const updatePayload = {
            name: 'Updated Name',
            phone: '1234567890',
            address: '123 Test St, Test City'
        };

        const updateRes = await fetch(`${BASE_URL}/user/profile/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload)
        });
        const updateData = await updateRes.json();

        if (!updateRes.ok) throw new Error(`Update failed: ${updateData.message}`);

        console.log(`✅ Update Response: Name=${updateData.user.name}, Addr=${updateData.user.address}`);

        // 4. Verify Persistence
        const verifyRes = await fetch(`${BASE_URL}/user/${userId}`);
        const verifyData = await verifyRes.json();
        const user = verifyData.user;

        const addressMatch = user.addresses.some(a => a.street === updatePayload.address);

        if (user.name === updatePayload.name && user.phone === updatePayload.phone && addressMatch) {
            console.log('🎉 Profile Update Verified in DB!');
        } else {
            console.error('❌ Verification Failed!');
            console.log('Expected:', updatePayload);
            console.log('Actual:', { name: user.name, phone: user.phone, addresses: user.addresses });
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    }
};

runTest();
