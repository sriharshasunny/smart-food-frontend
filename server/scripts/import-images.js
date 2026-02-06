const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const FoodItem = require('../models/FoodItem');
const Restaurant = require('../models/Restaurant');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const images = {
    biryani: 'C:/Users/sriha/.gemini/antigravity/brain/e2154e23-52e8-4a42-be75-c14239def379/biryani_1768918311883.png',
    paneer: 'C:/Users/sriha/.gemini/antigravity/brain/e2154e23-52e8-4a42-be75-c14239def379/paneer_1768918394800.png',
    margherita: 'C:/Users/sriha/.gemini/antigravity/brain/e2154e23-52e8-4a42-be75-c14239def379/margherita_1768919462205.png',
    pepperoni: 'C:/Users/sriha/.gemini/antigravity/brain/e2154e23-52e8-4a42-be75-c14239def379/pepperoni_1768919510175.png'
};

const getBase64 = (filePath) => {
    try {
        const file = fs.readFileSync(filePath);
        return `data:image/png;base64,${file.toString('base64')}`;
    } catch (e) {
        console.error(`Error reading file ${filePath}:`, e);
        return null;
    }
};

const importImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Prepare Base64 Data
        const data = {
            biryani: getBase64(images.biryani),
            paneer: getBase64(images.paneer),
            margherita: getBase64(images.margherita),
            pepperoni: getBase64(images.pepperoni)
        };

        if (Object.values(data).some(v => v === null)) {
            console.error('❌ Failed to read some images. Aborting.');
            process.exit(1);
        }

        // 2. Update Food Items
        const updates = [
            { name: "Hyderabadi Chicken Biryani", image: data.biryani },
            { name: "Paneer Butter Masala", image: data.paneer },
            { name: "Pepperoni Pizza", image: data.pepperoni },
            { name: "Margherita Pizza", image: data.margherita }
        ];

        for (const update of updates) {
            const res = await FoodItem.updateOne(
                { name: update.name },
                { $set: { image: update.image } }
            );
            console.log(`Update ${update.name}: ${res.modifiedCount ? '✅ Modified' : '⚠️ Not Modified (or not found)'}`);
        }

        // 3. Update Restaurants
        // Spicy House -> Biryani image
        await Restaurant.updateOne(
            { name: "Spicy House" },
            { $set: { image: data.biryani } }
        );
        console.log('Update Spicy House Image: ✅');

        // Pizza Paradise -> Margherita image
        await Restaurant.updateOne(
            { name: "Pizza Paradise" },
            { $set: { image: data.margherita } }
        );
        console.log('Update Pizza Paradise Image: ✅');

        console.log('🎉 Image Migration Complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

importImages();
