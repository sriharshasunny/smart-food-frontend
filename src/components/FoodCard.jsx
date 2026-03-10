import React, { memo, useState } from 'react';
import { Star, Plus, Heart, Clock, Flame } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { optimizeImage } from '../utils/imageOptimizer';

// Optimization: Use memo to prevent unnecessary re-renders
const FoodCard = memo(({ food, restaurantName, variant = 'vertical', isFeatured = false, onAdd }) => {
    // Avoid importing 'cart' directly if we don't strictly need it to display the quantity here
    // In many UI designs, FoodCard just needs to *add* to cart. 
    // This simple change prevents all 50 FoodCards from re-rendering every time 1 item is added to the cart!
    const { addToCart, toggleWishlist, isInWishlist } = useShop();
    const [imageLoaded, setImageLoaded] = useState(false);

    // Derived state
    const isWishlisted = isInWishlist(food.id);

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
                className="bg-white rounded-2xl p-3 border border-gray-100 flex gap-4 relative hover:border-orange-200 transition-colors"
                style={{ transform: 'translateZ(0)' }} // Hardware acceleration without heavy classes
            >
                {/* Image Section - Square - Optimized loading */}
                <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gray-200" />
                    )}
                    <img
                        src={optimizeImage(food.image, 200)} // Optimize for thumbnail
                        alt={food.name}
                        loading="lazy"
                        decoding="async"
                        onLoad={() => setImageLoaded(true)}
                        className={`w-full h-full object-cover relative z-10 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />

                    {/* Veg/Non-veg Indicator */}
                    <div className={`absolute top-1.5 left-1.5 w-4 h-4 rounded border flex items-center justify-center bg-white ${food.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${food.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                    </div>

                    {/* Wishlist Button - Simplified interactions */}
                    <button
                        onClick={handleWishlist}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white/90 text-gray-400 hover:text-red-500 shadow-sm"
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
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded text-yellow-600 font-bold border border-gray-100 text-[10px]">
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
        <div
            className="bg-white rounded-[1.5rem] overflow-hidden border border-gray-100 flex flex-col h-full cursor-pointer relative hover:border-orange-200 transition-colors"
            style={{ transform: 'translateZ(0)' }}
        >
            {/* Image Section */}
            <div className="relative h-44 bg-gray-100 overflow-hidden">
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200" />
                )}

                <img
                    src={optimizeImage(food.image, 600)} // Optimize for card width
                    alt={food.name}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover relative z-10 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />

                {/* Restaurant Name Overlay */}
                {restaurantName && (
                    <div className="absolute top-3 left-3 z-10">
                        <p className="text-[10px] font-black text-white uppercase tracking-wider bg-black/50 px-2 py-1 rounded-md">
                            {restaurantName}
                        </p>
                    </div>
                )}

                {/* Rating Badge */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-black/60 px-2.5 py-1.5 rounded-lg text-yellow-400 text-[11px] font-black">
                    {food.rating || 4.2} <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>

                <button
                    onClick={handleWishlist}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 text-gray-400 hover:text-red-500 shadow-sm"
                >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow bg-white">
                <div className="flex justify-between items-start mb-1.5 gap-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1 text-[15px] leading-tight">
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
                        className="bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors border border-orange-100 hover:border-transparent flex items-center gap-1"
                    >
                        ADD
                        <span className="text-sm font-light leading-none ml-0.5">+</span>
                    </button>
                </div>
            </div>
        </div>
    );
});

// We need a stable comparison to prevent re-renders when parent states change
export default memo(FoodCard, (prevProps, nextProps) => {
    return prevProps.food.id === nextProps.food.id &&
        prevProps.variant === nextProps.variant &&
        prevProps.onAdd === nextProps.onAdd;
});
