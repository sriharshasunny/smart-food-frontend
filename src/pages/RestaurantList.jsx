import React from 'react';
import RestaurantCard from '../components/RestaurantCard';
import { mockRestaurants as restaurants } from '../data/mockData';
import { Filter } from 'lucide-react';

const RestaurantList = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Restaurants Near You</h1>
                    <p className="text-gray-500 mt-1">Found {restaurants.length} places</p>
                </div>

                <div className="mt-4 md:mt-0 flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium shadow-sm transition-colors">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                    <select className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-primary-500">
                        <option>Sort by Rating</option>
                        <option>Delivery Time</option>
                        <option>Cost: Low to High</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
            </div>
        </div>
    );
};

export default RestaurantList;
