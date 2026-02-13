require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkModel(modelName) {
    console.log(`\nTesting model: ${modelName}...`);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ ERROR: GEMINI_API_KEY is missing from .env");
        return false;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello! Just checking my quota.");
        console.log(`✅ Success with ${modelName}! Response: ${result.response.text()}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed with ${modelName}:`);
        console.error(error.message);
        return false;
    }
}

async function runTests() {
    console.log("Starting verification for key ending in: ..." + process.env.GEMINI_API_KEY.slice(-4));

    // Test standard flash first (preferred)
    await checkModel("gemini-1.5-flash");

    // Test 2.0 (fallback)
    await checkModel("gemini-2.0-flash");
}

runTests();
