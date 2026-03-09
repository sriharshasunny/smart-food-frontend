const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is missing.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listAllModels() {
    try {
        console.log("Fetching supported models...");
        // the listModels function doesn't exist directly on genAI in older SDKs.
        // We'll just fetch directly with node-fetch

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            console.error("Failed to fetch models: ", await response.text());
            return;
        }

        const data = await response.json();
        const supportedModels = data.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name);

        console.log("AVAILABLE MODELS FOR GENERATECONTENT:\n");
        console.log(supportedModels.join("\n"));

    } catch (e) {
        console.error("Failed:", e.message);
    }
}

listAllModels();
