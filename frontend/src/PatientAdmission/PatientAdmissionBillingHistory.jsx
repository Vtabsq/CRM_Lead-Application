import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, IndianRupee, FileText, TrendingUp } from 'lucide-react';
import API_BASE_URL from '../config';

const PatientAdmissionBillingHistory = () => {
    const { patientName } = useParams();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [clientInfo, setClientInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBillingHistory();
        fetchClientInfo();
    }, [patientName]);

    const fetchBillingHistory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/patientadmission/billing-history/${encodeURIComponent(patientName)}`);
            const data = await response.json();

            if (data.status === 'success') {
                setHistory(data.history || []);
            } else {
                setError('Failed to load billing history');
            }
        } catch (err) {
            console.error('Error fetching billing history:', err);
            setError('Failed to connect to server');
        }
    };

    const fetchClientInfo = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/patientadmission/clients/${encodeURIComponent(patientName)}`);
            const data = await response.json();

            if (data.status === 'success') {
                setClientInfo(data.client);
            }
        } catch (err) {
            console.error('Error fetching client info:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const totalBilled = history.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        const averageMonthly = history.length > 0 ? totalBilled / history.length : 0;

        return {
            totalBilled,
            averageMonthly,
            invoiceCount: history.length
        };
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Loading billing history...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/patientadmission/clients')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
                >
                    <ArrowLeft size={20} />
                    Back to Clients
                </button>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Billing History</h1>
                        <p className="text-gray-600 mt-1">{patientName}</p>
                    </div>

                    {clientInfo && (
                        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                            <div className="text-sm text-gray-600">Service Started</div>
                            <div className="text-lg font-semibold text-gray-800">{clientInfo.service_started_on}</div>
                            <div className="text-sm text-gray-600 mt-2">Next Billing</div>
                            <div className="text-lg font-semibold text-blue-600">{clientInfo.next_billing_date || 'N/A'}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Billed</p>
                            <p className="text-2xl font-bold text-gray-800">₹{stats.totalBilled.toLocaleString()}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <IndianRupee className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Average Monthly</p>
                            <p className="text-2xl font-bold text-green-600">₹{Math.round(stats.averageMonthly).toLocaleString()}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <TrendingUp className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Invoices</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.invoiceCount}</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <FileText className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing History Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">Invoice History</h2>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice Ref
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Invoice Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    No billing history found
                                </td>
                            </tr>
                        ) : (
                            history.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                        {item.invoice_ref}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.invoice_date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        ₹{parseFloat(item.amount || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Paid'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {item.status || 'Invoiced'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Timeline Visualization */}
            {history.length > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Billing Timeline</h2>
                    <div className="space-y-4">
                        {history.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Calendar className="text-blue-600" size={20} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{item.invoice_ref}</div>
                                            <div className="text-sm text-gray-500">{item.invoice_date}</div>
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            ₹{parseFloat(item.amount || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientAdmissionBillingHistory;
