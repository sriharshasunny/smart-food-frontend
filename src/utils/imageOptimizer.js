/**
 * Optimizes image URLs for performance by appending cloud-specific resize parameters.
 * Supports Supabase Storage and Unsplash.
 * 
 * @param {string} url - The original image URL
 * @param {number} width - Target width in pixels
 * @param {number} quality - Image quality (0-100), default 80
 * @returns {string} Optimized URL
 */
export const optimizeImage = (url, width = 400, quality = 80) => {
    if (!url) return '';

    // 1. Supabase Storage Optimization
    // Check if it's a Supabase URL
    if (url.includes('supabase.co/storage/v1/object/public')) {
        // Supabase Image Transformations (requires Pro plan or self-hosted with imgproxy)
        // If transformations are enabled:
        // return `${url}?width=${width}&quality=${quality}&resize=cover`;

        // For standard bucket usage without transformations, we can't resize on the fly easily 
        // unless using a third-party proxy or if standard transformations are active.
        // HOWEVER, if the user uploaded a huge file, we can't fix it here without a service.
        // But if using Unsplash embedding...
        return url; // Return as is for now until transformation scaling is confirmed.
    }

    // 2. Unsplash Optimization (Common in demo data)
    if (url.includes('images.unsplash.com')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}w=${width}&q=${quality}&auto=format&fit=crop`;
    }

    // 3. Other CDNs (Cloudinary, etc.) - Add logic here if needed

    return url;
};
