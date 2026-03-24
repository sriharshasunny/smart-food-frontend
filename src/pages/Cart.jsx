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

    // Recalculate totals locally
    const safeCartTotal = safeCart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);

    const deliveryFee = safeCartTotal > 500 ? 0 : 40;
    const taxes = safeCartTotal * 0.05;
    const platformFee = 5;
    const finalTotal = safeCartTotal + deliveryFee + taxes + platformFee;

    const handleDodoPayment = async () => {
        setIsPaymentLoading(true);
        try {
            let userToUse = authUser;
            if (!userToUse) {
                const userString = localStorage.getItem('user');
                try {
                    userToUse = userString ? JSON.parse(userString) : null;
                } catch (e) { console.error("Error parsing stored user", e); }
            }

            if (!userToUse || !userToUse.email) {
                setIsPaymentLoading(false);
                if (confirm('You must be logged in to place an order. Proceed to login?')) {
                    navigate('/login', { state: { from: '/cart' } });
                }
                return;
            }

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

    if (safeCart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-100/50 rounded-full blur-[80px]" />
                </div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 mb-8"
                >
                    <div className="w-48 h-48 bg-gray-50 rounded-full flex items-center justify-center relative">
                        <ShoppingBag className="w-20 h-20 text-gray-300" strokeWidth={1.5} />
                    </div>
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 tracking-tight text-center relative z-10 uppercase">Your Bag is Empty</h2>
                <p className="text-gray-500 mb-8 font-medium text-center max-w-md relative z-10 font-bold uppercase tracking-widest text-[10px]">
                    Good food is just a few selections away
                </p>

                <Link to="/home" className="relative z-10">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-10 py-4 bg-gray-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-full shadow-xl transition-all flex items-center gap-3 group"
                    >
                        Browse Gallery <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfd] pb-32">
            {/* Premium Background Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-red-50/30 blur-[100px] rounded-full" />
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
                {/* Checkout Step Indicator */}
                <div className="flex items-center justify-center mb-16">
                    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-black">1</div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Review Items</span>
                        </div>
                        <div className="w-8 h-px bg-gray-200" />
                        <div className="flex items-center gap-2 opacity-30">
                            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[10px] font-black">2</div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Address</span>
                        </div>
                        <div className="w-8 h-px bg-gray-200" />
                        <div className="flex items-center gap-2 opacity-30">
                            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[10px] font-black">3</div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Payment</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Left: Cart Items */}
                    <div className="w-full lg:w-[62%] space-y-6">
                        <div className="flex items-end justify-between mb-8 px-2">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Your <span className="text-orange-500">Selections</span></h1>
                                <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] mt-2 opacity-70">
                                    {safeCart.length} premium items curated for you
                                </p>
                            </div>
                        </div>

                        <AnimatePresence mode='popLayout'>
                            {safeCart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-[2.5rem] p-5 pr-8 flex gap-6 items-center shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 border border-gray-100/50 group"
                                >
                                    <div className="w-32 h-32 shrink-0 rounded-[2rem] overflow-hidden shadow-inner relative border border-gray-50">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-xl font-black text-gray-900 truncate pr-4 tracking-tight uppercase">{item.name}</h3>
                                            <div className="text-xl font-black text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</div>
                                        </div>
                                        <p className="text-gray-400 text-[10px] font-black uppercase mb-6 tracking-widest opacity-60">Prepared by {item.restaurant?.name || "Premium Kitchen"}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-red-500 transition-all active:scale-90 border border-transparent hover:border-red-100"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-6 text-center font-black text-gray-900 text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-orange-500 transition-all active:scale-90 border border-transparent hover:border-orange-100"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Right: Summary Sidebar */}
                    <div className="w-full lg:w-[38%] sticky top-24">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[3rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.06)] border border-gray-100 relative overflow-hidden"
                        >
                            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-orange-100/40 blur-[80px] rounded-full" />

                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-gray-900 mb-10 flex items-center justify-between uppercase tracking-tighter">
                                    Bill Details <div className="w-10 h-1 bg-orange-500 rounded-full" />
                                </h3>

                                <div className="space-y-5 mb-10">
                                    <div className="flex justify-between items-center group">
                                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                                        <span className="text-gray-900 font-black text-sm">₹{safeCartTotal.toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                                            Delivery
                                            {deliveryFee === 0 && <span className="text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded-full">FREE</span>}
                                        </span>
                                        <span className={`text-sm font-black ${deliveryFee === 0 ? 'text-emerald-500' : 'text-gray-900'}`}>
                                            {deliveryFee === 0 ? "₹0" : `₹${deliveryFee}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Taxes & Service</span>
                                        <span className="text-gray-900 font-black text-sm">₹{(taxes + platformFee).toFixed(0)}</span>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-50 mb-8" />

                                <div className="flex justify-between items-end mb-12">
                                    <div>
                                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Grant Total</p>
                                        <p className="text-4xl font-black text-gray-900 tracking-tighter">₹{finalTotal.toFixed(0)}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-2xl">
                                        <Utensils className="text-gray-300 w-6 h-6" />
                                    </div>
                                </div>

                                <div className="relative group mb-8">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors w-4 h-4" />
                                    <input 
                                        type="text" 
                                        placeholder="PROMO CODE" 
                                        className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 text-[10px] font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all uppercase placeholder:text-gray-300" 
                                    />
                                </div>

                                <motion.button
                                    onClick={handleDodoPayment}
                                    disabled={isPaymentLoading}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white h-16 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-3 group disabled:opacity-50 relative overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        {isPaymentLoading ? 'Securing Link...' : 'Proceed to Checkout'}
                                        {!isPaymentLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 -translate-x-full skew-x-12 group-hover:translate-x-[200%] transition-transform duration-1000" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Cart;
