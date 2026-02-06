const https = require('https');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Using Key ending in: ...${apiKey ? apiKey.slice(-6) : 'NONE'}`);
console.log(`Checking URL: ${url.replace(apiKey, 'HIDDEN')}`);

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        try {
            const parsed = JSON.parse(data);
            if (res.statusCode === 200 && parsed.models) {
                console.log("SUCCESS! Models found:");
                const geminiModels = parsed.models.filter(m => m.name.includes('gemini'));
                if (geminiModels.length > 0) {
                    geminiModels.forEach(m => console.log(`- ${m.name}`));
                } else {
                    console.log("No 'gemini' models found in the list. All models:");
                    parsed.models.forEach(m => console.log(`- ${m.name}`));
                }
            } else {
                console.error("ERROR:", JSON.stringify(parsed, null, 2));
            }
        } catch (e) {
            console.log("Raw Body:", data);
        }
    });
}).on('error', err => console.error("Req Error:", err));
