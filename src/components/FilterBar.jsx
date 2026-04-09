import React from 'react';
import CategoryFilter from './CategoryFilter';
import { categories } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, Settings2, Flame, Leaf, Drumstick, Clock, Tag } from 'lucide-react';

const FilterBar = ({ activeCategory, setActiveCategory, subFilters, setSubFilters, isSticky }) => {
    const [showPriceSlider, setShowPriceSlider] = React.useState(false);

    const toggleSubFilter = (filterKey) => {
        setSubFilters(prev => ({ 
            ...prev, 
            [filterKey]: !prev[filterKey],
            // If turning on vegOnly, turn off nonVeg and vice versa
            ...(filterKey === 'vegOnly' && !prev.vegOnly ? { nonVeg: false } : {}),
            ...(filterKey === 'nonVeg' && !prev.nonVeg ? { vegOnly: false } : {})
        }));
    };

    return (
        <div
            className={`transition-all duration-300 ease-out z-40 
            ${isSticky
                    ? 'w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-2.5' 
                    : 'relative w-full bg-transparent pb-2' 
                }`}
        >
            {/* Big Categories when NOT Sticky */}
            {!isSticky && (
                <div className="w-full mb-3">
                    <CategoryFilter
                        categories={categories}
                        activeCategory={activeCategory}
                        onSelectCategory={setActiveCategory}
                        isSticky={false}
                    />
                </div>
            )}

            <div data-lenis-prevent className={`w-full overflow-x-auto hide-scrollbar ${isSticky ? 'px-4' : 'px-4 sm:px-0'}`}>
                <div className="flex items-center gap-3 h-full pb-1 whitespace-nowrap min-w-max">
                    
                    {/* Settings / Filters Icon */}
                    <button className="flex-shrink-0 h-9 w-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm hover:bg-gray-100 transition-colors">
                        <SlidersHorizontal size={14} />
                    </button>

                    {/* Vertical Divider */}
                    <div className="w-px h-6 bg-gray-200 mx-1"></div>

                    {/* Compact Categories (Only visible inside the horizontal stack when sticky) */}
                    {isSticky && (
                        <>
                            <CategoryFilter
                                categories={categories}
                                activeCategory={activeCategory}
                                onSelectCategory={setActiveCategory}
                                isSticky={true}
                            />
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        </>
                    )}

                    {/* Secondary Filter Pills */}
                    
                    {/* Top Rated */}
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleSubFilter('rating45Plus')}
                        className={`flex-shrink-0 h-9 px-4 rounded-full text-[11px] font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 border cursor-pointer
                            ${subFilters.rating45Plus
                                ? 'bg-orange-500 text-white border-transparent shadow-md'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                    >
                        <Flame size={12} className={subFilters.rating45Plus ? 'text-yellow-300' : 'text-orange-500'} />
                        Top Rated
                    </motion.button>

                    {/* Fast Delivery */}
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleSubFilter('fastDelivery')}
                        className={`flex-shrink-0 h-9 px-4 rounded-full text-[11px] font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 border cursor-pointer
                            ${subFilters.fastDelivery
                                ? 'bg-gray-900 text-white border-transparent shadow-md'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                    >
                        <Clock size={12} className={subFilters.fastDelivery ? 'text-white' : 'text-gray-500'} />
                        Fast Delivery
                    </motion.button>

                    {/* Veg Only */}
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleSubFilter('vegOnly')}
                        className={`flex-shrink-0 h-9 px-4 rounded-full text-[11px] font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 border cursor-pointer
                            ${subFilters.vegOnly
                                ? 'bg-green-600 text-white border-transparent shadow-md ring-1 ring-green-600/30'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-green-300'
                            }`}
                    >
                        <Leaf size={12} className={subFilters.vegOnly ? 'text-white' : 'text-green-600'} />
                        Veg
                    </motion.button>

                    {/* Non Veg */}
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleSubFilter('nonVeg')}
                        className={`flex-shrink-0 h-9 px-4 rounded-full text-[11px] font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 border cursor-pointer
                            ${subFilters.nonVeg
                                ? 'bg-red-600 text-white border-transparent shadow-md ring-1 ring-red-600/30'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-red-300'
                            }`}
                    >
                        <Drumstick size={12} className={subFilters.nonVeg ? 'text-white' : 'text-red-500'} />
                        Non-Veg
                    </motion.button>

                    {/* Great Offers */}
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        className={`flex-shrink-0 h-9 px-4 rounded-full text-[11px] font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 border cursor-pointer bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-blue-300`}
                    >
                        <Tag size={12} className="text-blue-500" />
                        Offers
                    </motion.button>

                    {/* Budget Filter */}
                    <div className="relative">
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setShowPriceSlider(!showPriceSlider)}
                            className={`flex-shrink-0 h-9 px-4 rounded-full text-[11px] font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 border cursor-pointer
                                ${subFilters.maxPrice < 1000
                                    ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-sm'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-orange-300'
                                }`}
                        >
                            <span>{subFilters.maxPrice < 1000 ? `Under ₹${subFilters.maxPrice}` : 'Budget'}</span>
                            {subFilters.maxPrice < 1000 && (
                                <X size={12} className="ml-0.5" onClick={(e) => { e.stopPropagation(); setSubFilters(prev => ({ ...prev, maxPrice: 1000 })); }} />
                            )}
                        </motion.button>

                        <AnimatePresence>
                            {showPriceSlider && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className={`absolute left-0 top-full mt-2 bg-white p-4 rounded-xl shadow-xl border border-gray-200 z-[100] w-64 origin-top-left`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-bold text-gray-800">Max Price</span>
                                        <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">₹{subFilters.maxPrice}</span>
                                    </div>

                                    <div className="relative h-6 flex items-center">
                                        <div className="absolute w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-orange-500 transition-all duration-75"
                                                style={{ width: `${(subFilters.maxPrice / 1000) * 100}%` }}
                                            />
                                        </div>
                                        <input
                                            type="range"
                                            min="100"
                                            max="1000"
                                            step="50"
                                            value={subFilters.maxPrice || 1000}
                                            onChange={(e) => setSubFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                                            className="w-full h-1.5 absolute z-20 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-2">
                                        <span>₹100</span>
                                        <span>₹1000+</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FilterBar;
