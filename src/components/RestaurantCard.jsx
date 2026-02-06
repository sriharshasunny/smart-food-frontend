import React from 'react';
import { Star, Clock, MapPin, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { useShop } from '../context/ShopContext';

const RestaurantCard = ({ restaurant }) => {
    const { id, name, image, rating, cuisine, deliveryTime, minOrder, categories, costForTwo, tags } = restaurant || {};
    const { isInWishlist, toggleWishlist } = useShop();
    const isWishlisted = isInWishlist(id);

    const cuisineText = Array.isArray(cuisine) ? cuisine.join(', ') : (cuisine || (Array.isArray(categories) ? categories.join(', ') : "Restaurant"));

    return (
        <Link to={`/restaurant/${id}`} className="block min-w-[260px] w-[260px] snap-start hover:z-10 group">
            <div
                className="bg-white rounded-[1.5rem] shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out overflow-hidden flex flex-col cursor-pointer relative h-full border border-gray-100 hover:border-orange-100 hover:-translate-y-1 gpu-accelerated"
            >
                {/* Image Section */}
                <div className="relative h-32 md:h-40 overflow-hidden shrink-0">
                    <img
                        src={image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80"}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

                    {/* Time Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1 text-gray-800">
                        <Clock className="w-3 h-3 text-orange-500" />
                        {deliveryTime || "30m"}
                    </div>
                    {/* Wishlist Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(restaurant);
                        }}
                        className={`absolute top-3 right-3 p-1.5 rounded-full transition-all duration-300 shadow-sm border border-white/20 ${isWishlisted
                            ? 'bg-red-500/90 text-white'
                            : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
                            }`}
                    >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>

                    {/* Prominent Rating */}
                    <div className="absolute bottom-3 left-3 bg-green-500/95 px-2 py-1 rounded-lg text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                        {rating || 4.5} <Star className="w-2.5 h-2.5 fill-current" />
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-1 relative bg-white">
                    <div className="flex justify-between items-start gap-1 mb-1">
                        <h3 className="text-[17px] font-black text-gray-900 line-clamp-1 flex-1 tracking-tight group-hover:text-gray-600 transition-colors">
                            {name || "Restaurant Name"}
                        </h3>
                        <div className="bg-gray-50 rounded-full p-1.5 group-hover:bg-gray-100 transition-colors">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 group-hover:text-black" />
                        </div>
                    </div>

                    <p className="text-gray-500 text-[11px] font-medium line-clamp-1 mb-3">
                        {tags ? tags.slice(0, 3).join(" • ") : cuisineText}
                    </p>

                    <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md uppercase tracking-wider">
                            Free Delivery
                        </span>

                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-orange-600 transition-colors flex items-center gap-1">
                            Visit <span className="text-lg leading-none mb-0.5">›</span>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default RestaurantCard;
