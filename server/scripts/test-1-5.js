require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkModel() {
    console.log("Testing gemini-1.5-flash...");
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Hi");
        console.log("✅ 1.5 Flash Works! Response:", result.response.text());
    } catch (error) {
        console.log("❌ 1.5 Flash Failed:", error.message);
    }
}

checkModel();
