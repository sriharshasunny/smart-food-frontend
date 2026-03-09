import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Zap, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

// Framer Motion Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
};

// Simplified lightweight image variant (No continuous scaling/Ken Burns)
const imageVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } }
};

const SWIPE_CONFIDENCE_THRESHOLD = 10000;
const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
};

const HeroBanner = ({ topRightContent }) => {
    // direction state allows us to know which way to animate the slide
    const [[page, direction], setPage] = useState([0, 0]);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const safeIndex = Math.abs(page % premiumOffers.length);
    const currentIndex = safeIndex;

    const paginate = (newDirection) => {
        setIsAutoPlaying(false);
        setPage([page + newDirection, newDirection]);
    };

    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => {
            setPage([page + 1, 1]);
        }, 6000);
        return () => clearInterval(timer);
    }, [isAutoPlaying, page]);

    const currentOffer = premiumOffers[currentIndex];
    const IconComponent = currentOffer.icon;

    return (
        // Restored rounded corners and mx-auto
        <div className="relative w-full mx-auto h-[60vh] min-h-[400px] md:h-[70vh] md:min-h-[550px] overflow-hidden bg-gray-950 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl group select-none content-visibility-auto contain-paint">

            {/* Carousel Container leveraging Framer Motion AnimatePresence */}
            <div className="relative h-full w-full pointer-events-auto overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        className="absolute inset-0 touch-pan-y" // Allow vertical scrolling
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.5 } }}
                        exit={{ opacity: 0, transition: { duration: 0.5 } }}
                        drag="x" // Enable horizontal dragging only
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.8}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);
                            if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) {
                                paginate(1); // Swipe left = next
                            } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) {
                                paginate(-1); // Swipe right = prev
                            }
                        }}
                    >
                        {/* Background Image with Ken Burns Effect */}
                        <motion.img
                            variants={imageVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            src={currentOffer.image}
                            alt={currentOffer.title}
                            decoding="async"
                            loading="eager"
                            className="absolute inset-0 w-full h-full object-cover object-center origin-center pointer-events-none"
                        />

                        {/* High-End gradient overlay for performance */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent md:via-black/50 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent md:hidden pointer-events-none" />

                        {/* Content Area with Staggered Entrance */}
                        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 lg:px-24 max-w-7xl mx-auto text-white z-20 pointer-events-none w-full">
                            <motion.div variants={containerVariants} initial="hidden" animate="show" exit="exit" className="pointer-events-auto w-full max-w-3xl">

                                <motion.div variants={itemVariants} className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6 flex-wrap">
                                    <span className={`inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest bg-gradient-to-r ${currentOffer.accent} shadow-lg shadow-orange-500/20`}>
                                        <IconComponent size={14} className="md:w-4 md:h-4" />
                                        {currentOffer.subtitle}
                                    </span>
                                    <div className="hidden sm:flex items-center gap-1.5 text-yellow-400 text-[10px] md:text-sm font-black uppercase tracking-widest bg-white/10 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-white/20 shadow-xl">
                                        <Sparkles size={14} className="md:w-4 md:h-4" /> EXCLUSIVE
                                    </div>
                                </motion.div>

                                {/* Next-Gen Typography */}
                                <motion.h2 variants={itemVariants} className="text-4xl sm:text-6xl md:text-7xl lg:text-[6.5rem] font-black mb-4 md:mb-6 leading-[1.05] tracking-tight drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-400">
                                    {currentOffer.title}
                                </motion.h2>

                                <motion.p variants={itemVariants} className="text-sm sm:text-lg md:text-2xl font-medium mb-6 md:mb-10 text-gray-300 max-w-sm md:max-w-xl leading-relaxed drop-shadow-lg">
                                    {currentOffer.description}
                                </motion.p>

                                <motion.div variants={itemVariants} className="flex items-center gap-3 md:gap-5 flex-wrap">
                                    {/* Clean Button */}
                                    <button className="group/btn relative px-6 py-3.5 md:px-10 md:py-4 bg-white text-black rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider hover:bg-orange-50 transition-colors duration-300 shadow-xl flex items-center gap-2 md:gap-3 cursor-pointer">
                                        <span className="relative z-10 transition-transform group-hover/btn:scale-105">View Menu</span>
                                        <ArrowRight size={18} className="md:w-5 md:h-5 relative z-10 transition-transform group-hover/btn:translate-x-1 text-orange-500" />
                                    </button>

                                    <div className="hidden sm:flex items-center gap-2 px-5 py-3 md:py-3.5 bg-black/80 rounded-2xl border border-white/10 shadow-lg">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Promo Code</span>
                                        <span className="text-sm md:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 ml-1">{currentOffer.code}</span>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Top Right Slot (Location) */}
            {topRightContent && (
                <div className="absolute top-4 right-4 md:top-6 md:right-8 z-40 pointer-events-auto">
                    {topRightContent}
                </div>
            )}

            {/* Indicators - Bottom */}
            <div className="absolute inset-x-0 bottom-4 md:bottom-8 flex justify-between items-end px-6 md:px-12 lg:px-24 mx-auto max-w-7xl z-30 pointer-events-none">
                <div className="flex gap-2.5 pointer-events-auto mb-2 md:mb-0">
                    {premiumOffers.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => { setIsAutoPlaying(false); setPage([index, index > page ? 1 : -1]); }}
                            className={`h-1.5 md:h-2 rounded-full transition-all duration-500 shadow-lg ${index === safeIndex ? 'w-10 md:w-16 bg-white shadow-white/50' : 'w-2 md:w-3 bg-white/40 hover:bg-white/60'}`}
                        />
                    ))}
                </div>

                <div className="hidden md:flex gap-4 pointer-events-auto">
                    <button onClick={() => paginate(-1)} className="w-14 h-14 rounded-full border border-white/20 bg-black/60 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl hover:shadow-white/20">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={() => paginate(1)} className="w-14 h-14 rounded-full border border-white/20 bg-black/60 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 hover:scale-110 active:scale-95 shadow-xl hover:shadow-white/20">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

        </div>
    );
};
export default HeroBanner;
