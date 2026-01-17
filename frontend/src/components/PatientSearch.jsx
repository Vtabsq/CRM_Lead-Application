import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CheckCircle } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

const PatientSearch = ({ onSelect, selectedPatient, onClear }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);

    // Search patients when search term changes
    useEffect(() => {
        const searchPatients = async () => {
            if (!searchTerm || searchTerm.length < 1) {
                setPatients([]);
                return;
            }

            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/patients/search`, {
                    params: { q: searchTerm }
                });
                setPatients(response.data.patients || []);
            } catch (error) {
                console.error('Error searching patients:', error);
                setPatients([]);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchPatients, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (patient) => {
        onSelect(patient);
        setSearchTerm(`${patient.patient_id} - ${patient.patient_name}`);
        setShowDropdown(false);
    };

    const handleClear = () => {
        setSearchTerm('');
        setPatients([]);
        if (onClear) onClear();
    };

    return (
        <div className="relative" ref={searchRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by Member ID or Patient Name..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
                {(searchTerm || selectedPatient) && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {showDropdown && searchTerm && !selectedPatient && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2">Searching...</p>
                        </div>
                    ) : patients.length > 0 ? (
                        patients.map((patient) => (
                            <div
                                key={patient.patient_id}
                                onClick={() => handleSelect(patient)}
                                className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">{patient.patient_name}</p>
                                        <p className="text-sm text-gray-600">ID: {patient.patient_id}</p>
                                        {patient.mobile && (
                                            <p className="text-xs text-gray-500">Mobile: {patient.mobile}</p>
                                        )}
                                    </div>
                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            No patients found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientSearch;
