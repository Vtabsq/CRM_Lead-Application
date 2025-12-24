import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, UserPlus, Users, UserCheck, Calendar, AlertCircle, ChevronRight } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Home = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState('');
    const [expandedSection, setExpandedSection] = useState(null);

    const [dashboardData, setDashboardData] = useState({
        previousDayEnquiries: { data: [], count: 0, date_filter: '' },
        leadsConverted: { data: [], count: 0, date_filter: '' },
        patientsAdmitted: { data: [], count: 0, date_filter: '' },
        patientsDischarged: { data: [], count: 0, date_filter: '' },
        followUpsToday: { data: [], count: 0, date_filter: '' }
    });

    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        setCurrentDate(formattedDate);
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            const endpoints = [
                { key: 'previousDayEnquiries', url: '/api/dashboard/previous-day-enquiries' },
                { key: 'leadsConverted', url: '/api/dashboard/leads-converted-yesterday' },
                { key: 'patientsAdmitted', url: '/api/dashboard/patients-admitted?date_filter=yesterday' },
                { key: 'patientsDischarged', url: '/api/dashboard/patients-discharged' },
                { key: 'followUpsToday', url: '/api/dashboard/follow-ups-today' }
            ];

            const results = await Promise.all(
                endpoints.map(endpoint =>
                    fetch(`${API_BASE_URL}${endpoint.url}`)
                        .then(res => res.ok ? res.json() : { data: [], count: 0, date_filter: '' })
                        .then(data => ({ key: endpoint.key, data }))
                        .catch(() => ({ key: endpoint.key, data: { data: [], count: 0, date_filter: '' } }))
                )
            );

            const newData = {};
            results.forEach(result => {
                newData[result.key] = result.data;
            });

            setDashboardData(newData);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    const handleViewDetails = (sectionKey) => {
        setExpandedSection(expandedSection === sectionKey ? null : sectionKey);
    };

    const DashboardCard = ({ sectionKey, category, title, description, count, icon: Icon, color, data }) => {
        const isExpanded = expandedSection === sectionKey;

        return (
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-200">
                {/* Card Content */}
                <div className="p-6 pb-8">
                    {/* Category Label */}
                    <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${color}`}>
                            {category}
                        </span>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color.replace('text-', 'from-')}-100 ${color.replace('text-', 'to-')}-200 flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {description}
                    </p>

                    {/* Count Badge */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl font-bold text-gray-800">{count}</span>
                        <span className="text-sm text-gray-500">records</span>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={() => handleViewDetails(sectionKey)}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${isExpanded
                                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300'
                                : color === 'text-blue-600' ? 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600'
                                    : color === 'text-green-600' ? 'bg-green-600 text-white hover:bg-green-700 border border-green-600'
                                        : color === 'text-purple-600' ? 'bg-purple-600 text-white hover:bg-purple-700 border border-purple-600'
                                            : color === 'text-orange-600' ? 'bg-orange-600 text-white hover:bg-orange-700 border border-orange-600'
                                                : color === 'text-pink-600' ? 'bg-pink-600 text-white hover:bg-pink-700 border border-pink-600'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600'
                            }`}
                    >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2].map(i => (
                                    <div key={i} className="animate-pulse h-4 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        ) : data.length === 0 ? (
                            <div className="text-center py-6 text-gray-400">
                                <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No records found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-300">
                                            <th className="text-left py-2 px-2 font-semibold text-gray-700">ID</th>
                                            <th className="text-left py-2 px-2 font-semibold text-gray-700">Name</th>
                                            <th className="text-left py-2 px-2 font-semibold text-gray-700">Mobile</th>
                                            <th className="text-left py-2 px-2 font-semibold text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.slice(0, 5).map((row, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 hover:bg-white">
                                                <td className="py-2 px-2 text-gray-800 font-medium truncate max-w-[80px]" title={row.member_id_key}>
                                                    {row.member_id_key || '-'}
                                                </td>
                                                <td className="py-2 px-2 text-gray-800 truncate max-w-[120px]" title={row.name}>
                                                    {row.name || '-'}
                                                </td>
                                                <td className="py-2 px-2 text-gray-600">{row.mobile || '-'}</td>
                                                <td className="py-2 px-2">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                        {row.status || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {data.length > 5 && (
                                    <div className="text-center mt-2 text-xs text-gray-500">
                                        +{data.length - 5} more records
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Daily Activity Dashboard
                        </h1>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {currentDate}
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium ${refreshing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>

            {/* Dashboard Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                    sectionKey="previousDayEnquiries"
                    category="ENQUIRIES"
                    title="Previous Day Enquiries"
                    description="All enquiries created yesterday. Track missed or unattended enquiries to ensure no lead is forgotten."
                    count={dashboardData.previousDayEnquiries.count}
                    icon={Users}
                    color="text-blue-600"
                    data={dashboardData.previousDayEnquiries.data}
                />

                <DashboardCard
                    sectionKey="leadsConverted"
                    category="CONVERSIONS"
                    title="Leads Converted Yesterday"
                    description="Enquiries converted to admission yesterday. Measure conversion efficiency and daily performance."
                    count={dashboardData.leadsConverted.count}
                    icon={TrendingUp}
                    color="text-green-600"
                    data={dashboardData.leadsConverted.data}
                />

                <DashboardCard
                    sectionKey="patientsAdmitted"
                    category="ADMISSIONS"
                    title="Patients Admitted"
                    description="Patients admitted into care yesterday. Confirms new revenue entries and operational workload."
                    count={dashboardData.patientsAdmitted.count}
                    icon={UserPlus}
                    color="text-purple-600"
                    data={dashboardData.patientsAdmitted.data}
                />

                <DashboardCard
                    sectionKey="patientsDischarged"
                    category="DISCHARGES"
                    title="Patients Discharged"
                    description="Patients whose service ended yesterday. Helps billing and closure verification."
                    count={dashboardData.patientsDischarged.count}
                    icon={UserCheck}
                    color="text-orange-600"
                    data={dashboardData.patientsDischarged.data}
                />

                <DashboardCard
                    sectionKey="followUpsToday"
                    category="FOLLOW-UPS"
                    title="Follow-Up Due Today"
                    description="Enquiries requiring follow-up today. Prevents missed follow-ups and improves conversion."
                    count={dashboardData.followUpsToday.count}
                    icon={Calendar}
                    color="text-pink-600"
                    data={dashboardData.followUpsToday.data}
                />
            </div>

            {/* Footer */}
            <div className="max-w-7xl mx-auto mt-8 text-center text-xs text-gray-500">
                <p>Click "View Details" on any card to see records • Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
        </div>
    );
};

export default Home;
