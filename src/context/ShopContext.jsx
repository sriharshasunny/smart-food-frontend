import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
    // 1. Fetch User Data on Login (Sync from Backend)
    const { user, loading } = useAuth();

    // Init from LocalStorage (Guest Support)
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            const parsed = savedCart ? JSON.parse(savedCart) : [];
            // SANITIZE: Ensure valid object and has ID
            return Array.isArray(parsed) ? parsed.filter(i => i && i.id && typeof i === 'object') : [];
        } catch (e) {
            console.error("Failed to parse cart", e);
            return [];
        }
    });

    const [wishlist, setWishlist] = useState(() => {
        try {
            const savedWishlist = localStorage.getItem('wishlist');
            const parsed = savedWishlist ? JSON.parse(savedWishlist) : [];
            const list = Array.isArray(parsed) ? parsed : [];
            return list.map(item => ({
                ...item,
                type: (item.costForTwo || item.deliveryTime) ? 'restaurant' : (item.type || 'food')
            }));
        } catch (e) {
            console.error("Failed to parse wishlist", e);
            return [];
        }
    });

    // Track synchronization state
    const [isInitialized, setIsInitialized] = useState(false);

    // Track previous user to detect Login vs Logout
    const prevUserRef = React.useRef(null);

    useEffect(() => {
        if (loading) return;

        const currentUser = user?._id;
        const previousUser = prevUserRef.current;

        // 1. LOGIN Detection (Guest -> User) OR (User A -> User B)
        if (currentUser && currentUser !== previousUser) {
            // Fetch Backend Data & MERGE
            setIsInitialized(false);
            fetch(`${API_URL}/api/user/${currentUser}`)
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        const backendCart = data.user.cart?.map(item => ({
                            ...item.foodId,
                            quantity: item.quantity,
                            notes: item.notes,
                            id: item.foodId._id
                        })) || [];

                        const backendWishlist = data.user.wishlist?.map(item => ({
                            ...item.foodId,
                            id: item.foodId._id,
                            type: 'food',
                            addedAt: item.addedAt
                        })) || [];

                        // MERGE STRATEGY: 
                        // Combined Cart = Backend Cart + (Local Cart Items that aren't in Backend)
                        // Actually better: If in both, sum quantity? Or prefer Local?
                        // Let's sum quantity for duplicates, add unique ones.

                        const fastCartMap = new Map();
                        backendCart.forEach(item => fastCartMap.set(item.id, item));

                        // Merge Local into Backend Map
                        cart.forEach(localItem => {
                            if (fastCartMap.has(localItem.id)) {
                                const existing = fastCartMap.get(localItem.id);
                                existing.quantity += localItem.quantity; // Sum quantities
                            } else {
                                fastCartMap.set(localItem.id, localItem);
                            }
                        });

                        const mergedCart = Array.from(fastCartMap.values());

                        // Merge Wishlist (Unique IDs)
                        const mergedWishlist = [...backendWishlist];
                        wishlist.forEach(localItem => {
                            if (!mergedWishlist.find(i => i.id === localItem.id)) {
                                mergedWishlist.push(localItem);
                            }
                        });

                        setCart(mergedCart);
                        setWishlist(mergedWishlist);

                        // Trigger Sync Back to DB with Merged Cart
                        fetch(`${API_URL}/api/user/cart`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: currentUser, cart: mergedCart })
                        }).catch(console.error);

                    }
                })
                .catch(err => console.error("Sync Error", err))
                .finally(() => setIsInitialized(true));
        }

        // 2. LOGOUT Detection
        else if (!currentUser && previousUser) {
            // User logged out. 
            // Optional: Clear cart to be clean? Or keep for guest?
            // "Cart items disappearing" - User might want them to stay?
            // Usually standard is Discard. 
            // But if I want to "Fix items appearing", I'll keep them in LocalStorage but clear Context?
            // No, Context mirrors LS.
            // Let's CLEAR for security, assuming "Disappearing" referred to the Refresh issue, not Logout.
            // But if they refresh, `currentUser` is null initially? No, Firebase Auth persists.
            // If they Refresh, `loading` is true, then `user` comes back.
            // So this `else if` only hits on explicit Logout.
            setCart([]);
            setWishlist([]);
            localStorage.removeItem('cart'); // Clean slate for new guest
            localStorage.removeItem('wishlist');
            setIsInitialized(true);
        }
        else if (!currentUser && !previousUser) {
            // Just Guest Mode (Initial Load)
            setIsInitialized(true);
        }

        prevUserRef.current = currentUser;

    }, [user, loading]);

    // 2. Persist to LocalStorage (Always)
    useEffect(() => {
        if (isInitialized || !user) { // Always save if initialized OR if guest
            localStorage.setItem('cart', JSON.stringify(cart));
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
    }, [cart, wishlist, isInitialized, user]);

    // 3. Sync Cart directly to Backend (Debounced) - Only for Logged In
    useEffect(() => {
        if (!isInitialized || !user?._id) return;

        const syncCart = setTimeout(() => {
            fetch(`${API_URL}/api/user/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, cart: cart })
            }).catch(e => console.error("Cart Sync Error", e));
        }, 2000);

        return () => clearTimeout(syncCart);
    }, [cart, user, isInitialized]);


    // Cart Logic
    const addToCart = (item) => {
        const itemWithId = { ...item, id: item._id || item.id };
        setCart((prevCart) => {
            const existingItem = prevCart.find((i) => i.id === itemWithId.id);
            if (existingItem) {
                return prevCart.map((i) =>
                    i.id === itemWithId.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prevCart, { ...itemWithId, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    };

    const updateQuantity = (itemId, amount) => {
        setCart((prevCart) =>
            prevCart.map((item) => {
                if (item.id === itemId) {
                    return { ...item, quantity: Math.max(0, item.quantity + amount) };
                }
                return item;
            }).filter((item) => item.quantity > 0)
        );
    };

    const clearCart = () => setCart([]);

    // Wishlist Logic
    const toggleWishlist = (item) => {
        const itemWithId = { ...item, id: item._id || item.id };

        // Optimistic UI Update first
        setWishlist((prevWishlist) => {
            const exists = prevWishlist.find((i) => i.id === itemWithId.id && i.type === (item.type || 'food'));
            if (exists) {
                return prevWishlist.filter((i) => !(i.id === itemWithId.id && i.type === (item.type || 'food')));
            }
            return [...prevWishlist, { ...itemWithId, type: item.type || 'food' }];
        });

        // Sync to Backend immediately for wishlist (rare action)
        if (user?._id) {
            fetch(`${API_URL}/api/user/wishlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, foodId: itemWithId.id })
            }).catch(e => console.error("Wishlist Sync Error", e));
        }
    };

    const isInWishlist = (itemId, type = 'food') => wishlist.some((item) => item.id === itemId && (item.type || 'food') === type);

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    // Global Search State
    const [searchQuery, setSearchQuery] = useState("");

    const value = React.useMemo(() => ({
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        cartTotal,
        cartCount,
        searchQuery,
        setSearchQuery
    }), [cart, wishlist, user, searchQuery]);

    return (
        <ShopContext.Provider value={value}>
            {children}
        </ShopContext.Provider>
    );
};
