import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import {
    MessageCircle, X, Send, ShoppingBag, Star, MapPin, ChevronRight,
    Sparkles, Minimize2, Maximize2, Bot, Clock, CheckCheck, Zap,
    History, ChevronDown, Flame, Leaf, Drumstick, Tag, Package, Search
} from 'lucide-react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { optimizeImage } from '../utils/imageOptimizer';

// ─── Typewriter ──────────────────────────────────────────────────────────────
const Typewriter = memo(({ text, speed = 11, onComplete }) => {
    const [out, setOut] = useState('');
    useEffect(() => {
        let i = 0, buf = '';
        setOut('');
        const id = setInterval(() => {
            if (i < text.length) { buf += text[i++]; setOut(buf); }
            else { clearInterval(id); onComplete?.(); }
        }, speed);
        return () => clearInterval(id);
    }, [text]);
    return <span>{out}</span>;
});

// ─── Animated Food Card ──────────────────────────────────────────────────────
const FoodCard = memo(({ food, onAdd, onViewRestaurant, index = 0 }) => {
    const [loaded, setLoaded] = useState(false);
    const isVeg = food.is_veg;
    const isSuspended = food._suspended || food.available === false;
    return (
        <div
            className={`group relative bg-gradient-to-br from-white/8 to-white/4 rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-0.5 ${isSuspended
                    ? 'border-gray-700/60 opacity-80 grayscale-[30%]'
                    : 'border-white/10 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10'
                }`}
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* Image */}
            <div className="relative h-36 overflow-hidden bg-gray-800/50">
                {!loaded && <div className="absolute inset-0 bg-gray-700/50 animate-pulse" />}
                <img
                    src={optimizeImage(food.image || food.imageUrl || food.image_url, 300)}
                    alt={food.name}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'; }}
                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'} ${isSuspended ? 'grayscale-[50%]' : ''}`}
                />
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {/* SUSPENDED ribbon */}
                {isSuspended && (
                    <div className="absolute top-0 right-0 bg-red-500/90 text-white text-[9px] font-black px-2 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                        Unavailable
                    </div>
                )}

                {/* Veg/Non-veg badge */}
                <div className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center ${isVeg ? 'border-green-500 bg-black/60' : 'border-red-500 bg-black/60'}`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>

                {/* Rating */}
                {food.rating && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        <Star size={9} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-yellow-400 text-[10px] font-bold">{Number(food.rating).toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <h4 className="font-bold text-white text-[13px] leading-tight line-clamp-1 mb-0.5">{food.name}</h4>
                {food.restaurant?.name && (
                    <button
                        onClick={() => onViewRestaurant?.(food.restaurant?._id || food.restaurant?.id)}
                        className="text-[10px] text-gray-400 hover:text-orange-400 transition-colors truncate w-full text-left block mb-2"
                    >
                        📍 {food.restaurant.name}
                    </button>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-black text-base">₹{food.price}</span>
                    {isSuspended ? (
                        <span className="text-[10px] text-red-400/80 font-semibold bg-red-500/10 px-2 py-1 rounded-lg">Unavailable</span>
                    ) : (
                        <button
                            onClick={() => onAdd(food)}
                            className="bg-orange-500 hover:bg-orange-400 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all active:scale-90 shadow-md shadow-orange-500/30 flex items-center gap-1"
                        >
                            ADD <ShoppingBag size={9} className="inline" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

// ─── Restaurant Card ─────────────────────────────────────────────────────────
const RestaurantCard = memo(({ rest, onView }) => {
    const isSuspended = rest._suspended || rest.is_active === false;
    return (
        <div className={`rounded-2xl overflow-hidden border transition-all duration-300 ${isSuspended ? 'bg-white/3 border-gray-700/50 opacity-80' : 'bg-white/6 border-white/10 hover:border-orange-500/40'
            }`}>
            <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2 flex-1 pr-2">
                        <h4 className="font-bold text-white text-sm leading-tight">{rest.name}</h4>
                        {isSuspended && (
                            <span className="text-[9px] font-black bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-md uppercase tracking-wide flex-shrink-0">Closed</span>
                        )}
                    </div>
                    {rest.rating && (
                        <div className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full flex-shrink-0">
                            <Star size={9} className="fill-current" />
                            <span className="text-[10px] font-bold">{rest.rating}</span>
                        </div>
                    )}
                </div>
                {rest.address && (
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mb-2 line-clamp-1">
                        <MapPin size={9} /> {rest.address}
                    </p>
                )}
                {rest.foods?.length > 0 && (
                    <div className="bg-black/20 rounded-xl p-2 mb-2 space-y-1">
                        {rest.foods.slice(0, 4).map((f, i) => (
                            <div key={i} className={`flex justify-between text-[11px] py-0.5 ${f._suspended ? 'opacity-50' : ''}`}>
                                <span className="text-gray-300 truncate flex-1 pr-2 flex items-center gap-1">
                                    {f._suspended && <span className="text-red-400 text-[9px]">[N/A]</span>}
                                    • {f.name}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {f.rating && <span className="text-yellow-400 text-[9px]">⭐{Number(f.rating).toFixed(1)}</span>}
                                    <span className="text-gray-400">₹{f.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <button
                    onClick={() => onView(rest._id || rest.id)}
                    className="w-full bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-400/50 text-white text-[11px] font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1 group"
                >
                    {isSuspended ? 'View Details' : 'View Full Menu'} <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
});

// ─── Quick Pick Category Button ───────────────────────────────────────────────
const QuickPick = memo(({ label, emoji, color, onClick }) => (
    <button
        onClick={() => onClick(label)}
        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 hover:scale-105 active:scale-95 min-w-[80px] ${color}`}
    >
        <span className="text-2xl leading-none">{emoji}</span>
        <span className="text-[10px] font-bold text-white/80 uppercase tracking-wide leading-none text-center">{label}</span>
    </button>
));

// ─── Date Header for History ─────────────────────────────────────────────────
const DateHeader = ({ date }) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const label = date === today ? 'Today' : date === yesterday ? 'Yesterday' : date;
    return (
        <div className="flex items-center gap-2 my-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest px-2">{label}</span>
            <div className="flex-1 h-px bg-white/8" />
        </div>
    );
};

// ─── Main ChatWidget ──────────────────────────────────────────────────────────
const ChatWidget = () => {
    const { user } = useAuth();
    const { addToCart } = useShop();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [view, setView] = useState('chat');    // 'chat' | 'history'
    const [historyDates, setHistoryDates] = useState([]);
    const [historyLogs, setHistoryLogs] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);

    const storageKey = `smartbot_${user?.id || 'guest'}`;

    const [messages, setMessages] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
            return saved.length > 0
                ? saved.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
                : [{ type: 'text', content: "Hey! 👋 I'm **SmartBot**. Tell me what you're craving!", sender: 'ai', timestamp: new Date() }];
        } catch (_) {
            return [{ type: 'text', content: "Hey! 👋 I'm **SmartBot**. Tell me what you're craving!", sender: 'ai', timestamp: new Date() }];
        }
    });

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [unread, setUnread] = useState(0);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const QUICK_PICKS = [
        { label: 'Trending 🔥', emoji: '🔥', query: 'Show me trending food today', color: 'bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/30' },
        { label: 'Veg', emoji: '🥦', query: 'Show me veg options', color: 'bg-green-600/20 border-green-500/30 hover:bg-green-600/30' },
        { label: 'Non-Veg', emoji: '🍗', query: 'Show me non-veg food', color: 'bg-red-600/20 border-red-500/30 hover:bg-red-600/30' },
        { label: 'Biryani', emoji: '🍛', query: 'Best biryani', color: 'bg-yellow-600/20 border-yellow-500/30 hover:bg-yellow-600/30' },
        { label: 'Burgers', emoji: '🍔', query: 'Best burgers', color: 'bg-amber-600/20 border-amber-500/30 hover:bg-amber-600/30' },
        { label: 'Pizza', emoji: '🍕', query: 'Show me pizza', color: 'bg-purple-600/20 border-purple-500/30 hover:bg-purple-600/30' },
        { label: 'Deals', emoji: '🏷️', query: 'Show me food offers', color: 'bg-sky-600/20 border-sky-500/30 hover:bg-sky-600/30' },
        { label: 'My Orders', emoji: '📦', query: 'Show my recent orders', color: 'bg-indigo-600/20 border-indigo-500/30 hover:bg-indigo-600/30' },
    ];

    // Persist messages to localStorage
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(messages.slice(-80)));
    }, [messages, storageKey]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (isOpen && view === 'chat') {
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
        } else if (!isOpen && messages.length > 1 && messages[messages.length - 1]?.sender === 'ai') {
            setUnread(u => u + 1);
        }
    }, [messages, isOpen, view]);

    useEffect(() => {
        if (isOpen) { setUnread(0); inputRef.current?.focus(); }
    }, [isOpen]);

    // Load history dates from localStorage
    useEffect(() => {
        if (view === 'history') loadHistory();
    }, [view]);

    const loadHistory = useCallback(() => {
        try {
            const rawMsgs = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const byDate = {};
            rawMsgs.forEach(m => {
                const d = new Date(m.timestamp).toDateString();
                if (!byDate[d]) byDate[d] = [];
                byDate[d].push(m);
            });
            const dates = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a));
            setHistoryDates(dates);
            setHistoryLogs(byDate);
            setSelectedDate(dates[0] || null);
        } catch (_) { }
    }, [storageKey]);

    // ── Send message ──────────────────────────────────────────────────────────
    const submitMessage = useCallback(async (text) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;
        setInput('');
        setView('chat');
        const userMsg = { type: 'text', content: trimmed, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const history = messages.slice(-8).map(m => ({
                sender: m.sender,
                content: (m.content || m.message || '') + (m.data?.length ? ` [shown: ${m.data.map(i => i.name).join(', ')}]` : '')
            }));

            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: trimmed, userId: user?.id || null, history })
            });

            const data = await res.json();
            setMessages(prev => [...prev, {
                sender: 'ai',
                timestamp: new Date(),
                ...(res.ok ? data : { type: 'text', message: data.message || 'Something went wrong. Try again!' })
            }]);
        } catch (_) {
            setMessages(prev => [...prev, {
                type: 'text',
                content: "Can't reach the server right now. Check your connection and try again! 🔌",
                sender: 'ai', timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    }, [loading, messages, user]);

    const handleViewRestaurant = useCallback((id) => {
        if (!id) return;
        setIsOpen(false);
        navigate(`/restaurant/${id}`);
    }, [navigate]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // ── Render message content ────────────────────────────────────────────────
    const renderContent = (msg, isLatest) => {
        const isAI = msg.sender === 'ai';

        // Food types
        if (['search_food', 'get_offers', 'trending_items'].includes(msg.type)) {
            const foods = msg.data || [];
            return (
                <div className="flex flex-col gap-3 w-full">
                    {msg.message && (
                        <p className="text-[13px] leading-relaxed text-gray-100">
                            {isAI && isLatest ? <Typewriter text={msg.message} onComplete={scrollToBottom} /> : msg.message}
                        </p>
                    )}
                    {foods.length > 0 ? (
                        <>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest -mb-1">
                                {msg.type === 'trending_items' ? '🔥 Trending Now' : msg.type === 'get_offers' ? '🏷️ Hot Deals' : '🍽️ Found for You'}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {foods.map((f, i) => (
                                    <FoodCard key={f.id || i} food={f} index={i} onAdd={addToCart} onViewRestaurant={handleViewRestaurant} />
                                ))}
                            </div>
                        </>
                    ) : (
                        !msg.message && <p className="text-gray-400 text-sm">No food items found. Try a different search!</p>
                    )}
                </div>
            );
        }

        // Restaurant types
        if (['search_restaurant', 'open_now'].includes(msg.type)) {
            const rests = msg.data || [];
            return (
                <div className="flex flex-col gap-3 w-full">
                    {msg.message && (
                        <p className="text-[13px] leading-relaxed text-gray-100">
                            {isAI && isLatest ? <Typewriter text={msg.message} onComplete={scrollToBottom} /> : msg.message}
                        </p>
                    )}
                    {rests.length > 0 && (
                        <>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest -mb-1">🏪 Restaurants</p>
                            <div className="flex flex-col gap-2">
                                {rests.map((r, i) => <RestaurantCard key={r.id || r._id || i} rest={r} onView={handleViewRestaurant} />)}
                            </div>
                        </>
                    )}
                </div>
            );
        }

        // Orders
        if (msg.type === 'get_orders') {
            const orders = msg.data || [];
            return (
                <div className="flex flex-col gap-3 w-full">
                    {msg.message && (
                        <p className="text-[13px] leading-relaxed text-gray-100">
                            {isAI && isLatest ? <Typewriter text={msg.message} onComplete={scrollToBottom} /> : msg.message}
                        </p>
                    )}
                    {orders.length > 0 ? (
                        <>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest -mb-1">📦 Recent Orders</p>
                            {orders.map((order, i) => (
                                <div key={order.id || i} className="bg-white/5 rounded-2xl border border-white/10 p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[11px] text-gray-500 font-mono">#{(order.id || '').toString().slice(-8)}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${order.status === 'delivered' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'}`}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </div>
                                    {(order.items || []).slice(0, 3).map((item, j) => (
                                        <div key={j} className="flex justify-between text-[11px] py-0.5">
                                            <span className="text-gray-300">{item.quantity}× {item.food?.name || 'Item'}</span>
                                            <span className="text-gray-500">₹{(item.food?.price || 0) * item.quantity}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/8">
                                        <span className="text-[10px] text-gray-600">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</span>
                                        <span className="text-white font-black">₹{order.total_amount || 0}</span>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : !msg.message && (
                        <p className="text-gray-400 text-sm italic">No past orders found.</p>
                    )}
                </div>
            );
        }

        // Plain text with bold support
        const content = msg.content || msg.message || '';
        const parseBold = (str) => str.split(/(\*\*.*?\*\*)/g).map((p, i) =>
            p.startsWith('**') && p.endsWith('**')
                ? <strong key={i} className="font-bold text-white">{p.slice(2, -2)}</strong>
                : <span key={i}>{p}</span>
        );

        return (
            <p className="text-[13px] leading-relaxed text-gray-100">
                {isAI && isLatest ? <Typewriter text={content} onComplete={scrollToBottom} /> : parseBold(content)}
            </p>
        );
    };

    const showQuickPicks = messages.filter(m => m.sender === 'user').length === 0;

    return (
        <>
            {/* ── Trigger Button ── */}
            <button
                onClick={() => { setIsOpen(o => !o); setUnread(0); }}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-550 to-red-600 shadow-2xl shadow-orange-500/50 hover:scale-110 active:scale-95 transition-all duration-300"
            >
                {isOpen ? (
                    <X size={22} className="text-white" />
                ) : (
                    <div className="relative">
                        <MessageCircle size={24} className="fill-white text-white" />
                        {unread > 0 && (
                            <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-sky-500 flex items-center justify-center text-[9px] font-black text-white">
                                {unread}
                            </span>
                        )}
                        <span className="absolute -top-1 -right-1 w-3 h-3 flex">
                            <span className="animate-ping absolute inset-0 rounded-full bg-sky-400 opacity-60" />
                        </span>
                    </div>
                )}
            </button>

            {/* ── Chat Window ── */}
            {isOpen && (
                <div className={`
                    fixed bottom-24 right-4 md:right-6 z-50 flex flex-col
                    rounded-[1.75rem] border border-white/10
                    bg-[#0b0c14] shadow-[0_40px_100px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.05)]
                    transition-all duration-300 overflow-hidden font-sans
                    ${isExpanded ? 'w-[96vw] md:w-[600px] h-[85vh] max-h-[880px]' : 'w-[92vw] md:w-[400px] h-[640px] max-h-[78vh]'}
                `}>

                    {/* Top ambient glow */}
                    <div className="pointer-events-none absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-orange-600/6 to-transparent z-0" />
                    <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-orange-500/30 to-transparent z-0" />

                    {/* ── Header ── */}
                    <div className="relative z-10 flex items-center justify-between px-5 py-3.5 border-b border-white/8 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/40">
                                    <Sparkles size={18} className="text-white" />
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0b0c14] rounded-full" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-black text-white leading-none">Smart Assistant</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] text-emerald-400 font-semibold tracking-wide">ONLINE · Gemini AI</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                            {/* History toggle */}
                            <button
                                onClick={() => setView(v => v === 'history' ? 'chat' : 'history')}
                                title="Chat History"
                                className={`p-2 rounded-xl transition-all ${view === 'history' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500 hover:text-white hover:bg-white/8'}`}
                            >
                                <History size={16} />
                            </button>
                            <button onClick={() => setIsExpanded(e => !e)} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/8 transition-all">
                                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/8 transition-all">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* ── HISTORY VIEW ── */}
                    {view === 'history' ? (
                        <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
                            {/* Date selector */}
                            <div className="px-4 pt-3 pb-2 shrink-0">
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-2">Conversation History</p>
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                                    {historyDates.length === 0 ? (
                                        <p className="text-[12px] text-gray-600 italic py-2">No history found yet.</p>
                                    ) : historyDates.map(date => {
                                        const today = new Date().toDateString();
                                        const yesterday = new Date(Date.now() - 86400000).toDateString();
                                        const label = date === today ? 'Today' : date === yesterday ? 'Yesterday' : new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                                        return (
                                            <button
                                                key={date}
                                                onClick={() => setSelectedDate(date)}
                                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${selectedDate === date ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white/6 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'}`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* History messages */}
                            <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                                {selectedDate && (historyLogs[selectedDate] || []).map((msg, i) => (
                                    <div key={i} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.sender !== 'user' && (
                                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Bot size={11} className="text-white" />
                                            </div>
                                        )}
                                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[12px] ${msg.sender === 'user' ? 'bg-orange-500/20 text-orange-100 rounded-tr-md border border-orange-500/20' : 'bg-white/5 text-gray-300 rounded-tl-md border border-white/8'}`}>
                                            {msg.content || msg.message}
                                        </div>
                                    </div>
                                ))}
                                {(!selectedDate || !(historyLogs[selectedDate] || []).length) && (
                                    <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                            <History size={24} className="text-gray-600" />
                                        </div>
                                        <p className="text-gray-600 text-sm text-center">No messages for this date</p>
                                    </div>
                                )}
                            </div>

                            {/* Back button */}
                            <div className="px-4 py-3 border-t border-white/8 shrink-0">
                                <button
                                    onClick={() => setView('chat')}
                                    className="w-full py-2.5 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 font-bold text-sm rounded-2xl transition-all"
                                >
                                    ← Back to Chat
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ── CHAT VIEW ── */}
                            <div
                                data-lenis-prevent
                                className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-none overscroll-y-contain"
                                style={{ scrollbarWidth: 'none' }}
                            >
                                {messages.map((msg, idx) => {
                                    const isUser = msg.sender === 'user';
                                    const isLatest = idx === messages.length - 1;
                                    const ts = msg.timestamp ? new Date(msg.timestamp) : null;

                                    // Group by date
                                    const currDate = ts?.toDateString();
                                    const prevDate = idx > 0 && messages[idx - 1].timestamp ? new Date(messages[idx - 1].timestamp).toDateString() : null;
                                    const showDate = currDate && currDate !== prevDate;

                                    return (
                                        <React.Fragment key={idx}>
                                            {showDate && <DateHeader date={currDate} />}
                                            <div className={`flex w-full gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                                {!isUser && (
                                                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-orange-500/30">
                                                        <Bot size={13} className="text-white" />
                                                    </div>
                                                )}
                                                <div className="max-w-[88%]">
                                                    <div className={`px-4 py-3 shadow-lg ${isUser
                                                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl rounded-tr-md shadow-orange-500/20'
                                                        : 'bg-white/6 text-gray-100 rounded-2xl rounded-tl-md border border-white/8 backdrop-blur-sm'
                                                        }`}>
                                                        {renderContent(msg, isLatest)}
                                                    </div>
                                                    <div className={`flex items-center gap-1 mt-1 text-[10px] text-gray-700 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                                        <Clock size={8} />
                                                        <span>{ts?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {isUser && <CheckCheck size={10} className="text-orange-400/60" />}
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}

                                {/* Loading bubbles */}
                                {loading && (
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/30">
                                            <Bot size={13} className="text-white" />
                                        </div>
                                        <div className="bg-white/6 border border-white/8 px-4 py-3 rounded-2xl rounded-tl-md flex items-center gap-1.5">
                                            {[0, 1, 2].map(i => (
                                                <span key={i} className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} className="h-1" />
                            </div>

                            {/* ── Quick Picks Grid ── */}
                            {showQuickPicks && (
                                <div className="relative z-10 px-4 pb-3 shrink-0">
                                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-2">Quick Picks</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {QUICK_PICKS.map((q, i) => (
                                            <QuickPick key={i} label={q.label} emoji={q.emoji} color={q.color} onClick={() => submitMessage(q.query)} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Input Bar ── */}
                            <div className="relative z-10 px-3 py-3 border-t border-white/8 shrink-0">
                                <div className="flex items-center gap-2 bg-white/6 border border-white/10 rounded-2xl px-1 py-1 focus-within:border-orange-500/40 focus-within:ring-1 focus-within:ring-orange-500/15 transition-all">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitMessage(input)}
                                        placeholder="Ask for biryani, veg options, orders..."
                                        className="flex-1 bg-transparent text-white text-[13px] px-3 py-2 focus:outline-none placeholder-gray-600 min-w-0"
                                    />
                                    <button
                                        onClick={() => submitMessage(input)}
                                        disabled={loading || !input.trim()}
                                        className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:from-orange-400 hover:to-red-500 disabled:opacity-30 disabled:shadow-none active:scale-90 transition-all flex-shrink-0"
                                    >
                                        <Send size={15} className="translate-x-px -translate-y-px" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-center gap-1 mt-1.5 opacity-40">
                                    <Zap size={8} className="text-orange-400" />
                                    <p className="text-[9px] text-gray-500">Powered by Gemini AI</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default ChatWidget;
