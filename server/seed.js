const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Restaurant = require('./models/Restaurant');
const FoodItem = require('./models/FoodItem');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional, be careful in prod!)
        // await Restaurant.deleteMany({});
        // await FoodItem.deleteMany({});
        // console.log('🗑️  Cleared existing Restaurants & FoodItems');

        // 1. Create Restaurants
        const restaurants = await Restaurant.create([
            {
                name: "Spicy House",
                description: "Authentic Indian Spices",
                image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
                rating: 4.5,
                cuisine: ["Indian", "Mughlai"],
                deliveryTime: "30-40 min",
                priceForTwo: 500,
                location: { type: "Point", coordinates: [77.6, 12.9], address: "Koramangala, Bangalore" }
            },
            {
                name: "Pizza Paradise",
                description: "Best Woodfired Pizzas",
                image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
                rating: 4.2,
                cuisine: ["Italian", "Fast Food"],
                deliveryTime: "25-35 min",
                priceForTwo: 600,
                location: { type: "Point", coordinates: [77.65, 12.95], address: "Indiranagar, Bangalore" }
            }
        ]);

        console.log(`Restaurants Created: ${restaurants.length}`);

        // 2. Create Food Items for each Restaurant
        const foods = [];

        // Spicy House Menu
        foods.push({
            restaurantId: restaurants[0]._id,
            name: "Hyderabadi Chicken Biryani",
            description: "Aromatic basmati rice with tender chicken",
            price: 250,
            image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80",
            category: "Main Course",
            isVeg: false
        });
        foods.push({
            restaurantId: restaurants[0]._id,
            name: "Paneer Butter Masala",
            description: "Soft paneer in rich tomato gravy",
            price: 200,
            image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&q=80",
            category: "Main Course",
            isVeg: true
        });

        // Pizza Paradise Menu
        foods.push({
            restaurantId: restaurants[1]._id,
            name: "Pepperoni Pizza",
            description: "Classic pepperoni with extra cheese",
            price: 350,
            image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80",
            category: "Pizza",
            isVeg: false
        });
        foods.push({
            restaurantId: restaurants[1]._id,
            name: "Margherita Pizza",
            description: "Classic tomato and basil",
            price: 280,
            image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
            category: "Pizza",
            isVeg: true
        });

        await FoodItem.create(foods);
        console.log(`Food Items Created: ${foods.length}`);

        console.log('✅ Seeding Completed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
