const http = require('http');

// Simple script to hit the local endpoint
const data = JSON.stringify({
    userId: "678f8c8b9d0e2a3b4c5d6e7f", // Valid User ID from previous logs
    message: "What food items do you have?"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/chat/ask',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log('BODY:', body);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
