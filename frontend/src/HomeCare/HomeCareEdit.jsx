import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react';
import API_BASE_URL from '../config';

const HomeCareEdit = () => {
    const { patientName } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        fetchClientData();
    }, [patientName]);

    const fetchClientData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/homecare/clients/${encodeURIComponent(patientName)}`);
            const data = await response.json();

            if (data.status === 'success' && data.client) {
                // Convert date format from DD/MM/YYYY to YYYY-MM-DD for input
                const serviceDate = data.client.service_started_on;
                let formattedDate = '';
                if (serviceDate) {
                    const parts = serviceDate.split('/');
                    if (parts.length === 3) {
                        formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                    }
                }

                setFormData({
                    patient_name: data.client.patient_name || '',
                    gender: data.client.gender || '',
                    age: data.client.age || '',
                    pain_point: data.client.pain_point || '',
                    location: data.client.location || '',
                    service_started_on: formattedDate || '',
                    service_type: data.client.service_type || 'Home Care',
                    home_care_revenue: data.client.home_care_revenue || '',
                    additional_nursing_charges: data.client.additional_nursing_charges || '0',
                    discount: data.client.discount || '0',
                    shift: data.client.shift || 'Regular',
                    active_inactive: data.client.status || 'ACTIVE',
                    service_stopped_on: '',
                    type_of_complaint: data.client.type_of_complaint || '',
                    resolved: data.client.resolved || 'No',
                    date_1: new Date().toISOString().split('T')[0],
                });
            } else {
                setError('Client not found');
            }
        } catch (err) {
            console.error('Error fetching client:', err);
            setError('Failed to load client data');
        } finally {
            setLoading(false);
        }
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
            setSaving(true);

            const response = await fetch(`${API_BASE_URL}/api/homecare/clients/${encodeURIComponent(patientName)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setSuccess('Home care client updated successfully!');
                setTimeout(() => {
                    navigate('/homecare/clients');
                }, 2000);
            } else {
                setError(data.detail || 'Failed to update client');
            }
        } catch (err) {
            console.error('Error updating client:', err);
            setError('Failed to update client. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="animate-spin" size={24} />
                    Loading client data...
                </div>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="p-6">
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    Client not found
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/homecare/clients')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
                >
                    <ArrowLeft size={20} />
                    Back to Clients
                </button>

                <h1 className="text-2xl font-bold text-gray-800">Edit Home Care Client</h1>
                <p className="text-gray-600 mt-1">{patientName}</p>
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
                    {/* Patient Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Patient Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="patient_name"
                            value={formData.patient_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">Patient name cannot be changed</p>
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

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
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

                    {/* Service Started On */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Started On <span className="text-red-500">*</span>
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

                    {/* Shift */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Shift
                        </label>
                        <select
                            name="shift"
                            value={formData.shift}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Regular">Regular</option>
                            <option value="Day">Day</option>
                            <option value="Night">Night</option>
                            <option value="24/7">24/7</option>
                        </select>
                    </div>

                    {/* Home Care Revenue */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Home Care Revenue (₹) <span className="text-red-500">*</span>
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

                    {/* Type of Complaint */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type of Complaint
                        </label>
                        <input
                            type="text"
                            name="type_of_complaint"
                            value={formData.type_of_complaint}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter complaint type (if any)"
                        />
                    </div>

                    {/* Resolved */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Resolved
                        </label>
                        <select
                            name="resolved"
                            value={formData.resolved}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
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

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            name="active_inactive"
                            value={formData.active_inactive}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>

                    {/* Service Stopped On (only if inactive) */}
                    {formData.active_inactive === 'INACTIVE' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Service Stopped On
                            </label>
                            <input
                                type="date"
                                name="service_stopped_on"
                                value={formData.service_stopped_on}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                    >
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/homecare/clients')}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HomeCareEdit;
