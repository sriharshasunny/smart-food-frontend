import React, { memo, useState } from 'react';
import { Star, Plus, Heart, Clock, Flame } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { optimizeImage } from '../utils/imageOptimizer';

// Optimization: Use memo to prevent unnecessary re-renders
const FoodCard = memo(({ food, restaurantName, variant = 'vertical', isFeatured = false, onAdd }) => {
    const { addToCart, toggleWishlist, isInWishlist, cart } = useShop();
    const [imageLoaded, setImageLoaded] = useState(false);
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
                className="bg-white rounded-2xl p-3 border border-gray-100 flex gap-4 relative group hover:border-orange-200 transition-colors"
            >

                {/* Image Section - Square - Optimized loading */}
                <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {/* YouTube-style Skeleton Overlay */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" />
                    )}
                    <img
                        src={optimizeImage(food.image, 200)} // Optimize for thumbnail
                        alt={food.name}
                        loading="lazy"
                        decoding="async"
                        onLoad={() => setImageLoaded(true)}
                        className={`w-full h-full object-cover transform transition-opacity duration-500 relative z-10 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
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
                        <div className="flex items-center gap-1 bg-black/5 backdrop-blur-sm px-2 py-0.5 rounded text-yellow-500 shadow-sm shadow-black/5 font-black border border-black/5 text-[10px]">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500 drop-shadow-[0_0_2px_rgba(234,179,8,0.4)]" />
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
        <div className="bg-white rounded-[1.5rem] overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 group flex flex-col h-full hover:-translate-y-1.5 cursor-pointer relative">

            {/* Premium Inner Glow */}
            <div className="absolute inset-0 rounded-[1.5rem] border-2 border-transparent group-hover:border-white/50 pointer-events-none z-10 transition-colors duration-500" />

            {/* Image Section */}
            <div className="relative h-44 bg-gray-100 overflow-hidden">
                {/* YouTube-style Skeleton Overlay */}
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" />
                )}

                <img
                    src={optimizeImage(food.image, 600)} // Optimize for card width
                    alt={food.name}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover relative z-10 transition-all duration-700 ease-out group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0 scale-105'}`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80" />

                {/* Restaurant Name Overlay */}
                {restaurantName && (
                    <div className="absolute top-3 left-3 z-10">
                        <p className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 drop-shadow-md bg-black/30 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                            {restaurantName}
                        </p>
                    </div>
                )}

                {/* Rating Badge - Liquid Dark with Gold Text */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-yellow-400 text-[11px] font-black shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-white/10 ring-1 ring-white/5">
                    {food.rating || 4.2} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                </div>

                <button
                    onClick={handleWishlist}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500 transition-colors border border-white/20 hover:border-transparent shadow-sm"
                >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow bg-white">
                <div className="flex justify-between items-start mb-1.5 gap-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1 text-[15px] group-hover:text-orange-600 transition-colors leading-tight">
                        {food.name}
                    </h3>
                    <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 mt-0.5 ${food.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${food.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                    </div>
                </div>

                <p className="text-gray-500 text-[11px] font-medium line-clamp-2 mb-4 leading-relaxed">
                    {food.description}
                </p>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="font-black text-lg text-gray-900 leading-none">₹{food.price}</span>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="bg-orange-50 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 text-orange-600 hover:text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 border border-orange-100 hover:border-transparent shadow-sm hover:shadow-orange-500/30 flex items-center gap-1 group/btn"
                    >
                        ADD
                        <span className="text-sm font-light leading-none group-hover/btn:rotate-90 transition-transform duration-300 ml-0.5">+</span>
                    </button>
                </div>
            </div>
        </div>
    );
});

export default FoodCard;
