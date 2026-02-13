require('dotenv').config({ path: '../.env' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API Key found");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error);
        } else {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

listModels();
