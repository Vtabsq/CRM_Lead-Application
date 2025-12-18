import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, RefreshCw, Table, ChevronLeft, ChevronRight, Edit2, X, Save } from 'lucide-react';

import API_BASE_URL from './config';
const COLUMNS_PER_PAGE = 5;

const SearchData = () => {
    const [searchCriteria, setSearchCriteria] = useState({
        date: '',
        name: '',
        member_id: ''
    });
    const [searchResults, setSearchResults] = useState(null);
    const [columnPage, setColumnPage] = useState(0);
    const [error, setError] = useState('');
    const [editingRow, setEditingRow] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [saving, setSaving] = useState(false);

    const updateSearchCriteria = (field, value) => {
        setSearchCriteria(prev => ({ ...prev, [field]: value }));
    };

    const performSearch = async () => {
        try {
            setError('');
            const res = await axios.post(`${API_BASE_URL}/search`, {
                date: searchCriteria.date,
                name: searchCriteria.name,
                memberId: searchCriteria.member_id
            });

            if (res.data.status === "success") {
                setSearchResults(res.data.data || []);
                setColumnPage(0);
                setError("");
            } else {
                setError(res.data.message || "No data found.");
                setSearchResults([]);
            }
        } catch (err) {
            console.error('Search failed:', err);
            setError(err.response?.data?.message || err.message || "Server error. Please try again.");
            setSearchResults(null);
        }
    };

    const loadAllRecords = async () => {
        try {
            setError('');
            const res = await axios.post(`${API_BASE_URL}/search`, {
                date: "",
                name: "",
                memberId: ""
            });

            if (res.data.status === "success") {
                setSearchResults(res.data.data || []);
                setColumnPage(0);
                setError("");
            } else {
                setError(res.data.message || "Unable to load sheet data.");
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Unable to load sheet data.");
        }
    };

    const clearSearch = () => {
        setSearchCriteria({ date: '', name: '', member_id: '' });
        setSearchResults(null);
        setColumnPage(0);
        setError('');
    };

    const handleEdit = (row) => {
        setEditingRow(row);
        setEditFormData({ ...row });
    };

    const handleCancelEdit = () => {
        setEditingRow(null);
        setEditFormData({});
        setError('');
    };

    const handleEditFormChange = (field, value) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');

            // Find Member ID from the row
            const memberIdKey = Object.keys(editFormData).find(k =>
                /member.*id|.*key/i.test(k)
            );

            if (!memberIdKey || !editFormData[memberIdKey]) {
                setError('Member ID is required to update the record');
                setSaving(false);
                return;
            }

            await axios.put(`${API_BASE_URL}/update_record`, {
                member_id: editFormData[memberIdKey],
                data: editFormData
            });

            // Refresh search results
            await performSearch();
            setEditingRow(null);
            setEditFormData({});
            setError('');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update record');
        } finally {
            setSaving(false);
        }
    };

    const getCurrentColumnHeaders = () => {
        if (!searchResults || searchResults.length === 0) return [];
        const headers = Object.keys(searchResults[0]);
        const start = columnPage * COLUMNS_PER_PAGE;
        return headers.slice(start, start + COLUMNS_PER_PAGE);
    };

    const getCurrentColumnData = () => {
        if (!searchResults || searchResults.length === 0) return [];
        const headers = Object.keys(searchResults[0]);
        const start = columnPage * COLUMNS_PER_PAGE;
        const currentHeaders = headers.slice(start, start + COLUMNS_PER_PAGE);

        return searchResults.map(row => {
            return currentHeaders.map(h => row[h]);
        });
    };

    const getTotalColumns = () => {
        if (!searchResults || searchResults.length === 0) return 0;
        return Object.keys(searchResults[0]).length;
    }

    const goToNextColumnPage = () => {
        const totalCols = getTotalColumns();
        if (columnPage < Math.ceil(totalCols / COLUMNS_PER_PAGE) - 1) {
            setColumnPage(c => c + 1);
        }
    };

    const goToPreviousColumnPage = () => {
        if (columnPage > 0) setColumnPage(c => c - 1);
    };

    return (
        <div className="bg-white shadow-xl p-6 mb-2 border-2 border-blue-200 h-full flex flex-col">
            <div className="mb-4 flex-shrink-0">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Search Google Sheets Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-base font-normal text-gray-700 mb-1">Date (contains)</label>
                        <input
                            type="text"
                            value={searchCriteria.date}
                            onChange={(e) => updateSearchCriteria('date', e.target.value)}
                            className="w-full px-4 py-2 text-base border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none"
                            placeholder="e.g., 2025-01-15"
                        />
                    </div>
                    <div>
                        <label className="block text-base font-normal text-gray-700 mb-1">Name (contains)</label>
                        <input
                            type="text"
                            value={searchCriteria.name}
                            onChange={(e) => updateSearchCriteria('name', e.target.value)}
                            className="w-full px-4 py-2 text-base border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none"
                            placeholder="e.g., John"
                        />
                    </div>
                    <div>
                        <label className="block text-base font-normal text-gray-700 mb-1">Member ID (contains)</label>
                        <input
                            type="text"
                            value={searchCriteria.member_id}
                            onChange={(e) => updateSearchCriteria('member_id', e.target.value)}
                            className="w-full px-4 py-2 text-base border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent outline-none"
                            placeholder="e.g., MID-2025"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={performSearch}
                        className="flex items-center px-6 py-2 bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 rounded transition-colors"
                    >
                        <Search className="w-4 h-4 mr-2" /> Search
                    </button>
                    <button
                        onClick={clearSearch}
                        className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 rounded transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Clear
                    </button>
                    <button
                        onClick={loadAllRecords}
                        className="flex items-center px-6 py-2 border border-green-400 text-blue-700 font-semibold hover:bg-green-50 rounded transition-colors"
                    >
                        View Full Sheet
                    </button>
                </div>
                {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}
            </div>

            {searchResults && (
                <div className="mt-6 flex-1 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h4 className="text-2xl font-semibold">
                            Search Results ({searchResults.length} found)
                        </h4>
                    </div>

                    <div className="border-2 border-gray-300 bg-white overflow-auto flex-1 rounded shadow-inner relative">
                        {searchResults.length > 0 ? (
                            <table className="table-auto border-collapse min-w-full">
                                <thead className="bg-gray-50 sticky top-0 border-b-2 border-gray-300 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-800 text-base whitespace-nowrap border-r border-gray-200 bg-gray-50">
                                            Actions
                                        </th>
                                        {getCurrentColumnHeaders().map((header, i) => (
                                            <th key={i} className="px-4 py-3 text-left font-semibold text-gray-800 text-base whitespace-nowrap border-r border-gray-200 min-w-[160px] bg-gray-50">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchResults.map((fullRow, rowIndex) => (
                                        <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-4 py-3 border-r border-gray-200">
                                                <button
                                                    onClick={() => handleEdit(fullRow)}
                                                    className="flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                                                    title="Edit this row"
                                                >
                                                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                                                </button>
                                            </td>
                                            {getCurrentColumnData()[rowIndex].map((cell, j) => (
                                                <td key={j} className="px-4 py-3 text-base break-words border-r border-gray-200 min-w-[160px]">
                                                    {cell || '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-lg">
                                No results found.
                            </div>
                        )}
                    </div>

                    {/* Column Navigation */}
                    {searchResults.length > 0 && Math.ceil(getTotalColumns() / COLUMNS_PER_PAGE) > 1 && (
                        <div className="flex justify-between items-center mt-4 px-4 flex-shrink-0">
                            <button
                                onClick={goToPreviousColumnPage}
                                disabled={columnPage === 0}
                                className={`flex items-center px-4 py-2 text-base font-semibold transition-all rounded shadow ${columnPage === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Previous Columns
                            </button>

                            <div className="text-sm text-gray-600 font-medium">
                                Page {columnPage + 1} of {Math.ceil(getTotalColumns() / COLUMNS_PER_PAGE)}
                            </div>

                            <button
                                onClick={goToNextColumnPage}
                                disabled={columnPage >= Math.ceil(getTotalColumns() / COLUMNS_PER_PAGE) - 1}
                                className={`flex items-center px-4 py-2 text-base font-semibold transition-all rounded shadow ${columnPage >= Math.ceil(getTotalColumns() / COLUMNS_PER_PAGE) - 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            >
                                Next Columns <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {editingRow && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Edit Record</h3>
                            <button
                                onClick={handleCancelEdit}
                                className="text-white hover:bg-blue-800 rounded-full p-1 transition-colors"
                                disabled={saving}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(editFormData).map((field) => {
                                    const isReadOnly = /member.*id|.*key|timestamp/i.test(field);
                                    return (
                                        <div key={field}>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {field}
                                                {isReadOnly && <span className="text-gray-400 text-xs ml-2">(Read-only)</span>}
                                            </label>
                                            <input
                                                type="text"
                                                value={editFormData[field] || ''}
                                                onChange={(e) => handleEditFormChange(field, e.target.value)}
                                                readOnly={isReadOnly}
                                                className={`w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${isReadOnly ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''}`}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                            <button
                                onClick={handleCancelEdit}
                                disabled={saving}
                                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchData;
