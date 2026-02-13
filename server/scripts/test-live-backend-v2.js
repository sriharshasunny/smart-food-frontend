
const https = require('https');

const options = {
    hostname: 'smart-food-backend-czp1.onrender.com',
    port: 443,
    path: '/',
    method: 'GET'
};

console.log("Pinging https://smart-food-backend-czp1.onrender.com/ ...");

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('BODY:', data);

        // Check Chat Endpoint if Root is OK
        checkChat();
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();

function checkChat() {
    console.log("\nChecking /api/chat ...");
    const chatOpts = {
        ...options,
        path: '/api/chat',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    const chatReq = https.request(chatOpts, (res) => {
        console.log(`CHAT STATUS: ${res.statusCode}`);
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => console.log('CHAT BODY:', d));
    });

    chatReq.on('error', e => console.error(e));
    chatReq.write(JSON.stringify({ message: 'ping', userId: 'test' }));
    chatReq.end();
}
