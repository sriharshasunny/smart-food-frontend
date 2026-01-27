import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SpaceBackground = () => {
    const [stars, setStars] = useState([]);

    useEffect(() => {
        // Reduced star count for better performance
        const genStars = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            delay: Math.random() * 5
        }));
        setStars(genStars);
    }, []);

    const foodItems = [
        { emoji: "🍔", x: 10, y: 10, delay: 0 },
        { emoji: "🍕", x: 80, y: 20, delay: 2 },
        { emoji: "🍩", x: 20, y: 50, delay: 4 },
        { emoji: "🍟", x: 85, y: 60, delay: 1 },
        { emoji: "🥤", x: 50, y: 5, delay: 5 },
    ];

    return (
        <div className="fixed inset-0 z-[-1] bg-[#0a0a0f] overflow-hidden pointer-events-none">
            {/* Stars - Removed opacity animation loop for performance, using static random opacity instead */}
            {stars.map(star => (
                <div
                    key={star.id}
                    className="absolute bg-white rounded-full opacity-60"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                    }}
                />
            ))}

            {/* Nebula Glows - Simplified */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/10 via-transparent to-orange-900/10" />

            {/* Floating Food - Simplified Animation (No rotation, simple Y float) */}
            {foodItems.map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ x: `${item.x}vw`, y: `${item.y}vh`, opacity: 0 }}
                    animate={{
                        y: [`${item.y}vh`, `${item.y - 10}vh`, `${item.y}vh`],
                        opacity: 0.7,
                    }}
                    transition={{
                        duration: 8,
                        delay: item.delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute text-4xl select-none opacity-70"
                    style={{
                        // Removed expensive filters
                        color: 'rgba(255,255,255,0.6)'
                    }}
                >
                    {item.emoji}
                </motion.div>
            ))}
        </div>
    );
};

export default SpaceBackground;
