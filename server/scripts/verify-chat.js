require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function verifyChat() {
    console.log("Checking API Key...");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ ERROR: GEMINI_API_KEY is missing from .env");
        process.exit(1);
    }
    console.log("✅ API Key found.");

    try {
        console.log("Initializing Gemini Client...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("Sending test prompt...");
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        const text = response.text();

        console.log("✅ Gemini Response received:");
        console.log(text);
        console.log("✅ Verification SUCCESS!");

    } catch (error) {
        console.error("❌ ERROR: Failed to connect to Gemini API.");
        console.error(error);
        process.exit(1);
    }
}

verifyChat();
