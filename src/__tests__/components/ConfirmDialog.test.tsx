/**
 * @fileoverview ConfirmDialog component tests
 * Tests modal display, button interactions, and keyboard handling
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import ConfirmDialog from '@/components/ConfirmDialog';

describe('ConfirmDialog', () => {
    const mockOnConfirm = jest.fn();
    const mockOnCancel = jest.fn();

    const defaultProps = {
        isOpen: true,
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?',
        onConfirm: mockOnConfirm,
        onCancel: mockOnCancel,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render dialog when isOpen is true', () => {
            render(<ConfirmDialog {...defaultProps} />);

            expect(screen.getByText('Confirm Action')).toBeInTheDocument();
            expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
        });

        it('should NOT render dialog when isOpen is false', () => {
            render(<ConfirmDialog {...defaultProps} isOpen={false} />);

            expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
        });

        it('should render confirm button with default label', () => {
            render(<ConfirmDialog {...defaultProps} />);

            expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
        });

        it('should render cancel button with default label', () => {
            render(<ConfirmDialog {...defaultProps} />);

            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        });

        it('should render custom button labels', () => {
            render(
                <ConfirmDialog
                    {...defaultProps}
                    confirmLabel="Delete"
                    cancelLabel="Keep"
                />
            );

            expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /keep/i })).toBeInTheDocument();
        });
    });

    describe('Button Interactions', () => {
        it('should call onConfirm when confirm button is clicked', () => {
            render(<ConfirmDialog {...defaultProps} />);

            fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

            expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        });

        it('should call onCancel when cancel button is clicked', () => {
            render(<ConfirmDialog {...defaultProps} />);

            fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

            expect(mockOnCancel).toHaveBeenCalledTimes(1);
        });

        it('should call onCancel when backdrop is clicked', () => {
            render(<ConfirmDialog {...defaultProps} />);

            // Click the backdrop (the overlay behind the dialog)
            const backdrop = document.querySelector('.bg-black\\/50');
            if (backdrop) {
                fireEvent.click(backdrop);
            }

            expect(mockOnCancel).toHaveBeenCalledTimes(1);
        });
    });

    describe('Keyboard Interactions', () => {
        it('should call onCancel when Escape key is pressed', () => {
            render(<ConfirmDialog {...defaultProps} />);

            fireEvent.keyDown(document, { key: 'Escape' });

            expect(mockOnCancel).toHaveBeenCalledTimes(1);
        });

        it('should not respond to Enter or Space keys', () => {
            render(<ConfirmDialog {...defaultProps} />);

            fireEvent.keyDown(document, { key: 'Enter' });
            fireEvent.keyDown(document, { key: 'Space' });
            fireEvent.keyDown(document, { key: 'a' });
            fireEvent.keyDown(document, { key: 'Tab' });

            expect(mockOnCancel).not.toHaveBeenCalled();
            expect(mockOnConfirm).not.toHaveBeenCalled();
        });
    });

    describe('Variants', () => {
        it('should apply danger variant styling to confirm button', () => {
            render(<ConfirmDialog {...defaultProps} variant="danger" />);

            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            expect(confirmButton).toHaveClass('bg-red-600');
        });

        it('should apply default variant styling to confirm button', () => {
            render(<ConfirmDialog {...defaultProps} variant="default" />);

            const confirmButton = screen.getByRole('button', { name: /confirm/i });
            expect(confirmButton).toHaveClass('bg-blue-600');
        });
    });

    describe('Body Scroll Lock', () => {
        it('should prevent body scroll when dialog is open', () => {
            render(<ConfirmDialog {...defaultProps} />);

            expect(document.body.style.overflow).toBe('hidden');
        });

        it('should restore body scroll when dialog is closed', () => {
            const { rerender } = render(<ConfirmDialog {...defaultProps} />);

            expect(document.body.style.overflow).toBe('hidden');

            rerender(<ConfirmDialog {...defaultProps} isOpen={false} />);

            expect(document.body.style.overflow).toBe('unset');
        });

        it('should restore body scroll on unmount', () => {
            const { unmount } = render(<ConfirmDialog {...defaultProps} />);

            expect(document.body.style.overflow).toBe('hidden');

            unmount();

            expect(document.body.style.overflow).toBe('unset');
        });
    });

    describe('Use Cases', () => {
        it('should work for remove item confirmation', () => {
            render(
                <ConfirmDialog
                    isOpen={true}
                    title="Remove Item"
                    message="Are you sure you want to remove School A - Grade 1 from your cart?"
                    confirmLabel="Remove"
                    cancelLabel="Keep"
                    onConfirm={mockOnConfirm}
                    onCancel={mockOnCancel}
                    variant="danger"
                />
            );

            expect(screen.getByText('Remove Item')).toBeInTheDocument();
            expect(screen.getByText(/remove School A - Grade 1/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /remove/i })).toHaveClass('bg-red-600');
        });

        it('should work for clear cart confirmation', () => {
            render(
                <ConfirmDialog
                    isOpen={true}
                    title="Clear Cart"
                    message="Are you sure you want to remove all items from your cart? This action cannot be undone."
                    confirmLabel="Clear All"
                    cancelLabel="Cancel"
                    onConfirm={mockOnConfirm}
                    onCancel={mockOnCancel}
                    variant="danger"
                />
            );

            expect(screen.getByText('Clear Cart')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
        });
    });
});

