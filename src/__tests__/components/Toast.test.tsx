/**
 * @fileoverview Toast component tests
 * Tests toast display, auto-dismiss, and manual close
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import Toast from '@/components/Toast';

describe('Toast', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('Rendering', () => {
        it('should not render when isVisible is false', () => {
            render(
                <Toast
                    message="Test message"
                    isVisible={false}
                    onClose={mockOnClose}
                />
            );

            expect(screen.queryByText('Test message')).not.toBeInTheDocument();
        });

        it('should render message after delay when isVisible is true', () => {
            render(
                <Toast
                    message="Item added to cart"
                    isVisible={true}
                    onClose={mockOnClose}
                    delay={0}
                />
            );

            act(() => {
                jest.advanceTimersByTime(10);
            });

            expect(screen.getByText('Item added to cart')).toBeInTheDocument();
        });

        it('should respect custom delay before showing', () => {
            render(
                <Toast
                    message="Delayed message"
                    isVisible={true}
                    onClose={mockOnClose}
                    delay={500}
                />
            );

            // Should not be visible yet
            expect(screen.queryByText('Delayed message')).not.toBeInTheDocument();

            act(() => {
                jest.advanceTimersByTime(500);
            });

            expect(screen.getByText('Delayed message')).toBeInTheDocument();
        });
    });

    describe('Auto-dismiss', () => {
        it('should call onClose after default duration', () => {
            render(
                <Toast
                    message="Auto dismiss"
                    isVisible={true}
                    onClose={mockOnClose}
                    delay={0}
                />
            );

            act(() => {
                jest.advanceTimersByTime(10); // Show toast
            });

            expect(mockOnClose).not.toHaveBeenCalled();

            act(() => {
                jest.advanceTimersByTime(3000); // Default duration
            });

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should call onClose after custom duration', () => {
            render(
                <Toast
                    message="Custom duration"
                    isVisible={true}
                    onClose={mockOnClose}
                    duration={5000}
                    delay={0}
                />
            );

            act(() => {
                jest.advanceTimersByTime(10); // Show toast
            });

            act(() => {
                jest.advanceTimersByTime(3000);
            });

            expect(mockOnClose).not.toHaveBeenCalled();

            act(() => {
                jest.advanceTimersByTime(2000);
            });

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('Cleanup', () => {
        it('should clear timers when isVisible changes to false', () => {
            const { rerender } = render(
                <Toast
                    message="Test"
                    isVisible={true}
                    onClose={mockOnClose}
                    delay={0}
                />
            );

            act(() => {
                jest.advanceTimersByTime(10);
            });

            // Store call count before hiding
            const callCountBeforeHide = mockOnClose.mock.calls.length;

            // Hide the toast
            rerender(
                <Toast
                    message="Test"
                    isVisible={false}
                    onClose={mockOnClose}
                    delay={0}
                />
            );

            // Advance past duration
            act(() => {
                jest.advanceTimersByTime(5000);
            });

            // onClose should not be called again after toast was hidden (timers were cleared)
            expect(mockOnClose.mock.calls.length).toBe(callCountBeforeHide);
        });

        it('should clear timers on unmount', () => {
            const { unmount } = render(
                <Toast
                    message="Test"
                    isVisible={true}
                    onClose={mockOnClose}
                    delay={0}
                />
            );

            act(() => {
                jest.advanceTimersByTime(10);
            });

            // Store the call count before unmount
            const callCountBeforeUnmount = mockOnClose.mock.calls.length;

            unmount();

            // Advance time after unmount
            act(() => {
                jest.advanceTimersByTime(5000);
            });

            // onClose should not have been called again after unmount (timers were cleared)
            expect(mockOnClose.mock.calls.length).toBe(callCountBeforeUnmount);
        });
    });
});

