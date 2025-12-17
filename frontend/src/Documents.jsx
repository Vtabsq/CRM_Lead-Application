import React from 'react';
import { ExternalLink, FileText } from 'lucide-react';

const GOOGLE_SHEETS = [
    {
        name: 'Sheet1',
        url: 'https://docs.google.com/spreadsheets/d/1L4jwfA2R_MjT3kSsof93U3V-DKaM4zemGdKeCq2fy9Y/edit#gid=0',
        description: 'Main patient data sheet'
    },

    {
        name: 'Admission Details',
        url: 'https://docs.google.com/spreadsheets/d/13NOTcuCrFDrTVbow0GsWobcX84oGmAkjepOLCDRZKzw/edit?usp=sharing',
        description: 'Bed admission and discharge records'
    }
];

const Documents = () => {
    const handleViewSheet = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-3">
            <div className="bg-white  shadow-xl p-4 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <FileText className="w-8 h-8 text-blue-600" />
                            Documents
                        </h2>
                        <p className="text-gray-600 mt-2">Access and view available Google Sheets</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {GOOGLE_SHEETS.map((sheet, index) => (
                        <div
                            key={index}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50  p-4 border-2 border-blue-200 hover:border-green-400 transition-all shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">{sheet.name}</h3>
                                    <p className="text-sm text-gray-600">{sheet.description}</p>
                                </div>
                                <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                            </div>

                            <button
                                onClick={() => handleViewSheet(sheet.url)}
                                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold  hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View Sheet
                            </button>
                        </div>
                    ))}
                </div>


            </div>
        </div>
    );
};

export default Documents;
