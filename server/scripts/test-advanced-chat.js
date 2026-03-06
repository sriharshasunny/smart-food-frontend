require('dotenv').config();
const { processChatRequest } = require('../controllers/chatController');

const req = {
    body: {
        message: "suggest me best food items for dinner like burgers and biryani and ice creams",
        userId: "d8e3d0cd-f2d1-432d-88b1-12f38d390a37",
        history: []
    }
};

const res = {
    json: (data) => console.log("\n✅ Response JSON:", JSON.stringify(data, null, 2)),
    status: (code) => {
        console.log("Status Code:", code);
        return {
            json: (data) => console.log("Response JSON:", JSON.stringify(data, null, 2))
        };
    }
};

async function run() {
    console.log("Testing Advanced Chat...");
    await processChatRequest(req, res);
    console.log("Done.");
    process.exit(0);
}

run();
