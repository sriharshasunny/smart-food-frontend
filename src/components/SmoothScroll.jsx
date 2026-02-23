import { useEffect } from 'react';
import Lenis from 'lenis';

const SmoothScroll = () => {
    useEffect(() => {
        // Initialize Lenis for top-tier professional, lag-free momentum scrolling
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',        // vertical scrolling
            gestureDirection: 'vertical', // vertical gestures
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,          // Native scrolling on mobile touch devices is usually preferred
            touchMultiplier: 2,
            infinite: false,
        });

        // Use requestAnimationFrame to continuously update the scroll
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return null;
};

export default SmoothScroll;

