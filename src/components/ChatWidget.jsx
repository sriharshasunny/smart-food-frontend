import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { 
    MessageCircle, X, Send, ShoppingBag, Star, MapPin, ChevronRight,
    Bot, Clock, CheckCheck, Zap, History, Sparkles, Flame,
    Minimize2, Maximize2, ArrowLeft, Leaf, Drumstick
} from 'lucide-react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { optimizeImage } from '../utils/imageOptimizer';

const pulseGlow = `
@keyframes pulse-glow {
  0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.6); }
  70% { box-shadow: 0 0 0 18px rgba(249, 115, 22, 0); }
  100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
}

@keyframes float-orb {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes chat-bounce {
  0%,80%,100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}

.chat-dot { animation: chat-bounce 1.2s ease-in-out infinite; }
.chat-dot:nth-child(2) { animation-delay: 0.15s; }
.chat-dot:nth-child(3) { animation-delay: 0.3s; }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   Typewriter
───────────────────────────────────────────────────────────────────────────── */
const Typewriter = memo(({ text, speed = 12, onComplete }) => {
    const [out, setOut] = useState('');
    useEffect(() => {
        let i = 0; let buf = ''; setOut('');
        const id = setInterval(() => {
            if (i < text.length) { buf += text[i++]; setOut(buf); }
            else { clearInterval(id); onComplete?.(); }
        }, speed);
        return () => clearInterval(id);
    }, [text]);
    return <span>{out}</span>;
});

/* ─────────────────────────────────────────────────────────────────────────────
   Food Card  — white card, matches app FoodCard style
───────────────────────────────────────────────────────────────────────────── */
const ChatFoodCard = memo(({ food, onAdd, onViewRestaurant, index = 0 }) => {
    const [loaded, setLoaded] = useState(false);
    const isVeg = food.is_veg;
    const isSuspended = food._suspended || food.available === false;

    return (
        <div
            className={`group relative bg-neutral-900 rounded-2xl overflow-hidden border transition-all duration-300 shadow-xl animate-slide-up ${isSuspended
                ? 'border-neutral-800 opacity-70 grayscale-[25%]'
                : 'border-neutral-800 hover:border-themeAccent-500/50 hover:shadow-themeAccent-900/20 hover:-translate-y-1'
                }`}
            style={{
                animationDelay: `${index * 80}ms`,
                animationFillMode: 'both'
            }}
        >
            {/* Image */}
            <div className="relative h-32 overflow-hidden bg-gray-100">
                {!loaded && <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 animate-pulse" />}
                <img
                    src={optimizeImage(food.image || food.imageUrl || food.image_url, 300)}
                    alt={food.name}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'; }}
                    className={`w-full h-full object-cover transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${isSuspended ? '' : 'group-hover:scale-105'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Suspended ribbon */}
                {isSuspended && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Unavailable</span>
                    </div>
                )}

                {/* Veg dot */}
                <div className={`absolute top-2 left-2 w-4 h-4 rounded border-2 flex items-center justify-center bg-white ${isVeg ? 'border-green-500' : 'border-red-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>

                {/* Rating pill */}
                {food.rating && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full shadow-sm">
                        <Star size={8} className="fill-themeAccent-400 text-themeAccent-400" />
                        <span className="text-themeAccent-600 text-[10px] font-bold">{Number(food.rating).toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-2.5">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white text-[12px] leading-tight line-clamp-1 flex-1">{food.name}</h4>
                    {food.is_history && (
                        <span className="text-[8px] font-black bg-white/10 text-white/40 px-1.5 py-0.5 rounded uppercase tracking-widest ml-1 shrink-0">Ordered</span>
                    )}
                </div>
                {food.restaurant?.name && (
                    <button
                        onClick={() => onViewRestaurant?.(food.restaurant?.id || food.restaurant?._id)}
                        className="text-[10px] text-themeAccent-500 hover:text-themeAccent-600 truncate w-full text-left flex items-center gap-0.5 mb-2 transition-colors"
                    >
                        <MapPin size={8} className="flex-shrink-0" />
                        {food.restaurant.name}
                    </button>
                )}
                <div className="flex items-center justify-between">
                    <span className="text-green-600 font-black text-[13px]">₹{food.price}</span>
                    {isSuspended ? (
                        <span className="text-[9px] text-red-500 font-semibold italic">Not Available</span>
                    ) : (
                        <button
                            onClick={() => onAdd(food)}
                            className="bg-themeAccent-500 hover:bg-themeAccent-600 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg transition-all active:scale-90 shadow-sm shadow-orange-200 flex items-center gap-1"
                        >
                            ADD <ShoppingBag size={8} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

/* ─────────────────────────────────────────────────────────────────────────────
   Restaurant Card — white card matching app style
───────────────────────────────────────────────────────────────────────────── */
const ChatRestaurantCard = memo(({ rest, onView }) => {
    const isSuspended = rest._suspended || rest.is_active === false;
    return (
        <div className={`bg-neutral-900 rounded-2xl border transition-all duration-200 overflow-hidden shadow-md ${isSuspended ? 'border-neutral-800 opacity-75' : 'border-neutral-800 hover:border-themeAccent-500/40 hover:shadow-lg'
            }`}>
            <div className="p-3">
                <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h4 className="font-bold text-white text-[13px] leading-tight truncate">{rest.name}</h4>
                        {isSuspended && (
                            <span className="text-[8px] font-black bg-red-50 text-red-500 border border-red-200 px-1.5 py-0.5 rounded-md uppercase tracking-wide flex-shrink-0">Closed</span>
                        )}
                    </div>
                    {rest.rating && (
                        <div className="flex items-center gap-0.5 bg-orange-950/30 border border-themeAccent-500/20 px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2">
                            <Star size={8} className="fill-themeAccent-400 text-themeAccent-400" />
                            <span className="text-themeAccent-500 text-[10px] font-bold">{rest.rating}</span>
                        </div>
                    )}
                </div>
                {rest.address && (
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mb-2 line-clamp-1">
                        <MapPin size={8} className="flex-shrink-0" /> {rest.address}
                    </p>
                )}
                {rest.foods?.length > 0 && (
                    <div className="bg-neutral-800/40 rounded-xl p-2 mb-2 space-y-1 border border-neutral-700/40">
                        {rest.foods.slice(0, 4).map((f, i) => (
                            <div key={i} className={`flex justify-between items-center text-[11px] ${f._suspended ? 'opacity-50' : ''}`}>
                                <span className="text-gray-600 truncate flex-1 pr-2 flex items-center gap-1">
                                    {f._suspended && <span className="text-red-400 text-[9px] font-bold">[N/A]</span>}
                                    <span className={f.is_veg ? 'text-green-500' : 'text-red-400'}>●</span>
                                    {f.name}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {f.rating && <span className="text-themeAccent-400 text-[9px] font-semibold">★{Number(f.rating).toFixed(1)}</span>}
                                    <span className="text-gray-700 font-semibold">₹{f.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <button
                    onClick={() => onView(rest._id || rest.id)}
                    className="w-full bg-themeAccent-500 hover:bg-themeAccent-600 text-white text-[11px] font-bold py-2 rounded-xl transition-all active:scale-98 flex items-center justify-center gap-1 shadow-sm shadow-orange-200"
                >
                    {isSuspended ? 'View Details' : 'View Full Menu'} <ChevronRight size={12} />
                </button>
            </div>
        </div>
    );
});

/* ─────────────────────────────────────────────────────────────────────────────
   Quick Pick Chip
───────────────────────────────────────────────────────────────────────────── */
const Chip = memo(({ label, emoji, onClick, active }) => (
    <button
        onClick={() => onClick(label)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-[11px] font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${active
            ? 'bg-themeAccent-500 border-themeAccent-500 text-white shadow-md shadow-themeAccent-900/20'
            : 'bg-neutral-800 border-neutral-700 text-gray-400 hover:border-themeAccent-500/50 hover:bg-neutral-700 hover:text-themeAccent-400'
            }`}
    >
        <span className="text-base leading-none">{emoji}</span> {label}
    </button>
));

/* ─────────────────────────────────────────────────────────────────────────────
   Date separator
───────────────────────────────────────────────────────────────────────────── */
const DateSep = ({ date }) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const label = date === today ? 'Today' : date === yesterday ? 'Yesterday' : new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return (
        <div className="flex items-center gap-2 my-4">
            <div className="flex-1 h-px bg-neutral-800" />
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest px-2 bg-black">{label}</span>
            <div className="flex-1 h-px bg-neutral-800" />
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Main ChatWidget
───────────────────────────────────────────────────────────────────────────── */
const ChatWidget = () => {
    const location = useLocation();
    const isOceanTheme = location.pathname === '/recommendations';

    const { user } = useAuth();
    const { addToCart } = useShop();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        const handleOpen = () => { setIsOpen(true); setUnread(0); };
        window.addEventListener('open-chat', handleOpen);
        return () => window.removeEventListener('open-chat', handleOpen);
    }, []);
    const [isExpanded, setIsExpanded] = useState(false);
    const [view, setView] = useState('chat');  // 'chat' | 'history'
    const [historyDates, setHistoryDates] = useState([]);
    const [historyLogs, setHistoryLogs] = useState({});
    const [selDate, setSelDate] = useState(null);
    const [activeChip, setActiveChip] = useState(null);

    const CHAT_V = 'v2_black_orange_pure';
    const storageKey = `smartbot_${user?.id || 'guest'}`;

    const [messages, setMessages] = useState(() => {
        try {
            // Force clear old history version if logic changes
            if (localStorage.getItem('chat_v_flag') !== CHAT_V) {
                localStorage.removeItem(storageKey);
                localStorage.setItem('chat_v_flag', CHAT_V);
                return [{ type: 'text', content: "Hey! 👋 I'm **SmartBot** — your AI food guide. What are you craving today?", sender: 'ai', timestamp: new Date() }];
            }
            const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
            return saved.length > 0
                ? saved.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
                : [{ type: 'text', content: "Hey! 👋 I'm **SmartBot** — your AI food guide. What are you craving today?", sender: 'ai', timestamp: new Date() }];
        } catch { return [{ type: 'text', content: "Hey! 👋 I'm **SmartBot** — your AI food guide. What are you craving today?", sender: 'ai', timestamp: new Date() }]; }
    });

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [unread, setUnread] = useState(0);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    const QUICK_PICKS = [
        { emoji: '🔥', label: 'Trending', query: 'Show me trending food today' },
        { emoji: '🥦', label: 'Veg', query: 'Show me veg food options' },
        { emoji: '🍗', label: 'Non-Veg', query: 'Show me non-veg food' },
        { emoji: '🍛', label: 'Biryani', query: 'Best biryani' },
        { emoji: '🍔', label: 'Burgers', query: 'Best burgers' },
        { emoji: '🍕', label: 'Pizza', query: 'Show me pizza' },
        { emoji: '🏷️', label: 'Deals', query: 'Show me food offers' },
        { emoji: '📦', label: 'My Orders', query: 'Show my recent orders' },
    ];

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(messages.slice(-80)));
    }, [messages, storageKey]);

    useEffect(() => {
        if (isOpen && view === 'chat') setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
        else if (!isOpen && messages.length > 1 && messages.at(-1)?.sender === 'ai') setUnread(u => u + 1);
    }, [messages, isOpen, view]);

    useEffect(() => {
        if (isOpen) { setUnread(0); inputRef.current?.focus(); }
    }, [isOpen]);

    useEffect(() => {
        if (view === 'history') loadHistory();
    }, [view]);

    const loadHistory = useCallback(() => {
        try {
            const raw = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const byDate = {};
            raw.forEach(m => {
                const d = new Date(m.timestamp).toDateString();
                if (!byDate[d]) byDate[d] = [];
                byDate[d].push(m);
            });
            const dates = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a));
            setHistoryDates(dates);
            setHistoryLogs(byDate);
            setSelDate(dates[0] || null);
        } catch (_) { }
    }, [storageKey]);

    const scrollToBottom = useCallback(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), []);

    const submitMessage = useCallback(async (text) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;
        setInput('');
        setActiveChip(null);
        setView('chat');
        setMessages(prev => [...prev, { type: 'text', content: trimmed, sender: 'user', timestamp: new Date() }]);
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
                sender: 'ai', timestamp: new Date(),
                ...(res.ok ? data : { type: 'text', message: data.message || 'Something went wrong. Please try again!' })
            }]);
        } catch {
            setMessages(prev => [...prev, { type: 'text', content: "Can't reach server right now. Check your connection! 🔌", sender: 'ai', timestamp: new Date() }]);
        } finally { setLoading(false); }
    }, [loading, messages, user]);

    const handleViewRestaurant = useCallback((id) => { if (!id) return; setIsOpen(false); navigate(`/restaurant/${id}`); }, [navigate]);

    /* ── Render message content ── */
    const renderContent = (msg, isLatest) => {
        const isAI = msg.sender === 'ai';

        if (['search_food', 'recommend_food', 'food_results', 'get_offers', 'trending_items'].includes(msg.type)) {
            const foods = msg.data || [];
            return (
                <div className="w-full flex flex-col gap-2.5">
                    {msg.message && (
                        <p className="text-[13px] text-gray-300 leading-relaxed">
                            {isAI && isLatest ? <Typewriter text={msg.message} onComplete={scrollToBottom} /> : msg.message}
                        </p>
                    )}
                    {foods.length > 0 && (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-black text-themeAccent-500 uppercase tracking-widest">
                                    {msg.type === 'trending_items' ? '🔥 Trending' : msg.type === 'get_offers' ? '🏷️ Deals' : '🍽️ Search Results'}
                                </span>
                                <div className="flex-1 h-px bg-neutral-800" />
                                <span className="text-[10px] text-gray-500 font-bold">{foods.length} items</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {foods.map((f, i) => <ChatFoodCard key={f.id || i} food={f} index={i} onAdd={addToCart} onViewRestaurant={handleViewRestaurant} />)}
                            </div>
                        </>
                    )}
                    {foods.length === 0 && !msg.message && <p className="text-gray-500 text-[13px]">No items found. Try a different search!</p>}
                </div>
            );
        }

        if (['search_restaurant', 'open_now'].includes(msg.type)) {
            const rests = msg.data || [];
            return (
                <div className="w-full flex flex-col gap-2.5">
                    {msg.message && (
                        <p className="text-[13px] text-gray-300 leading-relaxed">
                            {isAI && isLatest ? <Typewriter text={msg.message} onComplete={scrollToBottom} /> : msg.message}
                        </p>
                    )}
                    {rests.length > 0 && (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-themeAccent-500 uppercase tracking-widest">🏪 Restaurants</span>
                                <div className="flex-1 h-px bg-neutral-800" />
                            </div>
                            {rests.map((r, i) => <ChatRestaurantCard key={r.id || r._id || i} rest={r} onView={handleViewRestaurant} />)}
                        </>
                    )}
                </div>
            );
        }

        if (msg.type === 'get_orders') {
            const orders = msg.data || [];
            return (
                <div className="w-full flex flex-col gap-2.5">
                    {msg.message && (
                        <p className="text-[13px] text-gray-300 leading-relaxed">
                            {isAI && isLatest ? <Typewriter text={msg.message} onComplete={scrollToBottom} /> : msg.message}
                        </p>
                    )}
                    {orders.length > 0 && (
                        <>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-themeAccent-500 uppercase tracking-widest">📦 Recent Orders</span>
                                <div className="flex-1 h-px bg-neutral-800" />
                            </div>
                            {orders.map((order, i) => (
                                <div key={order.id || i} className="group relative bg-[#0c0c0e] border border-white/[0.05] rounded-[1.5rem] p-4 overflow-hidden hover:border-themeAccent-500/30 transition-all duration-300 shadow-2xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-themeAccent-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-themeAccent-500/10 transition-all" />
                                    
                                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/[0.04] relative z-10">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.15em] mb-0.5">Order ID</span>
                                            <span className="text-[12px] text-white/80 font-mono tracking-wider">#{(order.id || '').toString().slice(-8)}</span>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-inner ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-themeAccent-500/10 text-themeAccent-400 border border-themeAccent-500/20'}`}>
                                            {order.status || 'Pending'}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 relative z-10">
                                        {(order.items || []).slice(0, 5).map((item, j) => {
                                            const itemName = item.food?.name || item.name || 'Item';
                                            const itemPrice = item.food?.price || item.price || 0;
                                            const isItemUnavailable = !item.food || item.food.available === false;

                                            return (
                                                <div key={j} className="flex justify-between items-start text-[12px]">
                                                    <div className="flex items-start gap-2 max-w-[75%]">
                                                        <span className="text-themeAccent-400 font-bold bg-themeAccent-500/10 px-1.5 py-0.5 rounded-md text-[10px]">{item.quantity}×</span>
                                                        <div className="flex flex-col">
                                                            <span className={`text-white/80 font-medium line-clamp-1 translate-y-px ${isItemUnavailable ? 'opacity-50' : ''}`}>
                                                                {itemName}
                                                            </span>
                                                            {isItemUnavailable && (
                                                                <span className="text-[8px] text-red-500/80 font-bold uppercase tracking-tighter -mt-0.5 italic">Currently Unavailable</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-white/50 font-medium">₹{itemPrice * item.quantity}</span>
                                                </div>
                                            );
                                        })}
                                        {(order.items || []).length > 5 && (
                                            <div className="text-[10px] text-white/30 font-medium pl-8 italic">+{order.items.length - 5} more item(s)</div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/[0.04] relative z-10">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.1em] mb-0.5">Date</span>
                                            <span className="text-[11px] text-white/60 font-medium">{order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.1em] mb-0.5">Total</span>
                                            <span className="text-white font-black text-lg tracking-tight">₹{order.total_amount || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            );
        }

        // Plain text with bold
        const content = msg.content || msg.message || '';
        const parseBold = (str) => str.split(/(\*\*.*?\*\*)/g).map((p, i) =>
            p.startsWith('**') && p.endsWith('**')
                ? <strong key={i} className="font-bold text-white">{p.slice(2, -2)}</strong>
                : <span key={i}>{p}</span>
        );
        return (
            <p className="text-[13px] leading-relaxed text-gray-300">
                {isAI && isLatest ? <Typewriter text={content} onComplete={scrollToBottom} /> : parseBold(content)}
            </p>
        );
    };

    const showQuickPicks = messages.filter(m => m.sender === 'user').length === 0;
    const lastAI = messages.length > 0 && messages[messages.length - 1].sender === 'ai' ? messages[messages.length - 1] : null;
    const suggestedQueries = lastAI?.suggested_queries || [];

    return (
        <div className={isOceanTheme ? 'theme-ocean' : ''}>
            <style>{pulseGlow}</style>
            {/* ── Floating Trigger — only shown when chat is closed ── */}
            {!isOpen && (
                <button
                    onClick={() => { setIsOpen(true); setUnread(0); }}
                    className="fixed z-[60] w-14 h-14 flex items-center justify-center rounded-2xl
                               bg-gradient-to-br from-orange-500 via-orange-600 to-red-600
                               shadow-[0_8px_32px_rgba(249,115,22,0.45)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.65)]
                               active:scale-95 transition-all duration-300 group border border-orange-400/30"
                    style={{ bottom: '15px', right: '20px', animation: 'float-orb 4s ease-in-out infinite' }}
                >
                    <span className="absolute inset-0 rounded-2xl border-2 border-orange-400 opacity-40"
                        style={{ animation: 'pulse-glow 2s ease-out infinite' }} />
                    <div className="relative flex items-center justify-center w-full h-full">
                        <Bot size={24} className="text-white group-hover:scale-110 transition-transform duration-300" />
                        {unread > 0 && (
                            <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full
                                           bg-white text-orange-600 border-2 border-orange-500
                                           flex items-center justify-center text-[9px] font-black shadow-lg">
                                {unread}
                            </span>
                        )}
                    </div>
                </button>
            )}

            {isOpen && (
                <div className={`
                    fixed z-50 flex flex-col font-sans
                    bg-[#0a0a0f] border border-orange-500/20
                    rounded-[2rem] overflow-hidden
                    shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(249,115,22,0.1)]
                    transition-all duration-300 animate-slide-up origin-bottom-right
                    ${isExpanded ? 'w-[95vw] md:w-[600px] h-[85vh] max-h-[880px]' : 'w-[92vw] md:w-[420px] h-[570px] max-h-[75vh]'}
                `}
                style={{ bottom: '100px', right: '20px' }}
                >
                    {/* Top glow line */}
                    <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

                    {/* ── Header ── */}
                    <div className="flex items-center justify-between px-5 py-4 bg-[#0d0d14] border-b border-white/[0.06] shrink-0">
                        <div className="flex items-center gap-3">
                            {/* Bot avatar */}
                            <div className="relative">
                                <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-orange-500 to-red-600
                                               flex items-center justify-center shadow-lg shadow-orange-500/30 border border-orange-400/20">
                                    <Bot size={22} className="text-white" />
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-[2.5px] border-[#0d0d14] rounded-full shadow-sm
                                               shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                            </div>
                            <div>
                                <h3 className="text-[15px] font-black text-white tracking-tight leading-none">SmartBot</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                    <span className="text-[10px] text-gray-500 font-bold tracking-wide">AI Engine · Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <button onClick={() => setView(v => v === 'history' ? 'chat' : 'history')} title="History"
                                className={`p-2 rounded-xl transition-all ${view === 'history'
                                    ? 'bg-orange-500/20 text-orange-400'
                                    : 'text-white/30 hover:text-white/70 hover:bg-white/5'}`}>
                                <History size={16} />
                            </button>
                            <button onClick={() => setIsExpanded(e => !e)} className="p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/5 transition-all">
                                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* ── HISTORY VIEW ── */}
                    {view === 'history' ? (
                        <div className="flex flex-col flex-1 overflow-hidden bg-black">
                            <div className="px-4 pt-3 pb-2 shrink-0 bg-neutral-900 border-b border-neutral-800">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Chat History</p>
                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                                    {historyDates.length === 0
                                        ? <p className="text-[12px] text-gray-500 italic py-1">No history yet.</p>
                                        : historyDates.map(date => {
                                            const today = new Date().toDateString(), yesterday = new Date(Date.now() - 86400000).toDateString();
                                            const label = date === today ? 'Today' : date === yesterday ? 'Yesterday' : new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                                            return (
                                                <button key={date} onClick={() => setSelDate(date)}
                                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${selDate === date ? 'bg-themeAccent-600 text-white shadow-md shadow-themeAccent-900/20' : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700 hover:text-themeAccent-400'}`}>
                                                    {label}
                                                </button>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                                {selDate && (historyLogs[selDate] || []).map((msg, i) => (
                                    <div key={i} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.sender !== 'user' && (
                                            <div className="w-6 h-6 rounded-xl bg-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm border border-neutral-700">
                                                <Bot size={11} className="text-themeAccent-500" />
                                            </div>
                                        )}
                                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed ${msg.sender === 'user' ? 'bg-themeAccent-600 text-white rounded-tr-md' : 'bg-neutral-900 text-gray-100 rounded-tl-md border border-neutral-800'}`}>
                                            {msg.content || msg.message}
                                        </div>
                                    </div>
                                ))}
                                {(!selDate || !(historyLogs[selDate]?.length)) && (
                                    <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                                        <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                                            <History size={22} className="text-neutral-700" />
                                        </div>
                                        <p className="text-gray-500 text-sm">No messages for this date</p>
                                    </div>
                                )}
                            </div>
                            <div className="px-4 py-3 border-t border-neutral-800 bg-neutral-900 shrink-0">
                                <button onClick={() => setView('chat')} className="w-full py-2.5 bg-themeAccent-600 hover:bg-orange-700 text-white font-bold text-sm rounded-2xl transition-all shadow-sm shadow-themeAccent-900/20 flex items-center justify-center gap-2">
                                    <ArrowLeft size={14} /> Back to Chat
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ── CHAT AREA ── */}
                            <div
                                data-lenis-prevent
                                className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none overscroll-y-contain ${isOceanTheme ? 'bg-transparent' : 'bg-black'}`}
                                style={{ scrollbarWidth: 'none' }}
                            >
                                {messages.map((msg, idx) => {
                                    const isUser = msg.sender === 'user';
                                    const isLatest = idx === messages.length - 1;
                                    const ts = msg.timestamp ? new Date(msg.timestamp) : null;
                                    const currDate = ts?.toDateString();
                                    const prevDate = idx > 0 && messages[idx - 1].timestamp ? new Date(messages[idx - 1].timestamp).toDateString() : null;

                                    return (
                                        <React.Fragment key={idx}>
                                            {currDate && currDate !== prevDate && <DateSep date={currDate} />}
                                            <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>

                                                {!isUser && (
                                                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm border border-neutral-700">
                                                        <Bot size={14} className="text-themeAccent-500" />
                                                    </div>
                                                )}

                                                <div className="max-w-[88%] animate-fade-in">
                                                    <div className={`px-4 py-3 rounded-2xl shadow-sm text-[13px] leading-relaxed ${
                                                        isUser
                                                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-sm shadow-orange-500/20'
                                                            : 'bg-[#14141f] text-gray-200 rounded-tl-sm border border-white/[0.07]'
                                                        }`}>
                                                        {renderContent(msg, isLatest)}
                                                    </div>
                                                    <div className={`flex items-center gap-1 mt-1 text-[10px] text-gray-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                                        <Clock size={8} />
                                                        <span>{ts?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {isUser && <CheckCheck size={10} className="text-themeAccent-400" />}
                                                    </div>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}

                                                                {loading && (
                                    <div className="flex items-center gap-2.5 animate-fade-in">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/30">
                                            <Bot size={14} className="text-white" />
                                        </div>
                                        <div className="bg-[#14141f] border border-white/[0.07] px-5 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                                            <span className="chat-dot w-2 h-2 bg-orange-500 rounded-full" />
                                            <span className="chat-dot w-2 h-2 bg-orange-400 rounded-full" />
                                            <span className="chat-dot w-2 h-2 bg-orange-300 rounded-full" />
                                        </div>
                                    </div>
                                )}

                                <div ref={bottomRef} className="h-1" />
                            </div>

                            {/* ── Quick Picks ── Dark */}
                            {showQuickPicks && (
                                <div className="px-4 pb-3 shrink-0 bg-black">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Quick Picks</p>
                                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                                        {QUICK_PICKS.map((q, i) => (
                                            <Chip key={i} label={q.label} emoji={q.emoji} active={activeChip === q.label}
                                                onClick={() => { setActiveChip(q.label); submitMessage(q.query); }} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Auto Suggestions ── */}
                            {suggestedQueries.length > 0 && !loading && (
                                <div className="px-4 pb-3 shrink-0 bg-black animate-fade-in">
                                    <p className="text-[10px] font-bold text-themeAccent-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Sparkles size={10} /> Suggested</p>
                                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
                                        {suggestedQueries.map((q, i) => (
                                            <Chip key={i} label={q} emoji="✨" active={activeChip === q}
                                                onClick={() => { setActiveChip(q); submitMessage(q); }} />
                                        ))}
                                    </div>
                                </div>
                            )}

                                             {/* ── Input Bar ── */}
                            <div className="px-4 pb-5 pt-3 bg-[#0d0d14] border-t border-white/[0.06] shrink-0">
                                <div className="flex items-center gap-2 bg-[#1a1a28] border border-white/10 shadow-inner rounded-2xl px-2 py-1.5 focus-within:border-orange-500/40 focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.08)] transition-all duration-300">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitMessage(input)}
                                        placeholder="Ask me anything about food..."
                                        className="flex-1 bg-transparent text-white text-[13px] px-3 py-2 focus:outline-none placeholder-gray-600 min-w-0 font-medium"
                                    />
                                    <button
                                        onClick={() => submitMessage(input)}
                                        disabled={loading || !input.trim()}
                                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500
                                                   disabled:from-neutral-700 disabled:to-neutral-800 disabled:shadow-none
                                                   flex items-center justify-center text-white transition-all active:scale-90
                                                   shadow-md shadow-orange-500/30 flex-shrink-0"
                                    >
                                        <Send size={15} className="translate-x-px" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-center gap-1.5 mt-2">
                                    <Sparkles size={9} className="text-orange-500/60" />
                                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Powered by Gemini AI</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
