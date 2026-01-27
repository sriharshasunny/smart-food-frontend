import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

const Orders = () => {
    const { user, loading: authLoading } = useAuth(); // Rename to avoid conflict
    const [orders, setOrders] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);

    const fetchOrders = async () => {
        if (authLoading) return; // Wait for auth check
        if (!user?._id) {
            setFetchLoading(false);
            console.log("No user ID found for fetching orders");
            return;
        }

        console.log("Fetching orders for user:", user._id);
        try {
            const res = await fetch(`${API_URL}/api/orders?userId=${user._id}`);
            const data = await res.json();
            console.log("Fetched orders:", data);
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchOrders();
        }
    }, [user, authLoading]);

    const clearHistory = async () => {
        if (!confirm("Are you sure you want to delete all order history?")) return;
        try {
            await fetch(`${API_URL}/api/orders?userId=${user._id}`, { method: 'DELETE' });
            setOrders([]);
        } catch (error) {
            console.error("Error deleting history:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    if (fetchLoading || authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 px-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Your Orders</h1>
                        <p className="text-gray-500 mt-1">Track and manage your past calls.</p>
                    </div>
                    {orders.length > 0 && (
                        <button
                            onClick={clearHistory}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors text-sm font-bold"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear History
                        </button>
                    )}
                </div>

                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2rem] p-12 text-center shadow-lg border border-gray-100"
                    >
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-orange-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Hungry? Explore our menu and place your first order today!
                        </p>
                        <Link
                            to="/restaurants"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all hover:scale-105 shadow-lg shadow-orange-500/25"
                        >
                            Browse Food
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-gray-50 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${order.orderStatus === 'Confirmed' ? 'bg-green-50 text-green-600' :
                                            order.orderStatus === 'Delivered' ? 'bg-blue-50 text-blue-600' :
                                                'bg-orange-50 text-orange-600'
                                            }`}>
                                            <Package className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${order.orderStatus === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                    order.orderStatus === 'Delivered' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="text-xl font-black text-gray-900">₹{order.totalAmount}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm py-2 px-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900">{item.quantity}x</span>
                                                <span className="text-gray-700">{item.name}</span>
                                            </div>
                                            <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                        <CheckCircle className="w-4 h-4" />
                                        Payment Successful
                                    </div>
                                    <Link
                                        to={`/orders/${order._id || order.id}/invoice`}
                                        className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
                                    >
                                        View Invoice <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
