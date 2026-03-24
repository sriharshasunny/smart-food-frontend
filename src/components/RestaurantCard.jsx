import React, { memo, useState } from 'react';
import { Star, Clock, MapPin, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { useShop } from '../context/ShopContext';

import { optimizeImage } from '../utils/imageOptimizer';

const RestaurantCard = memo(({ restaurant }) => {
    const { id, name, image, rating, cuisine, deliveryTime, minOrder, categories, costForTwo, tags } = restaurant || {};
    const { isInWishlist, toggleWishlist } = useShop();
    const [imageLoaded, setImageLoaded] = useState(false);

    const isWishlisted = isInWishlist(id);
    const cuisineText = Array.isArray(cuisine) ? cuisine.join(', ') : (cuisine || (Array.isArray(categories) ? categories.join(', ') : "Restaurant"));
    const fallbackImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4";

    return (
        <Link to={`/restaurant/${id}`} className="block group">
            <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden flex flex-col cursor-pointer relative h-full border border-gray-100 group-hover:border-orange-200"
            >
                {/* Image Section */}
                <div className="relative h-44 overflow-hidden shrink-0 bg-gray-50">
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                    )}
                    <img
                        src={optimizeImage(image || fallbackImage, 600)}
                        alt={name}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        className={`w-full h-full object-cover relative z-10 transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />

                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 z-20" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

                    {/* Time Badge - Glassmorphism */}
                    <div className="absolute top-4 left-4 z-30 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-1.5 text-gray-800 border border-white/40">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        {deliveryTime || "25-30"} MIN
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(restaurant);
                        }}
                        className={`absolute top-4 right-4 z-30 p-2.5 rounded-full transition-all duration-300 shadow-xl border border-white/30 backdrop-blur-md ${isWishlisted
                            ? 'bg-red-500 text-white border-red-400'
                            : 'bg-white/60 text-gray-400 hover:text-red-500 hover:bg-white'
                            }`}
                    >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>

                    {/* Rating Badge - Premium HUD style */}
                    <div className="absolute bottom-4 left-4 z-30 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-yellow-400 text-[11px] font-black flex items-center gap-1.5 shadow-2xl">
                        <span className="flex items-center gap-1">
                            {rating || 4.2} <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        </span>
                        <div className="w-px h-3 bg-white/20 mx-1" />
                        <span className="text-white/60 text-[9px] uppercase tracking-tighter self-end">Premium</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 pt-6 flex flex-col flex-1 relative bg-white">
                    <div className="flex justify-between items-start gap-2 mb-1.5 text-ellipsis overflow-hidden">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-orange-600 transition-colors leading-tight">
                            {name || "Restaurant Name"}
                        </h3>
                    </div>

                    <p className="text-gray-400 text-xs font-bold line-clamp-1 mb-4 uppercase tracking-wider opacity-60">
                        {tags ? tags.slice(0, 3).join(" • ") : cuisineText}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
                                Free Delivery
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-gray-300 group-hover:text-orange-500 transition-all uppercase tracking-widest">
                            Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
});

// Deep comparison to prevent re-renders unless id changes
export default memo(RestaurantCard, (prevProps, nextProps) => {
    return prevProps.restaurant?.id === nextProps.restaurant?.id;
});
