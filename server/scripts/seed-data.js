const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const FoodItem = require('../models/FoodItem');
require('dotenv').config({ path: '../.env' });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        // Clear existing data (Optional: Remove if we want to append)
        await Restaurant.deleteMany({});
        await FoodItem.deleteMany({});
        console.log("Cleared existing data.");

        // Restaurants
        const restaurants = [
            {
                name: "Paradise Biryani",
                description: "World famous Hyderabadi Biryani.",
                rating: 4.8,
                cuisine: ["Biryani", "Mughlai"],
                deliveryTime: "40-50 min",
                priceForTwo: 800,
                location: { type: 'Point', coordinates: [78.4867, 17.3850], address: "Secunderabad, Hyderabad" },
                image: "https://b.zmtcdn.com/data/pictures/chains/1/90031/9b1095d539c32247e2467d020d5757d5.jpg"
            },
            {
                name: "Pizza Hut",
                description: "Tastiest pizzas in town.",
                rating: 4.2,
                cuisine: ["Italian", "Pizza"],
                deliveryTime: "30 min",
                priceForTwo: 600,
                location: { type: 'Point', coordinates: [78.4867, 17.3850], address: "Banjara Hills, Hyderabad" },
                image: "https://www.pizza-hut.co.uk/order/images/icons/logo-300x300.ed09f0955306cb0be92c695a213e1fa9.png"
            },
            {
                name: "Burger King",
                description: "Flame grilled burgers.",
                rating: 4.4,
                cuisine: ["American", "Burgers"],
                deliveryTime: "25 min",
                priceForTwo: 500,
                location: { type: 'Point', coordinates: [78.4867, 17.3850], address: "Gachibowli, Hyderabad" },
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Burger_King_logo_%281999%29.svg/2024px-Burger_King_logo_%281999%29.svg.png"
            },
            {
                name: "Chutneys",
                description: "Authentic South Indian tiffins.",
                rating: 4.6,
                cuisine: ["South Indian", "Idli", "Dosa"],
                deliveryTime: "20-30 min",
                priceForTwo: 400,
                location: { type: 'Point', coordinates: [78.4867, 17.3850], address: "Jubilee Hills, Hyderabad" },
                image: "https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_508,h_320,c_fill/e0vvulfbadltxmklxgei"
            },
            {
                name: "Mainland China",
                description: "Premium Chinese fine dining.",
                rating: 4.7,
                cuisine: ["Chinese", "Asian"],
                deliveryTime: "45-55 min",
                priceForTwo: 1200,
                location: { type: 'Point', coordinates: [78.4867, 17.3850], address: "Hitech City, Hyderabad" },
                image: "https://b.zmtcdn.com/data/pictures/chains/2/94252/39327576d1e4e6g19688439266395568.jpg"
            }
        ];

        const savedRestaurants = await Restaurant.insertMany(restaurants);
        console.log(`Added ${savedRestaurants.length} restaurants.`);

        // Food Items Map
        const rMap = {}; // name -> id
        savedRestaurants.forEach(r => rMap[r.name] = r._id);

        const foodItems = [
            // Paradise
            { restaurantId: rMap["Paradise Biryani"], name: "Chicken Biryani", price: 350, description: "Aromatic spicy rice with chicken", isVeg: false, rating: 4.9, category: "Main Course" },
            { restaurantId: rMap["Paradise Biryani"], name: "Mutton Biryani", price: 450, description: "Tender mutton with aromatic rice", isVeg: false, rating: 4.8, category: "Main Course" },
            { restaurantId: rMap["Paradise Biryani"], name: "Paneer Biryani", price: 300, description: "Spicy rice with paneer cubes", isVeg: true, rating: 4.5, category: "Main Course" },
            { restaurantId: rMap["Paradise Biryani"], name: "Chicken 65", price: 280, description: "Spicy fried chicken appetizer", isVeg: false, rating: 4.6, category: "Starters" },

            // Pizza Hut
            { restaurantId: rMap["Pizza Hut"], name: "Margherita Pizza", price: 250, description: "Classic cheese pizza", isVeg: true, rating: 4.3, category: "Pizza" },
            { restaurantId: rMap["Pizza Hut"], name: "Pepperoni Pizza", price: 350, description: "Pizza with spicy pepperoni slices", isVeg: false, rating: 4.5, category: "Pizza" },
            { restaurantId: rMap["Pizza Hut"], name: "Veggie Supreme", price: 320, description: "Loaded with veggies", isVeg: true, rating: 4.2, category: "Pizza" },
            { restaurantId: rMap["Pizza Hut"], name: "Cheese Garlic Bread", price: 150, description: "Garlic bread with mozzerala", isVeg: true, rating: 4.6, category: "Sides" },

            // Burger King
            { restaurantId: rMap["Burger King"], name: "Whopper", price: 199, description: "Signature flame grilled burger", isVeg: false, rating: 4.7, category: "Burgers" },
            { restaurantId: rMap["Burger King"], name: "Veg Whopper", price: 179, description: "Vegetarian version of the classic", isVeg: true, rating: 4.3, category: "Burgers" },
            { restaurantId: rMap["Burger King"], name: "Chicken Fries", price: 120, description: "Fried chicken strips", isVeg: false, rating: 4.2, category: "Sides" },
            { restaurantId: rMap["Burger King"], name: "Chocolate Shake", price: 150, description: "Thick chocolate milkshake", isVeg: true, rating: 4.5, category: "Beverages" },

            // Chutneys
            { restaurantId: rMap["Chutneys"], name: "Steam Dosa", price: 120, description: "Soft fluffy dosa, oil free", isVeg: true, rating: 4.8, category: "Dosa" },
            { restaurantId: rMap["Chutneys"], name: "Babai Idli", price: 100, description: "Famous idli with ghee and powder", isVeg: true, rating: 4.9, category: "Idli" },
            { restaurantId: rMap["Chutneys"], name: "Masala Dosa", price: 140, description: "Crispy dosa with potato filling", isVeg: true, rating: 4.7, category: "Dosa" },
            { restaurantId: rMap["Chutneys"], name: "Filter Coffee", price: 50, description: "Authentic south indian coffee", isVeg: true, rating: 4.8, category: "Beverages" },

            // Mainland China
            { restaurantId: rMap["Mainland China"], name: "Dim Sums", price: 350, description: "Steamed chicken dumplings", isVeg: false, rating: 4.6, category: "Starters" },
            { restaurantId: rMap["Mainland China"], name: "Hakka Noodles", price: 280, description: "Classic stir fried noodles", isVeg: true, rating: 4.4, category: "Main Course" },
            { restaurantId: rMap["Mainland China"], name: "Kung Pao Chicken", price: 400, description: "Spicy chicken with peanuts", isVeg: false, rating: 4.7, category: "Main Course" },
            { restaurantId: rMap["Mainland China"], name: "Spring Rolls", price: 250, description: "Crispy fried veggie rolls", isVeg: true, rating: 4.5, category: "Starters" }
        ];

        const savedItems = await FoodItem.insertMany(foodItems);
        console.log(`Added ${savedItems.length} food items.`);

        console.log("Database seeded successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedData();
