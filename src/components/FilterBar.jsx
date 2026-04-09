import React from 'react';
import CategoryFilter from './CategoryFilter';
import { categories } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const FilterBar = ({ activeCategory, setActiveCategory, subFilters, setSubFilters, isSticky }) => {
    const [showPriceSlider, setShowPriceSlider] = React.useState(false);

    const toggleSubFilter = (filterKey) => {
        setSubFilters(prev => ({ 
            ...prev, 
            [filterKey]: !prev[filterKey],
            ...(filterKey === 'vegOnly' && !prev.vegOnly ? { nonVeg: false } : {}),
            ...(filterKey === 'nonVeg' && !prev.nonVeg ? { vegOnly: false } : {})
        }));
    };

    return (
        <div
            className={`transition-all duration-300 ease-out z-20 
            ${isSticky
                    ? 'w-full h-[60px] flex items-center justify-between bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 px-4' // Sticky: Full width, fixed padding
                    : 'relative w-full bg-transparent px-0' // Normal: parent padding applies or we reset it here? User said "only 15 dp right and left"
                }`}
        >
            <div className={`w-full h-full flex items-center justify-between gap-4 ${isSticky ? '' : ''}`}>

                {/* 1. Categories (Stretches) */}
                <div className={`flex-1 min-w-0 overflow-hidden h-full flex items-center`}>
                    <CategoryFilter
                        categories={categories}
                        activeCategory={activeCategory}
                        onSelectCategory={setActiveCategory}
                        isSticky={isSticky}
                    />
                </div>

                {/* 2. Secondary Filters (Right Side) */}
                <div data-lenis-prevent className={`flex-shrink-0 flex ${isSticky ? 'items-center gap-3' : 'flex-col items-stretch gap-2 justify-start ml-2 border-l border-gray-100 pl-4 py-1 h-[110px] overflow-y-auto hide-scrollbar'}`}>

                    {/* Top Rated */}
                    <motion.button
                        className={`transition-all shadow-sm flex items-center justify-between gap-2 border
                            ${isSticky ? 'px-4 py-2 rounded-full text-[11px] font-bold' : 'w-full px-3 py-1.5 rounded-lg text-[10px] font-bold'}
                            ${subFilters.rating45Plus
                                ? 'bg-gradient-to-br from-black to-gray-800 text-white shadow-md shadow-black/20 ring-1 ring-black/5'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:shadow-sm'
                            }`}
                    >
                        {isSticky ? (
                            <><span>★</span> Top Rated</>
                        ) : (
                            <><span>Top Rated</span> <span className={subFilters.rating45Plus ? 'text-yellow-400' : 'text-gray-400'}>★</span></>
                        )}
                    </motion.button>

                    {/* Veg Only */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => toggleSubFilter('vegOnly')}
                        className={`transition-all shadow-sm flex items-center justify-between gap-2 border
                            ${isSticky ? 'px-4 py-2 rounded-full text-[11px] font-bold' : 'w-full px-3 py-1.5 rounded-lg text-[10px] font-bold'}
                            ${subFilters.vegOnly
                                ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-green-500/20 ring-1 ring-green-500/20'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-600 hover:shadow-sm'
                            }`}
                    >
                        {isSticky ? (
                            <><span className={subFilters.vegOnly ? 'text-white' : 'text-green-600'}>☘</span> Veg Only</>
                        ) : (
                            <><span>Veg Only</span> <span className={subFilters.vegOnly ? 'text-white' : 'text-green-600'}>☘</span></>
                        )}
                    </motion.button>

                    {/* Non Veg */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => toggleSubFilter('nonVeg')}
                        className={`transition-all shadow-sm flex items-center justify-between gap-2 border
                            ${isSticky ? 'px-4 py-2 rounded-full text-[11px] font-bold' : 'w-full px-3 py-1.5 rounded-lg text-[10px] font-bold'}
                            ${subFilters.nonVeg
                                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md shadow-red-500/20 ring-1 ring-red-500/20'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600 hover:shadow-sm'
                            }`}
                    >
                        {isSticky ? (
                            <><span className={subFilters.nonVeg ? 'text-white' : 'text-red-500'}>🍗</span> Non Veg</>
                        ) : (
                            <><span>Non Veg</span> <span className={subFilters.nonVeg ? 'text-white' : 'text-red-500'}>🍗</span></>
                        )}
                    </motion.button>

                    {/* Fast Delivery */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => toggleSubFilter('fastDelivery')}
                        className={`transition-all shadow-sm flex items-center justify-between gap-2 border
                            ${isSticky ? 'px-4 py-2 rounded-full text-[11px] font-bold' : 'w-full px-3 py-1.5 rounded-lg text-[10px] font-bold'}
                            ${subFilters.fastDelivery
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-500/20'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm'
                            }`}
                    >
                        {isSticky ? (
                            <><span className={subFilters.fastDelivery ? 'text-white' : 'text-blue-500'}>⚡</span> Fast</>
                        ) : (
                            <><span>Fast</span> <span className={subFilters.fastDelivery ? 'text-white' : 'text-blue-500'}>⚡</span></>
                        )}
                    </motion.button>

                    {/* Budget Filter */}
                    <div className="relative">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setShowPriceSlider(!showPriceSlider)}
                            className={`transition-all shadow-sm flex items-center justify-between gap-2 border
                                ${isSticky ? 'px-4 py-2 rounded-full text-[11px] font-bold' : 'w-full px-3 py-1.5 rounded-lg text-[10px] font-bold'}
                                ${subFilters.maxPrice < 1000
                                    ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20 ring-1 ring-orange-500/20'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600 hover:shadow-sm'
                                }`}
                        >
                            {isSticky ? (
                                <>
                                    <span>{subFilters.maxPrice < 1000 ? `Under ₹${subFilters.maxPrice}` : 'Budget'}</span>
                                    {subFilters.maxPrice < 1000 && (
                                        <X size={12} className="ml-1 z-10" onClick={(e) => { e.stopPropagation(); setSubFilters(prev => ({ ...prev, maxPrice: 1000 })); }} />
                                    )}
                                </>
                            ) : (
                                <>
                                    <span className="flex items-center gap-1">
                                        {subFilters.maxPrice < 1000 && (
                                            <X size={10} className="mr-1 opacity-70 hover:opacity-100 z-10" onClick={(e) => { e.stopPropagation(); setSubFilters(prev => ({ ...prev, maxPrice: 1000 })); }} />
                                        )}
                                        {subFilters.maxPrice < 1000 ? `Under ₹${subFilters.maxPrice}` : 'Budget'}
                                    </span>
                                    <span className={subFilters.maxPrice < 1000 ? 'text-white' : 'text-orange-500'}>₹</span>
                                </>
                            )}
                        </motion.button>

                        <AnimatePresence>
                            {showPriceSlider && (
                                <motion.div
                                    initial={{ opacity: 0, x: isSticky ? 0 : 10, y: isSticky ? 10 : 0, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: isSticky ? 0 : 10, y: isSticky ? 10 : 0, scale: 0.95 }}
                                    className={`absolute ${isSticky ? 'right-0 top-full mt-3 origin-top-right' : 'right-full top-1/2 -translate-y-1/2 mr-3 origin-right'} bg-white p-4 rounded-xl shadow-xl border border-gray-200 z-[100] w-64`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-bold text-gray-800">Max Price</span>
                                        <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">₹{subFilters.maxPrice}</span>
                                    </div>

                                    <div className="relative h-6 flex items-center">
                                        {/* Custom Track Background */}
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
                                            className="absolute w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {/* Custom Thumb handle managed via CSS normally, but native slider with opacity 0 above works for interactions. 
                                            Let's use standard accent-color for simplicity but higher quality. 
                                         */}
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
                                        <span>₹500</span>
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
