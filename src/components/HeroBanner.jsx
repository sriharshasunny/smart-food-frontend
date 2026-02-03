import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Zap, Brain, Award } from 'lucide-react';

// Import generated banner images
import banner1 from '../assets/banners/banner_gourmet_food.png';
import banner2 from '../assets/banners/banner_fast_delivery_new.png';
import banner3 from '../assets/banners/banner_cuisine_variety.png';

const premiumOffers = [
    {
        id: 1,
        title: "Gourmet Delivery",
        subtitle: "Premium Quality",
        description: "Experience delicious gourmet food delivered fresh to your doorstep. Burgers, pizza, biryani and more!",
        image: banner1,
        accent: "from-orange-500 to-red-600",
        code: "GOURMET50",
        icon: Award
    },
    {
        id: 2,
        title: "Lightning Fast Delivery",
        subtitle: "30 Minutes or Free",
        description: "Hot, fresh food delivered to your doorstep at lightning speed. Track your order in real-time.",
        image: banner2,
        accent: "from-orange-500 to-red-600",
        code: "FASTFOOD30",
        icon: Zap
    },
    {
        id: 3,
        title: "Cuisine Variety",
        subtitle: "World Flavors",
        description: "Explore cuisines from around the world - Indian, Italian, Asian, American and more delivered fresh.",
        image: banner3,
        accent: "from-yellow-500 to-orange-600",
        code: "VARIETY40",
        icon: Sparkles
    }
];

const HeroBanner = ({ topRightContent }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % premiumOffers.length);
        }, 6000); // 6s rotation for 3 images
        return () => clearInterval(timer);
    }, [isAutoPlaying]);

    const prevSlide = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev - 1 + premiumOffers.length) % premiumOffers.length);
    };

    const nextSlide = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev + 1) % premiumOffers.length);
    };

    const currentOffer = premiumOffers[currentIndex];
    const IconComponent = currentOffer.icon;

    return (
        <div className="relative w-full h-[280px] sm:h-[380px] md:h-[480px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl mx-auto group select-none">
            {/* Carousel Container */}
            <div className="relative h-full w-full bg-gray-900">
                {premiumOffers.map((offer, index) => (
                    <div
                        key={offer.id}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
                            }`}
                    >
                        {/* Background Image with Better Fitting (Reduced Zoom) */}
                        <div className="absolute inset-0 overflow-hidden">
                            <img
                                src={offer.image}
                                alt={offer.title}
                                className={`w-full h-full object-cover object-center transition-transform duration-[10000ms] ease-out ${index === currentIndex ? 'scale-105' : 'scale-100'}`}
                            />
                        </div>

                        {/* Enhanced Gradient Overlay for Better Text Readability and Top Nav visibility */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/10" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none" />

                        {/* Content Area */}
                        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-24 max-w-5xl text-white">
                            <div
                                className={`transition-all duration-1000 delay-300 transform ${index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                    }`}
                            >
                                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-5 flex-wrap">
                                    <span
                                        className={`inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest bg-gradient-to-r ${offer.accent} shadow-lg`}
                                    >
                                        <IconComponent size={12} className="md:w-3.5 md:h-3.5" />
                                        {offer.subtitle}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-yellow-400 text-[10px] md:text-xs font-bold bg-white/10 backdrop-blur-md px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl border border-white/20">
                                        <Sparkles size={12} className="md:w-3.5 md:h-3.5" /> LIMITED OFFER
                                    </div>
                                </div>

                                <h2 className="text-3xl sm:text-4xl md:text-7xl font-black mb-3 md:mb-5 leading-tight tracking-tight drop-shadow-2xl">
                                    {offer.title}
                                </h2>

                                <p className="text-sm sm:text-lg md:text-2xl font-light mb-5 md:mb-8 text-gray-100 max-w-2xl leading-relaxed line-clamp-2 md:line-clamp-none">
                                    {offer.description}
                                </p>

                                <div className="flex items-center gap-4 flex-wrap">
                                    <button className="group/btn relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:-translate-y-1 flex items-center gap-3 overflow-hidden">
                                        <span className="relative z-10">Order Now</span>
                                        <ArrowRight size={18} className="relative z-10 transition-transform group-hover/btn:translate-x-1" />

                                        {/* Shine effect */}
                                        <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                    </button>

                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Use Code:</span>
                                        <span className="text-sm font-black text-white border-b-2 border-dashed border-white/50">{offer.code}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Top Right Content Slot (Location Widget) - Above z-10 but below nav controls */}
            {topRightContent && (
                <div className="absolute top-4 right-4 md:top-8 md:right-8 z-40">
                    {topRightContent}
                </div>
            )}

            {/* Premium Navigation Controls */}
            <div className="absolute inset-x-0 bottom-8 flex justify-between items-end px-8 md:px-12 z-20 pointer-events-none">
                {/* Dots Indicator */}
                <div className="flex gap-2.5 pointer-events-auto">
                    {premiumOffers.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setIsAutoPlaying(false);
                                setCurrentIndex(index);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-500 ${index === currentIndex
                                ? 'w-12 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                                : 'w-2 bg-white/30 hover:bg-white/50'
                                }`}
                        />
                    ))}
                </div>

                {/* Arrows */}
                <div className="flex gap-3 pointer-events-auto">
                    <button
                        onClick={prevSlide}
                        className="w-12 h-12 rounded-full border border-white/20 bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-black transition-all hover:scale-110 active:scale-95 group/btn"
                    >
                        <ChevronLeft size={20} className="group-hover/btn:-translate-x-0.5 transition-transform" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="w-12 h-12 rounded-full border border-white/20 bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-black transition-all hover:scale-110 active:scale-95 group/btn"
                    >
                        <ChevronRight size={20} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroBanner;
