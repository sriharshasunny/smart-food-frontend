import React from 'react';
import { Star, Clock, Heart, MapPin, ChevronRight, Utensils } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const RestaurantWishlistCard = ({ restaurant }) => {
    const { toggleWishlist, isInWishlist } = useShop();
    const navigate = useNavigate();

    // Safety check
    if (!restaurant) return null;

    const isWishlisted = isInWishlist(restaurant.id, 'restaurant');

    const handleCardClick = () => {
        navigate(`/restaurant/${restaurant.id}`);
    };

    return (
        <motion.div
            onClick={handleCardClick}
            whileHover={{ y: -4 }}
            className="bg-white rounded-[1.5rem] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-orange-100 flex flex-col h-full cursor-pointer relative"
        >
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                {/* Wishlist Button - Absolute Top Right */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist({ ...restaurant, type: 'restaurant' });
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full backdrop-blur-md bg-white/10 hover:bg-red-500 text-white border border-white/20 transition-all duration-300 group/heart"
                >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-red-500 group-hover/heart:text-white' : ''}`} />
                </button>

                {/* Cuisine Badge - Top Left */}
                {restaurant.cuisine && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{restaurant.cuisine}</span>
                    </div>
                )}

                {/* Content Overlay - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 pt-12 bg-gradient-to-t from-black via-black/80 to-transparent">
                    <h3 className="font-black text-xl text-white mb-2 leading-tight group-hover:text-orange-400 transition-colors">
                        {restaurant.name}
                    </h3>

                    <div className="flex items-center gap-4 text-white/90 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                            <span>{restaurant.rating}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/30"></div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-orange-400" />
                            <span>{restaurant.deliveryTime}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/30"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-300">Cost:</span>
                            <span>{restaurant.costForTwo}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions Section */}
            <div className="p-4 flex items-center justify-between border-t border-gray-50 bg-gray-50/50 group-hover:bg-white transition-colors">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]">View Details</span>
                </div>

                <button className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-all">
                    Menu
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </motion.div>
    );
};

export default RestaurantWishlistCard;
