import React, { useState } from 'react';
import { Eye, Edit3, Bell, Table, ChevronLeft, ChevronRight, Menu, ChevronDown, UserPlus, Bed, Settings, Search, FileText, User, Phone, Heart, Activity, DollarSign, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        'enquiries': true,
        'patient Admission': true,
        'management': true,
        'Analytics': true
    });

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const currentPath = location.pathname;

    // Helper to check if link is active
    const isActiveLink = (path) => {
        if (path === '/' || path === '/enquiries') {
            return currentPath === '/' || currentPath === '/enquiries';
        }
        return currentPath.startsWith(path);
    };

    const NavItem = ({ icon: Icon, label, path, isSubItem = false }) => {
        const active = isActiveLink(path);

        return (
            <button
                onClick={() => navigate(path)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} 
                    px-4 py-2 transition-all duration-300 relative group
                    ${active
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-green-50 border-2 border-transparent hover:border-green-500'
                    }
                    ${isSubItem && !isCollapsed ? 'pl-8' : ''}
                `}
                title={isCollapsed ? label : ''}
            >
                <Icon className={`w-5 h-5 flex-shrink-0 ${!isCollapsed && 'mr-3'}`} />
                {!isCollapsed && (
                    <span className="font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 text-base">
                        {label}
                    </span>
                )}
                {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-base opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-200 shadow-xl">
                        {label}
                    </div>
                )}
            </button>
        );
    };

    const SectionHeader = ({ id, icon: Icon, label, isExpanded, onClick }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} 
                px-4 py-2 transition-all duration-300 relative group
                bg-gradient-to-r from-green-50 to-green-100 text-gray-800 hover:from-green-100 hover:to-green-200
                border-2 border-green-200 font-bold
            `}
            title={isCollapsed ? label : ''}
        >
            <div className="flex items-center">
                <Icon className={`w-5 h-5 flex-shrink-0 ${!isCollapsed && 'mr-3'}`} />
                {!isCollapsed && (
                    <span className="font-bold whitespace-nowrap overflow-hidden transition-all duration-300">
                        {label}
                    </span>
                )}
            </div>
            {!isCollapsed && (
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
            )}
            {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-base opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-200 shadow-xl">
                    {label}
                </div>
            )}
        </button>
    );

    return (
        <aside className={`sticky top-0 h-screen transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'} hidden md:block z-10`}>
            <div className="bg-white shadow-xl p-1.5 border-2 border-blue-200 h-full flex flex-col overflow-y-auto">
                <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-end'} mb-4`}>
                    <button onClick={toggleSidebar} className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors">
                        {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                <div className="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar flex-1 pb-4">

                    {/* GLOBAL SEARCH */}
                    <NavItem icon={Search} label="Search Data" path="/search" />
                    <div className="my-2 border-t border-gray-100"></div>

                    {/* ENQUIRIES SECTION */}
                    <div>
                        <SectionHeader
                            id="enquiries"
                            icon={FileText}
                            label="Enquiries"
                            isExpanded={expandedSections['enquiries']}
                            onClick={() => {
                                if (isCollapsed) {
                                    setIsCollapsed(false);
                                    setExpandedSections(prev => ({ ...prev, 'enquiries': true }));
                                } else {
                                    toggleSection('enquiries');
                                }
                            }}
                        />
                        {!isCollapsed && expandedSections['enquiries'] && (
                            <div className="mt-2 space-y-1">
                                <NavItem icon={User} label="Patient Information" path="/enquiries" isSubItem={true} />
                            </div>
                        )}
                    </div>

                    {/* PATIENT ADMISSION SECTION */}
                    <div>
                        <SectionHeader
                            id="patient Admission"
                            icon={UserPlus}
                            label="Patient Admission"
                            isExpanded={expandedSections['patient Admission']}
                            onClick={() => {
                                if (isCollapsed) {
                                    setIsCollapsed(false);
                                    setExpandedSections(prev => ({ ...prev, 'patient Admission': true }));
                                } else {
                                    toggleSection('patient Admission');
                                }
                            }}
                        />
                        {!isCollapsed && expandedSections['patient Admission'] && (
                            <div className="mt-2 space-y-1">
                                <NavItem icon={UserPlus} label="Registration" path="/admission" isSubItem={true} />
                                <div className="my-2 border-t border-gray-100"></div>
                                <NavItem icon={Bed} label="Bed Availability" path="/bed-availability" isSubItem={true} />
                                <NavItem icon={FileText} label="Extract Summary" path="/billing-summary" isSubItem={true} />
                                {/* Search Data moved to top */}
                            </div>
                        )}
                    </div>

                    {/* MANAGEMENT SECTION */}
                    <div>
                        <SectionHeader
                            id="management"
                            icon={Settings}
                            label="Management"
                            isExpanded={expandedSections['management']}
                            onClick={() => {
                                if (isCollapsed) {
                                    setIsCollapsed(false);
                                    setExpandedSections(prev => ({ ...prev, 'management': true }));
                                } else {
                                    toggleSection('management');
                                }
                            }}
                        />
                        {!isCollapsed && expandedSections['management'] && (
                            <div className="mt-2 space-y-1">
                                <NavItem icon={Eye} label="Documents" path="/documents" isSubItem={true} />
                                <NavItem icon={Edit3} label="Schema" path="/schema" isSubItem={true} />
                                <NavItem icon={DollarSign} label="Charge Summary" path="/charge-summary" isSubItem={true} />
                                <NavItem icon={Bell} label="Notifications" path="/notifications" isSubItem={true} />
                                <NavItem icon={FileText} label="File Manager" path="/file-manager" isSubItem={true} />
                            </div>
                        )}
                    </div>

                    {/* ANALYTICS SECTION */}
                    <div>
                        <SectionHeader
                            id="Analytics"
                            icon={BarChart3}
                            label="Analytics"
                            isExpanded={expandedSections['Analytics']}
                            onClick={() => {
                                if (isCollapsed) {
                                    setIsCollapsed(false);
                                    setExpandedSections(prev => ({ ...prev, 'Analytics': true }));
                                } else {
                                    toggleSection('Analytics');
                                }
                            }}
                        />
                        {!isCollapsed && expandedSections['Analytics'] && (
                            <div className="mt-2 space-y-1">
                                <NavItem icon={BarChart3} label="Power BI Report" path="/analysis" isSubItem={true} />
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
