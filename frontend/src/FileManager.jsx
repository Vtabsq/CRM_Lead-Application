import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, AlertCircle, RefreshCw, Trash2, Calendar, Filter, AlertOctagon, Database } from 'lucide-react';
import API_BASE_URL from './config';


const FileManager = () => {
    const [activeTab, setActiveTab] = useState('filter'); // 'filter' | 'upload' | 'schema'

    // Upload State
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const [confirming, setConfirming] = useState(false);

    // Delete/Filter State
    const [filters, setFilters] = useState({
        year: '',
        month: '',
        specificDate: '',
        startDate: '',
        endDate: ''
    });
    const [dateColumn, setDateColumn] = useState('');
    const [availableColumns, setAvailableColumns] = useState([]); // Fetch from backend
    const [selectedColumns, setSelectedColumns] = useState({});
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [deleteSafety, setDeleteSafety] = useState({
        acknowledged: false,
        confirmText: ''
    });
    const [deleteStatus, setDeleteStatus] = useState(null); // 'success', 'error', null
    const [deleteMessage, setDeleteMessage] = useState('');

    const importantColumnsDefaults = ['MemberidKey', 'patient_name', 'mobile_number', 'email', 'date', 'status'];

    useEffect(() => {
        fetchFields();
    }, []);

    const fetchFields = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/get_sheet_headers`);
            const data = await response.json();
            if (data.fields) {
                const colNames = data.fields.map(f => f.name);
                setAvailableColumns(colNames);

                // Initialize selected columns
                const initialSelected = {};
                colNames.forEach(col => {
                    if (importantColumnsDefaults.some(d => col.toLowerCase().includes(d.toLowerCase()))) {
                        initialSelected[col] = true;
                    }
                });
                setSelectedColumns(initialSelected);

                // Try to auto-detect date column
                const dateCol = colNames.find(c => c.toLowerCase().includes('date') || c.toLowerCase().includes('time'));
                if (dateCol) setDateColumn(dateCol);
            }
        } catch (err) {
            console.error("Failed to fetch fields", err);
        }
    };

    // --- Upload Handlers ---
    const handleConfirmUpdate = async () => {
        if (!uploadResult || !uploadResult.file_path) return;
        setConfirming(true);
        try {
            const response = await fetch(`${API_BASE_URL}/confirm_upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ file_path: uploadResult.file_path }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Update failed");

            setUploadResult(prev => ({
                ...prev,
                update_status: 'success',
                update_status_message: data.message
            }));
        } catch (err) {
            setUploadError("Update failed: " + err.message);
        } finally {
            setConfirming(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setUploadResult(null);
            setUploadError(null);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadResult(null);
            setUploadError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setUploadResult(null);
        setUploadError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${API_BASE_URL}/upload_file`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Upload failed');
            }

            const data = await response.json();
            if (data.status === 'error') {
                throw new Error(data.message || 'Processing failed');
            }
            setUploadResult(data);
        } catch (err) {
            setUploadError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const renderAnalytics = (Analytics) => {
        if (!Analytics) return null;
        const { new_columns, missing_columns } = Analytics;

        return (
            <div className="mt-4 space-y-3">
                {new_columns && new_columns.length > 0 && (
                    <div className="flex items-start p-3 bg-green-50 border border-green-200  text-green-800">
                        <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">New Columns Detected:</p>
                            <ul className="list-disc list-inside text-base mt-1">
                                {new_columns.map((col, idx) => (
                                    <li key={idx}>{col}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {missing_columns && missing_columns.length > 0 && (
                    <div className="flex items-start p-3 bg-red-50 border border-red-200  text-red-800">
                        <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Missing Columns:</p>
                            <ul className="list-disc list-inside text-base mt-1">
                                {missing_columns.map((col, idx) => (
                                    <li key={idx}>{col}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // --- Delete/Filter Handlers ---
    const handleFilterChange = (key, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };
            // Auto-clear specific date if month/year selected manually? No, requirement says date narrows month.
            // But if user picks a specific date, month/year are implicitly that date's.
            if (key === 'specificDate' && value) {
                // If specific date selected, we could disable or sync month/year, but for now just keep simple.
            }
            return newFilters;
        });
        setPreviewData(null);
        setDeleteStatus(null);
    };

    const toggleColumn = (col) => {
        setSelectedColumns(prev => ({
            ...prev,
            [col]: !prev[col]
        }));
    };

    const handlePreview = async () => {
        if (!dateColumn) {
            alert("Please select a Date Column");
            return;
        }
        setPreviewLoading(true);
        setDeleteStatus(null);
        try {
            const payload = {
                filters,
                date_column: dateColumn,
                preview_columns: Object.keys(selectedColumns).filter(k => selectedColumns[k])
            };

            const response = await fetch(`${API_BASE_URL}/delete/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Preview failed");
            setPreviewData(data);
        } catch (err) {
            alert("Preview Error: " + err.message);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteSafety.acknowledged || deleteSafety.confirmText !== 'DELETE') return;

        setPreviewLoading(true); // Re-use loading state
        try {
            const payload = {
                filters,
                date_column: dateColumn
            };
            const response = await fetch(`${API_BASE_URL}/delete/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Delete failed");

            setDeleteStatus('success');
            setDeleteMessage(data.message);
            setPreviewData(null);
            setDeleteSafety({ acknowledged: false, confirmText: '' });
        } catch (err) {
            setDeleteStatus('error');
            setDeleteMessage(err.message);
        } finally {
            setPreviewLoading(false);
        }
    };


    return (
        <div className="p-4 w-full">
            <h1 className="text-xl font-semibold mb-8 text-gray-800 flex items-center">
                <FileText className="mr-3 h-8 w-8 text-blue-600" />
                File Manager
            </h1>

            {/* Tabs */}
            <div className="flex space-x-4 mb-3 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('filter')}
                    className={`pb-2 px-4 font-medium transition-colors duration-200 flex items-center ${activeTab === 'filter'
                        ? 'border-b-2 text-blue-600 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter Data / Delete
                </button>
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`pb-2 px-4 font-medium transition-colors duration-200 flex items-center ${activeTab === 'upload'
                        ? 'border-b-2 text-blue-600 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Data
                </button>

            </div>

            {/* Content Area */}
            <div className="bg-white  shadow-sm border border-gray-100 min-h-[500px]">

                {/* --- FILTER / DELETE TAB --- */}
                {activeTab === 'filter' && (
                    <div className="p-4">
                        <div className="mb-3">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center mb-1">
                                <Trash2 className="w-5 h-5 mr-2 text-red-600" />
                                Delete Data
                            </h2>
                            <p className="text-gray-500 text-base">Filter and delete records based on date criteria.</p>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8">
                            {/* Date Controls */}
                            <div className="space-y-2 p-4 bg-gray-50  border border-gray-200">
                                <h3 className="font-semibold text-gray-700 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Date Configuration
                                </h3>

                                {/* Range Filter */}
                                <div className="p-3 bg-white border border-blue-100  shadow-sm">
                                    <label className="block text-sm font-bold text-blue-800 mb-2">Filter by Date Range</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-[10px] text-gray-500 uppercase font-semibold">Start Date</span>
                                            <input
                                                type="date"
                                                value={filters.startDate}
                                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                                className="w-full p-1.5 border border-gray-300 rounded text-base focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 uppercase font-semibold">End Date</span>
                                            <input
                                                type="date"
                                                value={filters.endDate}
                                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                                className="w-full p-1.5 border border-gray-300 rounded text-base focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="relative flex py-1 items-center">
                                    <div className="flex-grow border-t border-gray-300"></div>
                                    <span className="flex-shrink-0 mx-2 text-gray-400 text-sm">OR</span>
                                    <div className="flex-grow border-t border-gray-300"></div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Specific Date</label>
                                    <input
                                        type="date"
                                        value={filters.specificDate}
                                        onChange={(e) => handleFilterChange('specificDate', e.target.value)}
                                        disabled={!!filters.startDate || !!filters.endDate}
                                        className="w-full p-2 border border-gray-300  text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Month</label>
                                        <select
                                            value={filters.month}
                                            onChange={(e) => handleFilterChange('month', e.target.value)}
                                            disabled={!!filters.specificDate || !!filters.startDate || !!filters.endDate}
                                            className="w-full p-2 border border-gray-300  text-base disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            <option value="">Any</option>
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Year</label>
                                        <input
                                            type="number"
                                            placeholder="yyyy"
                                            value={filters.year}
                                            onChange={(e) => handleFilterChange('year', e.target.value)}
                                            disabled={!!filters.specificDate}
                                            className="w-full p-2 border border-gray-300  text-base disabled:bg-gray-100 disabled:text-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Column Configuration */}
                            <div className="space-y-2 p-4 bg-gray-50  border border-gray-200">
                                <h3 className="font-semibold text-gray-700">Column Configuration</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Date Column (Required)</label>
                                    <select
                                        value={dateColumn}
                                        onChange={(e) => setDateColumn(e.target.value)}
                                        className="w-full p-2 border border-gray-300  text-base"
                                    >
                                        <option value="">Select Column...</option>
                                        {availableColumns.map(col => (
                                            <option key={col} value={col}>{col}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Preview Columns</label>
                                    <div className="flex gap-2 mb-2">
                                        <button
                                            onClick={() => {
                                                const newSelected = {};
                                                availableColumns.forEach(c => newSelected[c] = true);
                                                setSelectedColumns(newSelected);
                                            }}
                                            className="text-sm px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={() => setSelectedColumns({})}
                                            className="text-sm px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                    <div className="h-32 overflow-y-auto border border-gray-300  p-2 bg-white space-y-1">
                                        {availableColumns.map(col => (
                                            <label key={col} className="flex items-center space-x-2 text-base">
                                                <input
                                                    type="checkbox"
                                                    checked={!!selectedColumns[col]}
                                                    onChange={() => toggleColumn(col)}
                                                    className="rounded text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="truncate">{col}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="flex flex-col justify-center space-y-2 p-4">
                                <button
                                    onClick={handlePreview}
                                    disabled={previewLoading || !dateColumn}
                                    className="w-full py-2 bg-green-600 text-white  font-semibold shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                                >
                                    {previewLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Preview Matches'}
                                </button>
                                <p className="text-sm text-gray-500 text-center">
                                    Click preview to see what will be deleted before confirming.
                                </p>
                            </div>
                        </div>

                        {/* Preview Results */}
                        {previewData && (
                            <div className="mb-8 border border-gray-200  overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-gray-800">Preview Results</h3>
                                        <p className="text-sm text-gray-600">
                                            Matches found: <span className="font-bold text-blue-600">{previewData.count} rows</span>
                                        </p>
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                        <div>Earliest: {previewData.earliest || 'N/A'}</div>
                                        <div>Latest: {previewData.latest || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {previewData.headers?.map(h => (
                                                    <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {previewData.rows?.map((row, i) => (
                                                <tr key={i}>
                                                    {previewData.headers?.map((h, j) => (
                                                        <td key={j} className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            {row[h]}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                            {previewData.rows?.length === 0 && (
                                                <tr><td colSpan="100%" className="px-4 py-2 text-center text-gray-500">No data found matching criteria</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Delete Confirmation Area */}
                                {previewData.count > 0 && (
                                    <div className="p-4 bg-red-50 border-t border-red-100">
                                        <div className="w-full space-y-2">
                                            <div className="flex items-start space-x-3 text-red-800">
                                                <AlertOctagon className="w-6 h-6 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-bold">Danger Zone</h4>
                                                    <p className="text-base">This action PERMANENTLY REMOVES data from the sheet. This cannot be undone.</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="safetyVerify"
                                                    checked={deleteSafety.acknowledged}
                                                    onChange={(e) => setDeleteSafety(prev => ({ ...prev, acknowledged: e.target.checked }))}
                                                    className="rounded text-red-600 focus:ring-red-500"
                                                />
                                                <label htmlFor="safetyVerify" className="text-base font-medium text-gray-700">I understand this cannot be undone easily.</label>
                                            </div>

                                            <div className="flex space-x-4">
                                                <input
                                                    type="text"
                                                    placeholder="Type DELETE to confirm"
                                                    value={deleteSafety.confirmText}
                                                    onChange={(e) => setDeleteSafety(prev => ({ ...prev, confirmText: e.target.value }))}
                                                    className="flex-1 p-2 border border-gray-300  text-base border-red-200 focus:ring-red-500 focus:border-red-500"
                                                />
                                                <button
                                                    onClick={handleDelete}
                                                    disabled={!deleteSafety.acknowledged || deleteSafety.confirmText !== 'DELETE' || previewLoading}
                                                    className="px-4 py-2 bg-red-600 text-white  font-bold shadow hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {previewLoading ? 'Deleting...' : 'Confirm Delete'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Status Message */}
                        {deleteStatus && (
                            <div className={`p-4  flex items-center ${deleteStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {deleteStatus === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                                <span>{deleteMessage}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* --- UPLOAD TAB --- */}
                {activeTab === 'upload' && (
                    <div className="p-4">
                        {/* Template Download Area */}
                        <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50  border border-blue-100 flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <h2 className="text-xl font-bold text-blue-900 mb-2">Download File Format</h2>
                                <p className="text-blue-700">Get the correct template to ensure your patient data matches the system.</p>
                            </div>
                            <div className="flex gap-3">
                                <a
                                    href=`${API_BASE_URL}/download_template?format=csv`
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 bg-white text-green-600 border border-green-200  font-bold shadow-sm hover:shadow-md hover:bg-green-50 transition-all"
                                >
                                    <FileText className="w-5 h-5 mr-2" />
                                    Download CSV
                                </a>
                                <a
                                    href=`${API_BASE_URL}/download_template` // Default handles xlsx
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center px-4 py-2 bg-white text-green-600 border border-green-200  font-bold shadow-sm hover:shadow-md hover:bg-green-50 transition-all"
                                >
                                    <FileText className="w-5 h-5 mr-2" />
                                    Download Excel
                                </a>
                            </div>
                        </div>

                        {/* Upload Area */}
                        <div
                            className={`
                                relative border-2 border-dashed  p-10 text-center transition-all duration-300
                                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-green-400'}
                            `}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleChange}
                            />

                            <div className="flex flex-col items-center justify-center space-y-2">
                                <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-xl font-medium text-gray-700">
                                        {file ? file.name : "Drag & Drop your file here"}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {file ? "Click to change file" : "or click to browse"}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-400">
                                    Supports: .xlsx, .csv
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        {file && (
                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className={`
                                        px-8 py-2  font-semibold text-white shadow-lg transition-all
                                        flex items-center space-x-2
                                        ${uploading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5'
                                        }
                                    `}
                                >
                                    {uploading ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            <span>Upload File</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Error Message */}
                        {uploadError && (
                            <div className="mt-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-center animate-in fade-in slide-in-from-bottom-2">
                                <AlertCircle className="w-6 h-6 mr-3" />
                                <div>
                                    <p className="font-bold">Error</p>
                                    <p>{uploadError}</p>
                                </div>
                            </div>
                        )}

                        {/* Success / Result Area */}
                        {uploadResult && (
                            <div className="mt-8 bg-white  shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                                <div className="p-4 border-b border-gray-100 bg-green-50 flex items-center">
                                    <div className="p-2 bg-green-100 rounded-full text-green-600 mr-4">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">Processing Complete</h3>
                                        <p className="text-green-700">{uploadResult.message}</p>
                                    </div>
                                </div>

                                <div className="p-4">
                                    {/* Status Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                        <div className="bg-gray-50 p-4 ">
                                            <span className="text-sm text-gray-500 block mb-1">Status</span>
                                            <span className="font-medium text-gray-800 capitalize">{uploadResult.status}</span>
                                        </div>
                                        {uploadResult.row_count && (
                                            <div className="bg-gray-50 p-4 ">
                                                <span className="text-sm text-gray-500 block mb-1">Rows Processed</span>
                                                <span className="font-medium text-gray-800">{uploadResult.row_count}</span>
                                            </div>
                                        )}
                                        {uploadResult.file_path && (
                                            <div className="bg-gray-50 p-4  md:col-span-2">
                                                <span className="text-sm text-gray-500 block mb-1">Saved Location</span>
                                                <span className="font-mono text-sm text-gray-600 break-all">{uploadResult.file_path}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Analytics Changes */}
                                    {uploadResult.Analytics && (
                                        <div className="border-t border-gray-100 pt-4">
                                            <h4 className="font-semibold text-gray-700 mb-2">Schema Analytics</h4>
                                            {(!uploadResult.Analytics.new_columns?.length && !uploadResult.Analytics.missing_columns?.length) ? (
                                                <p className="text-gray-500 italic">No schema changes detected.</p>
                                            ) : (
                                                renderAnalytics(uploadResult.Analytics)
                                            )}
                                        </div>
                                    )}

                                    {/* Confirmation Button */}
                                    {uploadResult.file_path && !uploadResult.update_status && (
                                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                                            <button
                                                onClick={handleConfirmUpdate}
                                                disabled={confirming}
                                                className="flex items-center px-4 py-2 bg-purple-600 text-white  font-semibold shadow hover:bg-purple-700 disabled:opacity-50"
                                            >
                                                {confirming ? (
                                                    <>
                                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                        Appending to Sheet1...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        Confirm & Append to Sheet1
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* Update Result */}
                                    {uploadResult.update_status && (
                                        <div className="mt-4 p-4 bg-purple-50 border border-purple-200  text-purple-900">
                                            <h4 className="font-bold flex items-center">
                                                <CheckCircle className="w-5 h-5 mr-2" />
                                                Update Successful
                                            </h4>
                                            <p className="mt-1 text-base">{uploadResult.update_status_message}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}


            </div>
        </div>
    );
};

export default FileManager;
