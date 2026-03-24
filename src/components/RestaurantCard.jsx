import React, { memo, useState } from 'react';
import { Star, Clock, MapPin, Heart, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { optimizeImage } from '../utils/imageOptimizer';

const RestaurantCard = memo(({ restaurant }) => {
    const { id, name, image, rating, cuisine, deliveryTime, tags, categories } = restaurant || {};
    const { isInWishlist, toggleWishlist } = useShop();
    const [imageLoaded, setImageLoaded] = useState(false);

    const isWishlisted = isInWishlist(id);
    const cuisineText = Array.isArray(cuisine) ? cuisine.join(', ') : (cuisine || (Array.isArray(categories) ? categories.join(', ') : "Restaurant"));
    const fallbackImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4";

    return (
        <Link to={`/restaurant/${id}`} className="block group">
            <div className="bg-white rounded-[1.5rem] shadow-sm overflow-hidden flex flex-col relative h-full border border-gray-100 hover:border-orange-200 transition-all duration-300">
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden shrink-0 bg-gray-100">
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}
                    <img
                        src={optimizeImage(image || fallbackImage, 500)}
                        alt={name}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        className={`w-full h-full object-cover relative z-10 transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 z-20" />

                    {/* Time Badge (Top Left - Matching Image 1) */}
                    <div className="absolute top-3 left-3 z-30 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-[10px] font-black shadow-sm flex items-center gap-1.5 text-gray-800">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        {deliveryTime || "25-30 MIN"}
                    </div>

                    {/* Wishlist Button (Top Right - Matching Image 1) */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(restaurant);
                        }}
                        className={`absolute top-3 right-3 z-30 p-2 rounded-full transition-all duration-300 shadow-sm border border-white/20 ${isWishlisted
                            ? 'bg-red-500 text-white'
                            : 'bg-white/90 text-gray-400 hover:text-red-500'
                            }`}
                    >
                        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>

                    {/* Rating Badge (Bottom Left - Matching Image 1) */}
                    <div className="absolute bottom-3 left-3 z-30 bg-black/70 backdrop-blur-md px-3 py-2 rounded-xl text-white text-[10px] font-black flex items-center gap-2 border border-white/10">
                        <span className="text-orange-400 font-black">{rating || '4.0'}</span>
                        <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                        <div className="w-[1px] h-3 bg-white/20" />
                        <span className="text-[8px] uppercase tracking-widest text-white/70">Premium</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-1 relative bg-white">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight leading-7 group-hover:text-orange-500 transition-colors uppercase truncate mb-1">
                        {name || "Restaurant Name"}
                    </h3>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4 truncate opacity-70">
                        {cuisineText}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-3 py-1.5 rounded-xl uppercase tracking-[0.15em]">
                            Free Delivery
                        </span>

                        <div className="flex items-center gap-1 text-[10px] font-black text-gray-300 group-hover:text-gray-900 transition-colors uppercase tracking-widest">
                            Explore <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
});

export default RestaurantCard;
