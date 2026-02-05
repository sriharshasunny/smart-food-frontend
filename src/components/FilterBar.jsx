import React from 'react';
import CategoryFilter from './CategoryFilter';
import { categories } from '../data/mockData';
import { Star, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FilterBar = ({ activeCategory, setActiveCategory, subFilters, setSubFilters, isSticky }) => {
    const [showPriceSlider, setShowPriceSlider] = React.useState(false);


    const toggleSubFilter = (filterKey) => {
        setSubFilters(prev => ({ ...prev, [filterKey]: !prev[filterKey] }));
    };

    return (
        <div
            className={`transition-all duration-300 ease-out z-20
            ${isSticky
                    ? 'w-full h-[67px] flex items-center bg-white shadow-md border-b border-gray-100'
                    : 'relative w-full py-2 bg-transparent'
                }`}
        >
            <div className={`w-full h-full ${isSticky ? 'w-full px-0 flex items-center justify-between gap-4' : 'flex flex-col md:flex-row gap-6'}`}>

                {/* 1. Categories */}
                <div className={`w-full ${isSticky ? 'flex-1 overflow-hidden h-full flex items-center origin-left' : 'md:flex-1'} min-w-0 transition-all duration-300`}>
                    <CategoryFilter
                        categories={categories}
                        activeCategory={activeCategory}
                        onSelectCategory={setActiveCategory}
                        isSticky={isSticky}
                    />
                </div>

                {/* 2. Secondary Filters */}
                <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${isSticky ? 'w-auto h-full flex items-center' : 'w-auto'}`}>
                    <div className={`
                        transition-all duration-200
                        ${isSticky
                            ? 'flex flex-row items-center gap-2 h-full'
                            : 'flex flex-row md:flex-col gap-2 md:gap-1.5 overflow-x-auto md:overflow-hidden md:max-h-[90px] md:overflow-y-auto hide-scrollbar pl-0 md:pl-2 py-1 items-center md:items-end w-full md:w-auto'
                        }
                    `}>

                        {/* Clear Button */}
                        {(subFilters.rating45Plus || subFilters.vegOnly || subFilters.maxPrice < 1000) && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => setSubFilters({ rating45Plus: false, rating4Plus: false, rating35Plus: false, vegOnly: false, maxPrice: 1000 })}
                                className={`text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1 ${isSticky ? 'order-last bg-white px-2 py-1 rounded-full border border-red-100 shadow-sm whitespace-nowrap' : 'mb-1'}`}
                            >
                                {isSticky ? <span className="text-red-600 font-extrabold">&times;</span> : <span>Clear All &times;</span>}
                            </motion.button>
                        )}

                        {/* Top Rated */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleSubFilter('rating45Plus')}
                            className={`flex items-center gap-1.5 transition-all border w-max flex-shrink-0 relative overflow-hidden active:scale-95 duration-200
                                ${isSticky
                                    ? `h-9 px-4 rounded-full text-[11px] font-bold tracking-wide ${subFilters.rating45Plus ? 'bg-orange-500 text-white shadow-md border-transparent' : 'bg-gray-50 text-gray-600 hover:bg-white hover:text-black border-transparent hover:border-gray-200 hover:shadow-sm'}`
                                    : `px-3 py-1 rounded-full text-[11px] font-bold ${subFilters.rating45Plus ? 'bg-gray-900 border-gray-900 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`
                                }`}
                        >
                            <Star size={isSticky ? 12 : 10} className={subFilters.rating45Plus ? 'fill-white text-white' : 'fill-orange-400 text-orange-400'} />
                            Top Rated
                        </motion.button>

                        {/* Pure Veg */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleSubFilter('vegOnly')}
                            className={`flex items-center gap-1.5 transition-all border w-max flex-shrink-0 relative overflow-hidden active:scale-95 duration-200
                                ${isSticky
                                    ? `h-9 px-4 rounded-full text-[11px] font-bold tracking-wide ${subFilters.vegOnly ? 'bg-green-600 text-white shadow-md border-transparent' : 'bg-gray-50 text-gray-600 hover:bg-white hover:text-black border-transparent hover:border-gray-200 hover:shadow-sm'}`
                                    : `px-3 py-1 rounded-full text-[11px] font-bold ${subFilters.vegOnly ? 'bg-green-600 border-green-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${subFilters.vegOnly ? 'bg-white' : 'bg-green-500'}`} />
                            Veg Only
                        </motion.button>

                        {/* Price Range Slider (Volume Style) */}
                        <div
                            className="relative flex items-center"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowPriceSlider(!showPriceSlider)}
                                className={`flex items-center gap-1.5 transition-all border w-max flex-shrink-0 relative overflow-hidden active:scale-95 duration-200
                                ${isSticky
                                        ? `h-9 px-4 rounded-full text-[11px] font-bold tracking-wide ${subFilters.maxPrice < 1000 ? 'bg-blue-600 text-white shadow-md border-transparent' : 'bg-gray-50 text-gray-600 hover:bg-white hover:text-black border-transparent hover:border-gray-200 hover:shadow-sm'}`
                                        : `px-3 py-1 rounded-full text-[11px] font-bold ${subFilters.maxPrice < 1000 ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`
                                    }`}
                            >
                                <span className="text-sm">💰</span>
                                {subFilters.maxPrice < 1000 ? `Under ₹${subFilters.maxPrice}` : 'Budget'}
                            </motion.button>

                            <AnimatePresence>
                                {showPriceSlider && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                        className="absolute top-full right-0 mt-2 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 z-50 w-64 flex flex-col gap-3"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-400">Max Price</span>
                                            <span className="text-sm font-black text-blue-600">₹{subFilters.maxPrice || 1000}</span>
                                        </div>

                                        <div className="relative w-full h-6 flex items-center">
                                            <input
                                                type="range"
                                                min="100"
                                                max="1000"
                                                step="50"
                                                value={subFilters.maxPrice || 1000}
                                                onChange={(e) => setSubFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                                                onMouseUp={() => setTimeout(() => setShowPriceSlider(false), 800)}
                                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
                                            />
                                        </div>

                                        <div className="flex justify-between text-[10px] text-gray-400 font-medium px-0.5">
                                            <span>₹100</span>
                                            <span>₹500</span>
                                            <span>₹1000</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
