import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, RefreshCw, Table, ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';
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
    // The backend endpoint now returns { status: "success", data: [...] }
    // There is no sheet_url returned in the new response format, so we might need to remove viewSheet URL logic
    // or keep it if we can infer it. However, the user instruction implies "View Full Sheet" button should just "Load all records"
    // into the table, NOT open a new tab with Google Sheets URL.
    // "View Full Sheet button does not reliably load all records... Search must always read from Google Sheet"
    // And "Add this function: loadAllRecords... Attach it to: <button onClick={loadAllRecords}>View Full Sheet</button>"
    // So the "View Full Sheet" button essentially becomes "Show All Data".

    const updateSearchCriteria = (field, value) => {
        setSearchCriteria(prev => ({ ...prev, [field]: value }));
    };

    const performSearch = async () => {
        try {
            setError('');
            // New POST API call
            const res = await axios.post(`${API_BASE_URL}/search`, {
                date: searchCriteria.date,
                name: searchCriteria.name,
                memberId: searchCriteria.member_id // Backend expects memberId, state calls it member_id. Map it properly.
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

    // Auto-load logic if needed? The user didn't explicitly remove it but said "Switching pages... must not freeze".
    // I will keep manual search for now to avoid freezing unless user wants auto-load.
    // App.jsx comment in original code: "Auto-load logic from App.jsx".
    // I'll keep it but use loadAllRecords maybe? Or just performSearch (which uses current criteria).
    useEffect(() => {
        // Initial load? maybe.
        // If we want to be safe and avoid freezing, maybe don't auto-load massive data unless asked.
        // But generally simple search pages might start empty.
        // I will commented out auto-load or remove it if not requested.
        // Actually, user said "Search Field has been moved... It must appear as TOP... Search should be accessible from any page".
        // Providing an empty start state is usually safer.
    }, []);

    const getCurrentColumnHeaders = () => {
        if (!searchResults || searchResults.length === 0) return [];
        // Extract headers from the first row of data
        const headers = Object.keys(searchResults[0]);
        const start = columnPage * COLUMNS_PER_PAGE;
        return headers.slice(start, start + COLUMNS_PER_PAGE);
    };

    const getCurrentColumnData = () => {
        if (!searchResults || searchResults.length === 0) return [];
        const headers = Object.keys(searchResults[0]); // Get all headers
        const start = columnPage * COLUMNS_PER_PAGE;
        const currentHeaders = headers.slice(start, start + COLUMNS_PER_PAGE);

        return searchResults.map(row => {
            // meaningful order? The JSON object keys are unordered in JS technically but usually fine.
            // Better to map currentHeaders to values.
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
                                        {getCurrentColumnHeaders().map((header, i) => (
                                            <th key={i} className="px-4 py-3 text-left font-semibold text-gray-800 text-base whitespace-nowrap border-r border-gray-200 min-w-[160px] bg-gray-50">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {getCurrentColumnData().map((row, i) => (
                                        <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                                            {row.map((cell, j) => (
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
        </div>
    );
};

export default SearchData;
