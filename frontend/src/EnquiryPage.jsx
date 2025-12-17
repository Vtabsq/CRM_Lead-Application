import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Save, Loader2, CheckCircle, XCircle, User, Phone, Edit3, Upload } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';
const FIELDS_PER_PAGE = 10;
const FOLLOW_UP_PAGE_INDEX = 2;

const PAGE_TITLES = {
    0: 'Patient Information',
    1: 'Enquiry Details',
    2: 'Follow Up and Status'
};

const normalizeName = (name) => String(name || '').trim().toLowerCase().replace(/_/g, ' ');
const PATIENT_LOCATION_FIELD = 'patient location';
const AREA_FIELD = 'area';
const REJECTION_REASON_FIELD = 'reason for rejection';
const CLOSED_LOST_VALUE = 'closed - lost';
const LEAD_STATUS_FIELD = 'lead status';

const REQUIRED_FIELDS = new Set([
    'Memberidkey',
    'Attender name',
    'Patient name',
    'Patient location',
    'Gender',
    'Age',
    'Email id',
    'Mobile number',
    'Service',
    'Location',
    'Date',
    'Source',
    'Crm agent name',
    'Enquiry made for',
    'Lead status',
    'Active/inactive',
    'Closed date'
]);

const FOLLOW_SEQUENCE_RULES = [
    { follow: 'Follow_1_date', reminder: 'Reminder_date_1', prevFollow: null },
    { follow: 'Follow_2_date', reminder: 'Reminder_date_2', prevFollow: 'Follow_1_date' },
    { follow: 'Follow_3_date', reminder: 'Reminder_date_3', prevFollow: 'Follow_2_date' },
    { follow: 'Follow_4_date', reminder: null, prevFollow: 'Follow_3_date' }
];

const EnquiryPage = () => {
    const [fields, setFields] = useState([]);
    const [schema, setSchema] = useState([]);
    const [formData, setFormData] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState('');
    const [sheetUrl, setSheetUrl] = useState(null);

    const reorderFieldsForInquiryPage = (inputFields = []) => {
        if (!Array.isArray(inputFields) || inputFields.length === 0) return inputFields;
        const reordered = inputFields.slice();
        const targets = [
            { match: 'Gender', insertIndex: 4 },
            { match: 'Age', insertIndex: 5 },
            { match: 'Patient location', insertIndex: 6 },
            { match: 'Area', insertIndex: 7 },
            { match: 'Pain point', insertIndex: FIELDS_PER_PAGE },
            { match: 'Enquiry made for', insertIndex: FIELDS_PER_PAGE + 1 }
        ];

        targets.forEach(({ match, insertIndex }) => {
            const idx = reordered.findIndex(field => normalizeName(field?.name) === match);
            if (idx === -1) return;
            const [field] = reordered.splice(idx, 1);
            const normalizedIndex = Math.min(insertIndex, reordered.length);
            reordered.splice(normalizedIndex, 0, field);
        });

        const edIdx = reordered.findIndex(field => normalizeName(field?.name) === 'ed comments');
        if (edIdx > -1) {
            const [edField] = reordered.splice(edIdx, 1);
            reordered.push(edField);
        }
        return reordered;
    };

    const generateMemberId = () => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const timestamp = now.getTime();
        const numericalId = (timestamp % 100000) + Math.floor(Math.random() * 9000) + 1000;
        return `MID-${dateStr}-${numericalId}`;
    };

    const todayISODate = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const isMemberIdName = (name) => {
        const lower = (name || '').toLowerCase();
        return lower.includes('member') && (lower.includes('id') || lower.includes('key'));
    };

    const initializeFormData = (schemaList = schema) => {
        const initial = {};
        (schemaList || []).forEach(field => {
            const name = field?.name;
            if (!name) return;
            const dataType = String(field?.data_type || field?.type || '').toLowerCase();
            const nameLower = String(name).toLowerCase();
            if (isMemberIdName(name)) {
                initial[name] = generateMemberId();
            } else if (dataType === 'date') {
                if (nameLower === 'date') {
                    initial[name] = todayISODate();
                } else {
                    initial[name] = '';
                }
            } else {
                initial[name] = '';
            }
        });
        return initial;
    };

    const fetchFields = async () => {
        try {
            setLoading(true);
            setError('');
            // Default to 'enquiry' type
            const response = await axios.get(`${API_BASE_URL}/get_fields?type=enquiry`);
            const got = response.data.fields || [];
            const reorderedSchema = reorderFieldsForInquiryPage(got);
            setSchema(reorderedSchema);

            const initialData = initializeFormData(reorderedSchema);
            setFormData(initialData);
        } catch (err) {
            setError('Failed to load form fields.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFields();
    }, []);

    const toTitleCase = (str) => {
        return String(str || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    useEffect(() => {
        if (!schema || schema.length === 0) {
            setFields([]);
            return;
        }
        const mapped = schema.map(f => ({
            name: f.name,
            label: toTitleCase(f.label || f.name),
            type: f.data_type === 'phone' ? 'tel' : (f.data_type === 'text' ? 'text' : (f.data_type || f.type || 'text')),
            options: f.options || []
        }));
        const reorderedFields = reorderFieldsForInquiryPage(mapped);
        setFields(reorderedFields);
    }, [schema]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    // Date Parsing Helpers
    const parseDateToISO = (value) => {
        if (!value) return '';
        const trimmed = String(value).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
            const [part1, part2, year] = trimmed.split('/');
            let day = part1.padStart(2, '0');
            let month = part2.padStart(2, '0');
            // simple check for US vs UK format ambiguity if needed, but defaulting to DD/MM/YYYY usually
            // Logic from App.jsx:
            const first = parseInt(part1, 10);
            const second = parseInt(part2, 10);
            if (first <= 12 && second > 12) {
                day = part2.padStart(2, '0');
                month = part1.padStart(2, '0');
            }
            return `${year}-${month}-${day}`;
        }
        const parsed = new Date(trimmed);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }
        return trimmed;
    };

    const formatDateForSheet = (value) => {
        if (!value) return value;
        const trimmed = String(value).trim();
        // Return ISO format directly for consistency with backend filter
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            return trimmed;
        }
        // If it comes as DD/MM/YYYY or DD-MM-YYYY, convert to YYYY-MM-DD
        if (/^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(trimmed)) {
            const parts = trimmed.split(/[\/-]/);
            const day = parts[0];
            const month = parts[1];
            const year = parts[2];
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return trimmed;
    };

    const isDateFieldNameGlobal = (name) => {
        const lower = String(name || '').toLowerCase();
        return fields.some(f => String(f?.type).toLowerCase() === 'date' && String(f?.name || '').toLowerCase() === lower);
    };

    const convertDatesForPayload = (dataObj) => {
        if (!dataObj) return {};
        const cloned = { ...dataObj };
        Object.keys(cloned).forEach(key => {
            if (isDateFieldNameGlobal(key)) {
                cloned[key] = formatDateForSheet(cloned[key]);
            }
        });
        return cloned;
    };

    const isRequiredField = (name) => {
        // Normalize the field name for consistent comparison
        const normalizedName = normalizeName(name);

        // Reason for rejection is always optional
        if (normalizedName === REJECTION_REASON_FIELD) {
            return false;
        }

        // All other fields are mandatory
        return true;
    };

    const areaFieldName = useMemo(() => {
        const match = schema.find(f => normalizeName(f?.name) === AREA_FIELD);
        return match?.name || 'Area';
    }, [schema]);

    const areaOptionsByLocation = useMemo(() => {
        const map = {};
        const areaField = schema.find(f => normalizeName(f?.name) === AREA_FIELD);
        const options = areaField?.options || [];
        map.__all = options.slice();
        options.forEach(option => {
            if (!option) return;
            const parts = String(option).split('-');
            const locationKey = normalizeName(parts[0]);
            if (!locationKey) return;
            if (!map[locationKey]) { map[locationKey] = []; }
            map[locationKey].push(option);
        });
        return map;
    }, [schema]);

    const handleInputChange = (fieldName, value) => {
        if (isMemberIdName(fieldName)) return;
        const lower = String(fieldName || '').toLowerCase();

        let nextValue = isDateFieldNameGlobal(lower) ? parseDateToISO(value) : value;

        // Auto-capitalize first character for text inputs
        if (typeof nextValue === 'string' && nextValue.length > 0 && !isDateFieldNameGlobal(lower)) {
            nextValue = nextValue.charAt(0).toUpperCase() + nextValue.slice(1);
        }

        setFormData(prev => {
            const updated = { ...prev, [fieldName]: nextValue };

            // Cascading logic for Location -> Area
            if (normalizeName(fieldName) === PATIENT_LOCATION_FIELD) {
                const areaName = areaFieldName;
                if (areaName) {
                    const allowed = areaOptionsByLocation[normalizeName(nextValue)] || [];
                    if (!allowed.includes(updated[areaName])) {
                        updated[areaName] = '';
                    }
                }
            }
            // Cascading logic for Lead Status -> Reason
            if (normalizeName(fieldName) === LEAD_STATUS_FIELD) {
                const reasonName = schema.find(f => normalizeName(f?.name) === REJECTION_REASON_FIELD)?.name;
                const status = normalizeName(nextValue);
                const isRejectionStatus = status.includes('closed') || status.includes('rejected') || status === 'lost';

                if (reasonName && !isRejectionStatus) {
                    updated[reasonName] = '';
                }
            }

            // --- Dynamic Date Validation Logic ---
            // 1. If Follow-up Date changes, check if existing Reminder Date is now invalid (Reminder >= Follow)
            const ruleForFollow = FOLLOW_SEQUENCE_RULES.find(r => resolveFieldName(r.follow) === fieldName);
            if (ruleForFollow && ruleForFollow.reminder) {
                const reminderField = resolveFieldName(ruleForFollow.reminder);
                if (reminderField && updated[reminderField]) {
                    const followDate = new Date(nextValue);
                    const reminderDate = new Date(updated[reminderField]);
                    // If Reminder is same or after Follow-up, clear it
                    if (!isNaN(followDate.getTime()) && !isNaN(reminderDate.getTime())) {
                        if (reminderDate >= followDate) {
                            updated[reminderField] = ''; // Auto-clear
                        }
                    }
                }
            }

            return updated;
        });
    };

    const resolveFieldName = (targetName) => {
        const normalizedTarget = normalizeName(targetName);
        const match = schema.find(f => normalizeName(f?.name) === normalizedTarget);
        return match?.name || null;
    };

    const getFieldLabel = (name) => {
        const match = schema.find(f => String(f?.name || '').toLowerCase() === String(name || '').toLowerCase());
        return match?.label || match?.name || name;
    };

    const validateFollowReminderSequence = (dataObj) => {
        const messages = [];
        FOLLOW_SEQUENCE_RULES.forEach(rule => {
            const followField = resolveFieldName(rule.follow);
            if (!followField) return;
            const followLabel = getFieldLabel(followField);
            const followDateStr = dataObj[followField];

            // 1. Previous Follow Sequence Check
            if (rule.prevFollow) {
                const prevField = resolveFieldName(rule.prevFollow);
                if (prevField && dataObj[prevField] && followDateStr) {
                    if (new Date(followDateStr) <= new Date(dataObj[prevField])) {
                        messages.push(`${followLabel} must be after ${getFieldLabel(prevField)}.`);
                    }
                }
            }

            // 2. Reminder Date Check (Must be BEFORE Follow-up Date)
            if (rule.reminder) {
                const reminderField = resolveFieldName(rule.reminder);
                if (reminderField && dataObj[reminderField] && followDateStr) {
                    const rDate = new Date(dataObj[reminderField]);
                    const fDate = new Date(followDateStr);
                    if (rDate >= fDate) {
                        messages.push(`${getFieldLabel(reminderField)} must be BEFORE ${followLabel}.`);
                    }
                }
            }
        });
        return messages;
    };

    const findMissingRequiredFields = (dataObj) => {
        const missing = [];
        schema.forEach(field => {
            if (!isRequiredField(field?.name)) return;
            if (!dataObj[field.name]) missing.push(field.name);
        });
        return missing;
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setMessage(null);
            setError('');

            const missing = findMissingRequiredFields(formData);
            if (missing.length) {
                setError(`Missing mandatory fields: ${missing.join(', ')}`);
                setSubmitting(false);
                return;
            }

            const sequenceErrors = validateFollowReminderSequence(formData);
            if (sequenceErrors.length) {
                setError(sequenceErrors.join(' '));
                setSubmitting(false);
                return;
            }

            const payloadData = convertDatesForPayload(formData);
            const response = await axios.post(`${API_BASE_URL}/submit`, { data: payloadData });

            setMessage(response.data.message || 'Data submitted successfully!');
            if (response.data.sheet_url) setSheetUrl(response.data.sheet_url);

            setTimeout(() => {
                const reset = initializeFormData(schema);
                setFormData(reset);
                setCurrentPage(0);
                setMessage(null);
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const totalPages = Math.ceil(fields.length / FIELDS_PER_PAGE);
    const startIndex = currentPage * FIELDS_PER_PAGE;
    const endIndex = startIndex + FIELDS_PER_PAGE;
    const currentFields = fields.slice(startIndex, endIndex);

    const goToNextPage = () => { if (currentPage < totalPages - 1) setCurrentPage(p => p + 1); };
    const goToPreviousPage = () => { if (currentPage > 0) setCurrentPage(p => p - 1); };

    const viewSheet = async () => {
        if (sheetUrl) {
            window.open(sheetUrl, '_blank');
            return;
        }
        try {
            const res = await axios.get(`${API_BASE_URL}/debug/latest`);
            if (res.data?.sheet_url) window.open(res.data.sheet_url, '_blank');
        } catch {
            setError('Cannot open sheet.');
        }
    };

    const renderField = (field) => {
        // Basic rendering logic adapted from App.jsx
        const value = formData[field.name] || '';
        const isDropdown = field.type === 'dropdown' || (Array.isArray(field.options) && field.options.length > 0);

        // Check for read-only fields
        const lowerName = normalizeName(field.name);
        const isReadOnly = isMemberIdName(field.name) || lowerName === 'date';

        if (isDropdown) {
            let opts = field.options || [];
            if (normalizeName(field.name) === AREA_FIELD) {
                // For simplicity, just use the opts passed in field, assuming it's dynamic? 
                // Actually App.jsx updated fields state for area. Here I'm using raw fields.
                // I need to filter options based on location.
                // But actually I have `areaOptionsByLocation`.
                const locField = schema.find(f => normalizeName(f.name) === PATIENT_LOCATION_FIELD);
                if (locField) {
                    const locValue = formData[locField.name];
                    if (locValue && areaOptionsByLocation[normalizeName(locValue)]) {
                        opts = areaOptionsByLocation[normalizeName(locValue)];
                    }
                }
            }

            return (
                <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                    value={value}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    disabled={isReadOnly}
                >
                    <option value="">Select {field.label}</option>
                    {opts.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                    ))}
                </select>
            );
        }

        if (field.type === 'date') {
            // Calculate max date if this is a Reminder Date
            let maxDateAttr = undefined;
            const ruleForReminder = FOLLOW_SEQUENCE_RULES.find(r => resolveFieldName(r.reminder) === field.name);

            if (ruleForReminder) {
                const followField = resolveFieldName(ruleForReminder.follow);
                const followDateVal = formData[followField];
                if (followDateVal) {
                    // Max Date = Follow Date - 1 day
                    const d = new Date(followDateVal);
                    if (!isNaN(d.getTime())) {
                        d.setDate(d.getDate() - 1);
                        maxDateAttr = d.toISOString().split('T')[0];
                    }
                }
            }

            return (
                <input
                    type="date"
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none ${isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                    value={value}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    readOnly={isReadOnly}
                    disabled={isReadOnly}
                    max={maxDateAttr}
                />
            );
        }

        return (
            <input
                type={field.type === 'number' ? 'number' : 'text'}
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 outline-none ${isReadOnly ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                value={value}
                onChange={e => handleInputChange(field.name, e.target.value)}
                readOnly={isReadOnly}
                disabled={isReadOnly}
            />
        );
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="bg-white shadow-xl p-4 mb-2 border-2 border-blue-200 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-green-700">Enquiries</h2>
                    <p className="text-sm text-gray-600 mt-1">New Patient Entry Process</p>
                </div>
                <button onClick={viewSheet} className="px-6 py-1.5 text-2xl font-semibold border-2 border-green-400 text-green-700 hover:bg-green-50 shadow-md transition-all">
                    View Sheet
                </button>
            </div>

            {/* Messages */}
            {message && (
                <div className="bg-green-50 border-2 border-green-400 p-4 mb-2 flex items-center shadow-lg">
                    <CheckCircle className="w-10 h-10 text-green-600 mr-4" />
                    <p className="text-green-900 text-2xl font-semibold">{message}</p>
                </div>
            )}
            {error && (
                <div className="bg-red-50 border-2 border-red-400 p-4 mb-2 flex items-center shadow-lg">
                    <XCircle className="w-10 h-10 text-red-600 mr-4" />
                    <p className="text-red-900 text-2xl font-semibold">{error}</p>
                </div>
            )}

            {/* Stepper */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between relative px-4 my-4">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
                    {[0, 1, 2].map((stepIdx) => {
                        const stepIcons = [User, Edit3, Phone];
                        const Icon = stepIcons[stepIdx];
                        const isActive = currentPage >= stepIdx;
                        const isCurrent = currentPage === stepIdx;
                        return (
                            <div key={stepIdx} className="flex flex-col items-center bg-transparent px-0 cursor-pointer" onClick={() => setCurrentPage(stepIdx)}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-green-600 text-white shadow-lg scale-110' : 'bg-white border-2 border-gray-300 text-gray-400'}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-green-600' : 'text-gray-500'}`}>
                                    {PAGE_TITLES[stepIdx]}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Form Content */}
                <div className="bg-white shadow-xl p-10 mb-2 border-2 border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        {currentFields.map((field) => {
                            // Conditional Rendering for Reason for Rejection
                            if (normalizeName(field.name) === REJECTION_REASON_FIELD) {
                                const leadStatusField = schema.find(f => normalizeName(f.name) === LEAD_STATUS_FIELD);
                                const currentStatus = normalizeName(formData[leadStatusField?.name]);
                                const isVisible = currentStatus.includes('closed') || currentStatus.includes('rejected') || currentStatus === 'lost';
                                if (!isVisible) return null;
                            }

                            return (
                                <div key={field.name}>
                                    <label className="block text-base font-bold text-gray-800 mb-2">
                                        {field.label}
                                        {isRequiredField(field.name) && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    {renderField(field)}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pagination / Submit */}
                <div className="flex justify-between items-center mt-4 pb-10">
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 0}
                        className={`flex items-center px-8 py-2 text-xl font-bold transition-all shadow-lg ${currentPage === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-green-600 border-2 border-blue-600'}`}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                    </button>

                    {currentPage === totalPages - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center px-10 py-2 text-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:from-green-600 hover:to-green-700 shadow-xl transition-all disabled:bg-gray-400"
                        >
                            {submitting ? <Loader2 className="w-7 h-7 mr-3 animate-spin" /> : <Save className="w-7 h-7 mr-3" />}
                            Submit
                        </button>
                    ) : (
                        <button
                            onClick={goToNextPage}
                            className="flex items-center px-10 py-2 text-xl bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold hover:from-blue-600 hover:to-green-600 shadow-xl"
                        >
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnquiryPage;
