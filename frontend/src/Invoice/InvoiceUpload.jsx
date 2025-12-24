import React from 'react';
import { Upload, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvoiceUpload = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 p-6">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl shadow-xl p-6 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/invoice')}
                        className="bg-white/20 p-2 rounded-lg backdrop-blur hover:bg-white/30 transition-all"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Invoice Upload</h1>
                        <p className="text-blue-100 text-sm">Upload invoices in bulk</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Invoice Upload</h2>
                <p className="text-gray-600 mb-6">This feature is coming soon</p>
                <button
                    onClick={() => navigate('/invoice')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
                >
                    Back to Invoice List
                </button>
            </div>
        </div>
    );
};

export default InvoiceUpload;
