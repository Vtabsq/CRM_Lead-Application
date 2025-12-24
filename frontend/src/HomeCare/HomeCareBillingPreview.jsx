import React, { useState, useEffect } from 'react';
import { Calendar, IndianRupee, TrendingUp, Download, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const HomeCareBillingPreview = () => {
    const navigate = useNavigate();
    const [upcomingBills, setUpcomingBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [previewDays, setPreviewDays] = useState(15);
    const [totalForecast, setTotalForecast] = useState(0);

    useEffect(() => {
        fetchBillingPreview();
    }, [previewDays]);

    const fetchBillingPreview = async () => {
        try {
            setLoading(true);
            setError(''); // Clear any previous errors
            const response = await fetch(`${API_BASE_URL}/api/homecare/billing-preview?days=${previewDays}`);
            const data = await response.json();

            if (data.status === 'success') {
                setUpcomingBills(data.upcoming_bills || []);
                setTotalForecast(data.total_forecast || 0);
                setError(''); // Clear error on success
            } else {
                setError('Failed to load billing preview');
            }
        } catch (err) {
            console.error('Error fetching billing preview:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleExportToExcel = () => {
        // Create CSV content
        const headers = ['Patient Name', 'Billing Date', 'Amount', 'Days Until'];
        const rows = upcomingBills.map(bill => [
            bill.patient_name,
            bill.billing_date,
            bill.amount,
            bill.days_until
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `home_care_billing_preview_${previewDays}days.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getDaysColor = (days) => {
        if (days <= 0) return 'bg-red-100 text-red-700';
        if (days <= 7) return 'bg-yellow-100 text-yellow-700';
        return 'bg-green-100 text-green-700';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Loading billing preview...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Billing Preview</h1>
                        <p className="text-gray-600 mt-1">Upcoming home care billing schedule</p>
                    </div>
                    <button
                        onClick={handleExportToExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        disabled={upcomingBills.length === 0}
                    >
                        <Download size={20} />
                        Export to CSV
                    </button>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setPreviewDays(7)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${previewDays === 7
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Next 7 Days
                    </button>
                    <button
                        onClick={() => setPreviewDays(15)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${previewDays === 15
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Next 15 Days
                    </button>
                    <button
                        onClick={() => setPreviewDays(30)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${previewDays === 30
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Next 30 Days
                    </button>
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
                            <p className="text-gray-600 text-sm">Upcoming Bills</p>
                            <p className="text-2xl font-bold text-gray-800">{upcomingBills.length}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Calendar className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Revenue Forecast</p>
                            <p className="text-2xl font-bold text-green-600">₹{totalForecast.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <TrendingUp className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Average Bill</p>
                            <p className="text-2xl font-bold text-gray-800">
                                ₹{upcomingBills.length > 0 ? Math.round(totalForecast / upcomingBills.length).toLocaleString() : 0}
                            </p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <IndianRupee className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Bills Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">Upcoming Bills - Next {previewDays} Days</h2>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Patient Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Billing Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Days Until
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {upcomingBills.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    No upcoming bills in the next {previewDays} days
                                </td>
                            </tr>
                        ) : (
                            upcomingBills.map((bill, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => navigate(`/homecare/billing-history/${encodeURIComponent(bill.patient_name)}`)}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-900"
                                        >
                                            {bill.patient_name}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {bill.billing_date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        ₹{parseFloat(bill.amount || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDaysColor(bill.days_until)}`}>
                                            {bill.days_until === 0 ? 'Today' : bill.days_until === 1 ? 'Tomorrow' : `${bill.days_until} days`}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Calendar View (Simple) */}
            {upcomingBills.length > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Billing Calendar</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingBills.slice(0, 6).map((bill, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="text-blue-600" size={20} />
                                        <span className="text-sm font-medium text-gray-900">{bill.billing_date}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getDaysColor(bill.days_until)}`}>
                                        {bill.days_until === 0 ? 'Today' : `${bill.days_until}d`}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 mb-1">{bill.patient_name}</div>
                                <div className="text-lg font-semibold text-gray-900">₹{parseFloat(bill.amount || 0).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeCareBillingPreview;
