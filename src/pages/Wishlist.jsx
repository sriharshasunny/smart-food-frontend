import React from 'react';
import { useShop } from '../context/ShopContext';
import FoodCard from '../components/FoodCard';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Wishlist = () => {
    const { wishlist } = useShop();

    // Only show food items
    const foodItems = wishlist.filter(item => !item.type || item.type === 'food');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 min-h-[80vh]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <Link to="/home" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 leading-none">Your Wishlist</h1>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Saved food items for later</p>
                    </div>
                </div>
            </div>


            <AnimatePresence mode="wait">
                {foodItems.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                            <Heart className="w-10 h-10 text-gray-300" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            No food items saved yet
                        </h2>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                            Start exploring and save your favorites to see them here!
                        </p>
                        <Link
                            to="/home"
                            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-gray-200"
                        >
                            Explore Now
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        key="food"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 content-visibility-auto contain-layout"
                    >
                        {foodItems.map((item) => (
                            <motion.div key={item.id} variants={itemVariants} layout>
                                <FoodCard food={item} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Wishlist;
