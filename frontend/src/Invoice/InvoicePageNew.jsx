import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, User, Phone, MapPin, Calendar, IndianRupee,
    Plus, Minus, Trash2, Save, ArrowLeft, CheckCircle, X
} from 'lucide-react';

const InvoicePageNew = () => {
    const navigate = useNavigate();

    // State Management
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [invoiceItems, setInvoiceItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [notes, setNotes] = useState('');
    const [discount, setDiscount] = useState(0);
    const [taxRate, setTaxRate] = useState(0);

    const searchRef = useRef(null);

    // Mock Patient Data - TODO: Replace with API call to Google Sheets
    const mockPatients = [
        {
            memberId: 'CBESB02993',
            name: 'Jayalakshmi',
            age: 91,
            gender: 'Female',
            mobile: '8489901999',
            address: 'Rajendra B2, FF2, Rhythm Tango, Parson Shesh Nestle Apartment, Nanjundapuram, Coimbatore'
        },
        {
            memberId: 'CBESB04229',
            name: 'Jayalakshmi. B',
            age: 72,
            gender: 'Female',
            mobile: '9876543210',
            address: 'Ram Nagar, Coimbatore'
        },
        {
            memberId: 'CBESB04118',
            name: 'Vasantha Ramesh',
            age: 68,
            gender: 'Female',
            mobile: '9123456789',
            address: 'Saibaba Colony, Coimbatore'
        },
        {
            memberId: 'RSPAL01190',
            name: 'Varadan K',
            age: 75,
            gender: 'Male',
            mobile: '9988776655',
            address: 'RSP SNF, Coimbatore'
        },
        {
            memberId: 'CBESB04073',
            name: 'Ravisekar V',
            age: 70,
            gender: 'Male',
            mobile: '8877665544',
            address: 'Gandhipuram, Coimbatore'
        }
    ];

    // Mock Service Catalog - TODO: Replace with API call
    const serviceCategories = [
        {
            category: 'Home Care Services',
            services: [
                { id: 'HC001', name: 'Basic Home Care', price: 39900, unit: 'month' },
                { id: 'HC002', name: 'Advanced Home Care', price: 55000, unit: 'month' },
                { id: 'HC003', name: 'ICU Home Care', price: 75000, unit: 'month' }
            ]
        },
        {
            category: 'Medical Services',
            services: [
                { id: 'MS001', name: 'Physiotherapy Session', price: 1500, unit: 'session' },
                { id: 'MS002', name: 'Nursing Care (12 hours)', price: 2500, unit: 'day' },
                { id: 'MS003', name: 'Doctor Consultation', price: 1000, unit: 'visit' }
            ]
        },
        {
            category: 'Equipment Rental',
            services: [
                { id: 'ER001', name: 'Hospital Bed Rental', price: 5000, unit: 'month' },
                { id: 'ER002', name: 'Oxygen Concentrator', price: 8000, unit: 'month' },
                { id: 'ER003', name: 'Wheelchair Rental', price: 2000, unit: 'month' }
            ]
        }
    ];

    // Filter patients based on search term
    const filteredPatients = mockPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.memberId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle patient selection
    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        setSearchTerm(`${patient.memberId} - ${patient.name}`);
        setShowDropdown(false);
    };

    // Clear patient selection
    const clearPatientSelection = () => {
        setSelectedPatient(null);
        setSearchTerm('');
        setInvoiceItems([]);
    };

    // Add item to invoice
    const addInvoiceItem = () => {
        setInvoiceItems([...invoiceItems, {
            id: Date.now(),
            description: '',
            quantity: 1,
            unitPrice: 0
        }]);
    };

    // Update invoice item
    const updateInvoiceItem = (id, field, value) => {
        setInvoiceItems(invoiceItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    // Remove invoice item
    const removeInvoiceItem = (id) => {
        setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    };

    // Add service from catalog
    const addServiceToInvoice = (service) => {
        const existingItem = invoiceItems.find(item => item.description === service.name);
        if (existingItem) {
            updateInvoiceItem(existingItem.id, 'quantity', existingItem.quantity + 1);
        } else {
            setInvoiceItems([...invoiceItems, {
                id: Date.now(),
                description: service.name,
                quantity: 1,
                unitPrice: service.price
            }]);
        }
    };

    // Calculate totals
    const subtotal = invoiceItems.reduce((sum, item) =>
        sum + (item.quantity * item.unitPrice), 0
    );
    const taxAmount = (subtotal * taxRate) / 100;
    const grandTotal = subtotal + taxAmount - discount;

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Handle invoice creation
    const handleCreateInvoice = () => {
        if (!selectedPatient) {
            alert('Please select a patient');
            return;
        }
        if (invoiceItems.length === 0) {
            alert('Please add at least one item to the invoice');
            return;
        }

        // TODO: Replace with API call to save invoice
        const invoiceData = {
            patient: selectedPatient,
            items: invoiceItems,
            subtotal,
            tax: taxAmount,
            discount,
            grandTotal,
            paymentMethod,
            notes,
            createdAt: new Date().toISOString()
        };

        console.log('Invoice Data:', invoiceData);
        alert('Invoice created successfully! (Mock - Backend integration pending)');

        // Reset form
        clearPatientSelection();
        setInvoiceItems([]);
        setDiscount(0);
        setTaxRate(0);
        setNotes('');
    };

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl shadow-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/invoice')}
                            className="bg-white/20 p-2 rounded-lg backdrop-blur hover:bg-white/30 transition-all"
                        >
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Create Invoice</h1>
                            <p className="text-blue-100 text-sm">Search patient and create invoice</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Patient Search & Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Patient Search */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Search className="w-6 h-6 text-blue-600" />
                            Search Patient
                        </h2>

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
                                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                                />
                                {selectedPatient && (
                                    <button
                                        onClick={clearPatientSelection}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Dropdown */}
                            {showDropdown && searchTerm && !selectedPatient && (
                                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                                    {filteredPatients.length > 0 ? (
                                        filteredPatients.map((patient) => (
                                            <div
                                                key={patient.memberId}
                                                onClick={() => handlePatientSelect(patient)}
                                                className="p-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{patient.name}</p>
                                                        <p className="text-sm text-gray-600">ID: {patient.memberId}</p>
                                                    </div>
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
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
                    </div>

                    {/* Patient Details Card */}
                    {selectedPatient && (
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg p-6 border-2 border-green-300 animate-fadeIn">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User className="w-6 h-6 text-green-600" />
                                Patient Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/60 backdrop-blur rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-1">Patient Name</p>
                                    <p className="font-bold text-gray-900 text-lg">{selectedPatient.name}</p>
                                </div>

                                <div className="bg-white/60 backdrop-blur rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-1">Member ID</p>
                                    <p className="font-bold text-gray-900">{selectedPatient.memberId}</p>
                                </div>

                                <div className="bg-white/60 backdrop-blur rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Age & Gender
                                    </p>
                                    <p className="font-bold text-gray-900">{selectedPatient.age} Years | {selectedPatient.gender}</p>
                                </div>

                                <div className="bg-white/60 backdrop-blur rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                        <Phone className="w-4 h-4" />
                                        Mobile
                                    </p>
                                    <p className="font-bold text-gray-900">{selectedPatient.mobile}</p>
                                </div>

                                <div className="bg-white/60 backdrop-blur rounded-lg p-4 md:col-span-2">
                                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        Address
                                    </p>
                                    <p className="font-semibold text-gray-900">{selectedPatient.address}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Invoice Items */}
                    {selectedPatient && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Invoice Items</h3>
                                <button
                                    onClick={addInvoiceItem}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-md flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Item
                                </button>
                            </div>

                            {invoiceItems.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="mb-2">No items added yet</p>
                                    <p className="text-sm">Click "Add Item" or select from service catalog</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {invoiceItems.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                value={item.description}
                                                onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                value={item.quantity}
                                                onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                value={item.unitPrice}
                                                onChange={(e) => updateInvoiceItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                                            />
                                            <div className="w-32 text-right font-bold text-gray-900">
                                                {formatCurrency(item.quantity * item.unitPrice)}
                                            </div>
                                            <button
                                                onClick={() => removeInvoiceItem(item.id)}
                                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Totals */}
                            {invoiceItems.length > 0 && (
                                <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-700">Subtotal:</span>
                                        <span className="font-bold text-gray-900 text-lg">{formatCurrency(subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between items-center gap-4">
                                        <span className="font-semibold text-gray-700">Tax (%):</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={taxRate}
                                                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                                className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                                            />
                                            <span className="font-bold text-gray-900">{formatCurrency(taxAmount)}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center gap-4">
                                        <span className="font-semibold text-gray-700">Discount:</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={discount}
                                                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                                className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
                                        <span className="font-bold text-xl text-gray-900">Grand Total:</span>
                                        <span className="font-bold text-2xl text-green-700">{formatCurrency(grandTotal)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payment & Notes */}
                    {selectedPatient && invoiceItems.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Details</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Payment Method
                                    </label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                                    >
                                        <option>Cash</option>
                                        <option>Card</option>
                                        <option>UPI</option>
                                        <option>Bank Transfer</option>
                                        <option>Cheque</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Notes / Remarks
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows="3"
                                        placeholder="Add any additional notes or remarks..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleCreateInvoice}
                                className="w-full mt-6 bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                <Save className="w-6 h-6" />
                                Create Invoice
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column - Service Catalog */}
                <div className="bg-white rounded-xl shadow-lg p-6 max-h-[800px] overflow-y-auto">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 sticky top-0 bg-white pb-2">
                        Service Catalog
                    </h3>

                    {!selectedPatient ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>Select a patient first to add services</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {serviceCategories.map((category) => (
                                <div key={category.category}>
                                    <h4 className="font-bold text-gray-700 mb-3 pb-2 border-b-2 border-gray-200">
                                        {category.category}
                                    </h4>
                                    <div className="space-y-2">
                                        {category.services.map((service) => (
                                            <div
                                                key={service.id}
                                                onClick={() => addServiceToInvoice(service)}
                                                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 cursor-pointer transition-all group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h5 className="font-semibold text-gray-900 text-sm">{service.name}</h5>
                                                        <p className="text-xs text-gray-600">
                                                            {formatCurrency(service.price)} / {service.unit}
                                                        </p>
                                                    </div>
                                                    <Plus className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoicePageNew;
