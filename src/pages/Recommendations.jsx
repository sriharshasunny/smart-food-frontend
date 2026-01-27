import React from 'react';
import { useShop } from '../context/ShopContext';
import { mockDishes } from '../data/mockData';
import FoodCard from '../components/FoodCard';

const Recommendations = () => {
    const { addToCart } = useShop();

    // Simple logic to just show some "recommended" dishes for now
    const recommendedDishes = mockDishes.filter(d => d.rating >= 4.5);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommended for You</h1>
            <p className="text-gray-500 mb-8">Curated choices mostly based on high ratings.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendedDishes.map(dish => (
                    <FoodCard key={dish.id} food={dish} onAdd={addToCart} />
                ))}
            </div>
        </div>
    );
};

export default Recommendations;
