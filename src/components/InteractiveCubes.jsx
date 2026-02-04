import React, { useRef, useEffect } from 'react';

const InteractiveCubes = () => {
    const containerRef = useRef(null);
    const cubesRef = useRef([]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const rect = container.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;

            cubesRef.current.forEach((cube, i) => {
                if (!cube) return;
                const speed = (i % 5) + 1; // Varying speeds
                const dx = (x - rect.width / 2) * (speed * 0.02);
                const dy = (y - rect.height / 2) * (speed * 0.02);

                // 3D Rotation based on mouse
                const rotX = -(y - rect.height / 2) * 0.1;
                const rotY = (x - rect.width / 2) * 0.1;

                cube.style.transform = `translate(${dx}px, ${dy}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
            <div className="relative w-full h-full max-w-4xl max-h-[600px] flex flex-wrap justify-between items-center opacity-30">
                {/* Generate 10 Cubes scattered */}
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        ref={el => cubesRef.current[i] = el}
                        className="relative w-16 h-16 transition-transform duration-100 ease-out"
                        style={{
                            top: `${Math.random() * 80}%`,
                            left: `${Math.random() * 80}%`,
                            position: 'absolute',
                            perspective: '500px'
                        }}
                    >
                        {/* Cube Face (Wireframe Style) */}
                        <div className="w-full h-full border-2 border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_15px_rgba(6,182,212,0.2)] transform rotate-45"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InteractiveCubes;
