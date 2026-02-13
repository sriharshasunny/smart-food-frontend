const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

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
            console.log("Saving model list to models_list_raw.txt...");
            const list = data.models.map(m => `- ${m.name}`).join('\n');
            fs.writeFileSync(path.join(__dirname, '../models_list_raw.txt'), list);
            console.log("Done.");
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

listModels();
