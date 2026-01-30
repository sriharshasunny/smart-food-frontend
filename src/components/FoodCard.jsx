import React from 'react';
import { Star, Plus, Heart, Clock, Flame } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { motion } from 'framer-motion';

const FoodCard = ({ food, restaurantName, variant = 'vertical' }) => {
    const { addToCart, toggleWishlist, isInWishlist, cart } = useShop();
    const isWishlisted = isInWishlist(food.id);

    // Check if item is in cart
    const cartItem = cart.find(item => item.id === food.id);
    const quantity = cartItem?.quantity || 0;

    // Horizontal layout for restaurant menu page
    if (variant === 'horizontal') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group border border-gray-100 hover:border-orange-100 flex gap-4 p-4 transform hover:-translate-y-0.5 relative"
            >
                {/* Image Section - Square */}
                <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-xl">
                    <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-60" />

                    {/* Veg/Non-veg Indicator */}
                    <div className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center ${food.isVeg ? 'border-green-600 bg-white' : 'border-red-600 bg-white'
                        }`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${food.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                    </div>

                    {/* Bestseller Badge */}
                    {food.price > 300 && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-orange-500/95 px-2 py-0.5 rounded-md">
                            <Flame className="w-3 h-3 text-white" />
                            <span className="text-[9px] font-bold text-white uppercase tracking-wide">Bestseller</span>
                        </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(food);
                        }}
                        className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all duration-300 shadow-sm border border-white/20 ${isWishlisted
                            ? 'bg-red-500/90 text-white'
                            : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
                            }`}
                    >
                        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                        <h3 className="font-bold text-base text-gray-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-1 mb-1">
                            {food.name}
                        </h3>

                        <p className="text-gray-400 text-xs font-medium mb-2 line-clamp-2 leading-relaxed">
                            {food.description || 'Delicious food item prepared with fresh ingredients'}
                        </p>

                        {/* Rating and Time */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-gray-700">{food.rating || 4.5}</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                            <div className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">{food.time || '25'}m</span>
                            </div>
                        </div>
                    </div>

                    {/* Price and Add Button */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-50">
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] text-gray-400 font-bold line-through">₹{(food.price * 1.2).toFixed(0)}</span>
                            <span className="font-black text-xl text-gray-900 tracking-tight">₹{food.price}</span>
                        </div>

                        {quantity > 0 ? (
                            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-2 px-3 rounded-lg shadow-md">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Decrease quantity logic would go here
                                    }}
                                    className="hover:scale-110 transition-transform"
                                >
                                    -
                                </button>
                                <span className="text-sm min-w-[20px] text-center">{quantity}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(food);
                                    }}
                                    className="hover:scale-110 transition-transform"
                                >
                                    +
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(food);
                                }}
                                className="bg-gray-50 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 hover:text-white text-gray-700 font-bold py-2 px-5 rounded-lg transition-all duration-300 flex items-center gap-1.5 group/btn shadow-sm hover:shadow-orange-200 hover:shadow-md active:scale-95 border border-gray-100 hover:border-transparent text-xs uppercase tracking-wide"
                            >
                                ADD
                                <Plus className="w-3.5 h-3.5 transition-transform group-hover/btn:rotate-90" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    }

    // Vertical layout (original - for home page grid)
    return (
        <div className="bg-white rounded-[1.5rem] shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-500 overflow-hidden group border border-gray-100 hover:border-orange-100 flex flex-col h-full transform hover:-translate-y-1 relative">

            {/* Image Section - Taller (h-44) & Premium */}
            <div className="relative h-44 overflow-hidden rounded-t-[1.5rem]">
                <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-60" />

                {/* Restaurant Name Overlay (Top Left - Clean White) */}
                {restaurantName && (
                    <div className="absolute top-3 left-3 z-10">
                        <p className="text-[10px] font-black text-white/95 uppercase tracking-[0.2em] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,1)] animate-pulse"></span>
                            {restaurantName}
                        </p>
                    </div>
                )}

                {/* Compact Rating Badge */}
                <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded-lg border border-white/20 shadow-sm transition-colors">
                    <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-[9px] font-bold text-white leading-none">{food.rating}</span>
                </div>

                {/* Compact Time Badge */}
                <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-black/60 px-1.5 py-0.5 rounded-lg border border-white/10 text-white text-[9px] font-bold shadow-sm">
                    <Clock className="w-2.5 h-2.5" />
                    {food.time || '25'}m
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(food);
                    }}
                    className={`absolute top-3 right-3 p-1.5 rounded-full transition-all duration-300 shadow-sm border border-white/20 ${isWishlisted
                        ? 'bg-red-500/90 text-white'
                        : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
                        }`}
                >
                    <Heart className={`w-3 h-3 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Content - Compact Padding */}
            <div className="p-3.5 flex flex-col flex-grow bg-white relative z-10">

                <h3 className="font-bold text-[15px] text-gray-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-1 mb-1">
                    {food.name}
                </h3>

                <p className="text-gray-400 text-[10px] font-medium mb-3 line-clamp-2 leading-relaxed">
                    {food.description}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-gray-50/50">
                    <div className="flex flex-col leading-none">
                        <span className="text-[9px] text-gray-400 font-bold line-through ml-0.5">₹{(food.price * 1.2).toFixed(0)}</span>
                        <span className="font-black text-lg text-gray-900 tracking-tight">₹{food.price}</span>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart(food);
                        }}
                        className="bg-gray-50 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 hover:text-white text-gray-700 font-bold py-1.5 px-4 rounded-lg transition-all duration-300 flex items-center gap-1 group/btn shadow-sm hover:shadow-orange-200 hover:shadow-md active:scale-95 border border-gray-100 hover:border-transparent text-xs"
                    >
                        ADD
                        <Plus className="w-3 h-3 transition-transform group-hover/btn:rotate-90" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FoodCard;
