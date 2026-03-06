import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Zap, Award } from 'lucide-react';

const premiumOffers = [
    {
        id: 1,
        title: "Gourmet Cravings",
        subtitle: "Premium Quality",
        description: "Experience five-star dining delivered fresh to your doorstep. Handmade burgers, artisan pizzas, and more.",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1600&auto=format&fit=crop",
        accent: "from-orange-500 to-red-600",
        code: "TASTY50",
        icon: Award
    },
    {
        id: 2,
        title: "Super Fast Delivery",
        subtitle: "30 Mins Promise",
        description: "Hungry? We deliver faster than you can set the table. Live tracking included.",
        image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=1600&auto=format&fit=crop",
        accent: "from-blue-500 to-indigo-600",
        code: "SPEEDY30",
        icon: Zap
    },
    {
        id: 3,
        title: "Global Flavors",
        subtitle: "World Cuisine",
        description: "From Italian Pasta to spicy Indian Curry, explore a world of flavors today.",
        image: "https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=1600&auto=format&fit=crop",
        accent: "from-emerald-500 to-green-600",
        code: "WORLD40",
        icon: Sparkles
    }
];

// High-Performance CSS-only floating orbs (0% JS overhead)
const FloatingOrbs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-70">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/40 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute -bottom-40 left-1/4 w-[25rem] h-[25rem] bg-pink-500/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
    </div>
);

const HeroBanner = ({ topRightContent }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const containerRef = useRef(null);
    const [transform, setTransform] = useState('');

    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % premiumOffers.length);
        }, 5000);
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

    // Ultra-lightweight Vanilla JS 3D Tilt Effect
    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();

        // Calculate mouse position relative to center of element (-1 to 1)
        const x = (e.clientX - left - width / 2) / (width / 2);
        const y = (e.clientY - top - height / 2) / (height / 2);

        // Constrain tilt to max 4 degrees to ensure lag-free performance
        const rotateX = y * -4;
        const rotateY = x * 4;

        // requestAnimationFrame natively throttles this to monitor refresh rate (60/120fps)
        requestAnimationFrame(() => {
            setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
        });
    };

    const handleMouseLeave = () => {
        requestAnimationFrame(() => {
            setTransform(`perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
        });
    };

    const currentOffer = premiumOffers[currentIndex];
    const IconComponent = currentOffer.icon;

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-[260px] sm:h-[380px] md:h-[480px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl mx-auto group select-none content-visibility-auto contain-paint ease-out transition-transform duration-200"
            style={{ transform, transformStyle: 'preserve-3d' }}
        >
            <FloatingOrbs />

            {/* Carousel Container */}
            <div className="relative h-full w-full bg-gray-900 pointer-events-none">
                {premiumOffers.map((offer, index) => (
                    <div
                        key={offer.id}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'}`}
                        style={{ willChange: 'opacity' }}
                    >
                        {/* Background Image - Optimized Loading */}
                        <div className="absolute inset-0 overflow-hidden">
                            <img
                                src={offer.image}
                                alt={offer.title}
                                decoding="async"
                                loading="eager"
                                className={`w-full h-full object-cover object-center transition-transform duration-[10000ms] ease-out saturate-125 brightness-110 contrast-125 ${index === currentIndex ? 'scale-105' : 'scale-100'}`}
                                style={{ willChange: 'transform' }}
                            />
                        </div>

                        {/* High-End Glassmorphism Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent md:via-black/50 backdrop-blur-[2px]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent md:hidden" />

                        {/* Content Area with 3D Pop (TranslateZ) */}
                        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-24 max-w-5xl text-white z-20 pointer-events-auto" style={{ transform: 'translateZ(50px)' }}>
                            <div className={`transition-all duration-700 delay-100 transform ${index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-5 flex-wrap">
                                    <span className={`inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest bg-gradient-to-r ${offer.accent} shadow-lg shadow-orange-500/20`}>
                                        <IconComponent size={12} className="md:w-3.5 md:h-3.5" />
                                        {offer.subtitle}
                                    </span>
                                    <div className="hidden sm:flex items-center gap-1.5 text-yellow-400 text-[10px] md:text-xl font-bold bg-white/10 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-1.5 rounded-xl border border-white/20 shadow-xl">
                                        <Sparkles size={14} className="md:w-4 md:h-4" /> EXCLUSIVE
                                    </div>
                                </div>

                                {/* Next-Gen Typography */}
                                <h2 className="text-3xl sm:text-5xl md:text-[5.5rem] font-black mb-2 md:mb-6 leading-[1.1] tracking-tight drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300">
                                    {offer.title}
                                </h2>

                                <p className="text-xs sm:text-lg md:text-xl font-medium mb-5 md:mb-8 text-gray-300 max-w-md md:max-w-xl leading-relaxed line-clamp-2 drop-shadow-lg">
                                    {offer.description}
                                </p>

                                <div className="flex items-center gap-3 md:gap-5 flex-wrap">
                                    <button className="group/btn relative px-6 py-3 md:px-10 md:py-4 bg-white text-black rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider hover:bg-gradient-to-r hover:from-white hover:to-gray-200 transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 flex items-center gap-2 md:gap-3 overflow-hidden cursor-pointer">
                                        <span className="relative z-10 transition-transform group-hover/btn:scale-105">View Menu</span>
                                        <ArrowRight size={16} className="md:w-5 md:h-5 relative z-10 transition-transform group-hover/btn:translate-x-1.5 text-orange-500 group-hover/btn:text-red-500" />
                                    </button>

                                    <div className="hidden sm:flex items-center gap-2 px-5 py-3 md:py-3.5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Promo Code</span>
                                        <span className="text-sm md:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 ml-1">{offer.code}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Top Right Slot (Location) */}
            {topRightContent && (
                <div className="absolute top-4 right-4 md:top-8 md:right-8 z-40 pointer-events-auto" style={{ transform: 'translateZ(30px)' }}>
                    {topRightContent}
                </div>
            )}

            {/* Indicators - Bottom */}
            <div className="absolute inset-x-0 bottom-4 md:bottom-8 flex justify-between items-end px-6 md:px-12 z-30 pointer-events-none" style={{ transform: 'translateZ(40px)' }}>
                <div className="flex gap-2 pointer-events-auto">
                    {premiumOffers.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => { setIsAutoPlaying(false); setCurrentIndex(index); }}
                            className={`h-1.5 md:h-2 rounded-full transition-all duration-500 shadow-lg ${index === currentIndex ? 'w-10 md:w-16 bg-white shadow-white/50' : 'w-2 md:w-3 bg-white/40 hover:bg-white/60'}`}
                        />
                    ))}
                </div>

                <div className="hidden md:flex gap-3 pointer-events-auto">
                    <button onClick={prevSlide} className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/20 bg-black/40 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl hover:shadow-white/20">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextSlide} className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/20 bg-black/40 backdrop-blur-xl text-white flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 hover:scale-110 active:scale-95 shadow-2xl hover:shadow-white/20">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};
export default HeroBanner;
