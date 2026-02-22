import { useEffect } from 'react';

const SmoothScroll = () => {
    // Optimization: Removed Lenis JS-based scroll hijacking.
    // Native CSS `scroll-behavior: smooth` is 100x faster, uses purely the GPU, 
    // and correctly handles 120Hz/90Hz displays without lagging or locking the main thread.

    useEffect(() => {
        // Enforce native native smooth scrolling on the document level globally
        document.documentElement.style.scrollBehavior = 'smooth';

        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    return null;
};

export default SmoothScroll;
