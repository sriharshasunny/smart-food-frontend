import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Zap, Brain, Award } from 'lucide-react';

const premiumOffers = [
    {
        id: 1,
        title: "Gourmet Cravings",
        subtitle: "Premium Quality",
        description: "Experience five-star dining delivered fresh to your doorstep. Handmade burgers, artisan pizzas, and more.",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop", // Optimized w=1200
        accent: "from-orange-500 to-red-600",
        code: "TASTY50",
        icon: Award
    },
    {
        id: 2,
        title: "Super Fast Delivery",
        subtitle: "30 Mins Promise",
        description: "Hungry? We deliver faster than you can set the table. Live tracking included.",
        image: "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?q=80&w=1200&auto=format&fit=crop", // Optimized w=1200
        accent: "from-blue-500 to-indigo-600",
        code: "SPEEDY30",
        icon: Zap
    },
    {
        id: 3,
        title: "Global Flavors",
        subtitle: "World Cuisine",
        description: "From Italian Pasta to spicy Indian Curry, explore a world of flavors today.",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop", // Optimized w=1200
        accent: "from-emerald-500 to-green-600",
        code: "WORLD40",
        icon: Sparkles
    }
];

// Canvas Particle System for High Performance Visuals
const HeroParticles = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resizeCanvas = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.offsetWidth;
                canvas.height = canvas.parentElement.offsetHeight;
            }
        };

        const createParticle = () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.1
        });

        const initParticles = () => {
            const isMobile = window.innerWidth < 768; // Mobile detection
            const particleCount = isMobile ? 15 : 50; // Reduced count for mobile
            particles = Array.from({ length: particleCount }, createParticle);
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, i) => {
                p.x += p.speedX;
                p.y += p.speedY;

                // Wrap around
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        initParticles();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />;
};

const HeroBanner = ({ topRightContent }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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

    const currentOffer = premiumOffers[currentIndex];
    const IconComponent = currentOffer.icon;

    return (
        <div className="relative w-full h-[260px] sm:h-[380px] md:h-[480px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl mx-auto group select-none content-visibility-auto contain-paint">

            {/* Optimized Canvas Particles Layer */}
            <HeroParticles />

            {/* Carousel Container */}
            <div className="relative h-full w-full bg-gray-900">
                {premiumOffers.map((offer, index) => (
                    <div
                        key={offer.id}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
                            }`}
                        style={{ willChange: 'opacity' }}
                    >
                        {/* Background Image - Optimized Loading */}
                        <div className="absolute inset-0 overflow-hidden">
                            <img
                                src={offer.image}
                                alt={offer.title}
                                loading={index === 0 ? "eager" : "lazy"}
                                decoding="async"
                                className={`w-full h-full object-cover object-center transition-transform duration-[10000ms] ease-out saturate-125 brightness-110 contrast-110 ${index === currentIndex ? 'scale-105' : 'scale-100'}`}
                                style={{ willChange: 'transform' }}
                            />
                        </div>

                        {/* Professional Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent md:via-black/40" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden" />

                        {/* Content Area */}
                        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-24 max-w-5xl text-white z-20">
                            <div
                                className={`transition-all duration-700 delay-100 transform ${index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                            >
                                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-5 flex-wrap">
                                    <span
                                        className={`inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest bg-gradient-to-r ${offer.accent} shadow-lg`}
                                    >
                                        <IconComponent size={10} className="md:w-3.5 md:h-3.5" />
                                        {offer.subtitle}
                                    </span>
                                    <div className="hidden sm:flex items-center gap-1.5 text-yellow-400 text-[10px] md:text-xs font-bold bg-white/10 backdrop-blur-md px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl border border-white/20">
                                        <Sparkles size={12} className="md:w-3.5 md:h-3.5" /> LIMITED
                                    </div>
                                </div>

                                <h2 className="text-2xl sm:text-4xl md:text-7xl font-black mb-2 md:mb-5 leading-tight tracking-tight drop-shadow-2xl">
                                    {offer.title}
                                </h2>

                                <p className="text-xs sm:text-lg md:text-2xl font-light mb-4 md:mb-8 text-gray-200 max-w-md md:max-w-2xl leading-relaxed line-clamp-2">
                                    {offer.description}
                                </p>

                                <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                                    <button className="group/btn relative px-6 py-3 md:px-8 md:py-4 bg-white text-black rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider hover:bg-gray-100 transition-all duration-300 hover:-translate-y-1 flex items-center gap-2 md:gap-3 overflow-hidden shadow-xl">
                                        <span className="relative z-10">Order Now</span>
                                        <ArrowRight size={14} className="md:w-[18px] md:h-[18px] relative z-10 transition-transform group-hover/btn:translate-x-1" />
                                    </button>

                                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
                                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Code:</span>
                                        <span className="text-sm font-black text-white border-b border-dashed border-white/50">{offer.code}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Top Right Slot (Location) */}
            {topRightContent && (
                <div className="absolute top-4 right-4 md:top-8 md:right-8 z-40">
                    {topRightContent}
                </div>
            )}

            {/* Indicators - Bottom */}
            <div className="absolute inset-x-0 bottom-4 md:bottom-8 flex justify-between items-end px-6 md:px-12 z-30 pointer-events-none">
                <div className="flex gap-1.5 md:gap-2.5 pointer-events-auto">
                    {premiumOffers.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => { setIsAutoPlaying(false); setCurrentIndex(index); }}
                            className={`h-1 md:h-1.5 rounded-full transition-all duration-500 ${index === currentIndex ? 'w-8 md:w-12 bg-white' : 'w-1.5 md:w-2 bg-white/30'}`}
                        />
                    ))}
                </div>

                <div className="hidden md:flex gap-3 pointer-events-auto">
                    <button onClick={prevSlide} className="w-12 h-12 rounded-full border border-white/20 bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-black transition-all hover:scale-110 active:scale-95">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextSlide} className="w-12 h-12 rounded-full border border-white/20 bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white hover:text-black transition-all hover:scale-110 active:scale-95">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
export default HeroBanner;
