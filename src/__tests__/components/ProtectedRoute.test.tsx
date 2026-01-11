/**
 * @fileoverview ProtectedRoute component tests
 * Tests route protection - ensuring unauthenticated users cannot access protected pages
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/navigation
const mockReplace = jest.fn();
let mockPathname = '/';

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: mockReplace,
    }),
    usePathname: () => mockPathname,
}));

// Mock auth state
let mockIsAuthenticated = false;

jest.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        isAuthenticated: mockIsAuthenticated,
    }),
}));

import ProtectedRoute from '@/components/ProtectedRoute';

describe('ProtectedRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsAuthenticated = false;
        mockPathname = '/';
    });

    describe('Unauthenticated User', () => {
        it('should redirect to login page when not authenticated and on protected route', async () => {
            mockIsAuthenticated = false;
            mockPathname = '/';

            render(
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            );

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/login');
            });
        });

        it('should redirect to login when accessing cart page without auth', async () => {
            mockIsAuthenticated = false;
            mockPathname = '/cart';

            render(
                <ProtectedRoute>
                    <div>Cart Content</div>
                </ProtectedRoute>
            );

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/login');
            });
        });

        it('should redirect to login when accessing about page without auth', async () => {
            mockIsAuthenticated = false;
            mockPathname = '/about';

            render(
                <ProtectedRoute>
                    <div>About Content</div>
                </ProtectedRoute>
            );

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/login');
            });
        });

        it('should NOT redirect when already on login page', () => {
            mockIsAuthenticated = false;
            mockPathname = '/login';

            render(
                <ProtectedRoute>
                    <div>Login Content</div>
                </ProtectedRoute>
            );

            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('should render children on login page even when not authenticated', () => {
            mockIsAuthenticated = false;
            mockPathname = '/login';

            render(
                <ProtectedRoute>
                    <div>Login Form Here</div>
                </ProtectedRoute>
            );

            expect(screen.getByText('Login Form Here')).toBeInTheDocument();
        });

        it('should NOT render protected content when not authenticated', () => {
            mockIsAuthenticated = false;
            mockPathname = '/';

            render(
                <ProtectedRoute>
                    <div>Secret Content</div>
                </ProtectedRoute>
            );

            expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
        });
    });

    describe('Authenticated User', () => {
        it('should render protected content when authenticated', () => {
            mockIsAuthenticated = true;
            mockPathname = '/';

            render(
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            );

            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });

        it('should NOT redirect when authenticated', () => {
            mockIsAuthenticated = true;
            mockPathname = '/';

            render(
                <ProtectedRoute>
                    <div>Content</div>
                </ProtectedRoute>
            );

            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('should render cart page content when authenticated', () => {
            mockIsAuthenticated = true;
            mockPathname = '/cart';

            render(
                <ProtectedRoute>
                    <div>Cart Page</div>
                </ProtectedRoute>
            );

            expect(screen.getByText('Cart Page')).toBeInTheDocument();
        });

        it('should render about page content when authenticated', () => {
            mockIsAuthenticated = true;
            mockPathname = '/about';

            render(
                <ProtectedRoute>
                    <div>About Page</div>
                </ProtectedRoute>
            );

            expect(screen.getByText('About Page')).toBeInTheDocument();
        });
    });
});

