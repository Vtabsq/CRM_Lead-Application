import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Loader2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import API_BASE_URL from './config';

const NotificationSettings = () => {
    const navigate = useNavigate();
    const [senderEmail, setSenderEmail] = useState('');
    const [ccEmailsInput, setCcEmailsInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState('');

    const fetchNotificationSettings = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/notification_settings`);
            if (res.data?.sender_email) {
                setSenderEmail(res.data.sender_email);
            }
            if (Array.isArray(res.data?.cc_emails)) {
                setCcEmailsInput(res.data.cc_emails.join('\n'));
            } else {
                setCcEmailsInput('');
            }
        } catch (e) {
            console.error('Failed to load notification settings', e);
        }
    };

    useEffect(() => {
        fetchNotificationSettings();
    }, []);

    const parseCcInput = (value) => {
        if (!value) return [];
        return value.split(/[,\n]+/).map(item => item.trim()).filter(item => item);
    };

    const saveNotificationSettings = async () => {
        try {
            setLoading(true);
            setError('');
            setMessage(null);

            if (!senderEmail || !senderEmail.includes('@')) {
                setError('Please enter a valid sender email address.');
                setLoading(false);
                return;
            }

            const ccList = parseCcInput(ccEmailsInput);
            const res = await axios.post(`${API_BASE_URL}/notification_settings`, { sender_email: senderEmail, cc_emails: ccList });

            if (Array.isArray(res.data?.cc_emails)) {
                setCcEmailsInput(res.data.cc_emails.join('\n'));
            }
            setMessage(res.data?.status === 'success' ? 'Notification settings updated.' : 'Notification settings saved.');
        } catch (e) {
            setError(e.response?.data?.detail || 'Failed to save notification settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-xl p-10 mb-2 border-2 border-orange-200 w-full max-w-4xl mx-auto mt-6 rounded-lg">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-orange-600">Notification Settings</h2>
                    <p className="text-sm text-gray-600 mt-1">Configure sender and CC email recipients for alerts</p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center px-4 py-1.5 text-base border-2 border-gray-400 text-gray-700 font-semibold hover:bg-gray-50 shadow-md"
                >
                    <ChevronLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                </button>
            </div>

            {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 font-semibold">{message}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 font-semibold">{error}</div>}

            <div className="space-y-6">
                <div>
                    <label className="block text-xl font-semibold text-gray-800 mb-2">Sender Email</label>
                    <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        disabled
                        className="w-full px-4 py-2 border-2 border-orange-200 bg-gray-100 text-gray-700 cursor-not-allowed text-base rounded"
                        placeholder="e.g., notifications@yourdomain.com"
                    />
                    <p className="mt-2 text-sm text-gray-500">Sender email is fixed. To change it, contact the administrator.</p>
                </div>

                <div>
                    <label className="block text-xl font-semibold text-gray-800 mb-2">CC Email Addresses</label>
                    <p className="text-sm text-gray-500 mb-2">Enter one email per line or separate with commas. These recipients will be copied on every notification email.</p>
                    <textarea
                        value={ccEmailsInput}
                        onChange={(e) => setCcEmailsInput(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2 border-2 border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-base rounded"
                        placeholder="team@example.com&#10;manager@example.com"
                    />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600 italic">
                        Tip: Use this list for supervisors or team members who need visibility on every lead submission.
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2 text-base border-2 border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 rounded shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveNotificationSettings}
                            disabled={loading}
                            className="flex items-center px-8 py-2 text-base bg-orange-500 text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-60 rounded hover:bg-orange-600 transition-colors"
                        >
                            {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Bell className="w-5 h-5 mr-2" />}
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
