/**
 * @fileoverview CartContext tests
 * Tests that the useCart hook throws when used outside provider
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Test component that uses the cart context
function TestCartHookUsage() {
    const { useCart } = require('@/contexts/CartContext');

    try {
        const cart = useCart();
        return <div data-testid="cart-result">Has cart context</div>;
    } catch (error: any) {
        return <div data-testid="cart-error">{error.message}</div>;
    }
}

describe('CartContext', () => {
    describe('useCart Hook', () => {
        it('should throw error when used outside CartProvider', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            render(<TestCartHookUsage />);

            expect(screen.getByTestId('cart-error')).toHaveTextContent('useCart must be used within a CartProvider');

            consoleSpy.mockRestore();
        });
    });
});
