import biryaniImg from '../assets/categories/biryani.png';
import northIndianImg from '../assets/categories/north_indian.png';
import southIndianImg from '../assets/categories/south_indian.png';
import chineseImg from '../assets/categories/chinese.png';
import pizzaImg from '../assets/categories/pizza.png';
import burgerImg from '../assets/categories/burger.png';
import continentalImg from '../assets/categories/continental.png';
import streetFoodImg from '../assets/categories/street_food.png';
import fastFoodImg from '../assets/categories/fast_food.png';
import dessertsImg from '../assets/categories/desserts.png';
import bakeryImg from '../assets/categories/bakery.png';
import healthyImg from '../assets/categories/healthy.png';
import sushiImg from '../assets/categories/sushi.png';

// Food item images
import californiaRoll from '../assets/food/california_roll.png';
import tunaSashimi from '../assets/food/tuna_sashimi.png';
import misoSoup from '../assets/food/miso_soup.png';
import frenchFries from '../assets/food/french_fries.png';
import veggieBurger from '../assets/food/veggie_burger.png';
import friedRice from '../assets/food/fried_rice.png';
import dimSum from '../assets/food/dim_sum.png';
import masalaDosa from '../assets/food/masala_dosa.png';
import idliSambar from '../assets/food/idli_sambar.png';
import filterCoffee from '../assets/food/filter_coffee.png';
import garlicBreadsticks from '../assets/food/garlic_breadsticks.png';
import bbqWings from '../assets/food/bbq_wings.png';

export const categories = [
    { id: 1, name: 'Biryani', image: biryaniImg },
    { id: 9, name: 'North Indian', image: northIndianImg },
    { id: 6, name: 'South Indian', image: southIndianImg },
    { id: 5, name: 'Chinese', image: chineseImg },
    { id: 2, name: 'Pizza', image: pizzaImg },
    { id: 3, name: 'Burger', image: burgerImg },
    { id: 10, name: 'Continental', image: continentalImg },
    { id: 11, name: 'Street Food', image: streetFoodImg },
    { id: 12, name: 'Fast Food', image: fastFoodImg },
    { id: 7, name: 'Desserts', image: dessertsImg },
    { id: 13, name: 'Bakery', image: bakeryImg },
    { id: 8, name: 'Healthy', image: healthyImg },
    { id: 4, name: 'Sushi', image: sushiImg },
    { id: 14, name: 'Ice Cream', image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=50" }
];

export const offers = [
    { id: 1, title: "50% OFF", description: "On your first order", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=50", code: "WELCOME50" },
    { id: 2, title: "Free Delivery", description: "On orders above $30", image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=500&q=50", code: "FREEDEL" },
    { id: 3, title: "20% Cashback", description: "Pay via UPI", image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=500&q=50", code: "UPI20" }
];

export const mockRestaurants = [
    {
        id: 1,
        name: "Spice Garden",
        rating: 4.5,
        deliveryTime: "30-45 min",
        costForTwo: "₹600",
        minOrder: 150,
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=50", // Cozy Cafe replacement
        tags: ["Indian", "Biryani", "Curry"],
        cuisine: "Indian",
        type: "restaurant"
    },
    {
        id: 2,
        name: "Sushi Master",
        rating: 4.8,
        deliveryTime: "45-60 min",
        costForTwo: "₹1200",
        minOrder: 300,
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=50", // Sushi Bar replacement
        tags: ["Japanese", "Sushi", "Asian"],
        cuisine: "Japanese",
        type: "restaurant"
    },
    {
        id: 3,
        name: "Burger King",
        rating: 4.2,
        deliveryTime: "20-35 min",
        costForTwo: "₹400",
        minOrder: 100,
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=500&q=50", // Modern Diner replacement
        tags: ["Burgers", "Fast Food", "American"],
        cuisine: "Burgers",
        type: "restaurant"
    },
    {
        id: 4,
        name: "Italian Delight",
        rating: 4.7,
        deliveryTime: "40-55 min",
        costForTwo: "₹900",
        minOrder: 250,
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=500&q=50", // Pizzeria replacement
        tags: ["Italian", "Pizza", "Pasta"],
        cuisine: "Italian",
        type: "restaurant"
    },
    {
        id: 5,
        name: "Wok & Roll",
        rating: 4.4,
        deliveryTime: "25-40 min",
        costForTwo: "₹700",
        minOrder: 200,
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=500&q=50", // Asian Rest replacement
        tags: ["Chinese", "Asian", "Stir Fry"],
        cuisine: "Chinese",
        type: "restaurant"
    },
    {
        id: 6,
        name: "Dosa Plaza",
        rating: 4.3,
        deliveryTime: "25-40 min",
        costForTwo: "₹300",
        minOrder: 100,
        image: "https://images.unsplash.com/photo-1589301760588-3771c503b3d6?auto=format&fit=crop&w=500&q=50", // South Indian cafe replacement
        tags: ["South Indian", "Dosa", "Vegetarian"],
        cuisine: "South Indian",
        type: "restaurant"
    },
    {
        id: 7,
        name: "Pizza Hut",
        rating: 4.1,
        deliveryTime: "30-45 min",
        costForTwo: "₹500",
        minOrder: 150,
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=50",
        tags: ["Pizza", "Fast Food"],
        cuisine: "Pizza",
        type: "restaurant"
    },
    {
        id: 8,
        name: "Healthy Bites",
        rating: 4.6,
        deliveryTime: "20-30 min",
        costForTwo: "₹550",
        minOrder: 180,
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=500&q=50",
        tags: ["Healthy", "Salads", "Smoothies"],
        cuisine: "Healthy",
        type: "restaurant"
    },
    {
        id: 9,
        name: "Scoops & Cones",
        rating: 4.9,
        deliveryTime: "15-25 min",
        costForTwo: "₹250",
        minOrder: 100,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=50",
        tags: ["Ice Cream", "Desserts", "Shakes"],
        cuisine: "Desserts",
        type: "restaurant"
    }
];

export const mockDishes = [
    // 1. Spice Garden (Indian - Biryani focus)
    { id: 101, name: "Hyderabadi Chicken Biryani", price: 320, description: "Aromatic basmati rice cooked with tender chicken and spices.", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Biryani", rating: 4.8, isVeg: false },
    { id: 102, name: "Butter Chicken", price: 290, description: "Creamy tomato curry with tender chicken pieces.", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Curry", rating: 4.7, isVeg: false },
    { id: 103, name: "Paneer Tikka Masala", price: 260, description: "Grilled paneer cubes in spicy gravy.", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Curry", rating: 4.6, isVeg: true },
    { id: 104, name: "Garlic Naan", price: 60, description: "Freshly baked indian bread with garlic butter.", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Breads", rating: 4.5, isVeg: true },
    { id: 105, name: "Veg Biryani", price: 240, description: "Flavorful rice with seasoned vegetables.", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Biryani", rating: 4.4, isVeg: true },
    { id: 106, name: "Tandoori Chicken", price: 350, description: "Roasted chicken marinated in yogurt and spices.", image: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Starters", rating: 4.9, isVeg: false },
    { id: 107, name: "Samosa", price: 40, description: "Crispy pastry filled with spiced potatoes.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Starters", rating: 4.5, isVeg: true },
    { id: 108, name: "Gulab Jamun", price: 90, description: "Sweet milk dumplings in rose syrup.", image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=400&q=50", restaurantId: 1, category: "Desserts", rating: 4.8, isVeg: true },

    // 2. Sushi Master (Japanese)
    { id: 201, name: "Salmon Nigiri", price: 450, description: "Fresh salmon over pressed vinegared rice.", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=50", restaurantId: 2, category: "Sushi", rating: 4.9, isVeg: false },
    { id: 202, name: "California Roll", price: 380, description: "Crab, avocado, and cucumber roll.", image: californiaRoll, restaurantId: 2, category: "Sushi", rating: 4.6, isVeg: false },
    { id: 203, name: "Tuna Sashimi", price: 550, description: "Thinly sliced fresh tuna.", image: tunaSashimi, restaurantId: 2, category: "Sashimi", rating: 4.8, isVeg: false },
    { id: 204, name: "Dragon Roll", price: 620, description: "Eel and cucumber topped with avocado.", image: "https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db?auto=format&fit=crop&w=400&q=50", restaurantId: 2, category: "Sushi", rating: 4.9, isVeg: false },
    { id: 205, name: "Miso Soup", price: 150, description: "Traditional Japanese soup with tofu.", image: misoSoup, restaurantId: 2, category: "Soup", rating: 4.5, isVeg: true },
    { id: 206, name: "Tempura Shrimp", price: 420, description: "Crispy fried shrimp batter.", image: "https://images.unsplash.com/photo-1615557960916-5f4791effe9d?auto=format&fit=crop&w=400&q=50", restaurantId: 2, category: "Starters", rating: 4.7, isVeg: false },
    { id: 207, name: "Spicy Tuna Roll", price: 480, description: "Tuna with spicy mayo.", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=400&q=50", restaurantId: 2, category: "Sushi", rating: 4.6, isVeg: false },

    // 3. Burger King
    { id: 301, name: "Whopper", price: 220, description: "The classic flame-grilled beef burger.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=50", restaurantId: 3, category: "Burger", rating: 4.5, isVeg: false },
    { id: 302, name: "Cheeseburger", price: 150, description: "Simple beef patty with cheddar cheese.", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=50", restaurantId: 3, category: "Burger", rating: 4.2, isVeg: false },
    { id: 303, name: "Chicken Royale", price: 190, description: "Crispy chicken breast with lettuce.", image: "https://images.unsplash.com/photo-1615297928064-24977384d0f9?auto=format&fit=crop&w=400&q=50", restaurantId: 3, category: "Burger", rating: 4.4, isVeg: false },
    { id: 304, name: "Veggie Burger", price: 170, description: "Plant-based patty with fresh veggies.", image: veggieBurger, restaurantId: 3, category: "Burger", rating: 4.3, isVeg: true },
    { id: 305, name: "French Fries", price: 90, description: "Golden crispy potato fries.", image: frenchFries, restaurantId: 3, category: "Sides", rating: 4.6, isVeg: true },
    { id: 306, name: "Onion Rings", price: 110, description: "Battered and fried onion rings.", image: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=400&q=50", restaurantId: 3, category: "Sides", rating: 4.4, isVeg: true },

    // 4. Italian Delight
    { id: 401, name: "Margherita Pizza", price: 350, description: "Classic tomato and mozzarella pizza.", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=50", restaurantId: 4, category: "Pizza", rating: 4.6, isVeg: true },
    { id: 402, name: "Pepperoni Pizza", price: 450, description: "Pizza topped with spicy pepperoni slices.", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=50", restaurantId: 4, category: "Pizza", rating: 4.8, isVeg: false },
    { id: 403, name: "Carbonara Pasta", price: 420, description: "Creamy pasta with bacon and egg.", image: "https://images.unsplash.com/photo-1612874742237-982867143824?auto=format&fit=crop&w=400&q=50", restaurantId: 4, category: "Pasta", rating: 4.7, isVeg: false },
    { id: 404, name: "Lasagna", price: 480, description: "Layered pasta with meat sauce and cheese.", image: "https://images.unsplash.com/photo-1574868235814-7d4761643195?auto=format&fit=crop&w=400&q=50", restaurantId: 4, category: "Pasta", rating: 4.8, isVeg: false },
    { id: 405, name: "Tiramisu", price: 250, description: "Coffee-flavoured Italian dessert.", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400&q=50", restaurantId: 4, category: "Desserts", rating: 4.9, isVeg: true },

    // 5. Wok & Roll (Chinese)
    { id: 501, name: "Kung Pao Chicken", price: 320, description: "Spicy stir-fry chicken with peanuts.", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400&q=50", restaurantId: 5, category: "Main", rating: 4.5, isVeg: false },
    { id: 502, name: "Veggie Spring Rolls", price: 180, description: "Crispy rolls filled with vegetables.", image: "https://images.unsplash.com/photo-1544681280-d2dc0444bedd?auto=format&fit=crop&w=400&q=50", restaurantId: 5, category: "Starters", rating: 4.4, isVeg: true },
    { id: 503, name: "Fried Rice", price: 250, description: "Stir-fried rice with eggs and veggies.", image: friedRice, restaurantId: 5, category: "Main", rating: 4.3, isVeg: false },
    { id: 504, name: "Dim Sum", price: 280, description: "Steamed dumplings.", image: dimSum, restaurantId: 5, category: "Starters", rating: 4.6, isVeg: false },
    { id: 505, name: "Hakka Noodles", price: 240, description: "Stir-fried noodles with crisp veggies.", image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=400&q=50", restaurantId: 5, category: "Main", rating: 4.5, isVeg: true },
    { id: 506, name: "Manchow Soup", price: 160, description: "Spicy and tangy soup with crispy noodles.", image: "https://images.unsplash.com/photo-1511690078903-71dc5a49f5e3?auto=format&fit=crop&w=400&q=50", restaurantId: 5, category: "Soup", rating: 4.3, isVeg: true },

    // 6. Dosa Plaza (South Indian)
    { id: 601, name: "Masala Dosa", price: 120, description: "Crispy crepe filled with potato masala.", image: masalaDosa, restaurantId: 6, category: "Dosa", rating: 4.8, isVeg: true },
    { id: 602, name: "Idli Sambar", price: 80, description: "Steamed rice cakes with lentil soup.", image: idliSambar, restaurantId: 6, category: "Breakfast", rating: 4.5, isVeg: true },
    { id: 603, name: "Vada", price: 70, description: "Fried savory donut-shaped snacks.", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=400&q=50", restaurantId: 6, category: "Snacks", rating: 4.6, isVeg: true },
    { id: 604, name: "Uttapam", price: 110, description: "Thick pancake with toppings.", image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=400&q=50", restaurantId: 6, category: "Breakfast", rating: 4.4, isVeg: true },
    { id: 605, name: "Filter Coffee", price: 40, description: "Authentic South Indian coffee.", image: filterCoffee, restaurantId: 6, category: "Beverage", rating: 4.9, isVeg: true },
    { id: 606, name: "Rava Dosa", price: 130, description: "Crispy semolina crepe with spices.", image: "/assets/food/rava_dosa.png", restaurantId: 6, category: "Dosa", rating: 4.7, isVeg: true },

    // 7. Pizza Hut
    { id: 701, name: "Veggie Supreme", price: 420, description: "Loaded with fresh vegetables.", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=50", restaurantId: 7, category: "Pizza", rating: 4.5, isVeg: true },
    { id: 702, name: "Chicken Supreme", price: 480, description: "Loaded with chicken and veggies.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=50", restaurantId: 7, category: "Pizza", rating: 4.7, isVeg: false },
    { id: 703, name: "Meat Lovers", price: 550, description: "Pepperoni, ham, beef, and sausage.", image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=400&q=50", restaurantId: 7, category: "Pizza", rating: 4.8, isVeg: false },
    { id: 704, name: "Garlic Breadsticks", price: 160, description: "Oven-baked with garlic butter.", image: garlicBreadsticks, restaurantId: 7, category: "Side", rating: 4.6, isVeg: true },
    { id: 705, name: "BBQ Wings", price: 240, description: "Tossed in smoky BBQ sauce.", image: bbqWings, restaurantId: 7, category: "Side", rating: 4.7, isVeg: false },

    // 8. Healthy Bites
    { id: 801, name: "Greek Salad", price: 280, description: "Fresh salad with feta cheese and olives.", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=400&q=50", restaurantId: 8, category: "Salad", rating: 4.7, isVeg: true },
    { id: 802, name: "Avocado Toast", price: 250, description: "Toasted bread with mashed avocado.", image: "/assets/food/avocado_toast.png", restaurantId: 8, category: "Breakfast", rating: 4.8, isVeg: true },
    { id: 803, name: "Green Smoothie", price: 180, description: "Blend of spinach, apple, and ginger.", image: "/assets/food/green_smoothie.png", restaurantId: 8, category: "Smoothie", rating: 4.6, isVeg: true },
    { id: 804, name: "Quinoa Power Bowl", price: 320, description: "Protein-packed bowl with veggies.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=50", restaurantId: 8, category: "Bowl", rating: 4.9, isVeg: true },
    { id: 805, name: "Fruit Parfait", price: 160, description: "Yogurt layered with fresh berries.", image: "/assets/food/fruit_parfait.png", restaurantId: 8, category: "Desserts", rating: 4.8, isVeg: true },

    // 9. Scoops & Cones (Ice Cream)
    { id: 901, name: "Belgian Chocolate Scoop", price: 120, description: "Rich dark chocolate ice cream.", image: "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=400&q=50", restaurantId: 9, category: "Ice Cream", rating: 4.9, isVeg: true },
    { id: 902, name: "Strawberry Swirl", price: 110, description: "Fresh strawberry ice cream.", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=50", restaurantId: 9, category: "Ice Cream", rating: 4.7, isVeg: true },
    { id: 903, name: "Vanilla Bean", price: 100, description: "Classic vanilla with real bean pods.", image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=400&q=50", restaurantId: 9, category: "Ice Cream", rating: 4.6, isVeg: true },
    { id: 904, name: "Mango Sorbet", price: 130, description: "Dairy-free fresh mango delight.", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=50", restaurantId: 9, category: "Ice Cream", rating: 4.8, isVeg: true },
    { id: 905, name: "Cookie Dough", price: 150, description: "Vanilla ice cream with chunks of cookie dough.", image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&q=50", restaurantId: 9, category: "Ice Cream", rating: 4.9, isVeg: true }
];
