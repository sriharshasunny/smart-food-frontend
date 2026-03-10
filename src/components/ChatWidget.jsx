import React, { useState, useRef, useEffect, memo } from 'react';
import {
    MessageCircle, X, Send, ShoppingBag, Star, MapPin,
    ChevronRight, Sparkles, Minimize2, Maximize2, Bot,
    Mic, Image, Smile, Clock, CheckCheck, Zap
} from 'lucide-react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { optimizeImage } from '../utils/imageOptimizer';

// ─── Typewriter Effect ───────────────────────────────────────────────────────
const Typewriter = memo(({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let idx = 0;
        let current = '';
        setDisplayedText('');
        const id = setInterval(() => {
            if (idx < text.length) {
                current += text.charAt(idx++);
                setDisplayedText(current);
            } else {
                clearInterval(id);
                if (onComplete) onComplete();
            }
        }, 11);
        return () => clearInterval(id);
    }, [text]);

    return <span className="leading-relaxed">{displayedText}</span>;
});

// ─── Quick Suggestion Chip ───────────────────────────────────────────────────
const SuggestionChip = memo(({ label, icon, onClick }) => (
    <button
        onClick={() => onClick(label)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/40 rounded-full text-xs font-medium text-gray-300 hover:text-orange-300 transition-all duration-200 whitespace-nowrap active:scale-95"
    >
        {icon && <span>{icon}</span>}
        {label}
    </button>
));

// ─── Food Card (compact) ─────────────────────────────────────────────────────
const FoodResultCard = memo(({ food, onAdd, onViewRestaurant }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    return (
        <div className="group flex gap-3 bg-white/5 hover:bg-white/10 p-2.5 rounded-2xl border border-white/8 hover:border-orange-500/40 transition-all duration-200">
            {/* Image */}
            <div className="relative w-[4.5rem] h-[4.5rem] rounded-xl overflow-hidden flex-shrink-0 bg-gray-800">
                {!imgLoaded && <div className="absolute inset-0 bg-gray-700 animate-pulse" />}
                <img
                    src={optimizeImage(food.image || food.imageUrl || food.image_url, 100)}
                    alt={food.name}
                    loading="lazy"
                    onLoad={() => setImgLoaded(true)}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'; }}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {food.rating && (
                    <div className="absolute bottom-1 left-1 flex items-center gap-0.5 text-[9px] font-bold text-yellow-300 bg-black/50 px-1 py-0.5 rounded">
                        ⭐ {typeof food.rating === 'number' ? food.rating.toFixed(1) : food.rating}
                    </div>
                )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <h4 className="font-semibold text-white text-sm leading-tight line-clamp-1">{food.name}</h4>
                    <p
                        className="text-[11px] text-gray-400 truncate mt-0.5 hover:text-orange-400 cursor-pointer transition-colors"
                        onClick={() => onViewRestaurant?.(food.restaurant?._id || food.restaurant?.id || food.restaurant_id)}
                    >
                        {food.restaurant?.name || 'View Restaurant'}
                    </p>
                </div>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-emerald-400 font-bold text-sm">₹{food.price}</span>
                    <button
                        onClick={() => onAdd(food)}
                        className="bg-orange-500 hover:bg-orange-400 active:scale-95 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-lg shadow-orange-500/20"
                    >
                        ADD <ShoppingBag size={9} />
                    </button>
                </div>
            </div>
        </div>
    );
});

// ─── Restaurant Card (compact) ───────────────────────────────────────────────
const RestaurantResultCard = memo(({ rest, onView }) => (
    <div className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/8 hover:border-orange-500/40 transition-all duration-200">
        <div className="flex justify-between items-start mb-1.5">
            <h4 className="font-semibold text-white text-sm leading-tight">{rest.name}</h4>
            {rest.rating && (
                <div className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-md font-bold flex-shrink-0 ml-2">
                    <Star size={9} className="fill-current" />
                    {rest.rating}
                </div>
            )}
        </div>
        {rest.address && (
            <div className="flex items-center text-[11px] text-gray-400 mb-2 gap-1">
                <MapPin size={9} className="flex-shrink-0" />
                <span className="truncate">{rest.address}</span>
            </div>
        )}
        {rest.foods?.length > 0 && (
            <div className="bg-black/20 p-2 rounded-lg mb-2">
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Top Items</p>
                {rest.foods.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex justify-between text-[11px] text-gray-300 py-0.5">
                        <span className="truncate pr-2 flex-1">★ {f.name}</span>
                        <span className="text-gray-400 shrink-0">₹{f.price}</span>
                    </div>
                ))}
            </div>
        )}
        <button
            onClick={() => onView(rest._id || rest.id)}
            className="w-full bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/40 text-white text-[11px] font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-1 group/btn"
        >
            View Full Menu <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
    </div>
));

// ─── Main Chat Widget ────────────────────────────────────────────────────────
const ChatWidget = () => {
    const { user } = useAuth();
    const { addToCart } = useShop();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('smartbot_chat_v2');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
            } catch (_) { }
        }
        return [
            {
                type: 'text',
                content: "Hey there! 👋 I'm **SmartBot**, your AI food guide. Tell me what you're craving and I'll find the perfect match!",
                sender: 'ai',
                timestamp: new Date(),
                isWelcome: true
            }
        ];
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [unread, setUnread] = useState(0);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const scrollRef = useRef(null);

    const QUICK_SUGGESTIONS = [
        { label: 'Biryani near me 🍛', icon: null },
        { label: 'Trending today 🔥', icon: null },
        { label: 'Best burgers 🍔', icon: null },
        { label: 'My orders 📦', icon: null },
        { label: 'Veg options 🥦', icon: null },
    ];

    useEffect(() => {
        if (isOpen) {
            setUnread(0);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
            inputRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        else if (messages.length > 1 && messages[messages.length - 1]?.sender === 'ai') {
            setUnread(u => u + 1);
        }
    }, [messages]);

    useEffect(() => {
        const toSave = messages.slice(-30);
        localStorage.setItem('smartbot_chat_v2', JSON.stringify(toSave));
    }, [messages]);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    const submitMessage = async (text) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;
        setInput('');
        setMessages(prev => [...prev, { type: 'text', content: trimmed, sender: 'user', timestamp: new Date() }]);
        setLoading(true);

        try {
            const history = messages.slice(-6).map(m => {
                let ctx = m.content || m.message || '';
                if (m.data?.length) ctx += ` [shown: ${m.data.map(i => i.name).join(', ')}]`;
                return { sender: m.sender, content: ctx };
            });

            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: trimmed, userId: user?.id || null, history })
            });
            const data = await res.json();
            if (res.ok) {
                setMessages(prev => [...prev, { sender: 'ai', ...data, timestamp: new Date() }]);
            } else {
                setMessages(prev => [...prev, {
                    type: 'text',
                    content: data.message || "Sorry, something went wrong. Please try again.",
                    sender: 'ai',
                    timestamp: new Date()
                }]);
            }
        } catch (_) {
            setMessages(prev => [...prev, {
                type: 'text',
                content: "I'm having trouble connecting. Please check your internet and try again. 🔌",
                sender: 'ai',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewRestaurant = (id) => {
        if (!id) return;
        setIsOpen(false);
        navigate(`/restaurant/${id}`);
    };

    // ── Render message content based on type ────────────────────────────────
    const renderContent = (msg, isLatest) => {
        const isAI = msg.sender === 'ai';

        // Food-type responses
        if (['search_food', 'get_offers', 'trending_items'].includes(msg.type)) {
            const foods = msg.data || [];
            return (
                <div className="flex flex-col w-full gap-2">
                    {msg.message && (
                        <p className="text-[14px] leading-relaxed">
                            {isAI && isLatest
                                ? <Typewriter text={msg.message} onComplete={scrollToBottom} />
                                : msg.message
                            }
                        </p>
                    )}
                    {foods.length > 0 && (
                        <div className="flex flex-col gap-2 mt-1">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                {msg.type === 'trending_items' ? '🔥 Trending Now' : msg.type === 'get_offers' ? '🏷️ Hot Deals' : '🍴 Top Picks'}
                            </p>
                            {foods.map((f, i) => (
                                <FoodResultCard
                                    key={f.id || i}
                                    food={f}
                                    onAdd={addToCart}
                                    onViewRestaurant={handleViewRestaurant}
                                />
                            ))}
                        </div>
                    )}
                    {foods.length === 0 && !msg.message && (
                        <p className="text-gray-400 text-sm italic">No items found matching your search. Try a different query!</p>
                    )}
                </div>
            );
        }

        // Restaurant-type responses
        if (['search_restaurant', 'open_now'].includes(msg.type)) {
            const restaurants = msg.data || [];
            return (
                <div className="flex flex-col w-full gap-2">
                    {msg.message && (
                        <p className="text-[14px] leading-relaxed">
                            {isAI && isLatest
                                ? <Typewriter text={msg.message} onComplete={scrollToBottom} />
                                : msg.message
                            }
                        </p>
                    )}
                    {restaurants.length > 0 && (
                        <div className="flex flex-col gap-2 mt-1">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">🏪 Restaurants</p>
                            {restaurants.map((r, i) => (
                                <RestaurantResultCard key={r.id || r._id || i} rest={r} onView={handleViewRestaurant} />
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // Orders
        if (msg.type === 'get_orders') {
            const orders = msg.data || [];
            return (
                <div className="flex flex-col w-full gap-2">
                    {msg.message && (
                        <p className="text-[14px] leading-relaxed">
                            {isAI && isLatest
                                ? <Typewriter text={msg.message} onComplete={scrollToBottom} />
                                : msg.message
                            }
                        </p>
                    )}
                    {orders.length > 0 ? (
                        <div className="flex flex-col gap-2 mt-1">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">📦 Recent Orders</p>
                            {orders.map((order, i) => (
                                <div key={order.id || i} className="bg-white/5 p-3 rounded-2xl border border-white/8">
                                    <div className="flex justify-between text-[11px] text-gray-400 mb-2">
                                        <span className="font-mono">#{(order.id || '').toString().slice(-8)}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${order.status === 'delivered' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'}`}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </div>
                                    {(order.items || []).slice(0, 3).map((item, j) => (
                                        <div key={j} className="flex justify-between text-[11px] text-gray-300 py-0.5">
                                            <span className="font-medium">{item.quantity}× {item.food?.name || 'Item'}</span>
                                            <span className="text-gray-500">₹{(item.food?.price || 0) * item.quantity}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/8">
                                        <span className="text-[10px] text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</span>
                                        <span className="text-white font-bold text-sm">₹{order.total_amount || 0}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !msg.message && <p className="text-gray-400 text-sm italic">No past orders found.</p>
                    )}
                </div>
            );
        }

        // Plain text
        const content = msg.content || msg.message || '';
        // Parse simple **bold** markdown
        const parseBold = (str) => {
            const parts = str.split(/(\*\*.*?\*\*)/g);
            return parts.map((p, i) =>
                p.startsWith('**') && p.endsWith('**')
                    ? <strong key={i} className="font-bold text-white">{p.slice(2, -2)}</strong>
                    : p
            );
        };

        return (
            <p className="text-[14px] leading-relaxed">
                {isAI && isLatest ? <Typewriter text={content} onComplete={scrollToBottom} /> : parseBold(content)}
            </p>
        );
    };

    return (
        <>
            {/* ── Floating Trigger Button ── */}
            <button
                onClick={() => { setIsOpen(o => !o); setUnread(0); }}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 shadow-2xl shadow-orange-500/40 hover:scale-110 active:scale-95 transition-all duration-300 ring-2 ring-orange-400/20"
            >
                {isOpen ? (
                    <X size={22} className="text-white transition-transform duration-300" />
                ) : (
                    <div className="relative">
                        <MessageCircle size={24} className="fill-white text-white" />
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-400 flex items-center justify-center text-[9px] font-bold text-white">
                                {unread}
                            </span>
                        )}
                        {/* Ping animation when closed */}
                        <span className="absolute -top-1 -right-1 w-3 h-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-50" />
                        </span>
                    </div>
                )}
            </button>

            {/* ── Chat Window ── */}
            {isOpen && (
                <div
                    className={`
                        fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col overflow-hidden
                        rounded-[2rem] border border-white/10
                        bg-[#0d0d14]/95 backdrop-blur-2xl
                        shadow-[0_32px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)]
                        transition-all duration-300 font-sans animate-fade-in-up
                        ${isExpanded ? 'w-[95vw] sm:w-[580px] h-[82vh] max-h-[820px]' : 'w-[92vw] sm:w-[390px] h-[600px] max-h-[75vh]'}
                    `}
                >
                    {/* ── Ambient glow at top ── */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-orange-500/8 to-transparent pointer-events-none z-0" />

                    {/* ── Header ── */}
                    <div className="relative z-10 flex items-center justify-between px-5 py-3.5 border-b border-white/8 bg-white/3 shrink-0">
                        <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                    <Sparkles size={18} className="text-white" />
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0d0d14] rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-[15px] leading-none mb-1">Smart Assistant</h3>
                                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span>ONLINE · AI-Powered</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsExpanded(e => !e)}
                                className="p-2 hover:bg-white/8 rounded-xl text-gray-400 hover:text-white transition-all"
                            >
                                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/8 rounded-xl text-gray-400 hover:text-white transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* ── Messages Area ── */}
                    <div
                        ref={scrollRef}
                        data-lenis-prevent
                        className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none overscroll-y-contain"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {messages.map((msg, idx) => {
                            const isUser = msg.sender === 'user';
                            const isLatest = idx === messages.length - 1;

                            return (
                                <div
                                    key={idx}
                                    className={`flex w-full gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    {/* AI Avatar */}
                                    {!isUser && (
                                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-orange-500/20">
                                            <Bot size={13} className="text-white" />
                                        </div>
                                    )}

                                    <div className={`relative max-w-[85%] ${isUser ? '' : ''}`}>
                                        {/* Message Bubble */}
                                        <div
                                            className={`
                                                px-4 py-3 text-sm shadow-lg
                                                ${isUser
                                                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl rounded-tr-md shadow-orange-500/20'
                                                    : 'bg-white/6 text-gray-100 rounded-2xl rounded-tl-md border border-white/8 backdrop-blur-sm'
                                                }
                                            `}
                                        >
                                            {renderContent(msg, isLatest)}
                                        </div>

                                        {/* Timestamp */}
                                        <div className={`flex items-center gap-1 mt-1 text-[10px] text-gray-600 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                            <Clock size={9} />
                                            {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isUser && <CheckCheck size={10} className="text-orange-400" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Loading indicator */}
                        {loading && (
                            <div className="flex items-center gap-2.5 justify-start">
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/20">
                                    <Bot size={13} className="text-white" />
                                </div>
                                <div className="bg-white/6 border border-white/8 px-4 py-3 rounded-2xl rounded-tl-md flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} className="h-1" />
                    </div>

                    {/* ── Quick Suggestions ── */}
                    {messages.length <= 2 && !loading && (
                        <div className="relative z-10 px-4 pb-2 shrink-0">
                            <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider mb-2">Quick Searches</p>
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                                {QUICK_SUGGESTIONS.map((s, i) => (
                                    <SuggestionChip key={i} label={s.label} icon={s.icon} onClick={submitMessage} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Input Bar ── */}
                    <div className="relative z-10 p-3 border-t border-white/8 bg-white/2 shrink-0">
                        <div className="flex items-center gap-2 bg-white/6 border border-white/10 rounded-2xl px-1 py-1 focus-within:border-orange-500/50 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitMessage(input)}
                                placeholder="Ask anything — burgers, biryani, orders..."
                                className="flex-1 bg-transparent text-white text-[13px] px-3 py-2 focus:outline-none placeholder-gray-600 min-w-0"
                            />
                            <button
                                onClick={() => submitMessage(input)}
                                disabled={loading || !input.trim()}
                                className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:from-orange-400 hover:to-red-500 disabled:opacity-40 disabled:shadow-none active:scale-95 transition-all flex-shrink-0"
                            >
                                <Send size={16} className="translate-x-0.5 -translate-y-0.5" />
                            </button>
                        </div>
                        {/* Footer branding */}
                        <div className="flex items-center justify-center gap-1.5 mt-2">
                            <Zap size={9} className="text-orange-500/50" />
                            <p className="text-[10px] text-gray-600">Powered by Gemini AI</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
