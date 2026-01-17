import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, UserPlus, Users, UserCheck, Calendar, AlertCircle, ChevronRight, XCircle, CheckCircle, Building2, LogOut } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Home = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState('');
    const [expandedSection, setExpandedSection] = useState(null);

    const [dashboardData, setDashboardData] = useState({
        previousDayEnquiries: { data: [], count: 0 },
        leadsConverted: { data: [], count: 0 },
        patientsAdmitted: { data: [], count: 0 },
        complaintsReceived: { data: [], count: 0 },
        complaintsResolved: { data: [], count: 0 },
        followUpsToday: { data: [], count: 0 },
        rsPuramAdmissions: { data: [], count: 0 },
        ramNagarAdmissions: { data: [], count: 0 },
        chennaiAdmissions: { data: [], count: 0 },
        rsPuramDischarges: { data: [], count: 0 },
        ramNagarDischarges: { data: [], count: 0 },
        chennaiDischarges: { data: [], count: 0 }
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
                { key: 'complaintsReceived', url: '/api/dashboard/complaints-received-yesterday' },
                { key: 'complaintsResolved', url: '/api/dashboard/complaints-resolved-yesterday' },
                { key: 'followUpsToday', url: '/api/dashboard/follow-ups-today' },
                { key: 'rsPuramAdmissions', url: '/api/dashboard/admissions-by-center?care_center=RS Puram&date_filter=today' },
                { key: 'ramNagarAdmissions', url: '/api/dashboard/admissions-by-center?care_center=ram nagar&date_filter=today' },
                { key: 'chennaiAdmissions', url: '/api/dashboard/admissions-by-center?care_center=chennai&date_filter=today' },
                { key: 'rsPuramDischarges', url: '/api/dashboard/discharges-by-center?care_center=RS Puram&date_filter=today' },
                { key: 'ramNagarDischarges', url: '/api/dashboard/discharges-by-center?care_center=ram nagar&date_filter=today' },
                { key: 'chennaiDischarges', url: '/api/dashboard/discharges-by-center?care_center=chennai&date_filter=today' }
            ];

            const results = await Promise.all(
                endpoints.map(endpoint =>
                    fetch(`${API_BASE_URL}${endpoint.url}`)
                        .then(res => res.ok ? res.json() : { data: [], count: 0 })
                        .then(data => ({ key: endpoint.key, data }))
                        .catch(() => ({ key: endpoint.key, data: { data: [], count: 0 } }))
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

    // Compact Dashboard Card - Click to expand with colored background
    const CompactCard = ({ sectionKey, title, count, icon: Icon, color, data }) => {
        const isExpanded = expandedSection === sectionKey;
        const hasData = data && data.length > 0;

        // Get background color class based on icon color
        const getBgColor = () => {
            if (color.includes('blue')) return 'bg-blue-50';
            if (color.includes('green')) return 'bg-green-50';
            if (color.includes('purple')) return 'bg-purple-50';
            if (color.includes('red')) return 'bg-red-50';
            if (color.includes('orange')) return 'bg-orange-50';
            if (color.includes('pink')) return 'bg-pink-50';
            if (color.includes('indigo')) return 'bg-indigo-50';
            return 'bg-gray-50';
        };

        return (
            <div className={`${getBgColor()} rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 flex flex-col`}>
                {/* Compact Header */}
                <div className="p-2.5 flex-shrink-0 bg-white">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color.replace('text-', 'from-')}-100 ${color.replace('text-', 'to-')}-200 flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-4 h-4 ${color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-semibold text-gray-800 truncate leading-tight">{title}</h3>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <span className="text-xl font-bold text-gray-800">{count}</span>
                        </div>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="border-t border-gray-200 bg-white p-3 overflow-auto max-h-64">
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2].map(i => (
                                    <div key={i} className="animate-pulse h-3 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        ) : !hasData ? (
                            <div className="text-center py-4 text-gray-400">
                                <AlertCircle className="w-8 h-8 mx-auto mb-1.5 opacity-50" />
                                <p className="text-xs">No data available</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-300">
                                            <th className="text-left py-1.5 px-1.5 font-semibold text-gray-700">ID</th>
                                            <th className="text-left py-1.5 px-1.5 font-semibold text-gray-700">Name</th>
                                            <th className="text-left py-1.5 px-1.5 font-semibold text-gray-700">Mobile</th>
                                            <th className="text-left py-1.5 px-1.5 font-semibold text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.slice(0, 5).map((row, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-1.5 px-1.5 text-gray-800 font-medium truncate max-w-[70px]" title={row.member_id_key}>
                                                    {row.member_id_key || '-'}
                                                </td>
                                                <td className="py-1.5 px-1.5 text-gray-800 truncate max-w-[100px]" title={row.name}>
                                                    {row.name || '-'}
                                                </td>
                                                <td className="py-1.5 px-1.5 text-gray-600">{row.mobile || '-'}</td>
                                                <td className="py-1.5 px-1.5">
                                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                        {row.status || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {data.length > 5 && (
                                    <div className="text-center mt-1.5 text-xs text-gray-500">
                                        +{data.length - 5} more
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* View Button - Always Visible with Dark Background */}
                <div className="p-2.5 flex-shrink-0 bg-gray-800 mt-auto">
                    <button
                        onClick={() => handleViewDetails(sectionKey)}
                        className="w-full py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-white text-gray-800 hover:bg-gray-100 shadow-sm"
                    >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Compact Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-gray-800">Daily Activity Dashboard</h1>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {currentDate}
                        </span>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className={`flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="max-w-[1600px] mx-auto mt-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {error}
                    </div>
                )}
            </div>

            {/* 12-Card Grid - Optimized for full page */}
            <div className="flex-1 overflow-auto p-4">
                <div className="max-w-[1600px] mx-auto h-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-full auto-rows-fr">
                        {/* Row 1: Enquiries & Conversions */}
                        <CompactCard
                            sectionKey="previousDayEnquiries"
                            title="Previous Day Enquiries"
                            count={dashboardData.previousDayEnquiries.count}
                            icon={Users}
                            color="text-blue-600"
                            data={dashboardData.previousDayEnquiries.data}
                        />

                        <CompactCard
                            sectionKey="leadsConverted"
                            title="Leads Converted Yesterday"
                            count={dashboardData.leadsConverted.count}
                            icon={TrendingUp}
                            color="text-green-600"
                            data={dashboardData.leadsConverted.data}
                        />

                        <CompactCard
                            sectionKey="patientsAdmitted"
                            title="Patients Admitted Yesterday"
                            count={dashboardData.patientsAdmitted.count}
                            icon={UserPlus}
                            color="text-purple-600"
                            data={dashboardData.patientsAdmitted.data}
                        />

                        <CompactCard
                            sectionKey="complaintsReceived"
                            title="Complaints Received Yesterday"
                            count={dashboardData.complaintsReceived.count}
                            icon={XCircle}
                            color="text-red-600"
                            data={dashboardData.complaintsReceived.data}
                        />

                        {/* Row 2: Complaints & Follow-ups */}
                        <CompactCard
                            sectionKey="complaintsResolved"
                            title="Complaints Resolved Yesterday"
                            count={dashboardData.complaintsResolved.count}
                            icon={CheckCircle}
                            color="text-green-600"
                            data={dashboardData.complaintsResolved.data}
                        />

                        <CompactCard
                            sectionKey="followUpsToday"
                            title="Follow-Up Due Today"
                            count={dashboardData.followUpsToday.count}
                            icon={Calendar}
                            color="text-pink-600"
                            data={dashboardData.followUpsToday.data}
                        />

                        {/* Row 3: Today's Admissions by Center */}
                        <CompactCard
                            sectionKey="rsPuramAdmissions"
                            title="RS Puram Admission - Today"
                            count={dashboardData.rsPuramAdmissions.count}
                            icon={Building2}
                            color="text-indigo-600"
                            data={dashboardData.rsPuramAdmissions.data}
                        />

                        <CompactCard
                            sectionKey="ramNagarAdmissions"
                            title="Ram Nagar Admission - Today"
                            count={dashboardData.ramNagarAdmissions.count}
                            icon={Building2}
                            color="text-indigo-600"
                            data={dashboardData.ramNagarAdmissions.data}
                        />

                        <CompactCard
                            sectionKey="chennaiAdmissions"
                            title="Chennai Admission - Today"
                            count={dashboardData.chennaiAdmissions.count}
                            icon={Building2}
                            color="text-indigo-600"
                            data={dashboardData.chennaiAdmissions.data}
                        />

                        {/* Row 4: Today's Discharges by Center */}
                        <CompactCard
                            sectionKey="rsPuramDischarges"
                            title="RS Puram Discharge - Today"
                            count={dashboardData.rsPuramDischarges.count}
                            icon={LogOut}
                            color="text-orange-600"
                            data={dashboardData.rsPuramDischarges.data}
                        />

                        <CompactCard
                            sectionKey="ramNagarDischarges"
                            title="Ram Nagar Discharge - Today"
                            count={dashboardData.ramNagarDischarges.count}
                            icon={LogOut}
                            color="text-orange-600"
                            data={dashboardData.ramNagarDischarges.data}
                        />

                        <CompactCard
                            sectionKey="chennaiDischarges"
                            title="Chennai Discharge - Today"
                            count={dashboardData.chennaiDischarges.count}
                            icon={LogOut}
                            color="text-orange-600"
                            data={dashboardData.chennaiDischarges.data}
                        />
                    </div>
                </div>
            </div>

            {/* Compact Footer */}
            <div className="bg-white border-t border-gray-200 px-4 py-1.5 flex-shrink-0">
                <div className="max-w-[1600px] mx-auto text-center text-xs text-gray-500">
                    <p>Click any card to see detailed records • Last updated: {new Date().toLocaleTimeString()}</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
