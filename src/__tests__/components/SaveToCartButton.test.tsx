/**
 * @fileoverview SaveToCartButton component tests
 * Tests add to cart functionality, button states, and validation
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock CartContext
const mockAddToCart = jest.fn();

jest.mock('@/contexts/CartContext', () => ({
    useCart: () => ({
        addToCart: mockAddToCart,
    }),
}));

import SaveToCartButton from '@/components/SaveToCartButton';

describe('SaveToCartButton', () => {
    const defaultItems = [
        { id: 1, name: 'Notebook', quantity: 5 },
        { id: 2, name: 'Pencil', quantity: 10 },
        { id: 3, name: 'Eraser', quantity: 2 },
    ];

    const defaultProps = {
        school: { id: 1, name: 'School A' },
        grade: { id: 1, name: 'Grade 1' },
        selectedIds: new Set([1, 2]),
        quantities: new Map([
            [1, 5],
            [2, 10],
            [3, 2],
        ]),
        items: defaultItems,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Rendering', () => {
        it('should render save to cart button', () => {
            render(<SaveToCartButton {...defaultProps} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should show item count in button text', () => {
            render(<SaveToCartButton {...defaultProps} />);

            expect(screen.getByText(/save to cart/i)).toBeInTheDocument();
            expect(screen.getByText(/2 items/i)).toBeInTheDocument();
        });

        it('should show singular "item" when only one item selected', () => {
            const props = {
                ...defaultProps,
                selectedIds: new Set([1]),
            };

            render(<SaveToCartButton {...props} />);

            expect(screen.getByText(/1 items/i)).toBeInTheDocument();
        });
    });

    describe('Button State', () => {
        it('should be disabled when no school is selected', () => {
            const props = {
                ...defaultProps,
                school: null,
            };

            render(<SaveToCartButton {...props} />);

            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('should be disabled when no grade is selected', () => {
            const props = {
                ...defaultProps,
                grade: null,
            };

            render(<SaveToCartButton {...props} />);

            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('should be disabled when no items are selected', () => {
            const props = {
                ...defaultProps,
                selectedIds: new Set<number>(),
            };

            render(<SaveToCartButton {...props} />);

            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('should be disabled when disabled prop is true', () => {
            const props = {
                ...defaultProps,
                disabled: true,
            };

            render(<SaveToCartButton {...props} />);

            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('should be enabled when all requirements are met', () => {
            render(<SaveToCartButton {...defaultProps} />);

            expect(screen.getByRole('button')).toBeEnabled();
        });
    });

    describe('Add to Cart Functionality', () => {
        it('should call addToCart with correct payload when clicked', () => {
            render(<SaveToCartButton {...defaultProps} />);

            fireEvent.click(screen.getByRole('button'));

            expect(mockAddToCart).toHaveBeenCalledWith({
                school: { id: 1, name: 'School A' },
                grade: { id: 1, name: 'Grade 1' },
                items: [
                    { id: 1, name: 'Notebook', quantity: 5 },
                    { id: 2, name: 'Pencil', quantity: 10 },
                ],
            });
        });

        it('should only include selected items in cart payload', () => {
            const props = {
                ...defaultProps,
                selectedIds: new Set([1]), // Only item 1 selected
            };

            render(<SaveToCartButton {...props} />);

            fireEvent.click(screen.getByRole('button'));

            expect(mockAddToCart).toHaveBeenCalledWith({
                school: { id: 1, name: 'School A' },
                grade: { id: 1, name: 'Grade 1' },
                items: [{ id: 1, name: 'Notebook', quantity: 5 }],
            });
        });

        it('should use quantities from quantities map', () => {
            const props = {
                ...defaultProps,
                quantities: new Map([
                    [1, 99], // Changed quantity
                    [2, 1],  // Changed quantity
                ]),
            };

            render(<SaveToCartButton {...props} />);

            fireEvent.click(screen.getByRole('button'));

            expect(mockAddToCart).toHaveBeenCalledWith({
                school: { id: 1, name: 'School A' },
                grade: { id: 1, name: 'Grade 1' },
                items: [
                    { id: 1, name: 'Notebook', quantity: 99 },
                    { id: 2, name: 'Pencil', quantity: 1 },
                ],
            });
        });

        it('should not include items with quantity 0', () => {
            const props = {
                ...defaultProps,
                quantities: new Map([
                    [1, 0], // Zero quantity
                    [2, 5],
                ]),
            };

            render(<SaveToCartButton {...props} />);

            fireEvent.click(screen.getByRole('button'));

            expect(mockAddToCart).toHaveBeenCalledWith({
                school: { id: 1, name: 'School A' },
                grade: { id: 1, name: 'Grade 1' },
                items: [{ id: 2, name: 'Pencil', quantity: 5 }],
            });
        });
    });

    describe('Temporary Disable After Click', () => {
        it('should show "Saved!" text after clicking', () => {
            render(<SaveToCartButton {...defaultProps} />);

            fireEvent.click(screen.getByRole('button'));

            expect(screen.getByText(/saved!/i)).toBeInTheDocument();
        });

        it('should disable button temporarily after clicking', () => {
            render(<SaveToCartButton {...defaultProps} />);

            fireEvent.click(screen.getByRole('button'));

            expect(screen.getByRole('button')).toBeDisabled();
        });

        it('should re-enable button after timeout', () => {
            render(<SaveToCartButton {...defaultProps} />);

            fireEvent.click(screen.getByRole('button'));

            expect(screen.getByRole('button')).toBeDisabled();

            act(() => {
                jest.advanceTimersByTime(3000);
            });

            expect(screen.getByRole('button')).toBeEnabled();
        });

        it('should show original text after timeout', () => {
            render(<SaveToCartButton {...defaultProps} />);

            fireEvent.click(screen.getByRole('button'));

            expect(screen.getByText(/saved!/i)).toBeInTheDocument();

            act(() => {
                jest.advanceTimersByTime(3000);
            });

            expect(screen.getByText(/save to cart/i)).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should not call addToCart when school is null', () => {
            const props = {
                ...defaultProps,
                school: null,
            };

            render(<SaveToCartButton {...props} />);

            // Button is disabled, but try to click anyway
            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(mockAddToCart).not.toHaveBeenCalled();
        });

        it('should not call addToCart when all selected items have 0 quantity', () => {
            const props = {
                ...defaultProps,
                quantities: new Map([
                    [1, 0],
                    [2, 0],
                ]),
            };

            render(<SaveToCartButton {...props} />);

            fireEvent.click(screen.getByRole('button'));

            expect(mockAddToCart).not.toHaveBeenCalled();
        });
    });
});

