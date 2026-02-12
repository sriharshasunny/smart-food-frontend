import React from 'react';
import { API_URL } from '../config';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Utensils, Tag, ChevronRight, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
    const { cart = [], removeFromCart, updateQuantity, cartTotal: contextTotal = 0 } = useShop() || {};
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    // State
    const [isPaymentLoading, setIsPaymentLoading] = React.useState(false);

    // --- Safety Sanitize ---
    const safeCart = Array.isArray(cart) ? cart.filter(item => item && typeof item === 'object' && item.id) : [];

    // Recalculate totals locally to be safe if context is weird, or just trust safeCart
    const safeCartTotal = safeCart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);

    // Use the safe total for fee calculations
    const deliveryFee = safeCartTotal > 500 ? 0 : 40;
    const taxes = safeCartTotal * 0.05;
    const platformFee = 5;
    const finalTotal = safeCartTotal + deliveryFee + taxes + platformFee;

    // --- Empty Cart State ---
    if (safeCart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 relative overflow-hidden">
                {/* Background Decor - Subtle */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-100/50 rounded-full blur-[80px]" />
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="relative z-10 mb-8"
                >
                    <div className="w-48 h-48 bg-gray-50 rounded-full flex items-center justify-center relative">
                        <ShoppingBag className="w-20 h-20 text-gray-300" strokeWidth={1.5} />

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-6 right-8 bg-white p-3 rounded-2xl shadow-lg border border-gray-100"
                        >
                            <span className="text-2xl">🍔</span>
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-6 left-8 bg-white p-3 rounded-2xl shadow-lg border border-gray-100"
                        >
                            <span className="text-2xl">🍕</span>
                        </motion.div>
                    </div>
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 tracking-tight text-center relative z-10">Good food is waiting</h2>
                <p className="text-gray-500 mb-8 font-medium text-center max-w-md relative z-10">
                    Your cart is empty. Add something delicious from the menu!
                </p>

                <Link to="/home" className="relative z-10">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3.5 bg-orange-500 text-white font-bold rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all flex items-center gap-2 group"
                    >
                        Browse Restaurants <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </Link>
            </div>
        );
    }

    const handleDodoPayment = async () => {
        setIsPaymentLoading(true);
        try {
            // Strictly require Logged In User
            let userToUse = authUser;

            if (!userToUse) {
                const userString = localStorage.getItem('user');
                try {
                    userToUse = userString ? JSON.parse(userString) : null;
                } catch (e) { console.error("Error parsing stored user", e); }
            }

            // Enforce Login
            if (!userToUse || !userToUse.email) {
                setIsPaymentLoading(false);
                if (confirm('You must be logged in to place an order. Proceed to login?')) {
                    navigate('/login', { state: { from: '/cart' } });
                }
                return;
            }

            console.log("Payment User Config:", {
                id: userToUse._id,
                name: userToUse.name,
                email: userToUse.email
            });

            const response = await fetch(`${API_URL}/api/payment/create-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: finalTotal,
                    currency: 'INR',
                    user: userToUse,
                    cart: safeCart
                }),
            });

            const data = await response.json();

            if (data.payment_link) {
                window.location.href = data.payment_link;
            } else {
                alert('Payment initiation failed: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Payment Error:', error);
            alert('Something went wrong with the payment.');
        } finally {
            setIsPaymentLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative min-h-screen">
            {/* Page Header */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">My Cart</h1>
                    <p className="text-gray-500 font-medium">Review and manage your selected items</p>
                </div>
                <div className="hidden md:block text-right">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Items</p>
                    <p className="text-2xl font-black text-orange-600">{safeCart.reduce((acc, item) => acc + (item.quantity || 0), 0)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* --- Left Column: Cart Items --- */}
                <div className="lg:col-span-2 space-y-4">
                    <AnimatePresence mode='popLayout'>
                        {safeCart.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                className="bg-white rounded-[2rem] p-4 pr-6 flex gap-4 md:gap-6 items-center group shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 border border-gray-100 relative overflow-hidden"
                            >
                                {/* Image */}
                                <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 relative rounded-2xl overflow-hidden shadow-inner">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                </div>

                                {/* Info */}
                                <div className="flex-grow min-w-0 z-10">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate pr-4">{item.name}</h3>
                                        <div className="font-bold text-lg text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</div>
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium mb-4 truncate">{item.description || "Perfectly prepared for you"}</p>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between">

                                        {/* Quantity Control */}
                                        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:scale-110 active:scale-90 transition-all text-gray-600 hover:text-red-500"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center font-bold text-gray-900 text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:scale-110 active:scale-90 transition-all text-gray-600 hover:text-green-600"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Delete */}
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* --- Right Column: Summary Card --- */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:sticky lg:top-24 space-y-6"
                >
                    {/* Bill Details Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-gray-100 relative overflow-hidden">
                        {/* Decorative Gradient Blob */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-orange-100 to-yellow-50 rounded-full blur-3xl opacity-60" />

                        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                            Bill Details <Utensils className="w-4 h-4 text-orange-500" />
                        </h3>

                        {/* Line Items */}
                        <div className="space-y-3 mb-6 relative z-10">
                            <div className="flex justify-between text-gray-500 font-medium text-sm">
                                <span>Item Total</span>
                                <span className="text-gray-900">₹{safeCartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 font-medium text-sm">
                                <span className="flex items-center gap-1">Delivery Fee {deliveryFee === 0 && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">FREE</span>}</span>
                                <span className={deliveryFee === 0 ? "text-green-600 font-bold" : "text-gray-900"}>
                                    {deliveryFee === 0 ? "₹0" : `₹${deliveryFee}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-500 font-medium text-sm">
                                <span>Platform Fee</span>
                                <span className="text-gray-900">₹{platformFee}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 font-medium text-sm">
                                <span>GST and Restaurant Charges</span>
                                <span className="text-gray-900">₹{taxes.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t-2 border-dashed border-gray-100 my-6 relative z-10" />

                        {/* Total */}
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <span className="text-gray-900 font-black text-lg">To Pay</span>
                            <span className="text-3xl font-black text-gray-900">₹{finalTotal.toFixed(0)}</span>
                        </div>

                        {/* Promo Code Input (Visual Only) */}
                        <div className="mb-6 relative z-10">
                            <div className="flex gap-2">
                                <div className="relative flex-grow">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Promo Code"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-4 py-3 text-sm font-bold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>
                                <button className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors">
                                    APPLY
                                </button>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <motion.button
                            onClick={handleDodoPayment}
                            disabled={isPaymentLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 group relative overflow-hidden z-10 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isPaymentLoading ? 'Processing...' : 'Pay with Dodo'} <ChevronRight className="w-5 h-5" />
                            </span>
                            {/* Shimmer Effect */}
                            {!isPaymentLoading && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />}
                        </motion.button>

                        <p className="text-[10px] text-gray-400 text-center mt-4 font-medium relative z-10">
                            Safe and secure payments. 100% Authentic Food.
                        </p>
                    </div>

                    {/* Savings Note (Optional) */}
                    {deliveryFee === 0 && (
                        <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3 overflow-hidden relative">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-600 font-bold text-lg">₹</div>
                            <div>
                                <p className="text-green-800 font-bold text-sm">You saved ₹40 on delivery!</p>
                                <p className="text-green-600 text-xs font-medium">Free delivery applied.</p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Cart;


