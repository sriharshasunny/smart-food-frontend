import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Trash2, ArrowRight, ShoppingBag, Receipt, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

/* ─── Status Config ─────────────────────────────────────────────────────────── */
const statusConfig = {
    Delivered:  { color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200', bar: 'bg-gradient-to-b from-green-400 to-green-500',  dot: 'bg-green-500',  icon: CheckCircle },
    Confirmed:  { color: 'text-orange-700', bg: 'bg-orange-50',  border: 'border-orange-200',bar: 'bg-gradient-to-b from-orange-400 to-orange-500', dot: 'bg-orange-500', icon: Zap },
    Pending:    { color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200', bar: 'bg-gradient-to-b from-amber-400 to-amber-500',   dot: 'bg-amber-500',  icon: Clock },
    Cancelled:  { color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200',   bar: 'bg-gradient-to-b from-red-400 to-red-500',       dot: 'bg-red-500',    icon: XCircle },
};
const getStatus = (s) => statusConfig[s] || statusConfig.Pending;

/* ─── Skeleton ───────────────────────────────────────────────────────────────── */
const OrderSkeleton = () => (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse shadow-sm">
        <div className="flex justify-between mb-5">
            <div className="flex gap-4 items-center">
                <div className="w-11 h-11 rounded-xl bg-gray-100" />
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-100 rounded-full" />
                    <div className="h-3 w-24 bg-gray-100 rounded-full" />
                </div>
            </div>
            <div className="h-8 w-20 bg-gray-100 rounded-full" />
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
            {[1, 2, 3].map(i => <div key={i} className="h-7 w-28 bg-gray-100 rounded-full" />)}
        </div>
    </div>
);

/* ─── Order Card ─────────────────────────────────────────────────────────────── */
const OrderCard = ({ order, index }) => {
    const cfg = getStatus(order.orderStatus);
    const StatusIcon = cfg.icon;
    const date = new Date(order.createdAt);
    const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative group"
        >
            {/* Timeline connector */}
            {index > 0 && (
                <div className="absolute -top-6 left-[22px] w-0.5 h-6 bg-gradient-to-b from-orange-200 to-transparent" />
            )}

            <div className="relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-orange-100 transition-all duration-300">
                {/* Left accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3.5px] ${cfg.bar} rounded-l-2xl`} />

                <div className="p-5 pl-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                            {/* Status icon */}
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${cfg.bg} ${cfg.border}`}>
                                <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-black text-gray-900 text-sm tracking-tight">
                                        Order #{order._id.slice(-8).toUpperCase()}
                                    </h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                                        {order.orderStatus}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 font-medium mt-0.5 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    {dateStr} · {timeStr}
                                </p>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="text-right shrink-0">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Total</p>
                            <p className="text-2xl font-black text-gray-900">₹{order.totalAmount}</p>
                        </div>
                    </div>

                    {/* Item chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {order.items.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 hover:bg-orange-50 hover:border-orange-200 transition-colors duration-200"
                            >
                                <span className="text-[10px] font-black text-orange-500">{item.quantity}×</span>
                                <span className="text-[11px] font-semibold text-gray-700">{item.name}</span>
                                <span className="text-[10px] text-gray-400 font-medium">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-xs text-green-600 font-semibold">Payment Successful</span>
                        </div>
                        <Link
                            to={`/orders/${order._id || order.id}/invoice`}
                            className="group/inv flex items-center gap-1.5 px-4 py-2 rounded-full bg-orange-50 hover:bg-orange-500 border border-orange-200 hover:border-orange-500 text-orange-600 hover:text-white text-xs font-black uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-orange-200 active:scale-95"
                        >
                            <Receipt className="w-3.5 h-3.5" />
                            View Invoice
                            <ArrowRight className="w-3 h-3 group-hover/inv:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

/* ─── Main Page ──────────────────────────────────────────────────────────────── */
const Orders = () => {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);

    const fetchOrders = async () => {
        if (authLoading || !user?._id) { setFetchLoading(false); return; }
        try {
            const res = await fetch(`${API_URL}/api/orders?userId=${user._id}`);
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => { if (!authLoading) fetchOrders(); }, [user, authLoading]);

    const clearHistory = async () => {
        if (!confirm('Delete all order history?')) return;
        try {
            await fetch(`${API_URL}/api/orders?userId=${user._id}`, { method: 'DELETE' });
            setOrders([]);
        } catch (err) { console.error(err); }
    };

    const totalSpent = orders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);

    /* ── Loading ── */
    if (fetchLoading || authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 px-4">
                <div className="max-w-3xl mx-auto space-y-4">
                    {[1, 2, 3].map(i => <OrderSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-24 px-4 sm:px-6 lg:px-8">

            <div className="max-w-3xl mx-auto">

                {/* ── Page Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="mb-8"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                <span className="text-[10px] font-black text-orange-500/70 uppercase tracking-[0.3em]">
                                    Order History
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Your Orders</h1>
                            {orders.length > 0 && (
                                <p className="text-gray-500 text-sm mt-1">
                                    {orders.length} order{orders.length !== 1 ? 's' : ''} · <span className="font-bold text-orange-500">₹{totalSpent.toLocaleString('en-IN')}</span> total spent
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                            {orders.length > 0 && (
                                <>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100">
                                        <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                                        <span className="text-xs font-black text-orange-600">{orders.length} Orders</span>
                                    </div>
                                    <button
                                        onClick={clearHistory}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-red-200 text-red-500 hover:bg-red-50 transition-all text-[10px] font-bold uppercase tracking-wider"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Clear
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ── Empty State ── */}
                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] p-12 text-center shadow-lg border border-gray-100"
                    >
                        <div className="relative w-24 h-24 mx-auto mb-6">
                            <div className="w-24 h-24 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                                <ShoppingBag className="w-10 h-10 text-orange-400" />
                            </div>
                            <div className="absolute inset-0 rounded-full border-2 border-orange-200 animate-ping opacity-30" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Hungry? Explore our menu and place your first order today!
                        </p>
                        <Link
                            to="/restaurants"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all hover:scale-105 shadow-lg shadow-orange-500/25 active:scale-95"
                        >
                            Browse Food <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <OrderCard key={order._id} order={order} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
