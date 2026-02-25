import React from 'react';

// Reusable Skeleton Component for the Food/Restaurant Cards
const SkeletonCard = ({ variant = 'vertical' }) => {
    if (variant === 'horizontal') {
        return (
            <div className="bg-white rounded-2xl p-3 border border-gray-100 flex gap-4 w-full h-full animate-pulse shadow-sm min-w-[300px]">
                {/* Image Placeholder */}
                <div className="w-28 h-28 rounded-xl bg-gray-200 shrink-0"></div>

                {/* Content Placeholder */}
                <div className="flex-1 flex flex-col pt-1">
                    <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-100 rounded-full w-full mb-1"></div>
                    <div className="h-3 bg-gray-100 rounded-full w-5/6 mb-auto"></div>

                    <div className="flex justify-between items-end mt-4">
                        <div className="h-5 bg-gray-200 rounded-full w-1/4"></div>
                        <div className="h-8 w-20 bg-orange-50 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Default Vertical (Grid) Layout
    return (
        <div className="bg-white rounded-[1.5rem] overflow-hidden border border-gray-100 flex flex-col h-full animate-pulse shadow-sm">
            {/* Image Placeholder */}
            <div className="h-44 bg-gray-200 w-full relative">
                {/* Simulated Badge */}
                <div className="absolute bottom-3 left-3 h-6 w-16 bg-black/10 rounded-lg"></div>
            </div>

            {/* Content Placeholder */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="h-5 bg-gray-200 rounded-full w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-100 rounded-full w-full mb-1.5"></div>
                <div className="h-3 bg-gray-100 rounded-full w-4/5 mb-6"></div>

                <div className="mt-auto flex justify-between items-end pt-3 border-t border-gray-50">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-9 w-24 bg-orange-50 rounded-xl"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
