import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ShoppingBag, Star, MapPin } from 'lucide-react';
import { API_URL } from '../config';

const ChatWidget = () => {
    // ... (state)

    const handleSend = async () => {
        // ...
        try {
            // ...
            const res = await fetch(`${API_URL}/api/chat`, { // Use API_URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, userId })
            });
            // ...

            const data = await res.json();

            if (res.ok) {
                setMessages(prev => [...prev, { sender: 'ai', ...data }]);
            } else {
                setMessages(prev => [...prev, { type: 'text', content: "Sorry, I encountered an error.", sender: 'ai' }]);
            }

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { type: 'text', content: "Network error. Please try again.", sender: 'ai' }]);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = (msg) => {
        if (msg.type === 'text') return <p>{msg.content || msg.message}</p>;

        if (msg.type === 'search_food' || msg.type === 'get_offers' || msg.type === 'trending_items') {
            const foods = msg.data || [];
            if (foods.length === 0) return <p>No food items found matching your criteria.</p>;

            return (
                <div className="flex flex-col gap-2 mt-2">
                    <p className="text-sm text-gray-400 mb-1">Here's what I found:</p>
                    {foods.map((food, i) => (
                        <div key={i} className="flex gap-3 bg-gray-800 p-2 rounded-lg border border-gray-700">
                            <img src={food.image_url || 'https://via.placeholder.com/60'} alt={food.name} className="w-16 h-16 object-cover rounded-md" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white truncate">{food.name}</h4>
                                <p className="text-xs text-gray-400 truncate">{food.restaurant?.name}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-green-400 font-bold">₹{food.price}</span>
                                    <div className="flex items-center text-xs text-yellow-400">
                                        <Star size={10} className="fill-current mr-1" />
                                        {food.rating}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (msg.type === 'search_restaurant' || msg.type === 'open_now') {
            const restaurants = msg.data || [];
            if (restaurants.length === 0) return <p>No restaurants found.</p>;

            return (
                <div className="flex flex-col gap-2 mt-2">
                    <p className="text-sm text-gray-400 mb-1">Found these places:</p>
                    {restaurants.map((rest, i) => (
                        <div key={i} className="bg-gray-800 p-2 rounded-lg border border-gray-700">
                            <h4 className="font-medium text-white">{rest.name}</h4>
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                                <MapPin size={10} className="mr-1" />
                                <span className="truncate">{rest.address}</span>
                            </div>
                            <div className="flex items-center text-xs text-yellow-400 mt-1">
                                <Star size={10} className="fill-current mr-1" />
                                {rest.rating}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (msg.type === 'get_orders') {
            const orders = msg.data || [];
            if (orders.length === 0) return <p>No recent orders found.</p>;

            return (
                <div className="flex flex-col gap-2 mt-2">
                    <p className="text-sm text-gray-400 mb-1">Your recent orders:</p>
                    {orders.map((order, i) => (
                        <div key={i} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                            <div className="flex justify-between text-xs text-gray-400 mb-2">
                                <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                <span className={`px-2 py-0.5 rounded-full ${order.status === 'delivered' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="space-y-1">
                                {order.items?.map((item, j) => (
                                    <div key={j} className="flex justify-between text-sm text-gray-200">
                                        <span>{item.quantity}x {item.food?.name || 'Item'}</span>
                                        <span>₹{item.price}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-700 mt-2 pt-2 text-right font-bold text-white">
                                Total: ₹{order.total_amount}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return <p>{JSON.stringify(msg)}</p>; // Fallback
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg transition-all transform hover:scale-110 flex items-center justify-center"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 h-[500px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                            <ShoppingBag size={16} text-white />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Food Assistant</h3>
                            <p className="text-xs text-green-400 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/95 backdrop-blur-sm">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl ${msg.sender === 'user'
                                        ? 'bg-orange-600 text-white rounded-tr-none'
                                        : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'
                                        }`}
                                >
                                    {renderContent(msg)}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700 flex gap-1 items-center">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-gray-800 border-t border-gray-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask for food, restaurants..."
                                className="flex-1 bg-gray-700 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-600 placeholder-gray-400"
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
