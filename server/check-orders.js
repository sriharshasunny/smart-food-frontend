const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Order = require('./models/Order');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Order.countDocuments();
        console.log(`Total Orders in DB: ${count}`);

        const latestOrder = await Order.findOne().sort({ createdAt: -1 });
        console.log('Latest Order:', JSON.stringify(latestOrder, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkOrders();
