const http = require('http');

const data = JSON.stringify({
    userId: '678f8c8b9d0e2a3b4c5d6e7f', // Mock ID, doesn't need to exist, just needs to not crash mongoose if valid ObjectId is required. 
    // Actually, let's use a fake but valid-looking ObjectId specific to this DB? 
    // Or just "undefined" to test the generic path if userId isn't strict.
    // Let's pass a message.
    message: "Hello, recommend me food."
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
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.write(data);
req.end();
