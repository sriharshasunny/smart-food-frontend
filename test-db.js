import mongoose from 'mongoose';

const uri = "mongodb+srv://sriharshakamatham:harsha@cluster0.p0t4a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

console.log("Attempting to connect to MongoDB...");

try {
    await mongoose.connect(uri);
    console.log("SUCCESS: Connected to MongoDB!");
    process.exit(0);
} catch (err) {
    console.error("ERROR: Could not connect to MongoDB.");
    console.error(err);
    process.exit(1);
}
