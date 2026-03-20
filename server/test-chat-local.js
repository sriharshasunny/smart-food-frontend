require('dotenv').config({ path: '../.env' });
const { processChatRequest } = require('./controllers/chatController');

async function test() {
    console.log("Starting test...");
    const req = {
        body: {
            message: "im looking for some best pizzas or popular suggestions",
            userId: "test_user_guest"
        }
    };

    const res = {
        json: (data) => console.log("\n[JSON Response]:\n" + JSON.stringify(data, null, 2)),
        status: (code) => {
            console.log('\n[Status]:', code);
            return res;
        }
    };

    try {
        await processChatRequest(req, res);
    } catch (e) {
        console.error("Test Error:", e);
    }
}

test();
