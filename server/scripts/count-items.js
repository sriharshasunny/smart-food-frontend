const mongoose = require('mongoose');
const FoodItem = require('../models/FoodItem');
require('dotenv').config({ path: '../.env' });

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const count = await FoodItem.countDocuments();
        console.log(`Total Food Items: ${count}`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
