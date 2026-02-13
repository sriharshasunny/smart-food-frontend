
const https = require('https');

function makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'smart-food-backend-czp1.onrender.com',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: data
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

async function testBackend() {
    console.log("1. Testing Root (Health/Waking up)...");
    try {
        const root = await makeRequest('/');
        console.log(`   Root Status: ${root.statusCode}`);
        // console.log(`   Root Body: ${root.body.substring(0, 100)}...`);
    } catch (e) {
        console.error("   Root Failed:", e.message);
    }

    console.log("\n2. Testing /api/chat (Expect 400 - Message Required)...");
    try {
        const chatCheck = await makeRequest('/api/chat', 'POST', {});
        console.log(`   Chat Check Status: ${chatCheck.statusCode}`);
        console.log(`   Chat Check Body: ${chatCheck.body}`);
    } catch (e) {
        console.error("   Chat Check Failed:", e.message);
    }

    console.log("\n3. Testing /api/chat (Expect Success or 500 if key invalid)...");
    try {
        const chatReal = await makeRequest('/api/chat', 'POST', { message: 'hello', userId: 'test-script' });
        console.log(`   Chat Real Status: ${chatReal.statusCode}`);
        console.log(`   Chat Real Body: ${chatReal.body}`);
    } catch (e) {
        console.error("   Chat Real Failed:", e.message);
    }
}

testBackend();
