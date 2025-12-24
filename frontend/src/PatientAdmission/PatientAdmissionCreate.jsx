import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Search, X } from 'lucide-react';
import API_BASE_URL from '../config';

const PatientAdmissionCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Patient search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const dropdownRef = useRef(null);

    const [formData, setFormData] = useState({
        patient_name: '',
        gender: '',
        age: '',
        pain_point: '',
        care_center: '',
        service_started_on: new Date().toISOString().split('T')[0],
        service_type: 'Patient Admission',
        home_care_revenue: '',
        additional_nursing_charges: '0',
        discount: '0',
        shift: 'Regular',
        active_inactive: 'ACTIVE',
        room_type: 'Twin',
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search patients with debounce
    useEffect(() => {
        const searchPatients = async () => {
            if (searchQuery.trim().length < 1) {
                setSearchResults([]);
                setShowDropdown(false);
                return;
            }

            setSearchLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/admission-patients/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await response.json();

                if (data.status === 'success') {
                    setSearchResults(data.patients || []);
                    setShowDropdown(true);
                }
            } catch (err) {
                console.error('Error searching patients:', err);
            } finally {
                setSearchLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchPatients, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        setSearchQuery(patient.display);
        setFormData(prev => ({
            ...prev,
            patient_name: patient.patient_name
        }));
        setShowDropdown(false);
    };

    const handleClearSelection = () => {
        setSelectedPatient(null);
        setSearchQuery('');
        setFormData(prev => ({
            ...prev,
            patient_name: ''
        }));
        setSearchResults([]);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        // Also update patient_name in formData for manual entry
        setFormData(prev => ({
            ...prev,
            patient_name: value
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!formData.patient_name.trim()) {
            setError('Patient name is required');
            return;
        }
        if (!formData.home_care_revenue || parseFloat(formData.home_care_revenue) <= 0) {
            setError('Home care revenue must be greater than 0');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/api/patientadmission/clients`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setSuccess('Home care client added successfully!');
                setTimeout(() => {
                    navigate('/patientadmission/clients');
                }, 2000);
            } else {
                setError(data.detail || 'Failed to add client');
            }
        } catch (err) {
            console.error('Error adding client:', err);
            setError('Failed to add client. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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

                <h1 className="text-2xl font-bold text-gray-800">Add New Patient Admission Client</h1>
                <p className="text-gray-600 mt-1">Enter patient details for patient admission service</p>
            </div>

            {/* Error/Success Messages */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    {success}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Patient Search Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Patient <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                                placeholder="Type Member ID or Patient Name..."
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {selectedPatient && (
                                <button
                                    type="button"
                                    onClick={handleClearSelection}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            )}
                            {searchLoading && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                </div>
                            )}
                        </div>

                        {/* Dropdown Results */}
                        {showDropdown && searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {searchResults.map((patient, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handlePatientSelect(patient)}
                                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <div className="font-medium text-gray-900">{patient.patient_name || 'N/A'}</div>
                                            <div className="text-sm text-blue-600 font-medium">
                                                Member ID: {patient.member_id || 'Not Available'}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {showDropdown && searchQuery && searchResults.length === 0 && !searchLoading && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                                No patients found
                            </div>
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Age */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Age
                        </label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            max="150"
                        />
                    </div>

                    {/* Care Center */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Care Center
                        </label>
                        <input
                            type="text"
                            name="care_center"
                            value={formData.care_center}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Pain Point */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pain Point / Diagnosis
                        </label>
                        <textarea
                            name="pain_point"
                            value={formData.pain_point}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Admission Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Admission Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="service_started_on"
                            value={formData.service_started_on}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Room Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Room Type
                        </label>
                        <select
                            name="room_type"
                            value={formData.room_type}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Twin">Twin</option>
                            <option value="Single">Single</option>
                        </select>
                    </div>

                    {/* No of Occupied Bed Days By Patient (Auto-calculated) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            No of Occupied Bed Days By Patient
                        </label>
                        <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium">
                            {(() => {
                                if (!formData.service_started_on) return '0 days';
                                const admissionDate = new Date(formData.service_started_on);
                                const today = new Date();
                                const diffTime = Math.abs(today - admissionDate);
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                            })()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Automatically calculated from admission date to today</p>
                    </div>

                    {/* Patient Admission Revenue */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Patient Admission Revenue (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="home_care_revenue"
                            value={formData.home_care_revenue}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    {/* Additional Nursing Charges */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Nursing Charges (₹)
                        </label>
                        <input
                            type="number"
                            name="additional_nursing_charges"
                            value={formData.additional_nursing_charges}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    {/* Discount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discount (₹)
                        </label>
                        <input
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    {/* Total Revenue (Calculated) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Revenue (₹)
                        </label>
                        <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold">
                            ₹{(
                                (parseFloat(formData.home_care_revenue) || 0) +
                                (parseFloat(formData.additional_nursing_charges) || 0) -
                                (parseFloat(formData.discount) || 0)
                            ).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                    >
                        <Save size={20} />
                        {loading ? 'Saving...' : 'Save Client'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/patientadmission/clients')}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PatientAdmissionCreate;
