
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// --- MOCK DATA (Copied from src/data/mockData.js) ---
const mockRestaurants = [
    {
        id: 1,
        name: "Spice Garden",
        rating: 4.5,
        deliveryTime: "30-45 min",
        costForTwo: "₹600",
        minOrder: 150,
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        tags: ["Indian", "Biryani", "Curry"],
        cuisine: "Indian",
        email: "spicegarden@gmail.com"
    },
    {
        id: 2,
        name: "Sushi Master",
        rating: 4.8,
        deliveryTime: "45-60 min",
        costForTwo: "₹1200",
        minOrder: 300,
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
        tags: ["Japanese", "Sushi", "Asian"],
        cuisine: "Japanese",
        email: "sushi@gmail.com"
    },
    {
        id: 3,
        name: "Burger King",
        rating: 4.2,
        deliveryTime: "20-35 min",
        costForTwo: "₹400",
        minOrder: 100,
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80",
        tags: ["Burgers", "Fast Food", "American"],
        cuisine: "Burgers",
        email: "burgerking@gmail.com"
    },
    {
        id: 4,
        name: "Italian Delight",
        rating: 4.7,
        deliveryTime: "40-55 min",
        costForTwo: "₹900",
        minOrder: 250,
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        tags: ["Italian", "Pizza", "Pasta"],
        cuisine: "Italian",
        email: "italian@gmail.com"
    },
    {
        id: 5,
        name: "Wok & Roll",
        rating: 4.4,
        deliveryTime: "25-40 min",
        costForTwo: "₹700",
        minOrder: 200,
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
        tags: ["Chinese", "Asian", "Stir Fry"],
        cuisine: "Chinese",
        email: "woknroll@gmail.com"
    },
    {
        id: 6,
        name: "Dosa Plaza",
        rating: 4.3,
        deliveryTime: "25-40 min",
        costForTwo: "₹300",
        minOrder: 100,
        image: "https://images.unsplash.com/photo-1589301760588-3771c503b3d6?auto=format&fit=crop&w=800&q=80",
        tags: ["South Indian", "Dosa", "Vegetarian"],
        cuisine: "South Indian",
        email: "dosaplaza@gmail.com"
    },
    {
        id: 7,
        name: "Pizza Hut",
        rating: 4.1,
        deliveryTime: "30-45 min",
        costForTwo: "₹500",
        minOrder: 150,
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
        tags: ["Pizza", "Fast Food"],
        cuisine: "Pizza",
        email: "pizzahut@gmail.com"
    },
    {
        id: 8,
        name: "Healthy Bites",
        rating: 4.6,
        deliveryTime: "20-30 min",
        costForTwo: "₹550",
        minOrder: 180,
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
        tags: ["Healthy", "Salads", "Smoothies"],
        cuisine: "Healthy",
        email: "healthybites@gmail.com"
    },
    {
        id: 9,
        name: "Scoops & Cones",
        rating: 4.9,
        deliveryTime: "15-25 min",
        costForTwo: "₹250",
        minOrder: 100,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
        tags: ["Ice Cream", "Desserts", "Shakes"],
        cuisine: "Desserts",
        email: "scoops@gmail.com"
    }
];

const mockDishes = [
    // 1. Spice Garden (Indian - Biryani focus)
    { name: "Hyderabadi Chicken Biryani", price: 320, description: "Aromatic basmati rice cooked with tender chicken and spices.", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Biryani", rating: 4.8, isVeg: false },
    { name: "Butter Chicken", price: 290, description: "Creamy tomato curry with tender chicken pieces.", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Curry", rating: 4.7, isVeg: false },
    { name: "Paneer Tikka Masala", price: 260, description: "Grilled paneer cubes in spicy gravy.", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Curry", rating: 4.6, isVeg: true },
    { name: "Garlic Naan", price: 60, description: "Freshly baked indian bread with garlic butter.", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Breads", rating: 4.5, isVeg: true },
    { name: "Veg Biryani", price: 240, description: "Flavorful rice with seasoned vegetables.", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Biryani", rating: 4.4, isVeg: true },
    { name: "Tandoori Chicken", price: 350, description: "Roasted chicken marinated in yogurt and spices.", image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Starters", rating: 4.9, isVeg: false },
    { name: "Samosa", price: 40, description: "Crispy pastry filled with spiced potatoes.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Starters", rating: 4.5, isVeg: true },
    { name: "Gulab Jamun", price: 90, description: "Sweet milk dumplings in rose syrup.", image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Desserts", rating: 4.8, isVeg: true },

    // 2. Sushi Master (Japanese)
    { name: "Salmon Nigiri", price: 450, description: "Fresh salmon over pressed vinegared rice.", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=50", restaurantId: 2, category: "Sushi", rating: 4.9, isVeg: false },
    { name: "California Roll", price: 380, description: "Crab, avocado, and cucumber roll.", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=50", restaurantId: 2, category: "Sushi", rating: 4.6, isVeg: false },
    { name: "Tuna Sashimi", price: 550, description: "Thinly sliced fresh tuna.", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=50", restaurantId: 2, category: "Sashimi", rating: 4.8, isVeg: false },
    { name: "Dragon Roll", price: 620, description: "Eel and cucumber topped with avocado.", image: "https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db?auto=format&fit=crop&w=400&q=50", restaurantId: 2, category: "Sushi", rating: 4.9, isVeg: false },
    { name: "Miso Soup", price: 150, description: "Traditional Japanese soup with tofu.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=50", restaurantId: 2, category: "Soup", rating: 4.5, isVeg: true },
    { name: "Tempura Shrimp", price: 420, description: "Crispy fried shrimp batter.", image: "https://images.unsplash.com/photo-1615557960916-5f4791effe9d?auto=format&fit=crop&w=400&q=50", restaurantId: 2, category: "Starters", rating: 4.7, isVeg: false },
    { name: "Spicy Tuna Roll", price: 480, description: "Tuna with spicy mayo.", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=400&q=50", restaurantId: 2, category: "Sushi", rating: 4.6, isVeg: false },

    // 3. Burger King
    { name: "Whopper", price: 220, description: "The classic flame-grilled beef burger.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=50", restaurantId: 3, category: "Burger", rating: 4.5, isVeg: false },
    { name: "Cheeseburger", price: 150, description: "Simple beef patty with cheddar cheese.", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=50", restaurantId: 3, category: "Burger", rating: 4.2, isVeg: false },
    { name: "Chicken Royale", price: 190, description: "Crispy chicken breast with lettuce.", image: "https://images.unsplash.com/photo-1615297928064-24977384d0f9?auto=format&fit=crop&w=400&q=50", restaurantId: 3, category: "Burger", rating: 4.4, isVeg: false },
    { name: "Veggie Burger", price: 170, description: "Plant-based patty with fresh veggies.", image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=400&q=50", restaurantId: 3, category: "Burger", rating: 4.3, isVeg: true },
    { name: "French Fries", price: 90, description: "Golden crispy potato fries.", image: "https://images.unsplash.com/photo-1573080496987-a199f8cd75ec?auto=format&fit=crop&w=400&q=50", restaurantId: 3, category: "Sides", rating: 4.6, isVeg: true },
    { name: "Onion Rings", price: 110, description: "Battered and fried onion rings.", image: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=400&q=50", restaurantId: 3, category: "Sides", rating: 4.4, isVeg: true },

    // 4. Italian Delight
    { name: "Margherita Pizza", price: 350, description: "Classic tomato and mozzarella pizza.", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=50", restaurantId: 4, category: "Pizza", rating: 4.6, isVeg: true },
    { name: "Pepperoni Pizza", price: 450, description: "Pizza topped with spicy pepperoni slices.", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=50", restaurantId: 4, category: "Pizza", rating: 4.8, isVeg: false },
    { name: "Carbonara Pasta", price: 420, description: "Creamy pasta with bacon and egg.", image: "https://images.unsplash.com/photo-1612874742237-982867143824?auto=format&fit=crop&w=400&q=50", restaurantId: 4, category: "Pasta", rating: 4.7, isVeg: false },
    { name: "Lasagna", price: 480, description: "Layered pasta with meat sauce and cheese.", image: "https://images.unsplash.com/photo-1574868235814-7d4761643195?auto=format&fit=crop&w=400&q=50", restaurantId: 4, category: "Pasta", rating: 4.8, isVeg: false },
    { name: "Tiramisu", price: 250, description: "Coffee-flavoured Italian dessert.", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400&q=50", restaurantId: 4, category: "Desserts", rating: 4.9, isVeg: true },

    // 5. Wok & Roll (Chinese)
    { name: "Kung Pao Chicken", price: 320, description: "Spicy stir-fry chicken with peanuts.", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400&q=50", restaurantId: 5, category: "Main", rating: 4.5, isVeg: false },
    { name: "Veggie Spring Rolls", price: 180, description: "Crispy rolls filled with vegetables.", image: "https://images.unsplash.com/photo-1544681280-d2dc0444bedd?auto=format&fit=crop&w=400&q=50", restaurantId: 5, category: "Starters", rating: 4.4, isVeg: true },
    { name: "Fried Rice", price: 250, description: "Stir-fried rice with eggs and veggies.", image: "https://images.unsplash.com/photo-1603133872878-684f208fb74b?auto=format&fit=crop&w=400&q=50", restaurantId: 5, category: "Main", rating: 4.3, isVeg: false },
    { name: "Dim Sum", price: 280, description: "Steamed dumplings.", image: "https://images.unsplash.com/photo-1496116218417-1a781b1c423c?auto=format&fit=crop&w=400&q=50", restaurantId: 5, category: "Starters", rating: 4.6, isVeg: false },
    { name: "Hakka Noodles", price: 240, description: "Stir-fried noodles with crisp veggies.", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=400&q=50", restaurantId: 5, category: "Main", rating: 4.5, isVeg: true },
    { name: "Manchow Soup", price: 160, description: "Spicy and tangy soup with crispy noodles.", image: "https://images.unsplash.com/photo-1511690078903-71dc5a49f5e3?auto=format&fit=crop&w=400&q=50", restaurantId: 5, category: "Soup", rating: 4.3, isVeg: true },

    // 6. Dosa Plaza (South Indian)
    { name: "Masala Dosa", price: 120, description: "Crispy crepe filled with potato masala.", image: "https://images.unsplash.com/photo-1589301760588-3771c503b3d6?auto=format&fit=crop&w=400&q=50", restaurantId: 6, category: "Dosa", rating: 4.8, isVeg: true },
    { name: "Idli Sambar", price: 80, description: "Steamed rice cakes with lentil soup.", image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=400&q=50", restaurantId: 6, category: "Breakfast", rating: 4.5, isVeg: true },
    { name: "Vada", price: 70, description: "Fried savory donut-shaped snacks.", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=400&q=50", restaurantId: 6, category: "Snacks", rating: 4.6, isVeg: true },
    { name: "Uttapam", price: 110, description: "Thick pancake with toppings.", image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=400&q=50", restaurantId: 6, category: "Breakfast", rating: 4.4, isVeg: true },
    { name: "Filter Coffee", price: 40, description: "Authentic South Indian coffee.", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=50", restaurantId: 6, category: "Beverage", rating: 4.9, isVeg: true },
    { name: "Rava Dosa", price: 130, description: "Crispy semolina crepe with spices.", image: "https://images.unsplash.com/photo-1589301760588-3771c503b3d6?auto=format&fit=crop&w=400&q=50", restaurantId: 6, category: "Dosa", rating: 4.7, isVeg: true },

    // 7. Pizza Hut
    { name: "Veggie Supreme", price: 420, description: "Loaded with fresh vegetables.", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=50", restaurantId: 7, category: "Pizza", rating: 4.5, isVeg: true },
    { name: "Chicken Supreme", price: 480, description: "Loaded with chicken and veggies.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=50", restaurantId: 7, category: "Pizza", rating: 4.7, isVeg: false },
    { name: "Meat Lovers", price: 550, description: "Pepperoni, ham, beef, and sausage.", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=400&q=50", restaurantId: 7, category: "Pizza", rating: 4.8, isVeg: false },
    { name: "Garlic Breadsticks", price: 160, description: "Oven-baked with garlic butter.", image: "https://images.unsplash.com/photo-1619531040576-f3e02509d3b3?auto=format&fit=crop&w=400&q=50", restaurantId: 7, category: "Side", rating: 4.6, isVeg: true },
    { name: "BBQ Wings", price: 240, description: "Tossed in smoky BBQ sauce.", image: "https://images.unsplash.com/photo-1527477396000-64ca9c00173d?auto=format&fit=crop&w=400&q=50", restaurantId: 7, category: "Side", rating: 4.7, isVeg: false },

    // 8. Healthy Bites
    { name: "Greek Salad", price: 280, description: "Fresh salad with feta cheese and olives.", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=400&q=50", restaurantId: 8, category: "Salad", rating: 4.7, isVeg: true },
    { name: "Avocado Toast", price: 250, description: "Toasted bread with mashed avocado.", image: "https://images.unsplash.com/photo-1588137372308-15f75323a675?auto=format&fit=crop&w=400&q=50", restaurantId: 8, category: "Breakfast", rating: 4.8, isVeg: true },
    { name: "Green Smoothie", price: 180, description: "Blend of spinach, apple, and ginger.", image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=400&q=50", restaurantId: 8, category: "Smoothie", rating: 4.6, isVeg: true },
    { name: "Quinoa Power Bowl", price: 320, description: "Protein-packed bowl with veggies.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=50", restaurantId: 8, category: "Bowl", rating: 4.9, isVeg: true },
    { name: "Fruit Parfait", price: 160, description: "Yogurt layered with fresh berries.", image: "https://images.unsplash.com/photo-1488477181946-6428a029177b?auto=format&fit=crop&w=400&q=50", restaurantId: 8, category: "Desserts", rating: 4.8, isVeg: true },

    // 9. Scoops & Cones (Ice Cream)
    { name: "Belgian Chocolate Scoop", price: 120, description: "Rich dark chocolate ice cream.", image: "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=400&q=50", restaurantId: 9, category: "Ice Cream", rating: 4.9, isVeg: true },
    { name: "Strawberry Swirl", price: 110, description: "Fresh strawberry ice cream.", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=50", restaurantId: 9, category: "Ice Cream", rating: 4.7, isVeg: true },
    { name: "Vanilla Bean", price: 100, description: "Classic vanilla with real bean pods.", image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=400&q=50", restaurantId: 9, category: "Ice Cream", rating: 4.6, isVeg: true },
    { name: "Mango Sorbet", price: 130, description: "Dairy-free fresh mango delight.", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=50", restaurantId: 9, category: "Ice Cream", rating: 4.8, isVeg: true },
    { name: "Cookie Dough", price: 150, description: "Vanilla ice cream with chunks of cookie dough.", image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=50", restaurantId: 9, category: "Ice Cream", rating: 4.9, isVeg: true }
];

const seedData = async () => {
    console.log("🌱 Seeding Supabase Database with FULL Mock Data...");

    try {
        const idMapping = {}; // mockId -> realUuid

        // 1. Insert Restaurants
        for (const meta of mockRestaurants) {
            // Prepare Object
            const restData = {
                name: meta.name,
                email: meta.email,
                password: meta.email,
                address: "Sample Address",
                cuisine: meta.tags, // Send Array directly
                rating: meta.rating,
                image: meta.image,
                is_active: true
            };

            // Check if exists
            const { data: existing } = await supabase.from('restaurants').select('id').eq('email', meta.email).single();

            if (existing) {
                console.log(`⚠️  ${meta.name} already exists. Using existing ID.`);
                idMapping[meta.id] = existing.id;
            } else {
                const { data: newRest, error } = await supabase.from('restaurants').insert(restData).select().single();
                if (error) {
                    console.error(`❌ Error creating ${meta.name}:`, error.message);
                } else {
                    console.log(`✅ Created Restaurant: ${meta.name}`);
                    idMapping[meta.id] = newRest.id;
                }
            }
        }

        // 2. Insert Dishes
        for (const dish of mockDishes) {
            const realRestId = idMapping[dish.restaurantId];
            if (!realRestId) {
                console.warn(`❌ Skipping dish ${dish.name} (Parent Restaurant not found)`);
                continue;
            }

            const foodData = {
                restaurant_id: realRestId,
                name: dish.name,
                description: dish.description,
                price: dish.price,
                image: dish.image,
                category: dish.category,
                is_veg: dish.isVeg,
                available: true
            };

            // Check duplicate
            const { data: existingFood } = await supabase
                .from('foods')
                .select('id')
                .eq('restaurant_id', realRestId)
                .eq('name', dish.name)
                .single();

            if (!existingFood) {
                const { error } = await supabase.from('foods').insert(foodData);
                if (error) console.error(`❌ Error creating food ${dish.name}:`, error.message);
                else console.log(`   ✅ Added Food: ${dish.name}`);
            }
        }

        console.log("\n✨ Full Seeding Completed!");

    } catch (error) {
        console.error("🔥 Critical Seeding Error:", error);
    }
};

seedData();
