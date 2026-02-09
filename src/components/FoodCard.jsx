import React, { memo } from 'react';
import { Star, Plus, Heart, Clock, Flame } from 'lucide-react';
import { useShop } from '../context/ShopContext';

// Optimization: Use memo to prevent unnecessary re-renders
const FoodCard = memo(({ food, restaurantName, variant = 'vertical', isFeatured = false, onAdd }) => {
    const { addToCart, toggleWishlist, isInWishlist, cart } = useShop();
    const isWishlisted = isInWishlist(food.id);

    // Check if item is in cart
    const cartItem = cart.find(item => item.id === food.id);
    const quantity = cartItem?.quantity || 0;

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAdd) onAdd(food); else addToCart(food);
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(food);
    };

    // Variant Check: Horizontal layout for restaurant menu page
    if (variant === 'horizontal') {
        return (
            <div
                className="bg-white rounded-2xl p-3 border border-gray-100 flex gap-4 relative group hover:border-orange-200 transition-colors will-change-transform"
            >
                import {optimizeImage} from '../utils/imageOptimizer';

                // ... (inside component)
                {/* Image Section - Square - Optimized loading */}
                <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    <img
                        src={optimizeImage(food.image, 200)} // Optimize for thumbnail
                        alt={food.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transform"
                    />

                    {/* Veg/Non-veg Indicator */}
                    <div className={`absolute top-1.5 left-1.5 w-4 h-4 rounded border flex items-center justify-center bg-white ${food.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${food.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                    </div>

                    {/* Wishlist Button - Simplified interactions */}
                    <button
                        onClick={handleWishlist}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white/90 text-gray-400 hover:text-red-500 transition-colors shadow-sm"
                    >
                        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 leading-tight line-clamp-1 mb-1 pr-4">
                            {food.name}
                        </h3>
                    </div>

                    <p className="text-gray-500 text-xs line-clamp-2 mb-auto leading-relaxed">
                        {food.description}
                    </p>

                    {/* Rating and Time */}
                    <div className="flex items-center gap-3 mb-3 text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span>{food.rating || 4.2}</span>
                        </div>
                        <span>•</span>
                        <span>{food.time || '25'}m</span>
                    </div>

                    {/* Price and Add Button */}
                    <div className="flex items-center justify-between mt-1">
                        <span className="font-black text-lg text-gray-900">₹{food.price}</span>

                        <button
                            onClick={handleAdd}
                            className="bg-orange-50 text-orange-600 hover:bg-orange-100 font-bold py-1.5 px-4 rounded-lg text-xs uppercase tracking-wide flex items-center gap-1 transition-colors"
                        >
                            ADD <Plus className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Vertical layout (original - for home page grid)
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 group flex flex-col h-full will-change-transform transform hover:-translate-y-1">

            {/* Image Section - Fixed Height for Layout Stability */}
            <div className="relative h-40 bg-gray-100 overflow-hidden">
                <img
                    src={optimizeImage(food.image, 600)} // Optimize for card width (high dpi)
                    alt={food.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                {/* Restaurant Name Overlay */}
                {restaurantName && (
                    <div className="absolute top-3 left-3">
                        <p className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 drop-shadow-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            {restaurantName}
                        </p>
                    </div>
                )}

                {/* Rating Badge */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded text-white text-[10px] font-bold border border-white/10">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>{food.rating || 4.2}</span>
                </div>

                <button
                    onClick={handleWishlist}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500 transition-colors"
                >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
                </button>
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 line-clamp-1 text-sm group-hover:text-orange-600 transition-colors">
                        {food.name}
                    </h3>
                    <div className={`w-3 h-3 rounded-sm border flex items-center justify-center flex-shrink-0 mt-1 ${food.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${food.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                    </div>
                </div>

                <p className="text-gray-500 text-[11px] line-clamp-2 mb-3 leading-relaxed">
                    {food.description}
                </p>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="font-black text-gray-900">₹{food.price}</span>

                    <button
                        onClick={handleAdd}
                        className="bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wide transition-colors border border-gray-100 hover:border-orange-100"
                    >
                        ADD +
                    </button>
                </div>
            </div>
        </div>
    );
});

export default FoodCard;
