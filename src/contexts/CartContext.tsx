'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import * as api from '@/services/api';
import { CartEntryPayload } from '@/types/cart';

export interface CartItem {
    id: number;
    name: string;
    quantity: number;
}

export interface CartEntry {
    id: string;
    timestamp: number;
    school: {
        id: number;
        name: string;
    };
    grade: {
        id: number;
        name: string;
    };
    class: {
        id: number;
        name: string;
    };
    items: CartItem[];
}

interface CartContextType {
    cartEntries: CartEntry[];
    addToCart: (entry: CartEntryPayload) => Promise<void>;
    removeFromCart: (id: string) => Promise<void>;
    clearCart: () => void;
    loading: boolean;
    error: string | null;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getCart();
            setCartEntries(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch cart');
            setCartEntries([]);
            // Optionally log error
            // console.error('Cart fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = useCallback(async (entry: CartEntryPayload) => {
        setError(null);
        try {
            const newEntry = await api.addToCart(entry);
            setCartEntries(prev => [...prev, newEntry]);
        } catch (err: any) {
            setError(err.message || 'Failed to add to cart');
            // Optionally log error
            // console.error('Add to cart error:', err);
        }
    }, []);

    const removeFromCart = useCallback(async (id: string) => {
        setError(null);
        try {
            await api.removeFromCart(id);
            setCartEntries(prev => prev.filter(entry => entry.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to remove from cart');
            // Optionally log error
            // console.error('Remove from cart error:', err);
        }
    }, []);

    const clearCart = useCallback(async () => {
        setError(null);
        try {
            await api.clearCart();
            setCartEntries([]);
        } catch (err: any) {
            setError(err.message || 'Failed to clear cart');
            // Optionally log error
            // console.error('Clear cart error:', err);
        }
    }, []);

    const refreshCart = fetchCart;

    return (
        <CartContext.Provider value={{ cartEntries, addToCart, removeFromCart, clearCart, loading, error, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
