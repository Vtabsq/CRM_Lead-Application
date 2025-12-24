import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Trash2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import PatientSearch from '../components/PatientSearch';
import ServiceSelector from '../components/ServiceSelector';
import EditableDropdown from '../components/EditableDropdown';
import API_BASE_URL from '../config';

const InvoiceCreateNew = () => {
    const navigate = useNavigate();

    // State
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [visitId, setVisitId] = useState('');
    const [careCenter, setCareCenter] = useState('');
    const [corporateCustomer, setCorporateCustomer] = useState(false);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [bulkDiscount, setBulkDiscount] = useState(0);
    const [showServiceSelector, setShowServiceSelector] = useState(false);
    const [saving, setSaving] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
    };

    const handlePatientClear = () => {
        setSelectedPatient(null);
        setInvoiceItems([]);
    };

    const handleAddService = (service) => {
        setInvoiceItems([...invoiceItems, { ...service, id: Date.now() }]);
        setShowServiceSelector(false);
    };

    const handleRemoveItem = (itemId) => {
        setInvoiceItems(invoiceItems.filter(item => item.id !== itemId));
    };

    const handleUpdateItem = (itemId, field, value) => {
        setInvoiceItems(invoiceItems.map(item => {
            if (item.id === itemId) {
                const updated = { ...item, [field]: value };

                // Recalculate amount
                const price = parseFloat(updated.price) || 0;
                const qty = parseInt(updated.quantity) || 1;
                const discount = parseFloat(updated.discount) || 0;
                const taxAmount = parseFloat(updated.tax_amount) || 0;

                let amount = price * qty;
                amount -= discount;

                if (updated.tax_type === 'Exclusive of tax') {
                    amount += taxAmount;
                }

                updated.amount = amount;
                return updated;
            }
            return item;
        }));
    };

    // Calculate totals
    const cost = invoiceItems.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        return sum + (price * qty);
    }, 0);

    const discount = invoiceItems.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0);
    const tax = invoiceItems.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);
    const rounded = Math.round(cost - discount + tax - bulkDiscount);
    const finalAmount = rounded;

    const handleSave = async (status = 'Invoiced') => {
        if (!selectedPatient) {
            alert('Please select a patient');
            return;
        }

        if (!visitId || !careCenter) {
            alert('Please fill in Visit ID and Care Center');
            return;
        }

        if (invoiceItems.length === 0) {
            alert('Please add at least one service');
            return;
        }

        setSaving(true);
        try {
            const invoiceData = {
                patient_id: selectedPatient.patient_id,
                patient_name: selectedPatient.patient_name,
                visit_id: visitId,
                care_center: careCenter,
                corporate_customer: corporateCustomer,
                status: status, // Add status to invoice data
                services: invoiceItems.map(item => ({
                    service_name: item.service_name,
                    provider: item.provider,
                    perform_date: item.perform_date,
                    price: item.price,
                    quantity: item.quantity,
                    discount: item.discount,
                    tax_type: item.tax_type,
                    tax_amount: item.tax_amount,
                    amount: item.amount,
                    sold_by: item.sold_by,
                    external_provider: item.external_provider,
                    notes: item.notes
                })),
                total_amount: finalAmount
            };

            const response = await axios.post(`${API_BASE_URL}/api/invoices`, invoiceData);

            const statusMessage = status === 'Paid' ? 'Invoice created and marked as Paid!' : 'Invoice created successfully!';
            alert(`${statusMessage} Invoice ID: ${response.data.invoice_id}`);
            navigate(`/invoice?patient_id=${selectedPatient.patient_id}`);
        } catch (error) {
            console.error('Error creating invoice:', error);
            alert('Failed to create invoice. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Top Bar */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/invoice')}
                        className="bg-white/20 p-2 rounded-lg backdrop-blur hover:bg-white/30 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>

                    {selectedPatient ? (
                        <div className="flex items-center gap-3 bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
                            <div className="bg-yellow-500 w-8 h-8 rounded flex items-center justify-center text-white font-bold">
                                {selectedPatient.patient_name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-white font-semibold">{selectedPatient.patient_name}</p>
                                <p className="text-blue-100 text-xs">{selectedPatient.patient_id}</p>
                            </div>
                            <button
                                onClick={handlePatientClear}
                                className="ml-2 text-white hover:text-red-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="w-96">
                            <PatientSearch
                                onSelect={handlePatientSelect}
                                selectedPatient={selectedPatient}
                                onClear={handlePatientClear}
                            />
                        </div>
                    )}

                    {selectedPatient && (
                        <button
                            onClick={handlePatientClear}
                            className="bg-blue-400 px-4 py-2 rounded text-white text-sm font-medium hover:bg-blue-500"
                        >
                            Change
                        </button>
                    )}
                </div>

                <button
                    onClick={() => navigate('/invoice')}
                    className="bg-green-500 px-6 py-2 rounded text-white text-sm font-medium hover:bg-green-600 shadow-md"
                >
                    Create
                </button>
            </div>

            {/* Breadcrumb */}
            <div className="bg-white px-6 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <button
                        onClick={() => navigate('/invoice')}
                        className="hover:text-blue-600 hover:underline"
                    >
                        Invoice
                    </button>
                    <span>›</span>
                    <span className="text-gray-900 font-medium">
                        {selectedPatient ? `Invoice For ${selectedPatient.patient_name}` : 'Create Invoice'}
                    </span>
                </div>
            </div>

            {selectedPatient ? (
                <div className="flex-1 overflow-hidden flex">
                    {/* Left Side - Invoice Form */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white">
                        {/* Visit ID and Care Center */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Visit ID:
                                </label>
                                <EditableDropdown
                                    category="visit_id"
                                    value={visitId}
                                    onChange={setVisitId}
                                    placeholder="Select Visit ID"
                                    defaultOptions={['6276666', '6276667', '6276668']}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Care Center:
                                </label>
                                <EditableDropdown
                                    category="care_center"
                                    value={careCenter}
                                    onChange={setCareCenter}
                                    placeholder="Select Care Center"
                                    defaultOptions={['HC CBE', 'RSP SNF', 'Clinic - Ram Nagar']}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                                />
                            </div>

                            <div className="flex items-center">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={corporateCustomer}
                                        onChange={(e) => setCorporateCustomer(e.target.checked)}
                                        className="mr-2 w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Corporate Customer</span>
                                </label>
                            </div>
                        </div>

                        {/* Invoice Items Table */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-800">Services/Products</h3>
                                <button
                                    onClick={() => setShowServiceSelector(true)}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Service
                                </button>
                            </div>

                            {invoiceItems.length === 0 ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                                    <p className="text-gray-500 text-lg mb-2">Add Products/Services From Right List</p>
                                    <p className="text-gray-400 text-sm">Click "Add Service" button to get started →</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border border-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Services/Products</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Provider</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Unit Price</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Qty.</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Discount</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Tax</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Total</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {invoiceItems.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-sm">{item.service_name}</td>
                                                    <td className="px-4 py-2 text-sm">{item.provider || '-'}</td>
                                                    <td className="px-4 py-2 text-sm">₹{formatCurrency(item.price)}</td>
                                                    <td className="px-4 py-2 text-sm">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-sm">₹{formatCurrency(item.discount)}</td>
                                                    <td className="px-4 py-2 text-sm">
                                                        {item.tax_type === 'Non-taxable' ? 'N/A' : `₹${formatCurrency(item.tax_amount)}`}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm font-semibold">₹{formatCurrency(item.amount)}</td>
                                                    <td className="px-4 py-2">
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Totals Section */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="max-w-md ml-auto space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Cost:</span>
                                    <span className="font-semibold">₹{formatCurrency(cost)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Discount:</span>
                                    <span className="font-semibold">₹{formatCurrency(discount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax:</span>
                                    <span className="font-semibold">₹{formatCurrency(tax)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Bulk Discount:</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={bulkDiscount}
                                            onChange={(e) => setBulkDiscount(parseFloat(e.target.value) || 0)}
                                            className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                                            placeholder="0.00"
                                        />
                                        <span className="text-gray-400">|</span>
                                        <span className="text-gray-400">00</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Rounded:</span>
                                    <span className="font-semibold">₹{formatCurrency(rounded)}</span>
                                </div>
                                <div className="border-t-2 border-gray-300 pt-3 flex justify-between">
                                    <span className="text-lg font-bold text-gray-800">Final Amount:</span>
                                    <span className="text-lg font-bold text-green-600">₹{formatCurrency(finalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 mt-6">
                            <button
                                onClick={() => handleSave('Paid')}
                                disabled={saving}
                                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Processing...' : 'Receive Payment'}
                            </button>
                            <button
                                onClick={() => navigate('/invoice')}
                                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>

                    {/* Service Selector Modal */}
                    {showServiceSelector && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                            <div className="bg-white rounded-xl shadow-2xl w-11/12 h-5/6 flex flex-col">
                                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-800">Select Service</h2>
                                    <button
                                        onClick={() => setShowServiceSelector(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <ServiceSelector
                                        onAddService={handleAddService}
                                        onClose={() => setShowServiceSelector(false)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-white">
                    <div className="text-center text-gray-400">
                        <p className="text-2xl font-semibold mb-2">Please select a patient to create an invoice</p>
                        <p className="text-sm">Use the search box above to find a patient</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceCreateNew;
