import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Edit, Receipt, User, Calendar, CreditCard } from 'lucide-react';

const InvoiceView = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Mock invoice data (in real app, fetch based on id)
    const mockInvoice = {
        invoiceNumber: 'INV-2025-001',
        date: '2025-12-18',
        status: 'Paid',
        patient: {
            name: 'Jayalakshmi',
            memberId: 'MID-2025-11-03-11592',
            age: 72,
            location: 'Coimbatore',
            phone: '+91 98765 43210'
        },
        visit: {
            visitId: 'VISIT-2025-001',
            admissionDate: '2025-12-01',
            dischargeDate: '2025-12-18',
            ward: 'General Ward'
        },
        items: [
            { id: 1, service: 'Basic Home Care', quantity: 1, unitPrice: 39900, total: 39900 },
            { id: 2, service: 'Physiotherapy Session', quantity: 3, unitPrice: 1500, total: 4500 },
            { id: 3, service: 'Doctor Consultation', quantity: 2, unitPrice: 1000, total: 2000 },
            { id: 4, service: 'Complete Blood Count', quantity: 1, unitPrice: 500, total: 500 }
        ],
        subtotal: 46900,
        tax: 0,
        discount: 0,
        grandTotal: 46900,
        paymentMethod: 'Cash',
        paymentDate: '2025-12-18'
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Cancelled':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    // Print invoice
    const handlePrint = () => {
        window.print();
    };

    // Download PDF (placeholder)
    const handleDownloadPDF = () => {
        alert('PDF download functionality will be implemented with backend integration');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl shadow-xl p-6 mb-6 print:hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/invoice')}
                            className="bg-white/20 p-2 rounded-lg backdrop-blur hover:bg-white/30 transition-all"
                        >
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Invoice Details</h1>
                            <p className="text-blue-100 text-sm">{mockInvoice.invoiceNumber}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2"
                        >
                            <Printer className="w-5 h-5" />
                            Print
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-all shadow-lg flex items-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Download PDF
                        </button>
                        <button
                            onClick={() => navigate('/invoice/create')}
                            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-all shadow-lg flex items-center gap-2"
                        >
                            <Edit className="w-5 h-5" />
                            Edit
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoice Content */}
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-5xl mx-auto">
                {/* Invoice Header */}
                <div className="border-b-2 border-gray-200 pb-6 mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Receipt className="w-8 h-8 text-blue-600" />
                                <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
                            </div>
                            <p className="text-gray-600">Grand World Elder Care</p>
                            <p className="text-gray-600 text-sm">Coimbatore, Tamil Nadu</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{mockInvoice.invoiceNumber}</p>
                            <p className="text-gray-600 text-sm mt-1">Date: {formatDate(mockInvoice.date)}</p>
                            <span className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold border ${getStatusColor(mockInvoice.status)}`}>
                                {mockInvoice.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Patient and Visit Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Patient Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-lg text-gray-800">Patient Information</h3>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-gray-600">Patient Name</p>
                                <p className="font-semibold text-gray-900">{mockInvoice.patient.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Member ID</p>
                                <p className="font-semibold text-gray-900">{mockInvoice.patient.memberId}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600">Age</p>
                                    <p className="font-semibold text-gray-900">{mockInvoice.patient.age} years</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Location</p>
                                    <p className="font-semibold text-gray-900">{mockInvoice.patient.location}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Phone</p>
                                <p className="font-semibold text-gray-900">{mockInvoice.patient.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Visit Information */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-green-600" />
                            <h3 className="font-bold text-lg text-gray-800">Visit Information</h3>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-gray-600">Visit ID</p>
                                <p className="font-semibold text-gray-900">{mockInvoice.visit.visitId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Admission Date</p>
                                <p className="font-semibold text-gray-900">{formatDate(mockInvoice.visit.admissionDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Discharge Date</p>
                                <p className="font-semibold text-gray-900">{formatDate(mockInvoice.visit.dischargeDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Ward</p>
                                <p className="font-semibold text-gray-900">{mockInvoice.visit.ward}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice Items Table */}
                <div className="mb-8">
                    <h3 className="font-bold text-xl text-gray-800 mb-4">Invoice Items</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-2 border-gray-200">
                            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-300">S.No</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-300">Service Description</th>
                                    <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 border-b-2 border-gray-300">Quantity</th>
                                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 border-b-2 border-gray-300">Unit Price</th>
                                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 border-b-2 border-gray-300">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockInvoice.items.map((item, index) => (
                                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-700">{index + 1}</td>
                                        <td className="px-4 py-3 text-gray-900 font-medium">{item.service}</td>
                                        <td className="px-4 py-3 text-center text-gray-700">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary Section */}
                <div className="flex justify-end mb-8">
                    <div className="w-full md:w-1/2 space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-semibold text-gray-700">Subtotal:</span>
                            <span className="font-bold text-gray-900">{formatCurrency(mockInvoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-semibold text-gray-700">Tax:</span>
                            <span className="font-bold text-gray-900">{formatCurrency(mockInvoice.tax)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="font-semibold text-gray-700">Discount:</span>
                            <span className="font-bold text-gray-900">-{formatCurrency(mockInvoice.discount)}</span>
                        </div>
                        <div className="flex justify-between py-3 bg-gradient-to-r from-green-50 to-blue-50 px-4 rounded-lg border-2 border-green-300">
                            <span className="font-bold text-xl text-gray-900">Grand Total:</span>
                            <span className="font-bold text-2xl text-green-700">{formatCurrency(mockInvoice.grandTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
                    <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        <h3 className="font-bold text-lg text-gray-800">Payment Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-600">Payment Method</p>
                            <p className="font-semibold text-gray-900">{mockInvoice.paymentMethod}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Payment Date</p>
                            <p className="font-semibold text-gray-900">{formatDate(mockInvoice.paymentDate)}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center text-gray-600 text-sm">
                    <p className="font-semibold">Thank you for choosing Grand World Elder Care</p>
                    <p className="mt-2">For any queries, please contact us at support@grandworld.com or +91 12345 67890</p>
                </div>
            </div>

            {/* Back Button (Print Hidden) */}
            <div className="mt-6 text-center print:hidden">
                <button
                    onClick={() => navigate('/invoice')}
                    className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg inline-flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Invoice List
                </button>
            </div>
        </div>
    );
};

export default InvoiceView;
