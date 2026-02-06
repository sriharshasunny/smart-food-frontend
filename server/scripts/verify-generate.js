const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGen() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Attempting generation with gemini-1.5-flash...");

        const result = await model.generateContent("Say Success");
        console.log("SUCCESS:", result.response.text());
    } catch (error) {
        console.error("FAIL:", error.message);
    }
}

testGen();
