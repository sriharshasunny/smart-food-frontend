import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
    // 1. Fetch User Data on Login (Sync from Backend)
    const { user, loading } = useAuth();

    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            const parsed = savedCart ? JSON.parse(savedCart) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Failed to parse cart", e);
            localStorage.removeItem('cart');
            return [];
        }
    });

    const [wishlist, setWishlist] = useState(() => {
        try {
            const savedWishlist = localStorage.getItem('wishlist');
            const parsed = savedWishlist ? JSON.parse(savedWishlist) : [];
            const list = Array.isArray(parsed) ? parsed : [];
            return list.map(item => {
                if (item.type) return item;
                if (item.costForTwo || item.deliveryTime || (item.cuisine && !item.price)) {
                    return { ...item, type: 'restaurant' };
                }
                return { ...item, type: 'food' };
            });
        } catch (e) {
            console.error("Failed to parse wishlist", e);
            localStorage.removeItem('wishlist');
            return [];
        }
    });

    // Flag to prevent syncing empty local state before backend fetch completes
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (loading) return;

        // 1. LOGOUT: Clear local state if user logs out
        if (!user) {
            setCart([]);
            setWishlist([]);
            localStorage.removeItem('cart');
            localStorage.removeItem('wishlist');
            setIsInitialized(false);
            return;
        }

        // 2. LOGIN: Fetch User Data & Overwrite Local State
        if (user?._id) {
            setIsInitialized(false); // Reset while fetching
            fetch(`${API_URL}/api/user/${user._id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        // LOAD CART
                        let backendCart = [];
                        if (data.user.cart && data.user.cart.length > 0) {
                            backendCart = data.user.cart.map(item => ({
                                ...item.foodId,
                                quantity: item.quantity,
                                notes: item.notes,
                                id: item.foodId._id
                            }));
                        }
                        setCart(backendCart);

                        // LOAD WISHLIST
                        let backendWishlist = [];
                        if (data.user.wishlist && data.user.wishlist.length > 0) {
                            backendWishlist = data.user.wishlist.map(item => ({
                                ...item.foodId,
                                id: item.foodId._id,
                                type: 'food',
                                addedAt: item.addedAt
                            }));
                        }
                        setWishlist(backendWishlist);
                    }
                })
                .catch(err => console.error("Failed to sync user data", err))
                .finally(() => setIsInitialized(true)); // Allow edits/sync after fetch
        } else {
            // Guest mode (if allowed) or error state
            setIsInitialized(true);
        }
    }, [user, loading]);

    // 2. Persist to LocalStorage
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('cart', JSON.stringify(cart));
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
    }, [cart, wishlist, isInitialized]);

    // 3. Sync Cart to Backend (Debounced)
    useEffect(() => {
        if (!isInitialized) return; // Block sync until backend load is done

        const syncCart = setTimeout(() => {
            if (user?._id) {
                fetch(`${API_URL}/api/user/cart`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user._id, cart: cart })
                }).catch(e => console.error("Cart Sync Error", e));
            }
        }, 1000);

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

    return (
        <ShopContext.Provider
            value={{
                cart,
                wishlist,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                toggleWishlist,
                isInWishlist,
                cartTotal,
                cartCount
            }}
        >
            {children}
        </ShopContext.Provider>
    );
};
