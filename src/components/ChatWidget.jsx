import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ShoppingBag, Star, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';

// Typewriter Component for AI Responses
const Typewriter = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState("");
    const indexRef = useRef(0);

    useEffect(() => {
        indexRef.current = 0;
        setDisplayedText("");

        const intervalId = setInterval(() => {
            if (indexRef.current < text.length) {
                setDisplayedText((prev) => prev + text.charAt(indexRef.current));
                indexRef.current++;
            } else {
                clearInterval(intervalId);
                if (onComplete) onComplete();
            }
        }, 15); // Adjust speed here (lower = faster)

        return () => clearInterval(intervalId);
    }, [text]);

    return <p className="leading-relaxed">{displayedText}</p>;
};

const ChatWidget = () => {
    const { user } = useAuth();
    const { addToCart } = useShop();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'text', content: "Hi! I'm SmartBot. How can I help you discover delicious food today?", sender: 'ai', timestamp: new Date() }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setInput("");
        setMessages(prev => [...prev, { type: 'text', content: userMessage, sender: 'user', timestamp: new Date() }]);
        setLoading(true);

        try {
            const userId = user?.id || null;

            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, userId })
            });

            const data = await res.json();

            if (res.ok) {
                setMessages(prev => [...prev, { sender: 'ai', ...data, timestamp: new Date() }]);
            } else {
                setMessages(prev => [...prev, { type: 'text', content: data.message || "Sorry, I can't think right now.", sender: 'ai', timestamp: new Date() }]);
            }

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { type: 'text', content: "Network error. Please try again.", sender: 'ai', timestamp: new Date() }]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (food) => {
        addToCart(food);
        // Optional: show toast or small feedback
    };

    const handleViewRestaurant = (restaurantId) => {
        setIsOpen(false); // Close chat to view
        navigate(`/restaurant/${restaurantId}`);
    };

    // Render Cards Logic
    const renderContent = (msg, isLatest) => {
        // Text Message
        if (msg.type === 'text') {
            // Only use Typewriter for the VERY LAST message if it's from AI
            if (msg.sender === 'ai' && isLatest) {
                return <Typewriter text={msg.content || msg.message} onComplete={scrollToBottom} />;
            }
            return <p className="leading-relaxed">{msg.content || msg.message}</p>;
        }

        // Food Search / Trending / Offers
        if (['search_food', 'get_offers', 'trending_items'].includes(msg.type)) {
            const foods = msg.data || [];
            if (foods.length === 0) return <p>No food items found matching your criteria.</p>;

            return (
                <div className="flex flex-col gap-3 mt-3 w-full">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Top Picks For You</p>
                    {foods.map((food, i) => (
                        <div key={i} className="group flex gap-3 bg-gray-800/50 hover:bg-gray-800 p-2.5 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-all duration-300">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={food.image_url || 'https://via.placeholder.com/60'} alt={food.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-semibold text-white text-sm truncate">{food.name}</h4>
                                    <p className="text-xs text-gray-400 truncate hover:text-orange-400 cursor-pointer" onClick={() => handleViewRestaurant(food.restaurant?._id)}>
                                        {food.restaurant?.name}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-emerald-400 font-bold text-sm">₹{food.price}</span>
                                    <button
                                        onClick={() => handleAddToCart(food)}
                                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        Add <ShoppingBag size={10} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Add a subtle "View More" hint or action if needed */}
                </div>
            );
        }

        // Restaurant Search
        if (['search_restaurant', 'open_now'].includes(msg.type)) {
            const restaurants = msg.data || [];
            if (restaurants.length === 0) return <p>No restaurants found.</p>;

            return (
                <div className="flex flex-col gap-3 mt-3 w-full">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Restaurants Nearby</p>
                    {restaurants.map((rest, i) => (
                        <div key={i} className="bg-gray-800/50 hover:bg-gray-800 p-3 rounded-xl border border-gray-700 transition-all">
                            <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-white text-sm">{rest.name}</h4>
                                <div className="flex items-center text-xs text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                                    <Star size={10} className="fill-current mr-1" />
                                    {rest.rating}
                                </div>
                            </div>
                            <div className="flex items-center text-xs text-gray-400 mt-1 mb-3">
                                <MapPin size={10} className="mr-1" />
                                <span className="truncate max-w-[180px]">{rest.address}</span>
                            </div>
                            <button
                                onClick={() => handleViewRestaurant(rest._id)}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-2 group"
                            >
                                View Menu <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ))}
                </div>
            );
        }

        // Orders
        if (msg.type === 'get_orders') {
            const orders = msg.data || [];
            if (orders.length === 0) return <p>No recent orders found.</p>;

            return (
                <div className="flex flex-col gap-3 mt-3 w-full">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Recent Orders</p>
                    {orders.map((order, i) => (
                        <div key={i} className="bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                            <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
                                <span>#{order._id.slice(-6)}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="py-2 border-t border-gray-700/50 space-y-1">
                                {order.items?.slice(0, 2).map((item, j) => (
                                    <div key={j} className="flex justify-between text-xs text-gray-300">
                                        <span>{item.quantity}x {item.food?.name}</span>
                                    </div>
                                ))}
                                {order.items?.length > 2 && <p className="text-xs text-gray-500 italic">+{order.items.length - 2} more items</p>}
                            </div>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700/50">
                                <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                                <span className="text-sm font-bold text-white">₹{order.total_amount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return <p>{msg.content || JSON.stringify(msg)}</p>;
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 p-0 w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 hover:scale-110 active:scale-95 text-white rounded-full shadow-2xl shadow-orange-500/30 transition-all duration-300 flex items-center justify-center group"
            >
                {isOpen ? (
                    <X size={24} className="rotate-0 transition-transform duration-300 group-hover:rotate-90" />
                ) : (
                    <div className="relative">
                        <MessageCircle size={26} className="fill-current text-white" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                        </span>
                    </div>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[350px] sm:w-[380px] h-[600px] max-h-[80vh] flex flex-col overflow-hidden rounded-3xl shadow-2xl shadow-black/50 animate-fade-in-up font-sans border border-gray-700/50 backdrop-blur-xl bg-gray-900/90">

                    {/* Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700/50 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-inner">
                                    <Sparkles size={18} className="text-white" />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-gray-900 rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-base tracking-tight">Smart Assistant</h3>
                                <p className="text-[11px] text-emerald-400 font-medium tracking-wide flex items-center gap-1">
                                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                                    ONLINE
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gradient-to-b from-gray-900/50 to-black/20 hide-scrollbar scrollbar-none">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`relative max-w-[85%] p-3.5 text-sm shadow-md transition-all duration-200 ${msg.sender === 'user'
                                            ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-2xl rounded-tr-sm'
                                            : 'bg-gray-800/80 text-gray-100 rounded-2xl rounded-tl-sm border border-white/5 backdrop-blur-md'
                                        }`}
                                >
                                    {renderContent(msg, idx === messages.length - 1)}
                                    <span className={`text-[10px] absolute -bottom-5 ${msg.sender === 'user' ? 'right-1' : 'left-1'} text-gray-500 opacity-60`}>
                                        {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800/80 p-4 rounded-2xl rounded-tl-sm border border-white/5 backdrop-blur-md flex gap-1.5 items-center">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-gray-800/90 border-t border-white/5 backdrop-blur-lg">
                        <div className="relative flex items-center gap-2 bg-gray-900/80 p-1.5 rounded-2xl border border-gray-700/50 focus-within:border-orange-500/50 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Looking for chinese? or burger?"
                                className="flex-1 bg-transparent text-white text-sm px-3 py-2.5 focus:outline-none placeholder-gray-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95"
                            >
                                <Send size={18} className="ml-0.5" />
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1 opacity-60">
                                <Sparkles size={8} /> Powered by Gemini AI
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
