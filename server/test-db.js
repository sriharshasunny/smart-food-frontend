const mongoose = require('mongoose');

// Hardcoded URI to test credentials directly
const uri = "mongodb+srv://sriharshaboindla_db_user:harshaDB@cluster0.eej2j3r.mongodb.net/?appName=Cluster0";

console.log("Attempting to connect to MongoDB...");

mongoose.connect(uri)
    .then(() => {
        console.log("SUCCESS: Connected to MongoDB!");
        process.exit(0);
    })
    .catch(err => {
        console.error("ERROR: Could not connect to MongoDB.");
        console.error(err);
        process.exit(1);
    });
