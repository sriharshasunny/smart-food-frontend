import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Download } from 'lucide-react';

const Invoice = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch order details
        // Note: Ideally we should use a specific endpoint or re-use the history endpoint with filter
        // For simplicity, we can fetch all and filter or add an endpoint. 
        // Let's rely on the existing GET /api/orders endpoint with userId context or fetch specific if supported.
        // Current backend supports GET /api/orders?userId=... 
        // To get a *specific* order securely, backend should ideally allow /api/orders/:id?userId=...
        // For now, let's try to fetch user's orders and find this one, or assume we can fetch by ID if we add backend support.
        // Let's modify frontend to assume we have the order data from navigation state OR fetch it.

        const fetchOrder = async () => {
            try {
                // HACK: Fetching single order via direct ID if backend supports, otherwise mock or list
                // Since our backend getOrderHistory uses ?userId, retrieving a single order might be tricky without access to User Context here immediately or if page is standalone.
                // Better approach: Create a simple route in backend or just fetch list.
                // Let's try fetching via the user's list if we have user context.
                // Actually, let's add a specific endpoint for invoice later if needed.
                // For now, let's assuming we pass data via state OR we just fetch from a new endpoint I'll add quickly.

                // WAIT: I should add a specific endpoint to backend for fetching single order by ID for invoice?
                // Or I can just fetch all orders for the user and filter.
                // Let's assume we can fetch it.
                // I'll add a quick route in backend for GET /api/orders/:orderId 

                const res = await fetch(`${API_URL}/api/orders/${orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                } else {
                    console.error("Failed to fetch order");
                }
            } catch (e) {
                console.error("Error", e);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-10 text-center">Loading Invoice...</div>;
    if (!order) return <div className="p-10 text-center">Order not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 print:p-0 print:bg-white">
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">

                {/* Header Actions (Hidden in Print) */}
                <div className="bg-gray-900 p-4 flex justify-between items-center print:hidden">
                    <button onClick={() => navigate(-1)} className="text-white flex items-center gap-2 hover:text-orange-400">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={handlePrint} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                        <Printer className="w-4 h-4" /> Print / Download
                    </button>
                </div>

                {/* Invoice Content */}
                <div className="p-10 md:p-16">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">INVOICE</h1>
                            <p className="text-gray-500 font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-orange-600 tracking-tighter">SmartFood Delivery</h2>
                            <p className="text-gray-400 text-sm mt-1">123 Culinary District<br />Bangalore, KA 560001</p>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-12">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                            <p className="font-bold text-gray-900">{order.guest_info?.name || 'Customer'}</p>
                            <p className="text-gray-500 text-sm">{order.guest_info?.email}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Details</h3>
                            <div className="space-y-1">
                                <p className="text-sm"><span className="text-gray-500">Date:</span> <span className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</span></p>
                                <p className="text-sm"><span className="text-gray-500">Status:</span> <span className="font-semibold text-green-600">{order.payment_status}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-12">
                        <thead>
                            <tr className="border-b-2 border-gray-100">
                                <th className="text-left py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Item Details</th>
                                <th className="text-center py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Qty</th>
                                <th className="text-right py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="text-right py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {order.order_items && order.order_items.length > 0 ? (
                                order.order_items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="py-4 text-sm font-medium text-gray-900 flex items-center gap-4">
                                            {/* Food Image */}
                                            {item.image && (
                                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Food'; }}
                                                    />
                                                </div>
                                            )}
                                            <span>{item.name}</span>
                                        </td>
                                        <td className="py-4 text-sm text-center text-gray-600">{item.quantity}</td>
                                        <td className="py-4 text-sm text-right text-gray-600">₹{item.price}</td>
                                        <td className="py-4 text-sm text-right font-bold text-gray-900">₹{item.price * item.quantity}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-gray-400 italic">No items found in this order.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end border-t border-gray-100 pt-8">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Subtotal</span>
                                <span className="font-bold text-gray-900">₹{order.total_amount}</span>
                                {/* Assuming total_amount includes everything for simplicity, or calculate subtotal */}
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Tax & Fees</span>
                                <span className="font-bold text-gray-900">₹0.00</span>
                                {/* If backend stores breakdown, use it. */}
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className="text-base font-black text-gray-900">Total</span>
                                <span className="text-2xl font-black text-orange-600">₹{order.total_amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-16 text-center border-t border-gray-100 pt-8">
                        <p className="text-gray-400 text-sm">Thank you for ordering with SmartFood Delivery!</p>
                        <p className="text-gray-300 text-xs mt-2">This is a computer-generated invoice.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
