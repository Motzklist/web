// src/services/api.ts
// Centralized API service for authentication and cart operations.
// All functions use fetch and the API base URL from environment variables.
// Update endpoint paths and request/response formats as needed when backend is ready.

import { CartEntryPayload } from '@/types/cart';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// --- Auth ---
export async function login(credentials: { username: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include', // for cookies/session if needed
    });
    if (!res.ok) return parseError(res, 'Login failed');
    return res.json();
}

export async function logout() {
    const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Logout failed');
    return res.json();
}

export async function checkAuth() {
    // Checks if the user is authenticated (e.g., GET /auth/status or /auth/me)
    const res = await fetch(`${API_BASE}/auth/status`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) {
        // Try to parse error message if available
        let message = 'Not authenticated';
        try {
            const data = await res.json();
            message = data?.error || message;
        } catch {}
        throw new Error(message);
    }
    return res.json();
}

// --- Cart ---
export async function getCart() {
    const res = await fetch(`${API_BASE}/cart`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Failed to fetch cart');
    return res.json();
}

export async function addToCart(entry: CartEntryPayload) {
    const res = await fetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Failed to add to cart');
    return res.json();
}

export async function removeFromCart(id: string) {
    const res = await fetch(`${API_BASE}/cart/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Failed to remove from cart');
    return res.json();
}

export async function clearCart() {
    // Deletes all items from the cart (DELETE /cart)
    const res = await fetch(`${API_BASE}/cart`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) {
        let message = 'Failed to clear cart';
        try {
            const data = await res.json();
            message = data?.error || message;
        } catch {}
        throw new Error(message);
    }
    return res.json();
}

// --- Improved error handling for all API calls ---
function parseError(res: Response, fallback: string) {
    return res.json().then(data => {
        throw new Error(data?.error || fallback);
    }).catch(() => {
        throw new Error(fallback);
    });
}

// Add more functions as needed for future backend endpoints.
