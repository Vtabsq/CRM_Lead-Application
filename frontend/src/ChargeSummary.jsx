import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, DollarSign } from 'lucide-react';
import API_BASE_URL from './config';

const ChargeSummary = () => {
    const [charges, setCharges] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCharges();
    }, []);

    const fetchCharges = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/settings/charges`);
            setCharges(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load charges", err);
            setError("Failed to load charge settings.");
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSuccess('');
            await axios.post(`${API_BASE_URL}/api/settings/charges`, charges);
            setSuccess("Charges updated successfully!");
        } catch (err) {
            setError("Failed to save charges.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-5 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-600" /></div>;

    return (
        <div className="w-full p-4 bg-white  shadow-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <DollarSign className="mr-2 text-blue-600" />
                Fixed Rate Settings
            </h2>

            <p className="mb-6 text-gray-500">
                Define the auto-fixed rates for admission charges. These values will automatically populate the admission form.
            </p>

            {error && <div className="mb-4 p-4 bg-red-50 text-red-600 ">{error}</div>}
            {success && <div className="mb-4 p-4 bg-green-50 text-green-600 ">{success}</div>}

            <div className="border border-gray-200  overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Charge Type</th>
                            <th className="px-4 py-2 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">Fixed Rate (₹)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Room Rates */}
                        <tr className="bg-blue-50/30">
                            <td className="px-4 py-2 whitespace-nowrap text-base font-medium text-gray-900">Room Rent - Single</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right">
                                <input
                                    type="number"
                                    value={charges?.single_bed_price || 0}
                                    onChange={(e) => setCharges({ ...charges, single_bed_price: parseFloat(e.target.value) })}
                                    className="w-32 text-right border border-gray-300  px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </td>
                        </tr>
                        <tr className="bg-blue-50/30">
                            <td className="px-4 py-2 whitespace-nowrap text-base font-medium text-gray-900">Room Rent - Double/Twin</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right">
                                <input
                                    type="number"
                                    value={charges?.twin_bed_price || 0}
                                    onChange={(e) => setCharges({ ...charges, twin_bed_price: parseFloat(e.target.value) })}
                                    className="w-32 text-right border border-gray-300  px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </td>
                        </tr>
                        <tr className="bg-blue-50/30">
                            <td className="px-4 py-2 whitespace-nowrap text-base font-medium text-gray-900">Room Rent - ICU</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right">
                                <input
                                    type="number"
                                    value={charges?.icu_bed_price || 0}
                                    onChange={(e) => setCharges({ ...charges, icu_bed_price: parseFloat(e.target.value) })}
                                    className="w-32 text-right border border-gray-300  px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </td>
                        </tr>
                        <tr className="bg-blue-50/30">
                            <td className="px-4 py-2 whitespace-nowrap text-base font-medium text-gray-900">Room Rent - General</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right">
                                <input
                                    type="number"
                                    value={charges?.general_bed_price || 0}
                                    onChange={(e) => setCharges({ ...charges, general_bed_price: parseFloat(e.target.value) })}
                                    className="w-32 text-right border border-gray-300  px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </td>
                        </tr>

                        {/* Other Charges */}
                        <tr>
                            <td className="px-4 py-2 whitespace-nowrap text-base font-medium text-gray-900">Bed Charges (Service/Nursing)</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right">
                                <input
                                    type="number"
                                    value={charges?.bed_service_charge || 0}
                                    onChange={(e) => setCharges({ ...charges, bed_service_charge: parseFloat(e.target.value) })}
                                    className="w-32 text-right border border-gray-300  px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 whitespace-nowrap text-base font-medium text-gray-900">Nurse Fee</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right">
                                <input
                                    type="number"
                                    value={charges?.nurse_fee || 0}
                                    onChange={(e) => setCharges({ ...charges, nurse_fee: parseFloat(e.target.value) })}
                                    className="w-32 text-right border border-gray-300  px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 whitespace-nowrap text-base font-medium text-gray-900">Consultation Fee</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right">
                                <input
                                    type="number"
                                    value={charges?.consultation_fee || 0}
                                    onChange={(e) => setCharges({ ...charges, consultation_fee: parseFloat(e.target.value) })}
                                    className="w-32 text-right border border-gray-300  px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 whitespace-nowrap text-base font-medium text-gray-900">Hospital Fee</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right">
                                <input
                                    type="number"
                                    value={charges?.registration_fee || 0}
                                    onChange={(e) => setCharges({ ...charges, registration_fee: parseFloat(e.target.value) })}
                                    className="w-32 text-right border border-gray-300  px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 whitespace-nowrap text-base font-medium text-gray-900">Medication Charges (Fixed/Base)</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right">
                                <input
                                    type="number"
                                    value={charges?.medication_fee || 0}
                                    onChange={(e) => setCharges({ ...charges, medication_fee: parseFloat(e.target.value) })}
                                    className="w-32 text-right border border-gray-300  px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2 whitespace-nowrap text-base font-medium text-gray-900">Miscellaneous</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right">
                                <input
                                    type="number"
                                    value={charges?.miscellaneous_fee || 0}
                                    onChange={(e) => setCharges({ ...charges, miscellaneous_fee: parseFloat(e.target.value) })}
                                    className="w-32 text-right border border-gray-300  px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-6 py-2 bg-green-600 text-white  shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    Save Default Charges
                </button>
            </div>
        </div>
    );
};

export default ChargeSummary;
