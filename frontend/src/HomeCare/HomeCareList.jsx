import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, IndianRupee, Filter, TrendingUp, AlertCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const HomeCareList = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ACTIVE');
    const [error, setError] = useState('');

    const stats = {
        total: filteredClients.length,
        active: filteredClients.filter(c => c.status === 'ACTIVE').length,
        revenue: filteredClients.reduce((sum, c) => sum + (parseFloat(c.revenue) || 0), 0)
    };

    useEffect(() => {
        fetchClients();
    }, [statusFilter]);

    useEffect(() => {
        filterClients();
    }, [searchTerm, clients]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const url = `${API_BASE_URL}/api/homecare/clients${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'success') {
                setClients(data.clients || []);
                setFilteredClients(data.clients || []);
            } else {
                setError('Failed to load clients');
            }
        } catch (err) {
            console.error('Error fetching clients:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const filterClients = () => {
        if (!searchTerm.trim()) {
            setFilteredClients(clients);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = clients.filter(client =>
            client.patient_name?.toLowerCase().includes(term) ||
            client.location?.toLowerCase().includes(term) ||
            client.pain_point?.toLowerCase().includes(term)
        );
        setFilteredClients(filtered);
    };

    const handleTriggerBilling = async (patientName) => {
        if (!confirm(`Generate invoice for ${patientName}?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/homecare/trigger-billing/${encodeURIComponent(patientName)}`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.status === 'success') {
                alert(`Invoice ${data.invoice.invoice_ref} generated successfully!\\nAmount: ₹${data.invoice.amount}`);
                fetchClients();
            } else {
                alert(data.detail || 'Failed to generate invoice');
            }
        } catch (err) {
            console.error('Error triggering billing:', err);
            alert('Failed to generate invoice');
        }
    };

    const calculateDaysUntilBilling = (nextBillingDate) => {
        if (!nextBillingDate) return null;

        try {
            const [day, month, year] = nextBillingDate.split('/');
            const billingDate = new Date(year, month - 1, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            billingDate.setHours(0, 0, 0, 0);

            const diffTime = billingDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays;
        } catch (err) {
            return null;
        }
    };

    const getBillingStatusColor = (days) => {
        if (days === null) return 'bg-gray-100 text-gray-700';
        if (days < 0) return 'bg-red-100 text-red-700';
        if (days === 0) return 'bg-orange-100 text-orange-700';
        if (days <= 7) return 'bg-yellow-100 text-yellow-700';
        return 'bg-green-100 text-green-700';
    };

    const getBillingStatusText = (days) => {
        if (days === null) return 'Not set';
        if (days < 0) return `${Math.abs(days)} days overdue`;
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        return `In ${days} days`;
    };

    const renderTableContent = () => {
        if (loading) {
            return (
                <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        Loading home care clients...
                    </td>
                </tr>
            );
        }

        if (error) {
            return (
                <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-red-600">
                        {error}
                    </td>
                </tr>
            );
        }

        if (filteredClients.length === 0) {
            return (
                <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No clients found
                    </td>
                </tr>
            );
        }

        return filteredClients.map((client, index) => {
            const daysUntilBilling = calculateDaysUntilBilling(client.next_billing_date);

            return (
                <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{client.patient_name}</div>
                        <div className="text-sm text-gray-500">{client.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {client.service_started_on}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getBillingStatusColor(daysUntilBilling)}`}>
                            {client.next_billing_date || 'Not set'}
                            {daysUntilBilling !== null && (
                                <div className="text-xs mt-1">{getBillingStatusText(daysUntilBilling)}</div>
                            )}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{parseFloat(client.revenue || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {client.shift}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${client.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {client.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                            onClick={() => navigate(`/homecare/edit/${encodeURIComponent(client.patient_name)}`)}
                            className="text-blue-600 hover:text-blue-900"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleTriggerBilling(client.patient_name)}
                            className="text-green-600 hover:text-green-900"
                        >
                            Bill Now
                        </button>
                    </td>
                </tr>
            );
        });
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden p-6">
                {/* Header */}
                <div className="flex-shrink-0 mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Home Care Clients</h1>
                            <p className="text-gray-600 text-sm">Manage home care services and billing</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate('/homecare/create')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Add New Client
                            </button>
                            <button
                                onClick={() => navigate('/homecare/billing-preview')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <TrendingUp size={20} />
                                Billing Preview
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex gap-3 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by patient name, location, or pain point..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStatusFilter('ACTIVE')}
                                className={`px-4 py-2 rounded-lg ${statusFilter === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setStatusFilter('INACTIVE')}
                                className={`px-4 py-2 rounded-lg ${statusFilter === 'INACTIVE' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                Inactive
                            </button>
                            <button
                                onClick={() => setStatusFilter('ALL')}
                                className={`px-4 py-2 rounded-lg ${statusFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                All
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - Compact */}
                <div className="flex-shrink-0 grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Total Clients</p>
                                <p className="text-xl font-bold text-gray-800">{stats.total}</p>
                            </div>
                            <Users className="text-blue-500" size={28} />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Active Services</p>
                                <p className="text-xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <TrendingUp className="text-green-500" size={28} />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Monthly Revenue</p>
                                <p className="text-xl font-bold text-yellow-600">₹{stats.revenue.toLocaleString()}</p>
                            </div>
                            <IndianRupee className="text-yellow-500" size={28} />
                        </div>
                    </div>
                </div>

                {/* Table Container - Fixed Header with Scrollable Body */}
                <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col min-h-0">
                    {/* Table Header - Fixed */}
                    <div className="flex-shrink-0 overflow-x-auto border-b border-gray-200">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Service Started</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Next Billing</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Revenue</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Shift</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                        </table>
                    </div>

                    {/* Table Body - Scrollable */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <tbody className="bg-white divide-y divide-gray-200">
                                {renderTableContent()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeCareList;
