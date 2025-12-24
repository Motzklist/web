'use client';

import {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import * as api from '@/services/api';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    // Optionally: user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: { children: ReactNode }) {
    // Always start with false to match SSR, then update after hydration
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check authentication status from backend
        (async () => {
            try {
                await api.checkAuth();
                setIsAuthenticated(true);
            } catch (err) {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const login = async (username: string, password: string) => {
        setError(null);
        try {
            await api.login({ username, password });
            setIsAuthenticated(true);
        } catch (err: any) {
            setError(err.message || 'Login failed');
            setIsAuthenticated(false);
            throw err; // So LoginForm can await and handle errors
        }
    };

    const logout = async () => {
        setError(null);
        try {
            await api.logout();
        } catch (err: any) {
            // Optionally show error, but always log out locally
        }
        setIsAuthenticated(false);
    };

    // Optionally expose error for UI feedback
    // error,

    if (isLoading) {
        return null; // Prevent flash of wrong content
    }

    return (
        <AuthContext.Provider value={{isAuthenticated, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
