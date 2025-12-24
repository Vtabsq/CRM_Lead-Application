import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

const EditableDropdown = ({
    category,
    value,
    onChange,
    placeholder = "Select an option",
    className = "",
    disabled = false,
    defaultOptions = []
}) => {
    const [options, setOptions] = useState(defaultOptions);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newValue, setNewValue] = useState('');

    // Initialize options from localStorage or use defaults
    useEffect(() => {
        const storageKey = `dropdown_${category}`;
        const stored = localStorage.getItem(storageKey);

        if (stored) {
            try {
                const parsedOptions = JSON.parse(stored);
                if (Array.isArray(parsedOptions) && parsedOptions.length > 0) {
                    setOptions(parsedOptions);
                } else {
                    setOptions(defaultOptions);
                }
            } catch (error) {
                console.error('Error parsing stored options:', error);
                setOptions(defaultOptions);
            }
        } else {
            setOptions(defaultOptions);
        }
    }, [category]);

    const handleAddNew = () => {
        if (!newValue.trim()) {
            alert('Please enter a value');
            return;
        }

        // Check if value already exists
        if (options.includes(newValue.trim())) {
            alert('This value already exists');
            return;
        }

        // Add new option to list
        const updatedOptions = [...options, newValue.trim()];
        setOptions(updatedOptions);

        // Save to localStorage
        const storageKey = `dropdown_${category}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedOptions));

        // Set as selected value
        onChange(newValue.trim());

        // Close modal and reset
        setShowAddModal(false);
        setNewValue('');
    };

    const handleSelectChange = (e) => {
        const selectedValue = e.target.value;

        if (selectedValue === '__add_new__') {
            setShowAddModal(true);
        } else {
            onChange(selectedValue);
        }
    };

    return (
        <>
            <select
                value={value}
                onChange={handleSelectChange}
                disabled={disabled}
                className={className}
            >
                <option value="">{placeholder}</option>
                {options.map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
                <option value="__add_new__" style={{ backgroundColor: '#f3f4f6', color: '#374151', fontWeight: '500' }}>
                    Add
                </option>
            </select>

            {/* Add New Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Add New {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewValue('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter Value
                            </label>
                            <input
                                type="text"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddNew();
                                    if (e.key === 'Escape') {
                                        setShowAddModal(false);
                                        setNewValue('');
                                    }
                                }}
                                placeholder="Enter new value"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewValue('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddNew}
                                disabled={!newValue.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EditableDropdown;
