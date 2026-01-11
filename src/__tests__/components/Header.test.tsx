/**
 * @fileoverview Header component tests
 * Tests navigation links, cart icon, and logout functionality
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/navigation
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: mockReplace,
    }),
}));

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    );
});

// Mock next/image
jest.mock('next/image', () => {
    return ({ src, alt, ...props }: { src: string; alt: string }) => (
        <img src={src} alt={alt} {...props} />
    );
});

// Auth mock state
let mockIsAuthenticated = false;
const mockLogout = jest.fn();

jest.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        isAuthenticated: mockIsAuthenticated,
        logout: mockLogout,
    }),
}));

// Cart mock state
let mockCartEntries: any[] = [];

jest.mock('@/contexts/CartContext', () => ({
    useCart: () => ({
        cartEntries: mockCartEntries,
    }),
}));

import Header from '@/components/Header';

describe('Header', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsAuthenticated = false;
        mockCartEntries = [];
    });

    describe('Navigation Links', () => {
        it('should render Home link', () => {
            render(<Header />);

            const homeLink = screen.getByRole('link', { name: /home/i });
            expect(homeLink).toBeInTheDocument();
            expect(homeLink).toHaveAttribute('href', '/');
        });

        it('should render About link', () => {
            render(<Header />);

            const aboutLink = screen.getByRole('link', { name: /about/i });
            expect(aboutLink).toBeInTheDocument();
            expect(aboutLink).toHaveAttribute('href', '/about');
        });

        it('should render Contact link', () => {
            render(<Header />);

            const contactLink = screen.getByRole('link', { name: /contact/i });
            expect(contactLink).toBeInTheDocument();
            expect(contactLink).toHaveAttribute('href', '/contact');
        });

        it('should render store name/logo link', () => {
            render(<Header />);

            const logoLink = screen.getByRole('link', { name: /motzkin store/i });
            expect(logoLink).toBeInTheDocument();
            expect(logoLink).toHaveAttribute('href', '/');
        });
    });

    describe('Unauthenticated State', () => {
        beforeEach(() => {
            mockIsAuthenticated = false;
        });

        it('should NOT show cart icon when not authenticated', () => {
            render(<Header />);

            expect(screen.queryByTitle(/view cart/i)).not.toBeInTheDocument();
        });

        it('should NOT show logout button when not authenticated', () => {
            render(<Header />);

            expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
        });
    });

    describe('Authenticated State', () => {
        beforeEach(() => {
            mockIsAuthenticated = true;
        });

        it('should show cart link when authenticated', () => {
            render(<Header />);

            const cartLink = screen.getByRole('link', { name: /cart/i });
            expect(cartLink).toHaveAttribute('href', '/cart');
        });

        it('should show logout button when authenticated', () => {
            render(<Header />);

            expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
        });

        it('should show empty cart icon when cart is empty', () => {
            mockCartEntries = [];
            render(<Header />);

            const cartImage = screen.getByAltText('Cart');
            expect(cartImage).toHaveAttribute('src', '/cart-empty.svg');
        });

        it('should show full cart icon when cart has items', () => {
            mockCartEntries = [{ id: '1', items: [] }];
            render(<Header />);

            const cartImage = screen.getByAltText('Cart');
            expect(cartImage).toHaveAttribute('src', '/cart-full.svg');
        });

        it('should link cart icon to cart page', () => {
            render(<Header />);

            const cartLink = screen.getByRole('link', { name: /cart/i });
            expect(cartLink).toHaveAttribute('href', '/cart');
        });
    });

    describe('Logout Functionality', () => {
        beforeEach(() => {
            mockIsAuthenticated = true;
        });

        it('should call logout when logout button is clicked', () => {
            render(<Header />);

            const logoutButton = screen.getByRole('button', { name: /logout/i });
            fireEvent.click(logoutButton);

            expect(mockLogout).toHaveBeenCalledTimes(1);
        });

        it('should redirect to login page after logout', () => {
            render(<Header />);

            const logoutButton = screen.getByRole('button', { name: /logout/i });
            fireEvent.click(logoutButton);

            expect(mockReplace).toHaveBeenCalledWith('/login');
        });
    });
});

