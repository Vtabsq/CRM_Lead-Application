import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, TrendingUp, UserPlus, UserMinus, Calendar, XCircle, CheckCircle, Building2, LogOut, AlertCircle, ChevronRight } from 'lucide-react';

const Home = () => {
    const [dashboardData, setDashboardData] = useState({
        previousDayEnquiries: { count: 0, data: [] },
        convertedLeads: { count: 0, data: [] },
        admittedPatients: { count: 0, data: [] },
        complaintsReceived: { count: 0, data: [] },
        complaintsResolved: { count: 0, data: [] },
        followUpsDue: { count: 0, data: [] },
        rsPuramAdmissions: { count: 0, data: [] },
        ramNagarAdmissions: { count: 0, data: [] },
        chennaiAdmissions: { count: 0, data: [] },
        rsPuramDischarges: { count: 0, data: [] },
        ramNagarDischarges: { count: 0, data: [] },
        chennaiDischarges: { count: 0, data: [] }
    });
    const [loading, setLoading] = useState(true);
    const [expandedSection, setExpandedSection] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [
                enquiries, converted, admitted, complaintsRec, complaintsRes, followUps,
                rsPuramAdm, ramNagarAdm, chennaiAdm,
                rsPuramDis, ramNagarDis, chennaiDis
            ] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/dashboard/previous-day-enquiries`),
                axios.get(`${API_BASE_URL}/api/dashboard/converted-leads-yesterday`),
                axios.get(`${API_BASE_URL}/api/dashboard/admitted-patients-yesterday`),
                axios.get(`${API_BASE_URL}/api/dashboard/complaints-received-yesterday`),
                axios.get(`${API_BASE_URL}/api/dashboard/complaints-resolved-yesterday`),
                axios.get(`${API_BASE_URL}/api/dashboard/follow-ups-due-today`),
                axios.get(`${API_BASE_URL}/api/dashboard/admissions-by-center?care_center=RS Puram&date_filter=today`),
                axios.get(`${API_BASE_URL}/api/dashboard/admissions-by-center?care_center=ram nagar&date_filter=today`),
                axios.get(`${API_BASE_URL}/api/dashboard/admissions-by-center?care_center=chennai&date_filter=today`),
                axios.get(`${API_BASE_URL}/api/dashboard/discharges-by-center?care_center=RS Puram&date_filter=today`),
                axios.get(`${API_BASE_URL}/api/dashboard/discharges-by-center?care_center=ram nagar&date_filter=today`),
                axios.get(`${API_BASE_URL}/api/dashboard/discharges-by-center?care_center=chennai&date_filter=today`)
            ]);

            setDashboardData({
                previousDayEnquiries: enquiries.data,
                convertedLeads: converted.data,
                admittedPatients: admitted.data,
                complaintsReceived: complaintsRec.data,
                complaintsResolved: complaintsRes.data,
                followUpsDue: followUps.data,
                rsPuramAdmissions: rsPuramAdm.data,
                ramNagarAdmissions: ramNagarAdm.data,
                chennaiAdmissions: chennaiAdm.data,
                rsPuramDischarges: rsPuramDis.data,
                ramNagarDischarges: ramNagarDis.data,
                chennaiDischarges: chennaiDis.data
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (sectionKey) => {
        setExpandedSection(expandedSection === sectionKey ? null : sectionKey);
    };

    // Dashboard Card - Matching the reference design
    const DashboardCard = ({ sectionKey, title, count, icon: Icon, color, data, category, description }) => {
        const isExpanded = expandedSection === sectionKey;
        const hasData = data && data.length > 0;

        return (
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200">
                {/* Card Header */}
                <div className="p-4">
                    {/* Category and Icon */}
                    <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${color}`}>
                            {category}
                        </span>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color.replace('text-', 'from-')}-100 ${color.replace('text-', 'to-')}-200 flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-800 mb-4">
                        {title}
                    </h3>


                    {/* Count */}
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-3xl font-bold text-gray-800">{count}</span>
                        <span className="text-sm text-gray-500">records</span>
                    </div>

                    {/* View Details Button */}
                    <button
                        onClick={() => handleViewDetails(sectionKey)}
                        className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${color === 'text-blue-600' ? 'bg-blue-600 hover:bg-blue-700' :
                            color === 'text-green-600' ? 'bg-green-600 hover:bg-green-700' :
                                color === 'text-purple-600' ? 'bg-purple-600 hover:bg-purple-700' :
                                    color === 'text-red-600' ? 'bg-red-600 hover:bg-red-700' :
                                        color === 'text-orange-600' ? 'bg-orange-600 hover:bg-orange-700' :
                                            color === 'text-pink-600' ? 'bg-pink-600 hover:bg-pink-700' :
                                                color === 'text-indigo-600' ? 'bg-indigo-600 hover:bg-indigo-700' :
                                                    'bg-blue-600 hover:bg-blue-700'
                            } text-white`}
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
                        ) : !hasData ? (
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

    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Daily Activity Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">📅 {currentDate}</p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center gap-2"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-[1600px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <DashboardCard
                            sectionKey="previousDayEnquiries"
                            title="Previous Day Enquiries"
                            category="ENQUIRIES"
                            description="All enquiries created yesterday. Track missed or unattended enquiries to ensure no lead is forgotten."
                            count={dashboardData.previousDayEnquiries.count}
                            data={dashboardData.previousDayEnquiries.data}
                            icon={Users}
                            color="text-blue-600"
                        />
                        <DashboardCard
                            sectionKey="convertedLeads"
                            title="Leads Converted Yesterday"
                            category="CONVERSIONS"
                            description="Enquiries converted to admission yesterday. Measure conversion efficiency and daily performance."
                            count={dashboardData.convertedLeads.count}
                            data={dashboardData.convertedLeads.data}
                            icon={TrendingUp}
                            color="text-green-600"
                        />
                        <DashboardCard
                            sectionKey="admittedPatients"
                            title="Enquiries Rejected Yesterday"
                            category="ENQUIRIES"
                            description="Enquiries that were rejected yesterday. Track loss reasons and follow-up opportunities."
                            count={dashboardData.admittedPatients.count}
                            data={dashboardData.admittedPatients.data}
                            icon={UserPlus}
                            color="text-purple-600"
                        />
                        <DashboardCard
                            sectionKey="complaintsReceived"
                            title="Complaints Received Yesterday"
                            category="COMPLAINTS"
                            description="Complaints received yesterday. Monitor customer satisfaction and service quality issues."
                            count={dashboardData.complaintsReceived.count}
                            data={dashboardData.complaintsReceived.data}
                            icon={XCircle}
                            color="text-red-600"
                        />
                        <DashboardCard
                            sectionKey="complaintsResolved"
                            title="Complaints Resolved Yesterday"
                            category="RESOLVED"
                            description="Complaints resolved yesterday. Track resolution efficiency and customer service performance."
                            count={dashboardData.complaintsResolved.count}
                            data={dashboardData.complaintsResolved.data}
                            icon={CheckCircle}
                            color="text-green-600"
                        />
                        <DashboardCard
                            sectionKey="followUpsDue"
                            title="Follow-Up Due Today"
                            category="FOLLOW-UPS"
                            description="Enquiries requiring follow-up today. Prevents missed follow-ups and improves conversion."
                            count={dashboardData.followUpsDue.count}
                            data={dashboardData.followUpsDue.data}
                            icon={Calendar}
                            color="text-pink-600"
                        />
                        <DashboardCard
                            sectionKey="rsPuramAdmissions"
                            title="RS Puram Admission - Yesterday"
                            category="ADMISSIONS"
                            description="New admissions at RS Puram center today. Monitor center-specific patient intake."
                            count={dashboardData.rsPuramAdmissions.count}
                            data={dashboardData.rsPuramAdmissions.data}
                            icon={Building2}
                            color="text-indigo-600"
                        />
                        <DashboardCard
                            sectionKey="ramNagarAdmissions"
                            title="Ram Nagar Admission - Yesterday"
                            category="ADMISSIONS"
                            description="New admissions at Ram Nagar center today. Monitor center-specific patient intake."
                            count={dashboardData.ramNagarAdmissions.count}
                            data={dashboardData.ramNagarAdmissions.data}
                            icon={Building2}
                            color="text-indigo-600"
                        />
                        <DashboardCard
                            sectionKey="chennaiAdmissions"
                            title="Chennai Admission - Yesterday"
                            category="ADMISSIONS"
                            description="New admissions at Chennai center today. Monitor center-specific patient intake."
                            count={dashboardData.chennaiAdmissions.count}
                            data={dashboardData.chennaiAdmissions.data}
                            icon={Building2}
                            color="text-indigo-600"
                        />
                        <DashboardCard
                            sectionKey="rsPuramDischarges"
                            title="RS Puram Discharge - Today"
                            category="DISCHARGES"
                            description="Patient discharges from RS Puram center today. Track center-specific service completions."
                            count={dashboardData.rsPuramDischarges.count}
                            data={dashboardData.rsPuramDischarges.data}
                            icon={LogOut}
                            color="text-orange-600"
                        />
                        <DashboardCard
                            sectionKey="ramNagarDischarges"
                            title="Ram Nagar Discharge - Today"
                            category="DISCHARGES"
                            description="Patient discharges from Ram Nagar center today. Track center-specific service completions."
                            count={dashboardData.ramNagarDischarges.count}
                            data={dashboardData.ramNagarDischarges.data}
                            icon={LogOut}
                            color="text-orange-600"
                        />
                        <DashboardCard
                            sectionKey="chennaiDischarges"
                            title="Chennai Discharge - Today"
                            category="DISCHARGES"
                            description="Patient discharges from Chennai center today. Track center-specific service completions."
                            count={dashboardData.chennaiDischarges.count}
                            data={dashboardData.chennaiDischarges.data}
                            icon={LogOut}
                            color="text-orange-600"
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 px-6 py-2 flex-shrink-0">
                <div className="max-w-[1600px] mx-auto text-center text-xs text-gray-500">
                    Click any card to see detailed records • Last updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};

export default Home;
