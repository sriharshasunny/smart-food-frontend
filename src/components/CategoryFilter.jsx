import React from 'react';

const CategoryFilter = ({ categories, activeCategory, onSelectCategory, isSticky }) => {
    // STICKY MODE: Text-only Pills
    if (isSticky) {
        return (
            <div className="w-full overflow-x-auto pb-0 hide-scrollbar animate-fade-in-down">
                <div className="flex gap-1 px-0 items-center h-full">
                    {/* All Option */}
                    <button
                        onClick={() => onSelectCategory('All')}
                        className={`flex-shrink-0 h-9 px-4 rounded-full text-[11px] font-bold tracking-wide transition-all flex items-center gap-2 border ${activeCategory === 'All'
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent shadow-md transform scale-105'
                            : 'bg-gray-50 text-gray-600 hover:bg-white hover:text-black border-transparent hover:border-gray-200 hover:shadow-sm'
                            }`}
                    >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${activeCategory === 'All' ? 'bg-white/20' : 'bg-white'}`}>
                            <span className="text-[9px]">ALL</span>
                        </div>
                        All
                    </button>

                    {/* Categories */}
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat.name)}
                            className={`flex-shrink-0 h-9 px-4 rounded-full text-[11px] font-bold tracking-wide transition-all flex items-center gap-2 border ${activeCategory === cat.name
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent shadow-md transform scale-105'
                                : 'bg-gray-50 text-gray-600 hover:bg-white hover:text-black border-transparent hover:border-gray-200 hover:shadow-sm'
                                }`}
                        >
                            <img src={cat.image} alt={cat.name} className="w-5 h-5 rounded-full object-cover shadow-sm bg-white" />
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // DEFAULT MODE: Image Circles
    return (
        <div className="w-full overflow-x-auto pb-4 hide-scrollbar pt-2">
            <div className="flex gap-6 px-4 sm:px-0">
                {/* All Option */}
                <button
                    onClick={() => onSelectCategory('All')}
                    className={`flex-shrink-0 flex flex-col items-center gap-2 group transition-all ${activeCategory === 'All' ? 'scale-105' : 'opacity-80 hover:opacity-100'}`}
                >
                    <div className={`
                        w-20 h-20 rounded-full flex items-center justify-center transition-all relative z-10
                        ${activeCategory === 'All'
                            ? 'bg-gradient-to-tr from-orange-500 to-red-500 shadow-lg shadow-orange-300 ring-4 ring-orange-50 animate-float'
                            : 'bg-white shadow-md group-hover:shadow-lg border border-gray-100'
                        }
                    `}>
                        <span className={`font-black text-sm ${activeCategory === 'All' ? 'text-white' : 'text-orange-500'}`}>ALL</span>
                    </div>
                    <span className={`text-xs font-bold transition-colors ${activeCategory === 'All' ? 'text-orange-600' : 'text-gray-500'}`}>
                        All
                    </span>
                </button>

                {/* Category items with 3D Glossy Images */}
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.name)}
                        className={`flex-shrink-0 flex flex-col items-center gap-3 group transition-all duration-300 ${activeCategory === cat.name ? 'scale-110' : 'hover:-translate-y-1'
                            }`}
                    >
                        {/* 3D Icon Container */}
                        <div className={`
                            relative w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500
                            ${activeCategory === cat.name ? 'animate-float' : ''}
                        `}>
                            {/* Glow Effect / Backdrop */}
                            <div className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-500 ${activeCategory === cat.name ? 'bg-orange-200/50 opacity-100' : 'bg-gray-100/0 opacity-0 group-hover:opacity-50'
                                }`} />

                            {/* The Image (No border crop, let it float) */}
                            <img
                                src={cat.image}
                                alt={cat.name}
                                className={`w-24 h-24 max-w-none object-contain drop-shadow-lg transition-transform duration-500 ${activeCategory === cat.name ? 'scale-110 drop-shadow-2xl' : 'grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110'
                                    }`}
                            />
                        </div>

                        <span className={`text-xs font-bold whitespace-nowrap transition-colors bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm ${activeCategory === cat.name ? 'text-orange-600 shadow-sm' : 'text-gray-500 group-hover:text-gray-800'
                            }`}>
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilter;
