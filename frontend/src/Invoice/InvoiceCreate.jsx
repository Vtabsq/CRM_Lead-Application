import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, User, Search, Plus, Minus, Trash2, Receipt, CheckCircle } from 'lucide-react';

const InvoiceCreate = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Patient Selection, 2: Service Selection
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedServices, setSelectedServices] = useState([]);

    // Mock patient data
    const mockPatients = [
        { id: 1, name: 'Jayalakshmi', memberId: 'MID-2025-11-03-11592', age: 72, location: 'Coimbatore' },
        { id: 2, name: 'Harish Kumar', memberId: 'MID-2025-11-03-8253', age: 68, location: 'Coimbatore' },
        { id: 3, name: 'Suman Reddy', memberId: 'MID-2025-11-04-9876', age: 75, location: 'Chennai' },
        { id: 4, name: 'Akaash Patel', memberId: 'MID-2025-11-05-5432', age: 70, location: 'Bangalore' },
        { id: 5, name: 'Priya Sharma', memberId: 'MID-2025-11-06-7890', age: 65, location: 'Mumbai' }
    ];

    // Mock service catalog
    const serviceCatalog = [
        {
            category: 'Home Care Services',
            services: [
                { id: 1, name: 'Basic Home Care', price: 39900, unit: 'month' },
                { id: 2, name: 'Advanced Home Care', price: 55000, unit: 'month' },
                { id: 3, name: 'ICU Home Care', price: 75000, unit: 'month' }
            ]
        },
        {
            category: 'Medical Services',
            services: [
                { id: 4, name: 'Physiotherapy Session', price: 1500, unit: 'session' },
                { id: 5, name: 'Nursing Care (12 hours)', price: 2500, unit: 'day' },
                { id: 6, name: 'Doctor Consultation', price: 1000, unit: 'visit' }
            ]
        },
        {
            category: 'Equipment Rental',
            services: [
                { id: 7, name: 'Hospital Bed Rental', price: 5000, unit: 'month' },
                { id: 8, name: 'Oxygen Concentrator', price: 8000, unit: 'month' },
                { id: 9, name: 'Wheelchair Rental', price: 2000, unit: 'month' }
            ]
        },
        {
            category: 'Lab Tests',
            services: [
                { id: 10, name: 'Complete Blood Count', price: 500, unit: 'test' },
                { id: 11, name: 'Blood Sugar Test', price: 300, unit: 'test' },
                { id: 12, name: 'ECG', price: 800, unit: 'test' }
            ]
        }
    ];

    // Filter patients based on search
    const filteredPatients = mockPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.memberId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Add service to invoice
    const addService = (service) => {
        const existing = selectedServices.find(s => s.id === service.id);
        if (existing) {
            setSelectedServices(selectedServices.map(s =>
                s.id === service.id ? { ...s, quantity: s.quantity + 1 } : s
            ));
        } else {
            setSelectedServices([...selectedServices, { ...service, quantity: 1 }]);
        }
    };

    // Update service quantity
    const updateQuantity = (serviceId, delta) => {
        setSelectedServices(selectedServices.map(s =>
            s.id === serviceId ? { ...s, quantity: Math.max(1, s.quantity + delta) } : s
        ).filter(s => s.quantity > 0));
    };

    // Remove service
    const removeService = (serviceId) => {
        setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
    };

    // Calculate totals
    const subtotal = selectedServices.reduce((sum, s) => sum + (s.price * s.quantity), 0);
    const tax = 0; // No tax for now
    const grandTotal = subtotal + tax;

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Generate invoice
    const handleGenerateInvoice = () => {
        // In real app, this would call backend API
        // For now, navigate to view page
        navigate('/invoice/view/new');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl shadow-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => step === 1 ? navigate('/invoice') : setStep(1)}
                            className="bg-white/20 p-2 rounded-lg backdrop-blur hover:bg-white/30 transition-all"
                        >
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Create Invoice</h1>
                            <p className="text-blue-100 text-sm">
                                Step {step} of 2: {step === 1 ? 'Select Patient' : 'Add Services'}
                            </p>
                        </div>
                    </div>
                    {/* Step Indicator */}
                    <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-white text-green-600' : 'bg-white/20 text-white'
                            }`}>
                            1
                        </div>
                        <div className="w-12 h-1 bg-white/30"></div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-white text-green-600' : 'bg-white/20 text-white'
                            }`}>
                            2
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 1: Patient Selection */}
            {step === 1 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <User className="w-6 h-6 text-blue-600" />
                        Select Patient
                    </h2>

                    {/* Search Bar */}
                    <div className="mb-6 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by patient name or member ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                        />
                    </div>

                    {/* Patient List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {filteredPatients.map((patient) => (
                            <div
                                key={patient.id}
                                onClick={() => setSelectedPatient(patient)}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedPatient?.id === patient.id
                                        ? 'border-green-500 bg-green-50 shadow-lg'
                                        : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{patient.name}</h3>
                                        <p className="text-sm text-gray-600">Member ID: {patient.memberId}</p>
                                        <p className="text-sm text-gray-600">Age: {patient.age} | Location: {patient.location}</p>
                                    </div>
                                    {selectedPatient?.id === patient.id && (
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Selected Patient Card */}
                    {selectedPatient && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6 mb-6">
                            <h3 className="font-bold text-lg text-gray-800 mb-3">Selected Patient</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-semibold text-gray-900">{selectedPatient.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Member ID</p>
                                    <p className="font-semibold text-gray-900">{selectedPatient.memberId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Age</p>
                                    <p className="font-semibold text-gray-900">{selectedPatient.age} years</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Location</p>
                                    <p className="font-semibold text-gray-900">{selectedPatient.location}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Next Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => setStep(2)}
                            disabled={!selectedPatient}
                            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${selectedPatient
                                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            Next: Add Services
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Service Selection */}
            {step === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Selected Services Panel (Left) */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Receipt className="w-6 h-6 text-blue-600" />
                            Invoice Items
                        </h2>

                        {selectedServices.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-semibold">No services added yet</p>
                                <p className="text-sm">Select services from the catalog on the right</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 mb-6">
                                    {selectedServices.map((service) => (
                                        <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{service.name}</h4>
                                                <p className="text-sm text-gray-600">{formatCurrency(service.price)} per {service.unit}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => updateQuantity(service.id, -1)}
                                                    className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-all"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="font-bold text-lg w-8 text-center">{service.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(service.id, 1)}
                                                    className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-all"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <span className="font-bold text-green-700 w-28 text-right">
                                                    {formatCurrency(service.price * service.quantity)}
                                                </span>
                                                <button
                                                    onClick={() => removeService(service.id)}
                                                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary */}
                                <div className="border-t-2 border-gray-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-semibold">Subtotal:</span>
                                        <span className="font-bold">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                        <span className="font-semibold">Tax:</span>
                                        <span className="font-bold">{formatCurrency(tax)}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-green-700 pt-2 border-t-2 border-gray-200">
                                        <span>Grand Total:</span>
                                        <span>{formatCurrency(grandTotal)}</span>
                                    </div>
                                </div>

                                {/* Generate Invoice Button */}
                                <div className="mt-6">
                                    <button
                                        onClick={handleGenerateInvoice}
                                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
                                    >
                                        Generate Invoice
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Service Catalog Panel (Right) */}
                    <div className="bg-white rounded-xl shadow-lg p-6 max-h-[800px] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Service Catalog</h2>

                        {serviceCatalog.map((category) => (
                            <div key={category.category} className="mb-6">
                                <h3 className="font-bold text-gray-700 mb-3 pb-2 border-b-2 border-gray-200">
                                    {category.category}
                                </h3>
                                <div className="space-y-2">
                                    {category.services.map((service) => (
                                        <div
                                            key={service.id}
                                            onClick={() => addService(service)}
                                            className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 cursor-pointer transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 text-sm">{service.name}</h4>
                                                    <p className="text-xs text-gray-600">{formatCurrency(service.price)} / {service.unit}</p>
                                                </div>
                                                <Plus className="w-5 h-5 text-green-600" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceCreate;
