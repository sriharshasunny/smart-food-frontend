
const https = require('https');

const data = JSON.stringify({
    message: "hello",
    userId: "debug-script"
});

const options = {
    hostname: 'smart-food-backend-czp1.onrender.com',
    port: 443,
    path: '/api/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Sending request to /api/chat...");

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
        console.log('RESPONSE BODY:');
        console.log(body);
    });
});

req.on('error', (error) => {
    console.error('REQUEST ERROR:', error);
});

req.write(data);
req.end();
