import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import API_BASE_URL from './config';

const DropdownManager = () => {
    const [dropdownFields, setDropdownFields] = useState({});
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [newOptions, setNewOptions] = useState({});

    useEffect(() => {
        fetchDropdownOptions();
    }, []);

    const fetchDropdownOptions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/dropdown-options`);
            const data = await response.json();

            if (data.status === 'success') {
                setDropdownFields(data.dropdown_options);
            } else {
                setError('Failed to load dropdown options');
            }
        } catch (err) {
            setError(`Error loading dropdown options: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOption = async (fieldName) => {
        const newOption = newOptions[fieldName]?.trim();

        if (!newOption) {
            alert('Please enter an option');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/dropdown-options/${encodeURIComponent(fieldName)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ option: newOption })
            });

            const data = await response.json();

            if (data.status === 'success') {
                setMessage(`Added "${newOption}" to ${fieldName}`);
                setNewOptions({ ...newOptions, [fieldName]: '' });
                await fetchDropdownOptions();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setError(data.message || 'Failed to add option');
            }
        } catch (err) {
            setError(`Error adding option: ${err.message}`);
        }
    };

    const handleDeleteOption = async (fieldName, option) => {
        if (!confirm(`Are you sure you want to delete "${option}" from ${fieldName}?`)) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/dropdown-options/${encodeURIComponent(fieldName)}/${encodeURIComponent(option)}`,
                { method: 'DELETE' }
            );

            const data = await response.json();

            if (data.status === 'success') {
                setMessage(`Deleted "${option}" from ${fieldName}`);
                await fetchDropdownOptions();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setError(data.message || 'Failed to delete option');
            }
        } catch (err) {
            setError(`Error deleting option: ${err.message}`);
        }
    };

    const handleSync = async () => {
        try {
            setSyncing(true);
            const response = await fetch(`${API_BASE_URL}/api/sync-schema-sheet`, {
                method: 'POST'
            });

            const data = await response.json();

            if (data.status === 'success') {
                setMessage('Schema and DropdownOption sheet synced successfully');
                await fetchDropdownOptions();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setError(data.message || 'Sync failed');
            }
        } catch (err) {
            setError(`Error syncing: ${err.message}`);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-10">
                <RefreshCw className="w-6 h-6 animate-spin text-green-600 mr-2" />
                <span className="text-gray-600">Loading dropdown fields...</span>
            </div>
        );
    }

    const fieldNames = Object.keys(dropdownFields);

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <Database className="w-6 h-6 mr-2 text-green-600" />
                        Dropdown Field Management
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                        Manage dropdown options for all form fields. Changes sync with Google Sheets.
                    </p>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 disabled:opacity-50 transition-all shadow-md"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync Schema & Sheet'}
                </button>
            </div>

            {/* Messages */}
            {message && (
                <div className="mb-4 bg-green-50 border-2 border-green-400 rounded-md p-3 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <p className="text-green-900 text-sm font-medium">{message}</p>
                </div>
            )}

            {error && (
                <div className="mb-4 bg-red-50 border-2 border-red-400 rounded-md p-3 flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-900 text-sm font-medium">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
                        ×
                    </button>
                </div>
            )}

            {/* Dropdown Fields */}
            {fieldNames.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    <Database className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No dropdown fields found. Sync with schema to populate.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fieldNames.map(fieldName => (
                        <div key={fieldName} className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-3 text-lg">{fieldName}</h3>

                            {/* Options List */}
                            <div className="mb-4 max-h-48 overflow-y-auto space-y-2">
                                {dropdownFields[fieldName]?.map((option, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border border-gray-200 group hover:bg-gray-100 transition-colors">
                                        <span className="text-gray-700 text-sm">{option}</span>
                                        <button
                                            onClick={() => handleDeleteOption(fieldName, option)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800"
                                            title="Delete option"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )) || (
                                        <p className="text-gray-400 text-sm italic">No options yet</p>
                                    )}
                            </div>

                            {/* Add New Option */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add new option..."
                                    value={newOptions[fieldName] || ''}
                                    onChange={(e) => setNewOptions({ ...newOptions, [fieldName]: e.target.value })}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') handleAddOption(fieldName);
                                    }}
                                    className="flex-1 h-9 px-3 text-sm border-2 border-gray-300 rounded-md focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
                                />
                                <button
                                    onClick={() => handleAddOption(fieldName)}
                                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                    title="Add option"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropdownManager;
