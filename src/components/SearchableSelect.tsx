'use client';

import {useState, useEffect} from 'react';

/**
 * SelectItem
 * A generic item shape for the dropdown list.
 * - `id` is used as a stable React key.
 * - `name` is the human-readable label displayed to the user.
 * - Additional fields may exist and are preserved via the index signature.
 */
export interface SelectItem {
    id: string | number;
    name: string;

    [key: string]: any;
}

/**
 * SearchableSelectProps
 * Props for the SearchableSelect component:
 * - `label`: Field label shown above the input.
 * - `items`: List of selectable items (must include `id` + `name`).
 * - `placeholder`: Placeholder text when nothing selected / query empty.
 * - `onSelect`: Callback invoked when the user selects an item.
 * - `disabled`: Disables input + dropdown interactions when true.
 */
interface SearchableSelectProps {
    label: string;
    items: SelectItem[];
    placeholder?: string;
    onSelect: (item: SelectItem) => void;
    disabled?: boolean;
}

/**
 * BLUR_CLOSE_DELAY_MS
 * Delay used when closing the dropdown on blur.
 * This avoids the "blur closes list before click registers" issue by letting
 * the onMouseDown selection fire before we close the menu.
 */
const BLUR_CLOSE_DELAY_MS = 200;

/**
 * SearchableSelect
 * Searchable dropdown built from a text input + filtered list.
 *
 * Behavior:
 * - Typing filters `items` by substring match on `name` (case-insensitive).
 * - Focus opens the dropdown (unless disabled).
 * - Blur closes the dropdown after a short delay (to allow item selection).
 * - Selecting an item sets it as the current value and calls `onSelect(item)`.
 * - When `items` changes (e.g., parent selection changes), input and selection reset.
 */
export default function SearchableSelect({
                                             label,
                                             items,
                                             placeholder = 'Search...',
                                             onSelect,
                                             disabled = false
                                         }: SearchableSelectProps) {
    // Current text in the input (also used for filtering)
    const [query, setQuery] = useState('');
    // Whether the dropdown list is currently visible
    const [isOpen, setIsOpen] = useState(false);
    // The last selected item (null if none selected)
    const [selectedItem, setSelectedItem] = useState<SelectItem | null>(null);

    // Reset when parent selection changes:
    // If the parent swaps `items` (e.g., selecting a different school changes grades),
    // we clear the existing query and selection to prevent stale UI state.
    useEffect(() => {
        setQuery('');
        setSelectedItem(null);
    }, [items]);

    // Filter items by name based on current query (case-insensitive substring match)
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
    );

    /**
     * handleSelect
     * Called when the user chooses an item from the dropdown.
     * Updates local UI state (selected item, input text, dropdown open state)
     * and informs the parent via `onSelect`.
     */
    const handleSelect = (item: SelectItem) => {
        setSelectedItem(item);
        // Put the item's name into the input so the user sees what was chosen
        setQuery(item.name);
        // Close dropdown after selection
        setIsOpen(false);
        // Notify parent of selection (parent can fetch dependent data, etc.)
        onSelect(item);
    };

    return (
        <div className={`relative w-full mb-4 font-sans ${disabled ? 'opacity-50' : ''}`}>
            <label className="block mb-1 text-sm font-bold text-gray-700 dark:text-gray-300">
                {label}
            </label>

            <input
                type="text"
                disabled={disabled}
                className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:disabled:bg-zinc-900"
                // If an item is selected, show its name as placeholder; otherwise show generic placeholder
                // (Note: the actual input value is `query`.)
                placeholder={selectedItem ? selectedItem.name : placeholder}
                value={query}
                onChange={(e) => {
                    // Update query as the user types, and open dropdown to show matches
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                // Open dropdown on focus (unless disabled)
                onFocus={() => !disabled && setIsOpen(true)}
                // Close dropdown on blur after a small delay to allow click/selection to register
                onBlur={() => setTimeout(() => setIsOpen(false), BLUR_CLOSE_DELAY_MS)}
            />

            {/* Only show dropdown when open, enabled, and there are matches */}
            {isOpen && !disabled && filteredItems.length > 0 && (
                <ul className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border rounded shadow-lg max-h-60 dark:bg-zinc-800 dark:border-zinc-700">
                    {filteredItems.map((item) => (
                        <li
                            key={item.id}
                            // Use onMouseDown (not onClick) so selection runs before input blur closes the list
                            onMouseDown={() => handleSelect(item)}
                            className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-gray-800 dark:text-gray-200 dark:hover:bg-blue-900"
                        >
                            {item.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
