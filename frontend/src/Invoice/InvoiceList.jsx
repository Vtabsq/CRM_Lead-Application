import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    ChevronDown, Download, RefreshCw, FileText, Plus, Search as SearchIcon,
    Mail, Printer, Share2, DollarSign, Calendar, RotateCcw
} from 'lucide-react';
import axios from 'axios';
import PatientSearch from '../components/PatientSearch';
import InvoiceTable from '../components/InvoiceTable';
import EditableDropdown from '../components/EditableDropdown';
import API_BASE_URL from '../config';

const InvoiceList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // State
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        careCenter: '',
        provider: '',
        status: '',
        period: 'Last 7 Days'
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Invoiced');
    const [showActionMenu, setShowActionMenu] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Load invoices on mount or when filters change
    useEffect(() => {
        loadInvoices();
    }, [selectedPatient, filters.careCenter, filters.provider, filters.status, filters.period]);

    // Check if patient_id is in URL params
    useEffect(() => {
        const patientId = searchParams.get('patient_id');
        if (patientId && !selectedPatient) {
            // TODO: Load patient details from API
        }
    }, [searchParams]);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            loadInvoices();
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const params = {};

            // Patient ID filter
            if (selectedPatient) {
                params.patient_id = selectedPatient.patient_id;
            }

            // Status filter
            if (filters.status && filters.status !== '') {
                params.status = filters.status;
            }

            // Care Center filter
            if (filters.careCenter && filters.careCenter !== '') {
                params.care_center = filters.careCenter;
            }

            // Provider filter
            if (filters.provider && filters.provider !== '') {
                params.provider = filters.provider;
            }

            // Invoice Ref search
            if (searchTerm) {
                params.invoice_ref = searchTerm;
            }

            // Date range filter
            const dateRange = calculateDateRange(filters.period);
            if (dateRange.start) {
                params.date_from = dateRange.start;
            }
            if (dateRange.end) {
                params.date_to = dateRange.end;
            }

            const response = await axios.get(`${API_BASE_URL}/api/invoices`, { params });
            setInvoices(response.data.invoices || []);
        } catch (error) {
            console.error('Error loading invoices:', error);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    // Calculate date range based on period selection
    const calculateDateRange = (period) => {
        const today = new Date();
        const formatDate = (date) => date.toISOString().split('T')[0];

        switch (period) {
            case 'Today':
                return { start: formatDate(today), end: formatDate(today) };
            case 'Last 7 Days':
                const last7 = new Date(today);
                last7.setDate(today.getDate() - 7);
                return { start: formatDate(last7), end: formatDate(today) };
            case 'Last 30 Days':
                const last30 = new Date(today);
                last30.setDate(today.getDate() - 30);
                return { start: formatDate(last30), end: formatDate(today) };
            case 'Last 90 Days':
                const last90 = new Date(today);
                last90.setDate(today.getDate() - 90);
                return { start: formatDate(last90), end: formatDate(today) };
            default:
                return { start: null, end: null };
        }
    };

    const handleDownloadCSV = () => {
        if (invoices.length === 0) {
            alert('No invoices to download');
            return;
        }
        const headers = ['Invoice Date', 'Patient Name', 'Patient ID', 'Invoice Ref', 'Visit ID', 'Care Center', 'Provider', 'Status', 'Total Amount'];
        const rows = invoices.map(inv => [
            inv.invoice_date || '',
            inv.patient_name || '',
            inv.patient_id || '',
            inv.invoice_id || '',
            inv.visit_id || '',
            inv.care_center || '',
            inv.provider || '',
            inv.status || '',
            inv.total_amount || '0'
        ]);
        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportExcel = () => {
        if (invoices.length === 0) {
            alert('No invoices to export');
            return;
        }
        const headers = ['Invoice Date', 'Patient Name', 'Patient ID', 'Invoice Ref', 'Visit ID', 'Care Center', 'Provider', 'Status', 'Total Amount'];
        const rows = invoices.map(inv => [
            inv.invoice_date || '',
            inv.patient_name || '',
            inv.patient_id || '',
            inv.invoice_id || '',
            inv.visit_id || '',
            inv.care_center || '',
            inv.provider || '',
            inv.status || '',
            inv.total_amount || '0'
        ]);
        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
        });
        const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.xlsx`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
    };

    const handlePatientClear = () => {
        setSelectedPatient(null);
    };

    const handleRowClick = (invoice) => {
        // Show action menu
        setShowActionMenu(showActionMenu === invoice.invoice_id ? null : invoice.invoice_id);
    };

    const handleAction = async (action, invoice) => {
        setShowActionMenu(null);

        switch (action) {
            case 'download':
                // Download invoice PDF from backend
                try {
                    console.log('Downloading PDF for invoice:', invoice);
                    const response = await axios.get(
                        `${API_BASE_URL}/api/invoices/${invoice.invoice_id}/pdf`,
                        { responseType: 'blob' }
                    );

                    // Create download link
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Invoice_${invoice.invoice_id}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);

                    console.log('PDF downloaded successfully');
                } catch (error) {
                    console.error('Error downloading invoice PDF:', error);
                    alert(`Failed to download invoice PDF: ${error.response?.data?.detail || error.message}\n\nPlease check the console for more details.`);
                }
                break;
            case 'email':
                // TODO: Implement email invoice
                alert(`Email invoice ${invoice.invoice_id}`);
                break;
            case 'print':
                // Open PDF in new tab for printing
                window.open(`${API_BASE_URL}/api/invoices/${invoice.invoice_id}/pdf`, '_blank');
                break;
            case 'share':
                // TODO: Implement share invoice
                alert(`Share invoice ${invoice.invoice_id}`);
                break;
            case 'payment':
                // TODO: Navigate to payment page
                alert(`Receive payment for ${invoice.invoice_id}`);
                break;
            case 'appointment':
                // TODO: Navigate to appointment creation
                alert(`Create appointment for ${invoice.patient_name}`);
                break;
            case 'associate':
                // TODO: Associate service plan
                alert(`Associate service plan for ${invoice.invoice_id}`);
                break;
            case 'return':
                // TODO: Return invoice
                alert(`Return invoice ${invoice.invoice_id}`);
                break;
            default:
                break;
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                invoice.invoice_id.toLowerCase().includes(search) ||
                invoice.patient_name.toLowerCase().includes(search) ||
                invoice.patient_id.toLowerCase().includes(search)
            );
        }
        return true;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Top Bar */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-4">
                    {/* Patient Search Dropdown */}
                    <div className="w-64">
                        <PatientSearch
                            onSelect={handlePatientSelect}
                            selectedPatient={selectedPatient}
                            onClear={handlePatientClear}
                        />
                    </div>

                    {/* Search Records Button */}
                    <button className="bg-blue-400 px-4 py-2 rounded text-white text-sm font-medium hover:bg-blue-500">
                        Search Records
                    </button>

                    {/* Create Button */}
                    <button
                        onClick={() => navigate('/invoice/create')}
                        className="bg-green-500 px-6 py-2 rounded text-white text-sm font-medium hover:bg-green-600 shadow-md flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create
                    </button>
                </div>

                {/* Right Side - Tabs */}
                <div className="flex items-center gap-2">
                    <button
                        className={`px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2 shadow-md ${activeTab === 'Invoiced'
                            ? 'bg-white text-blue-600'
                            : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                        onClick={() => setActiveTab('Invoiced')}
                    >
                        <FileText className="w-4 h-4" />
                        Invoiced
                    </button>
                </div>
            </div>

            {/* Breadcrumb Row */}
            <div className="bg-white px-6 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-gray-900 font-medium">
                        {selectedPatient ? `Invoice For ${selectedPatient.patient_name}` : 'Invoice'}
                    </span>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Care Centers */}
                    <EditableDropdown
                        category="care_center"
                        value={filters.careCenter}
                        onChange={(value) => setFilters({ ...filters, careCenter: value })}
                        placeholder="Care Center"
                        defaultOptions={['HC CBE', 'RSP SNF', 'Clinic - Ram Nagar']}
                        className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />

                    {/* Providers */}
                    <EditableDropdown
                        category="provider"
                        value={filters.provider}
                        onChange={(value) => setFilters({ ...filters, provider: value })}
                        placeholder="Provider"
                        defaultOptions={['Provider 1', 'Provider 2']}
                        className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />

                    {/* Status */}
                    <EditableDropdown
                        category="status"
                        value={filters.status}
                        onChange={(value) => setFilters({ ...filters, status: value })}
                        placeholder="Status"
                        defaultOptions={['Invoiced', 'Paid', 'Pending']}
                        className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />

                    {/* Period */}
                    <select
                        className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                        value={filters.period}
                        onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                    >
                        <option>All Time</option>
                        <option>Last 7 Days</option>
                        <option>Today</option>
                        <option>Last 30 Days</option>
                        <option>Last 90 Days</option>
                    </select>

                    {/* Search by Invoice Ref */}
                    <input
                        type="text"
                        placeholder="Search by Invoice Ref"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="p-1.5 border border-gray-300 rounded hover:bg-gray-50"
                        onClick={handleDownloadCSV}
                        title="Download CSV"
                    >
                        <Download className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                        className="p-1.5 border border-gray-300 rounded hover:bg-gray-50"
                        onClick={handleExportExcel}
                        title="Export Excel"
                    >
                        <FileText className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                        className="p-1.5 border border-gray-300 rounded hover:bg-gray-50"
                        onClick={loadInvoices}
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Pagination Info */}
            <div className="bg-white px-6 py-2 border-b border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    {loading ? (
                        <span>Loading...</span>
                    ) : (
                        <span>Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredInvoices.length)} of {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}</span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <button
                        className={`p-1 hover:bg-gray-100 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        <ChevronDown className="w-4 h-4 rotate-90" />
                    </button>
                    <span>Page {currentPage} of {totalPages || 1}</span>
                    <button
                        className={`p-1 hover:bg-gray-100 rounded ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto bg-white relative">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                            <p className="text-gray-500">Loading invoices...</p>
                        </div>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-lg font-medium">No invoices found</p>
                            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                        </div>
                    </div>
                ) : (
                    <InvoiceTable
                        invoices={currentInvoices}
                        onRowClick={handleRowClick}
                        loading={false}
                    />
                )}

                {/* Action Menu Popup */}
                {showActionMenu && (
                    <div className="absolute bg-white border-2 border-gray-200 rounded-lg shadow-xl p-2 z-50"
                        style={{
                            top: '200px',
                            left: '50%',
                            transform: 'translateX(-50%)'
                        }}
                    >
                        <button
                            onClick={() => handleAction('download', invoices.find(i => i.invoice_id === showActionMenu))}
                            className="w-full text-left px-4 py-2 hover:bg-green-100 rounded text-sm bg-green-50"
                        >
                            <Download className="w-4 h-4 inline mr-2" />
                            Download PDF
                        </button>
                        <button
                            onClick={() => handleAction('return', invoices.find(i => i.invoice_id === showActionMenu))}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-sm"
                        >
                            <RotateCcw className="w-4 h-4 inline mr-2" />
                            Return Invoice
                        </button>
                        <button
                            onClick={() => handleAction('associate', invoices.find(i => i.invoice_id === showActionMenu))}
                            className="w-full text-left px-4 py-2 hover:bg-blue-100 rounded text-sm bg-blue-50"
                        >
                            <FileText className="w-4 h-4 inline mr-2" />
                            Associate Service Plan
                        </button>
                        <button
                            onClick={() => handleAction('appointment', invoices.find(i => i.invoice_id === showActionMenu))}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-sm"
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Create Appointment
                        </button>
                        <button
                            onClick={() => handleAction('payment', invoices.find(i => i.invoice_id === showActionMenu))}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-sm"
                        >
                            <DollarSign className="w-4 h-4 inline mr-2" />
                            Receive Payment
                        </button>
                        <button
                            onClick={() => handleAction('share', invoices.find(i => i.invoice_id === showActionMenu))}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-sm"
                        >
                            <Share2 className="w-4 h-4 inline mr-2" />
                            Share Invoice
                        </button>
                        <button
                            onClick={() => handleAction('email', invoices.find(i => i.invoice_id === showActionMenu))}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-sm"
                        >
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email Invoice
                        </button>
                        <button
                            onClick={() => handleAction('print', invoices.find(i => i.invoice_id === showActionMenu))}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded text-sm"
                        >
                            <Printer className="w-4 h-4 inline mr-2" />
                            Print Invoice
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceList;

