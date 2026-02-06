const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const FoodItem = require('./models/FoodItem');

dotenv.config({ path: path.join(__dirname, '../.env') });

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const item = await FoodItem.findOne();
        if (item && item.image.startsWith('data:image/png;base64,')) {
            console.log('✅ Image Verification Passed: Found Base64 Image');
            console.log('Sample:', item.image.substring(0, 50) + '...');
        } else {
            console.error('❌ Image Verification Failed: Image is not Base64 or missing');
            console.log('Actual:', item?.image);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

verify();
