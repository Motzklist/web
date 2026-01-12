/**
 * @fileoverview Cart Page tests
 * Tests cart display, remove functionality, clear cart, and empty state
 * These tests mock the CartContext to provide different states
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/link
jest.mock('next/link', () => {
    function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
        return <a href={href}>{children}</a>;
    }
    MockLink.displayName = 'MockLink';
    return MockLink;
});

// Mock next/image
jest.mock('next/image', () => {
    function MockImage({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={src} alt={alt} {...props} />;
    }
    MockImage.displayName = 'MockImage';
    return MockImage;
});

// Mock Layout component
jest.mock('@/components/Layout', () => {
    function MockLayout({ children }: { children: React.ReactNode }) {
        return <div>{children}</div>;
    }
    MockLayout.displayName = 'MockLayout';
    return MockLayout;
});

// Cart mock functions
const mockRemoveFromCart = jest.fn();
const mockClearCart = jest.fn();

// Cart entry type for mocking
interface MockCartEntry {
    id: string;
    timestamp: number;
    school: { id: number; name: string };
    grade: { id: number; name: string };
    items: { id: number; name: string; quantity: number }[];
}

// This will be set by each test
let mockCartEntries: MockCartEntry[] = [];

jest.mock('@/contexts/CartContext', () => ({
    useCart: () => ({
        cartEntries: mockCartEntries,
        removeFromCart: mockRemoveFromCart,
        clearCart: mockClearCart,
    }),
}));

import CartPage from '@/app/cart/page';

describe('CartPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCartEntries = [];
    });

    describe('Empty Cart State', () => {
        it('should show empty cart message when cart is empty', () => {
            mockCartEntries = [];
            render(<CartPage />);

            expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
        });

        it('should show empty cart image', () => {
            mockCartEntries = [];
            render(<CartPage />);

            expect(screen.getByAltText(/empty cart/i)).toBeInTheDocument();
        });

        it('should show link to browse equipment', () => {
            mockCartEntries = [];
            render(<CartPage />);

            const browseLink = screen.getByRole('link', { name: /browse equipment/i });
            expect(browseLink).toBeInTheDocument();
            expect(browseLink).toHaveAttribute('href', '/');
        });

        it('should NOT show clear all button when cart is empty', () => {
            mockCartEntries = [];
            render(<CartPage />);

            expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument();
        });
    });

    describe('Cart with Items', () => {
        const mockEntries = [
            {
                id: 'entry-1',
                timestamp: Date.now(),
                school: { id: 1, name: 'School A' },
                grade: { id: 1, name: 'Grade 1' },
                items: [
                    { id: 1, name: 'Notebook', quantity: 5 },
                    { id: 2, name: 'Pencil', quantity: 10 },
                ],
            },
            {
                id: 'entry-2',
                timestamp: Date.now() - 1000,
                school: { id: 2, name: 'School B' },
                grade: { id: 2, name: 'Grade 2' },
                items: [
                    { id: 3, name: 'Eraser', quantity: 3 },
                ],
            },
        ];

        beforeEach(() => {
            mockCartEntries = mockEntries;
        });

        it('should display cart entries', () => {
            render(<CartPage />);

            expect(screen.getByText('School A')).toBeInTheDocument();
            expect(screen.getByText('Grade 1')).toBeInTheDocument();
            expect(screen.getByText('School B')).toBeInTheDocument();
            expect(screen.getByText('Grade 2')).toBeInTheDocument();
        });

        it('should display items within entries', () => {
            render(<CartPage />);

            expect(screen.getByText('Notebook')).toBeInTheDocument();
            expect(screen.getByText('Pencil')).toBeInTheDocument();
            expect(screen.getByText('Eraser')).toBeInTheDocument();
        });

        it('should display item quantities with multiplication symbol format', () => {
            render(<CartPage />);

            // Quantities are displayed in "×N" format
            expect(screen.getByText('×5')).toBeInTheDocument();   // Notebook: 5
            expect(screen.getByText('×10')).toBeInTheDocument();  // Pencil: 10
            expect(screen.getByText('×3')).toBeInTheDocument();   // Eraser: 3
        });

        it('should display cart summary', () => {
            render(<CartPage />);

            // Check that the summary text is present
            expect(screen.getByText(/equipment lists/i)).toBeInTheDocument();
        });

        it('should display total items count', () => {
            render(<CartPage />);

            // Total: 5 + 10 + 3 = 18 items
            expect(screen.getByText(/18/)).toBeInTheDocument();
            expect(screen.getByText(/items total/i)).toBeInTheDocument();
        });

        it('should show clear all button', () => {
            render(<CartPage />);

            expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
        });

        it('should show remove button for each entry', () => {
            render(<CartPage />);

            const removeButtons = screen.getAllByTitle(/remove from cart/i);
            expect(removeButtons).toHaveLength(2);
        });
    });

    describe('Remove Item Dialog', () => {
        beforeEach(() => {
            mockCartEntries = [
                {
                    id: 'entry-1',
                    timestamp: Date.now(),
                    school: { id: 1, name: 'Test School' },
                    grade: { id: 1, name: 'Test Grade' },
                    items: [{ id: 1, name: 'Notebook', quantity: 5 }],
                },
            ];
        });

        it('should show confirmation dialog when remove is clicked', () => {
            render(<CartPage />);

            const removeButton = screen.getByTitle(/remove from cart/i);
            fireEvent.click(removeButton);

            expect(screen.getByText(/remove item/i)).toBeInTheDocument();
        });

        it('should show entry name in confirmation message', () => {
            render(<CartPage />);

            const removeButton = screen.getByTitle(/remove from cart/i);
            fireEvent.click(removeButton);

            expect(screen.getByText(/Test School - Test Grade/i)).toBeInTheDocument();
        });

        it('should call removeFromCart when confirmed', () => {
            render(<CartPage />);

            const removeButton = screen.getByTitle(/remove from cart/i);
            fireEvent.click(removeButton);

            // The dialog has a "Remove" button - get all buttons with "Remove" text
            // and click the one that's the dialog confirm button (not the X icon)
            const removeButtons = screen.getAllByRole('button', { name: /remove/i });
            // The dialog confirm button is the last one (the X button has title, not name)
            const dialogConfirmButton = removeButtons[removeButtons.length - 1];
            fireEvent.click(dialogConfirmButton);

            expect(mockRemoveFromCart).toHaveBeenCalledWith('entry-1');
        });

        it('should close dialog when cancelled', () => {
            render(<CartPage />);

            const removeButton = screen.getByTitle(/remove from cart/i);
            fireEvent.click(removeButton);

            expect(screen.getByText(/remove item/i)).toBeInTheDocument();

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
        });
    });

    describe('Clear Cart Dialog', () => {
        beforeEach(() => {
            mockCartEntries = [
                {
                    id: 'entry-1',
                    timestamp: Date.now(),
                    school: { id: 1, name: 'School A' },
                    grade: { id: 1, name: 'Grade 1' },
                    items: [],
                },
            ];
        });

        it('should show confirmation dialog when clear all is clicked', () => {
            render(<CartPage />);

            const clearButton = screen.getByRole('button', { name: /clear all/i });
            fireEvent.click(clearButton);

            expect(screen.getByText(/clear cart/i)).toBeInTheDocument();
        });

        it('should call clearCart when confirmed', () => {
            render(<CartPage />);

            // Click "Clear All" button in the header to open dialog
            const clearAllButton = screen.getByRole('button', { name: /clear all/i });
            fireEvent.click(clearAllButton);

            // Dialog should now be open - find buttons
            // The dialog has: Cancel and "Clear All" (confirm button)
            // We need to click the confirm button in the dialog, not the original Clear All
            const allButtons = screen.getAllByRole('button');

            // Find buttons with "Clear All" text - there should be 2 (header + dialog)
            const clearAllButtons = allButtons.filter(btn =>
                btn.textContent?.toLowerCase().includes('clear all') ||
                btn.textContent?.toLowerCase().includes('clear')
            );

            // Click the last one (the one in the dialog)
            if (clearAllButtons.length >= 2) {
                fireEvent.click(clearAllButtons[clearAllButtons.length - 1]);
            }

            expect(mockClearCart).toHaveBeenCalled();
        });

        it('should close dialog when cancelled on clear cart', () => {
            render(<CartPage />);

            const clearButton = screen.getByRole('button', { name: /clear all/i });
            fireEvent.click(clearButton);

            expect(screen.getByText(/clear cart/i)).toBeInTheDocument();

            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            fireEvent.click(cancelButton);

            // Dialog should be closed, clearCart should NOT be called
            expect(mockClearCart).not.toHaveBeenCalled();
        });
    });

    describe('Checkout Button', () => {
        beforeEach(() => {
            mockCartEntries = [
                {
                    id: 'entry-1',
                    timestamp: Date.now(),
                    school: { id: 1, name: 'School A' },
                    grade: { id: 1, name: 'Grade 1' },
                    items: [],
                },
            ];
        });

        it('should show disabled checkout button', () => {
            render(<CartPage />);

            const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i });
            expect(checkoutButton).toBeDisabled();
        });

        it('should show coming soon message', () => {
            render(<CartPage />);

            expect(screen.getByText(/checkout functionality will be available soon/i)).toBeInTheDocument();
        });
    });

    describe('Date Formatting', () => {
        it('should display formatted timestamp', () => {
            const timestamp = new Date('2024-01-15T10:30:00').getTime();
            mockCartEntries = [
                {
                    id: 'entry-1',
                    timestamp: timestamp,
                    school: { id: 1, name: 'School A' },
                    grade: { id: 1, name: 'Grade 1' },
                    items: [],
                },
            ];

            render(<CartPage />);

            // Should show "Added" with the formatted date (Jan 15, 2024)
            expect(screen.getByText(/added/i)).toBeInTheDocument();
            expect(screen.getByText(/jan/i)).toBeInTheDocument();
            expect(screen.getByText(/15/)).toBeInTheDocument();
            expect(screen.getByText(/2024/)).toBeInTheDocument();
        });
    });
});

