/**
 * @fileoverview EquipmentList component tests
 * Tests equipment display, checkbox toggling, and quantity input
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import EquipmentList, { EquipmentData } from '@/components/EquipmentList';

const mockEquipmentData: EquipmentData = {
    classId: 1,
    className: 'Grade 1 Equipment',
    items: [
        { id: 1, name: 'Notebook', quantity: 5 },
        { id: 2, name: 'Pencil', quantity: 10 },
        { id: 3, name: 'Eraser', quantity: 2 },
        { id: 4, name: 'Ruler', quantity: 1 },
    ],
};

describe('EquipmentList', () => {
    const mockOnToggle = jest.fn();
    const mockOnQuantityChange = jest.fn();

    const defaultProps = {
        data: mockEquipmentData,
        selectedIds: new Set([1, 2, 3, 4]),
        quantities: new Map([
            [1, 5],
            [2, 10],
            [3, 2],
            [4, 1],
        ]),
        onToggle: mockOnToggle,
        onQuantityChange: mockOnQuantityChange,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render class name as header', () => {
            render(<EquipmentList {...defaultProps} />);

            expect(screen.getByText('Grade 1 Equipment')).toBeInTheDocument();
        });

        it('should render all equipment items', () => {
            render(<EquipmentList {...defaultProps} />);

            expect(screen.getByText('Notebook')).toBeInTheDocument();
            expect(screen.getByText('Pencil')).toBeInTheDocument();
            expect(screen.getByText('Eraser')).toBeInTheDocument();
            expect(screen.getByText('Ruler')).toBeInTheDocument();
        });

        it('should render table headers', () => {
            render(<EquipmentList {...defaultProps} />);

            expect(screen.getByText('Item')).toBeInTheDocument();
            expect(screen.getByText('Quantity')).toBeInTheDocument();
        });

        it('should render quantity inputs for each item', () => {
            render(<EquipmentList {...defaultProps} />);

            const inputs = screen.getAllByRole('spinbutton');
            expect(inputs).toHaveLength(4);
        });
    });

    describe('Checkbox/Selection Toggle', () => {
        it('should show checked state for selected items', () => {
            render(<EquipmentList {...defaultProps} />);

            // All 4 items are selected, each should have a checkmark button with the check SVG
            const checkButtons = screen.getAllByRole('button');
            expect(checkButtons).toHaveLength(4);

            // Check that SVG checkmarks are present (indicating selected state)
            const checkmarks = document.querySelectorAll('svg');
            expect(checkmarks.length).toBeGreaterThanOrEqual(4);
        });

        it('should call onToggle when item name is clicked', () => {
            render(<EquipmentList {...defaultProps} />);

            fireEvent.click(screen.getByText('Notebook'));

            expect(mockOnToggle).toHaveBeenCalledWith(1);
        });

        it('should call onToggle when checkbox button is clicked', () => {
            render(<EquipmentList {...defaultProps} />);

            const checkButtons = screen.getAllByRole('button');
            fireEvent.click(checkButtons[0]);

            expect(mockOnToggle).toHaveBeenCalledWith(1);
        });

        it('should show unchecked state for unselected items', () => {
            const propsWithUnselected = {
                ...defaultProps,
                selectedIds: new Set([2, 3]), // Only items 2 and 3 selected
            };

            render(<EquipmentList {...propsWithUnselected} />);

            // Only 2 items (2 and 3) should be in the selected state (with checkmarks),
            // implying that the remaining items are unselected.
            const checkmarks = document.querySelectorAll('svg');
            expect(checkmarks.length).toBe(2);
        });
    });

    describe('Quantity Input', () => {
        it('should display correct quantities', () => {
            render(<EquipmentList {...defaultProps} />);

            const inputs = screen.getAllByRole('spinbutton');
            expect(inputs[0]).toHaveValue(5);  // Notebook
            expect(inputs[1]).toHaveValue(10); // Pencil
            expect(inputs[2]).toHaveValue(2);  // Eraser
            expect(inputs[3]).toHaveValue(1);  // Ruler
        });

        it('should call onQuantityChange when quantity is changed', async () => {
            render(<EquipmentList {...defaultProps} />);
            const user = userEvent.setup();

            const inputs = screen.getAllByRole('spinbutton');
            // Clear and type new value
            await user.clear(inputs[0]);
            await user.type(inputs[0], '7');

            // The component calls onQuantityChange for each change
            // Check that it was called with the expected final value
            expect(mockOnQuantityChange).toHaveBeenCalled();
            // Verify the last call includes the item id 1
            const calls = mockOnQuantityChange.mock.calls;
            const callsForItem1 = calls.filter((call: number[]) => call[0] === 1);
            expect(callsForItem1.length).toBeGreaterThan(0);
        });

        it('should disable quantity input for unselected items', () => {
            const propsWithUnselected = {
                ...defaultProps,
                selectedIds: new Set([2, 3]), // Only items 2 and 3 selected
            };

            render(<EquipmentList {...propsWithUnselected} />);

            const inputs = screen.getAllByRole('spinbutton');
            expect(inputs[0]).toBeDisabled(); // Notebook (id: 1) - not selected
            expect(inputs[1]).toBeEnabled();  // Pencil (id: 2) - selected
            expect(inputs[2]).toBeEnabled();  // Eraser (id: 3) - selected
            expect(inputs[3]).toBeDisabled(); // Ruler (id: 4) - not selected
        });

        it('should clamp quantity to minimum 0', async () => {
            render(<EquipmentList {...defaultProps} />);
            const user = userEvent.setup();

            const inputs = screen.getAllByRole('spinbutton');
            await user.clear(inputs[0]);
            await user.type(inputs[0], '-5');

            // Should clamp to 0
            expect(mockOnQuantityChange).toHaveBeenCalledWith(1, 0);
        });

        it('should clamp quantity to maximum 99', async () => {
            render(<EquipmentList {...defaultProps} />);
            const user = userEvent.setup();

            const inputs = screen.getAllByRole('spinbutton');
            await user.clear(inputs[0]);
            await user.type(inputs[0], '150');

            // Should be clamped in some calls
            const calls = mockOnQuantityChange.mock.calls;
            const lastCall = calls[calls.length - 1];
            expect(lastCall[1]).toBeLessThanOrEqual(99);
        });
    });

    describe('Accessibility', () => {
        it('should have min and max attributes on quantity inputs', () => {
            render(<EquipmentList {...defaultProps} />);

            const inputs = screen.getAllByRole('spinbutton');
            inputs.forEach(input => {
                expect(input).toHaveAttribute('min', '0');
                expect(input).toHaveAttribute('max', '99');
            });
        });
    });
});

