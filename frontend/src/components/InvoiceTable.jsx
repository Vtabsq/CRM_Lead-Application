import React from 'react';
import { ChevronDown } from 'lucide-react';

const InvoiceTable = ({ invoices, onRowClick, loading }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-gray-600">Loading invoices...</p>
            </div>
        );
    }

    if (!invoices || invoices.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-semibold">No invoices found</p>
                <p className="text-sm mt-2">Try adjusting your filters or create a new invoice</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <ChevronDown className="w-4 h-4" />
                                INVOICED
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            PATIENT
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            PATIENT ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            INVOICE REF.
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            VISIT ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            CARE CENTER
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            STATUS
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            TOTAL AMT
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {invoices.map((invoice) => (
                        <tr
                            key={invoice.invoice_id}
                            onClick={() => onRowClick && onRowClick(invoice)}
                            className="hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                            <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex items-center gap-2">
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                    {invoice.invoice_date}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                                <span className="text-blue-600 hover:underline cursor-pointer">
                                    {invoice.patient_name}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{invoice.patient_id}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{invoice.invoice_id}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{invoice.visit_id}</td>
                            <td className="px-4 py-3 text-sm">
                                <span className="text-blue-600">{invoice.care_center}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{invoice.status}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                {formatCurrency(invoice.total_amount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InvoiceTable;
