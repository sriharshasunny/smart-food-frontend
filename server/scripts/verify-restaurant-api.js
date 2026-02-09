const API_URL = 'http://localhost:5000/api/restaurant';

async function verifyRestaurantAPI() {
    console.log("🧪 Starting Restaurant API Verification (Native Fetch)...");
    const testName = `VerifyTest_${Date.now()}`;
    const testEmail = `${testName}@gmail.com`;

    try {
        // 1. Create Restaurant
        console.log("\n1. Creating Restaurant...");
        const createRes = await fetch(`${API_URL}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: testName,
                email: testEmail,
                cuisine: "Test Cuisine",
                address: "123 Test Lane"
            })
        });

        if (createRes.status !== 201) {
            const err = await createRes.json();
            throw new Error(`Create failed: ${err.message}`);
        }

        const createData = await createRes.json();
        const restId = createData.restaurant.id;
        console.log(`✅ Created: ${testName} (ID: ${restId})`);

        // 2. Check Public List (Should be Active by default)
        console.log("\n2. Checking Active List (Should be visible)...");
        const listRes1 = await fetch(`${API_URL}/active/list`);
        const listData1 = await listRes1.json();

        const foundActive1 = listData1.find(r => r.id === restId);

        if (!foundActive1) throw new Error("Restaurant NOT found in active list (Default should be active)");
        console.log("✅ Restaurant is visible in Active List.");

        // 3. Suspend Restaurant
        console.log("\n3. Suspending Restaurant...");
        await fetch(`${API_URL}/${restId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: false })
        });
        console.log("✅ Suspended.");

        // 4. Check Public List (Should Notify be visible)
        console.log("\n4. Checking Active List (Should be HIDDEN)...");
        const listRes2 = await fetch(`${API_URL}/active/list`);
        const listData2 = await listRes2.json();
        const foundActive2 = listData2.find(r => r.id === restId);

        if (foundActive2) throw new Error("Restaurant FOUND in active list! (Suspension failed)");
        console.log("✅ Restaurant is HIDDEN from Active List.");

        // 5. Activate Restaurant
        console.log("\n5. Activating Restaurant...");
        await fetch(`${API_URL}/${restId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: true })
        });
        console.log("✅ Activated.");

        // 6. Fetch Details
        console.log("\n6. Fetching Details Endpoint...");
        const detailRes = await fetch(`${API_URL}/${restId}`);
        const detailData = await detailRes.json();

        if (detailData.name !== testName) throw new Error("Details mismatch");
        console.log("✅ Details Fetched Successfully.");

        console.log("\n🎉 Verification Passed!");

    } catch (error) {
        console.error("❌ Verification Failed:", error.message);
    }
}

verifyRestaurantAPI();
