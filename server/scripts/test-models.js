const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '../.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log("Using Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct "list models" in the simplified SDK that I recall offhand without checking docs, 
        // but let's try a simple generation to see if it works isolated.

        console.log("Testing gemini-1.5-flash...");
        const result1 = await model.generateContent("Hello");
        console.log("gemini-1.5-flash Success:", result1.response.text());

    } catch (error) {
        console.error("gemini-1.5-flash Failed:", error.message);
    }

    try {
        console.log("Testing gemini-pro...");
        const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result2 = await model2.generateContent("Hello");
        console.log("gemini-pro Success:", result2.response.text());
    } catch (error) {
        console.error("gemini-pro Failed:", error.message);
    }
}

listModels();
