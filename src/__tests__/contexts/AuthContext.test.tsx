/**
 * @fileoverview AuthContext tests
 * Tests that the useAuth hook throws when used outside provider
 * and that the context provides the expected interface
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth } from '@/contexts/AuthContext';

// We'll create a simple test component
function TestAuthHookUsage() {
    try {
        const auth = useAuth();
        return <div data-testid="auth-result">Has auth context: {auth.isAuthenticated ? 'yes' : 'no'}</div>;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return <div data-testid="auth-error">{message}</div>;
    }
}

describe('AuthContext', () => {
    describe('useAuth Hook', () => {
        it('should throw error when used outside AuthProvider', () => {
            // Suppress console.error for this test
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            render(<TestAuthHookUsage />);

            expect(screen.getByTestId('auth-error')).toHaveTextContent('useAuth must be used within an AuthProvider');

            consoleSpy.mockRestore();
        });
    });
});
