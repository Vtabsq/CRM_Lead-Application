import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, RefreshCw, ChevronDown, Upload, FileText, Monitor } from 'lucide-react';

const InvoiceHome = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCareCenter, setSelectedCareCenter] = useState('All');
    const [selectedProvider, setSelectedProvider] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedPeriod, setSelectedPeriod] = useState('Last 7 Days');
    const [activeTab, setActiveTab] = useState('Invoiced');
    const [activeMenuItem, setActiveMenuItem] = useState('Invoice');

    // Mock invoice data
    const mockInvoices = [
        {
            id: 1,
            invoiced: '17-12-2025 18:51',
            patient: 'Jayalakshmi. B',
            patientId: 'CBESB04229',
            invoiceRef: 'INV194150',
            visitId: '6298347',
            careCenter: 'Clinic - Ram Nagar',
            status: 'Invoiced',
            totalAmt: 70000
        },
        {
            id: 2,
            invoiced: '17-12-2025 18:22',
            patient: 'Vasantha Ra...',
            patientId: 'CBESB04118',
            invoiceRef: 'INV194149',
            visitId: '6233267',
            careCenter: 'Clinic - Ram Nagar',
            status: 'Invoiced',
            totalAmt: 350
        },
        {
            id: 3,
            invoiced: '17-12-2025 18:20',
            patient: 'Varadan K',
            patientId: 'RSPAL01190',
            invoiceRef: 'INV194148',
            visitId: '6298339',
            careCenter: 'RSP SNF',
            status: 'Invoiced',
            totalAmt: 350
        },
        {
            id: 4,
            invoiced: '17-12-2025 18:20',
            patient: 'Ravisekar V',
            patientId: 'CBESB04073',
            invoiceRef: 'INV194147',
            visitId: '6202851',
            careCenter: 'Clinic - Ram Nagar',
            status: 'Invoiced',
            totalAmt: 350
        },
        {
            id: 5,
            invoiced: '17-12-2025 18:19',
            patient: 'Kantharaj M',
            patientId: 'RSPAL01117',
            invoiceRef: 'INV194146',
            visitId: '6298337',
            careCenter: 'RSP SNF',
            status: 'Invoiced',
            totalAmt: 330
        },
        {
            id: 6,
            invoiced: '17-12-2025 18:19',
            patient: 'Ramathal R',
            patientId: 'RSPAL01061',
            invoiceRef: 'INV194145',
            visitId: '6298336',
            careCenter: 'RSP SNF',
            status: 'Invoiced',
            totalAmt: 350
        },
        {
            id: 7,
            invoiced: '17-12-2025 18:18',
            patient: 'Krishna Kuma...',
            patientId: 'RSPAL01201',
            invoiceRef: 'INV194144',
            visitId: '6298335',
            careCenter: 'RSP SNF',
            status: 'Invoiced',
            totalAmt: 350
        },
        {
            id: 8,
            invoiced: '17-12-2025 18:18',
            patient: 'Nagarathinam',
            patientId: 'RSPAL01212',
            invoiceRef: 'INV194143',
            visitId: '6298334',
            careCenter: 'RSP SNF',
            status: 'Invoiced',
            totalAmt: 350
        }
    ];

    // Filter invoices
    const filteredInvoices = mockInvoices.filter(invoice => {
        const matchesSearch =
            invoice.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.invoiceRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.patientId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCareCenter = selectedCareCenter === 'All' || invoice.careCenter === selectedCareCenter;
        const matchesStatus = selectedStatus === 'All' || invoice.status === selectedStatus;

        return matchesSearch && matchesCareCenter && matchesStatus;
    });

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Menu items for top navigation
    const menuItems = [
        { id: 'add-invoice', label: 'Add Invoice', icon: Plus, path: '/invoice/create' },
        { id: 'Invoice', label: 'Invoice', icon: FileText, path: '/invoice' },
        { id: 'invoice-upload', label: 'Invoice Upload', icon: Upload, path: '/invoice/upload' },
        { id: 'invoice-monitor', label: 'Invoice Upload Monitor', icon: Monitor, path: '/invoice/monitor' }
    ];

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Top Bar */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-4">
                    {/* Patient Dropdown */}
                    <div className="relative">
                        <button className="bg-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Patient
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Search Records */}
                    <button className="bg-blue-400 px-4 py-2 rounded text-white text-sm font-medium hover:bg-blue-500">
                        Search Records
                    </button>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="pl-10 pr-4 py-2 rounded border border-gray-300 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>

                    {/* Create Button */}
                    <button
                        onClick={() => navigate('/invoice/create')}
                        className="bg-green-500 px-6 py-2 rounded text-white text-sm font-medium hover:bg-green-600 shadow-md"
                    >
                        Create
                    </button>
                </div>

                {/* Right Side - Menu Items with Icons and Tooltips + Tabs */}
                <div className="flex items-center gap-2">
                    {/* Menu Items with Icons and Tooltips */}
                    {menuItems.map((item) => (
                        <div key={item.id} className="relative group">
                            <button
                                onClick={() => {
                                    setActiveMenuItem(item.id);
                                    if (item.path) navigate(item.path);
                                }}
                                className={`p-2 rounded transition-colors ${activeMenuItem === item.id
                                        ? 'bg-white/30 text-white'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                            </button>
                            {/* Tooltip - shows on hover */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                {item.label}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                            </div>
                        </div>
                    ))}

                    {/* Divider */}
                    <div className="h-6 w-px bg-white/30 mx-2"></div>

                    {/* Invoiced/Purchased Items Tabs */}
                    <button className="px-4 py-1.5 bg-white text-blue-600 rounded text-sm font-medium flex items-center gap-2 shadow-md">
                        <FileText className="w-4 h-4" />
                        Invoiced
                    </button>
                    <button className="px-4 py-1.5 bg-white/20 text-white rounded text-sm font-medium hover:bg-white/30">
                        Purchased Items
                    </button>
                </div>
            </div>

            {/* Breadcrumb Row - Simple, no extra buttons */}
            <div className="bg-white px-6 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Finance</span>
                    <span>›</span>
                    <span>Invoice</span>
                    <span>›</span>
                    <span className="text-gray-900 font-medium">Invoice</span>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* All - First dropdown */}
                    <select className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <option>All</option>
                    </select>

                    {/* All - Second dropdown */}
                    <select className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <option>All</option>
                    </select>

                    {/* All - Third dropdown */}
                    <select className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <option>All</option>
                    </select>

                    {/* All - Fourth dropdown */}
                    <select className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <option>All</option>
                    </select>

                    {/* Last 7 Days */}
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
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
                    <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50">
                        <Download className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50">
                        <FileText className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Pagination Info */}
            <div className="bg-white px-6 py-2 border-b border-gray-200 flex items-center justify-end">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <button className="p-1 hover:bg-gray-100 rounded">
                        <ChevronDown className="w-4 h-4 rotate-90" />
                    </button>
                    <span>1 - 15 of many</span>
                    <button className="p-1 hover:bg-gray-100 rounded">
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto bg-white">
                <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <ChevronDown className="w-4 h-4" />
                                    INVOICED
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">PATIENT</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">PATIENT ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">INVOICE REF.</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">VISIT ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">CARE CENTER</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">STATUS</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">TOTAL AMT</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredInvoices.map((invoice) => (
                            <tr
                                key={invoice.id}
                                onClick={() => navigate(`/invoice/view/${invoice.id}`)}
                                className="hover:bg-blue-50 cursor-pointer transition-colors"
                            >
                                <td className="px-4 py-3 text-sm text-gray-900">
                                    <div className="flex items-center gap-2">
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                        {invoice.invoiced}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <span className="text-blue-600 hover:underline cursor-pointer">{invoice.patient}</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{invoice.patientId}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{invoice.invoiceRef}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{invoice.visitId}</td>
                                <td className="px-4 py-3 text-sm">
                                    <span className="text-blue-600">{invoice.careCenter}</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{invoice.status}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{formatCurrency(invoice.totalAmt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoiceHome;
