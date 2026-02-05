import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const offers = [
    {
        id: 1,
        title: "50% OFF",
        subtitle: "On your first order",
        description: "Use code: FIRST50",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
        color: "from-orange-500 to-red-500"
    },
    {
        id: 2,
        title: "Free Delivery",
        subtitle: "From top restaurants",
        description: "No minimum order",
        image: "https://images.unsplash.com/photo-14762242034219ac39bcb3327?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
        color: "from-blue-500 to-indigo-500"
    },
    {
        id: 1,
        title: "Super Saver Deal",
        subtitle: "Burgers starting at ₹129",
        description: "Limited time offer",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
        color: "from-green-500 to-emerald-600"
    }
];

const OffersCarousel = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % offers.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % offers.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + offers.length) % offers.length);

    return (
        <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl group gpu-accelerated">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <img
                        src={offers[current].image}
                        alt={offers[current].title}
                        className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${offers[current].color} opacity-90 mix-blend-multiply`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 text-white z-10">
                        <motion.h3
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl md:text-6xl font-black mb-2 tracking-tight"
                        >
                            {offers[current].title}
                        </motion.h3>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl md:text-2xl font-medium mb-4 text-gray-100"
                        >
                            {offers[current].subtitle}
                        </motion.p>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg self-start text-sm font-bold border border-white/30"
                        >
                            {offers[current].description}
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {offers.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-2 h-2 rounded-full transition-all ${current === index ? 'w-8 bg-white' : 'bg-white/50 hover:bg-white/80'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default OffersCarousel;
