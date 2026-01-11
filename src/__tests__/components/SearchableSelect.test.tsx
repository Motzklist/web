/**
 * @fileoverview SearchableSelect component tests
 * Tests dropdown functionality, filtering, selection, and keyboard interactions
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import SearchableSelect, { SelectItem } from '@/components/SearchableSelect';

const mockItems: SelectItem[] = [
    { id: 1, name: 'School A' },
    { id: 2, name: 'School B' },
    { id: 3, name: 'School C' },
    { id: 4, name: 'Academy of Arts' },
    { id: 5, name: 'Technical Institute' },
];

describe('SearchableSelect', () => {
    const mockOnSelect = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render with label', () => {
            render(
                <SearchableSelect
                    label="School"
                    items={mockItems}
                    onSelect={mockOnSelect}
                />
            );

            expect(screen.getByText('School')).toBeInTheDocument();
        });

        it('should render input with placeholder', () => {
            render(
                <SearchableSelect
                    label="School"
                    items={mockItems}
                    placeholder="Search schools..."
                    onSelect={mockOnSelect}
                />
            );

            expect(screen.getByPlaceholderText('Search schools...')).toBeInTheDocument();
        });

        it('should render with default placeholder when not specified', () => {
            render(
                <SearchableSelect
                    label="School"
                    items={mockItems}
                    onSelect={mockOnSelect}
                />
            );

            expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
        });

        it('should be disabled when disabled prop is true', () => {
            render(
                <SearchableSelect
                    label="School"
                    items={mockItems}
                    onSelect={mockOnSelect}
                    disabled={true}
                />
            );

            expect(screen.getByRole('textbox')).toBeDisabled();
        });
    });

    describe('Dropdown Behavior', () => {
        it('should show dropdown when input is focused', async () => {
            render(
                <SearchableSelect
                    label="School"
                    items={mockItems}
                    onSelect={mockOnSelect}
                />
            );
            const user = userEvent.setup();

            await user.click(screen.getByRole('textbox'));

            expect(screen.getByText('School A')).toBeInTheDocument();
            expect(screen.getByText('School B')).toBeInTheDocument();
        });

        it('should not show dropdown when disabled', async () => {
            render(
                <SearchableSelect
                    label="School"
                    items={mockItems}
                    onSelect={mockOnSelect}
                    disabled={true}
                />
            );

            // Can't click disabled input, but verify items aren't shown
            expect(screen.queryByText('School A')).not.toBeInTheDocument();
        });

        it('should hide dropdown on blur after delay', async () => {
            jest.useFakeTimers();
            render(
                <SearchableSelect
                    label="School"
                    items={mockItems}
                    onSelect={mockOnSelect}
                />
            );

            const input = screen.getByRole('textbox');
            fireEvent.focus(input);

            expect(screen.getByText('School A')).toBeInTheDocument();

            fireEvent.blur(input);

            // Should still be visible immediately
            expect(screen.getByText('School A')).toBeInTheDocument();

            // After delay, should be hidden - wrap in act for state updates
            await act(async () => {
                jest.advanceTimersByTime(250);
            });

            expect(screen.queryByText('School A')).not.toBeInTheDocument();

            jest.useRealTimers();
        });
    });

    describe('Filtering', () => {
        it('should filter items as user types', async () => {
            render(
                <SearchableSelect
                    label="School"
                    items={mockItems}
                    onSelect={mockOnSelect}
                />
            );
            const user = userEvent.setup();

            await user.click(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'Academy');

            expect(screen.getByText('Academy of Arts')).toBeInTheDocument();
            expect(screen.queryByText('School A')).not.toBeInTheDocument();
            expect(screen.queryByText('School B')).not.toBeInTheDocument();
        });

        it('should filter case-insensitively', async () => {
            render(
                <SearchableSelect
                    label="School"
                    items={mockItems}
                    onSelect={mockOnSelect}
                />
            );
            const user = userEvent.setup();

            await user.click(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'SCHOOL');

            expect(screen.getByText('School A')).toBeInTheDocument();
            expect(screen.getByText('School B')).toBeInTheDocument();
            expect(screen.getByText('School C')).toBeInTheDocument();
        });

        it('should show no items when filter matches nothing', async () => {
            render(
                <SearchableSelect
                    label="School"
                    items={mockItems}
                    onSelect={mockOnSelect}
                />
            );
            const user = userEvent.setup();

            await user.click(screen.getByRole('textbox'));
            await user.type(screen.getByRole('textbox'), 'XYZ123');

            expect(screen.queryByText('School A')).not.toBeInTheDocument();
            expect(screen.queryByText('Academy of Arts')).not.toBeInTheDocument();
        });
    });

    describe('Selection', () => {
        it('should call onSelect when item is clicked', async () => {
            render(
                <SearchableSelect
                    label="School"
                    items={mockItems}
                    onSelect={mockOnSelect}
                />
            );
            const user = userEvent.setup();

            await user.click(screen.getByRole('textbox'));

            const item = screen.getByText('School A');
            fireEvent.mouseDown(item);

            expect(mockOnSelect).toHaveBeenCalledWith({ id: 1, name: 'School A' });
        });

        it('should update input value after selection', async () => {
            render(
                <SearchableSelect
                    label="School"
                    items={mockItems}
                    onSelect={mockOnSelect}
                />
            );
            const user = userEvent.setup();

            await user.click(screen.getByRole('textbox'));

            const item = screen.getByText('School B');
            fireEvent.mouseDown(item);

            expect(screen.getByRole('textbox')).toHaveValue('School B');
        });

        it('should close dropdown after selection', async () => {
            render(
                <SearchableSelect
                    label="School"
                    items={mockItems}
                    onSelect={mockOnSelect}
                />
            );
            const user = userEvent.setup();

            await user.click(screen.getByRole('textbox'));

            const item = screen.getByText('School A');
            fireEvent.mouseDown(item);

            await waitFor(() => {
                expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
            });
        });
    });

    describe('Reset Behavior', () => {
        it('should reset when items prop changes', async () => {
            const { rerender } = render(
                <SearchableSelect
                    label="School"
                    items={mockItems}
                    onSelect={mockOnSelect}
                />
            );
            const user = userEvent.setup();

            // Select an item
            await user.click(screen.getByRole('textbox'));
            fireEvent.mouseDown(screen.getByText('School A'));

            expect(screen.getByRole('textbox')).toHaveValue('School A');

            // Change items (simulating parent selection change)
            const newItems = [{ id: 10, name: 'Grade 1' }, { id: 11, name: 'Grade 2' }];
            rerender(
                <SearchableSelect
                    label="Grade"
                    items={newItems}
                    onSelect={mockOnSelect}
                />
            );

            // Input should be reset
            expect(screen.getByRole('textbox')).toHaveValue('');
        });
    });
});

