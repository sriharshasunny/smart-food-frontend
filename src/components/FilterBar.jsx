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
                <div data-lenis-prevent className={`flex-shrink-0 flex ${isSticky ? 'items-center gap-3' : 'flex-col items-stretch gap-[6px] justify-start ml-1 border-l border-gray-100 pl-2 py-0.5 h-[110px] w-[110px] overflow-y-auto hide-scrollbar'}`}>

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

                    {/* Premium Inline Expanding Budget Slider */}
                    <motion.div
                        layout
                        className={`transition-all overflow-hidden flex-shrink-0 border 
                            ${showPriceSlider ? 'w-full min-w-[200px] bg-white rounded-xl shadow-md border-orange-200' : 'bg-transparent border-transparent'}
                        `}
                    >
                        {!showPriceSlider ? (
                            <motion.button
                                layout
                                whileTap={{ scale: 0.98 }}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setShowPriceSlider(true)}
                                className={`transition-all shadow-sm flex items-center justify-between gap-2 border w-full
                                    ${isSticky ? 'px-4 py-2 rounded-full text-[11px] font-bold' : 'px-3 py-1.5 rounded-lg text-[10px] font-bold'}
                                    ${subFilters.maxPrice < 1000
                                        ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20 ring-1 ring-orange-500/20 border-transparent'
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
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="p-3 py-3.5 flex flex-col gap-3 w-full"
                            >
                                <div className="flex justify-between items-center w-full">
                                    <span className="text-[11px] font-black text-gray-800">Max ₹{subFilters.maxPrice}</span>
                                    <X size={14} className="cursor-pointer text-gray-400 hover:text-black shrink-0" onClick={() => setShowPriceSlider(false)} />
                                </div>
                                <div className="relative h-4 flex items-center w-full">
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
                                        className="w-full h-1.5 absolute z-20 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-500 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
