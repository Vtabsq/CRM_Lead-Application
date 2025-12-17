import React, { useState, useEffect } from 'react';
import {
    User, Calendar, Phone, MapPin, Heart, Activity, FileText,
    CreditCard, Check, ChevronRight, ChevronLeft, Upload, Search, Bed, Edit3, Plus, Trash2
} from 'lucide-react';
import DynamicForm from './components/DynamicForm';
import axios from 'axios';
import { indianStates, getDistrictsForState, getCitiesForDistrict } from './locationData';

const AdmissionRegistration = ({ generateMemberId, onSearch, currentStep, onStepChange }) => {
    const [internalStep, setInternalStep] = useState(1);
    const step = currentStep !== undefined ? currentStep : internalStep;

    const setStep = (newStep) => {
        if (onStepChange) {
            onStepChange(newStep);
        } else {
            setInternalStep(newStep);
        }
    };

    const [chargeSettings, setChargeSettings] = useState({});

    const [dynamicFields, setDynamicFields] = useState([]);

    useEffect(() => {
        // Fetch Charge Settings
        axios.get('http://localhost:8000/api/settings/charges')
            .then(res => setChargeSettings(res.data))
            .catch(err => console.error("Error fetching charge settings", err));

        // Fetch Dynamic Schema
        axios.get('http://localhost:8000/get_fields?type=admission')
            .then(res => {
                setDynamicFields(res.data.fields || []);
            })
            .catch(err => console.error("Error fetching admission schema", err));
    }, []);

    // --- Field Categorization for Dynamic Rendering ---
    const getStepFields = (names) => dynamicFields.filter(f => names.includes(f.name));

    const step1Fields = getStepFields(['patient_name', 'patient_last_name', 'gender', 'date_of_birth', 'age', 'patient_blood', 'patient_marital_status', 'nationality', 'religion', 'aadhaar', 'id_proof_type', 'id_proof_number']);
    const step2Fields = getStepFields(['email_id', 'mobile_number', 'door_number', 'street', 'city', 'district', 'state', 'pin_code', 'district_other', 'state_other', 'city_other']);
    const step3Fields = getStepFields(['relational_name', 'relational_relationship', 'relational_mobile', 'relational_mobile_alternative', 'emergency_address']);
    const step4Fields = getStepFields(['patient_current_status', 'patient_medical_history', 'patient_surgery', 'patient_allergy', 'disabilities']);
    const step5Fields = getStepFields(['room_type', 'check_in_date', 'check_out_date', 'attender_name', 'caretaker_name', 'hospital_location', 'pain_point', 'providing_services']);

    // Step 6 gets everything else
    const allStepFields = new Set([...step1Fields, ...step2Fields, ...step3Fields, ...step4Fields, ...step5Fields].map(f => f.name));
    const step6Fields = dynamicFields.filter(f => !allStepFields.has(f.name));

    const initialPatientState = {
        member_id: '',
        patient_name: '',
        patient_last_name: '',
        gender: '',
        date_of_birth: '',
        age: '',
        patient_blood: '',
        patient_marital_status: '',
        nationality: 'Indian',
        religion: '',
        aadhaar: '',
        id_proof_type: 'Driving License',
        id_proof_number: '',
        photo: null,

        // Address & Contact
        email_id: '',
        mobile_number: '',
        door_number: '',
        street: '',
        city: '',
        district: '',
        state: '',
        pin_code: '',

        // Emergency
        relational_name: '',
        relational_relationship: '',
        relational_mobile: '',
        relational_mobile_alternative: '',
        emergency_address: '',

        // Medical
        patient_current_status: '',
        patient_surgery: '',
        patient_medical_history: '',
        patient_allergy: '',

        // Service Details
        room_type: '',
        check_in_date: '',
        check_out_date: '',
        attender_name: '',
        caretaker_name: '',
        hospital_location: '',
        pain_point: '',
        providing_services: '',

        // Charges (Backend Logic)
        room_rent: '',
        admission_days: '',
        room_charges: '',
        bed_charges: '',
        consultation_fee: '',
        registration_fee: '',
        medication_charges: '',
        miscellaneous_charges: '',
        total_amount: ''
    };

    const [patientAdmissionList, setPatientAdmissionList] = useState([initialPatientState]);

    const addRow = () => {
        setPatientAdmissionList(prev => [...prev, { ...initialPatientState, member_id: generateMemberId ? generateMemberId() : '' }]);
    };

    const removeRow = (index) => {
        if (patientAdmissionList.length > 1) {
            setPatientAdmissionList(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleRowChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        setPatientAdmissionList(prevList => {
            const list = [...prevList];
            const currentItem = { ...list[index] };

            const newValue = type === 'checkbox' ? checked : value;
            currentItem[name] = newValue || ''; // Ensure no undefined

            // Auto-calculate Total (Charge Logic)
            const chargeFields = ['room_type', 'room_rent', 'admission_days', 'bed_charges', 'consultation_fee', 'registration_fee', 'medication_charges', 'miscellaneous_charges'];

            if (chargeFields.includes(name)) {
                let currentRent = parseFloat(name === 'room_rent' ? newValue : currentItem.room_rent) || 0;

                // Auto-set Rent based on Room Type if Room Type changed
                if (name === 'room_type') {
                    if (newValue === 'Single') currentRent = chargeSettings.single_bed_price || 0;
                    else if (newValue === 'Twin') currentRent = chargeSettings.twin_bed_price || 0;
                    else if (newValue === 'ICU') currentRent = chargeSettings.icu_bed_price || 0;
                    else if (newValue === 'General') currentRent = chargeSettings.general_bed_price || 0;
                    currentItem.room_rent = currentRent;
                }

                const days = parseFloat(name === 'admission_days' ? newValue : currentItem.admission_days) || 0;
                const roomCharges = currentRent * days;
                currentItem.room_charges = roomCharges;

                const bed = parseFloat(name === 'bed_charges' ? newValue : currentItem.bed_charges) || 0;
                const consult = parseFloat(name === 'consultation_fee' ? newValue : currentItem.consultation_fee) || 0;
                const reg = parseFloat(name === 'registration_fee' ? newValue : currentItem.registration_fee) || 0;
                const meds = parseFloat(name === 'medication_charges' ? newValue : currentItem.medication_charges) || 0;
                const misc = parseFloat(name === 'miscellaneous_charges' ? newValue : currentItem.miscellaneous_charges) || 0;

                currentItem.total_amount = roomCharges + bed + consult + reg + meds + misc;
            }

            // Age Calculation
            if (name === 'date_of_birth' && newValue) {
                const birthDate = new Date(newValue);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                currentItem.age = age.toString();
            }

            // Cascading Location Logic
            if (name === 'state') {
                currentItem.district = '';
                currentItem.city = '';
                currentItem.state_other = '';
                currentItem.district_other = '';
                currentItem.city_other = '';
            }
            if (name === 'district') {
                currentItem.city = '';
                currentItem.district_other = '';
                currentItem.city_other = '';
            }
            if (name === 'city') {
                currentItem.city_other = '';
            }

            list[index] = currentItem;
            return list;
        });
    };

    const updatePatientField = (index, field, value) => {
        setPatientAdmissionList(prev => {
            const list = [...prev];
            if (!list[index]) return list;
            list[index] = { ...list[index], [field]: value };
            return list;
        });
    };

    const [loading, setLoading] = useState(false);
    const [beds, setBeds] = useState([]);
    const [patients, setPatients] = useState([]);
    const [patientHeaders, setPatientHeaders] = useState([]);

    // --- View Admissions State ---
    const [showViewModal, setShowViewModal] = useState(false);
    const [admissionRecords, setAdmissionRecords] = useState([]);
    const [loadingAdmissions, setLoadingAdmissions] = useState(false);

    const fetchAdmissions = async () => {
        setLoadingAdmissions(true);
        try {
            const res = await axios.get('http://localhost:8000/patient-admission/view');
            if (res.data.status === 'success') {
                setAdmissionRecords(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching admissions:", error);
            alert("Failed to load admissions.");
        } finally {
            setLoadingAdmissions(false);
        }
    };

    useEffect(() => {
        if (showViewModal) {
            fetchAdmissions();
        }
    }, [showViewModal]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [bedsRes, patientsRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/beds'),
                    axios.get('http://localhost:8000/search_data?limit=1000')
                ]);
                setBeds(bedsRes.data.beds || []);
                setPatients(patientsRes.data.rows || []);
                setPatientHeaders(patientsRes.data.headers || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        if (patientAdmissionList[0].member_id === '' && generateMemberId) {
            setPatientAdmissionList(prev => {
                const list = [...prev];
                list[0] = { ...list[0], member_id: generateMemberId() };
                return list;
            });
        }
    }, [generateMemberId]);

    // Memoize header indices
    const headerIndices = React.useMemo(() => {
        if (!patientHeaders || !patientHeaders.length) return { idIdx: -1, nameIdx: -1, genderIdx: -1, phoneIdx: -1, emailIdx: -1, dobIdx: -1, addressIdx: -1 };
        const find = (regex) => patientHeaders.findIndex(h => regex.test(h));
        return {
            idIdx: find(/member.*id|key/i),
            nameIdx: find(/name|patient/i),
            genderIdx: find(/gender|sex/i),
            phoneIdx: find(/mobile|phone|contact/i),
            emailIdx: find(/email/i),
            dobIdx: find(/dob|birth/i),
            addressIdx: find(/address/i),
            aadhaarIdx: find(/aadhaar/i)
        };
    }, [patientHeaders]);

    // Memoize occupied IDs
    const occupiedMemberIds = React.useMemo(() => {
        return new Set(beds.filter(b => b.status === 'Occupied' && b.member_id).map(b => String(b.member_id).trim().toLowerCase()));
    }, [beds]);

    // Filter available patients
    const availablePatientOptions = React.useMemo(() => {
        if (!patients || !patients.length) return [];
        const { idIdx, nameIdx } = headerIndices;

        return patients.map((row, i) => {
            let id = '', name = 'Unknown';
            if (Array.isArray(row)) {
                if (idIdx !== -1) id = String(row[idIdx] || '').trim();
                if (nameIdx !== -1) name = row[nameIdx];
            } else if (typeof row === 'object') {
                const keys = Object.keys(row);
                const idKey = keys.find(k => /member.*id|key/i.test(k));
                const nameKey = keys.find(k => /name|patient/i.test(k));
                if (idKey) id = String(row[idKey]).trim();
                if (nameKey) name = row[nameKey];
            }
            // Filter
            if (!id) return null;
            if (occupiedMemberIds.has(id.toLowerCase())) return null;

            return { id, name, key: i, original: row };
        }).filter(item => item !== null);
    }, [patients, headerIndices, occupiedMemberIds]);

    const handleMemberSelect = (index, e) => {
        const val = e.target.value;
        const selectedOption = availablePatientOptions.find(opt => opt.id === val);

        setPatientAdmissionList(prev => {
            const list = [...prev];
            const currentItem = { ...list[index] };

            if (!selectedOption) {
                currentItem.memberId = val; // Just set the ID
                list[index] = currentItem;
                return list;
            }

            const row = selectedOption.original;
            // SMART PARSER implementation
            let rowVals = [];
            if (Array.isArray(row)) rowVals = row;
            else if (typeof row === 'object') rowVals = Object.values(row);
            rowVals = rowVals.map(v => String(v).trim());

            let foundId = '', foundGender = '', foundEmail = '', foundPhone = '', foundDob = '', foundName = '', foundAge = '';

            const idRegex = /MID-\d{4}-\d{2}-\d{2}-\d+/i;
            const genderRegex = /^(male|female|other)$/i;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^[6-9]\d{9}$/;
            const dateRegex = /^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/;

            rowVals.forEach((v) => {
                if (!v) return;
                if (!foundId && idRegex.test(v)) foundId = v;
                else if (!foundGender && genderRegex.test(v)) foundGender = v;
                else if (!foundEmail && emailRegex.test(v)) foundEmail = v;
                else if (!foundPhone && phoneRegex.test(v.replace(/\D/g, ''))) foundPhone = v;
                else if (!foundDob && dateRegex.test(v)) foundDob = v;
            });

            for (let i = 0; i < Math.min(rowVals.length, 6); i++) {
                const v = rowVals[i];
                if (!v || v === foundId || dateRegex.test(v) || genderRegex.test(v) || emailRegex.test(v) || /\d/.test(v)) continue;
                if (!foundName) { foundName = v; break; }
            }

            rowVals.forEach(v => {
                if (!v) return;
                if (/^\d{1,3}$/.test(v) && Number(v) > 0 && Number(v) < 120 && v.length < 4 && !foundAge) foundAge = v;
            });

            const nameParts = (foundName || 'Unknown').split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            currentItem.member_id = foundId || val;
            currentItem.patient_name = firstName;
            currentItem.patient_last_name = lastName;
            currentItem.gender = foundGender || currentItem.gender;
            currentItem.mobile_number = foundPhone || currentItem.mobile_number;
            currentItem.email_id = foundEmail || currentItem.email_id;
            currentItem.age = foundAge || currentItem.age;
            currentItem.date_of_birth = foundDob || currentItem.date_of_birth;

            if (foundDob) {
                const parts = foundDob.split(/[\/\-]/);
                if (parts.length === 3) {
                    const day = parseInt(parts[0], 10);
                    const month = parseInt(parts[1], 10) - 1;
                    const year = parseInt(parts[2], 10);
                    const birthDate = new Date(year, month, day);
                    if (!isNaN(birthDate.getTime())) {
                        const fmtMonth = String(month + 1).padStart(2, '0');
                        const fmtDay = String(day).padStart(2, '0');
                        currentItem.date_of_birth = `${year}-${fmtMonth}-${fmtDay}`;

                        // Recalc age logic
                        const today = new Date();
                        let a = today.getFullYear() - birthDate.getFullYear();
                        if (today.getMonth() < month || (today.getMonth() === month && today.getDate() < day)) a--;
                        if (!currentItem.age) currentItem.age = a.toString();
                    }
                }
            }

            list[index] = currentItem;
            return list;
        });
    };



    // --- Validation Configuration ---
    const STEP_REQUIRED_FIELDS = {
        1: ['member_id', 'patient_name', 'patient_last_name', 'gender', 'date_of_birth', 'age', 'patient_blood', 'patient_marital_status', 'nationality', 'religion', 'aadhaar', 'id_proof_type', 'id_proof_number'],
        2: ['email_id', 'mobile_number', 'door_number', 'street', 'state', 'district', 'city', 'pin_code'],
        3: ['relational_name', 'relational_relationship', 'relational_mobile', 'emergency_address'],
        4: ['patient_current_status', 'patient_medical_history', 'patient_allergy'],
        5: ['room_type', 'hospital_location', 'check_in_date', 'check_out_date', 'attender_name', 'caretaker_name', 'pain_point', 'providing_services', 'room_rent']
    };

    const isFieldRequired = (name) => {
        return Object.values(STEP_REQUIRED_FIELDS).some(fields => fields.includes(name));
    };

    const handleSubmit = async () => {
        for (let i = 0; i < patientAdmissionList.length; i++) {
            const patient = patientAdmissionList[i];
            const rowNum = i + 1;

            for (let s = 1; s <= 5; s++) {
                const fields = STEP_REQUIRED_FIELDS[s];
                for (const key of fields) {
                    const val = patient[key];
                    if (!val || (typeof val === 'string' && val.trim() === "") || (Array.isArray(val) && val.length === 0)) {
                        const formatName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        alert(`Row ${rowNum} (Step ${s}): Please fill the required field: ${formatName}`);
                        setStep(s); // Jump to error step
                        return;
                    }
                }
            }
        }

        try {
            setLoading(true);
            // Dynamic Payload - The state already uses snake_case keys matching schema!
            const formattedRows = patientAdmissionList.map(patient => ({
                ...patient,
                // Add legacy 'Date' if needed for backend/sheets compatibility, though schema has 'date'
                'date': patient.date || new Date().toISOString().split('T')[0],
                // Add computed total amount if not present (logic in handleRowChange should have set it)
                'total_amount': patient.total_amount || 0
            }));

            // Send as { rows: [...] }
            await axios.post('http://localhost:8000/patient-admission/save', { rows: formattedRows });

            alert('Admissions Registered Successfully!');
            // Reset to 1 empty row
            setPatientAdmissionList([{ ...initialPatientState, member_id: generateMemberId ? generateMemberId() : '' }]);
            setStep(1);
        } catch (error) {
            console.error(error);
            alert('Failed to register admission: ' + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: "Personal Details", icon: User },
        { id: 2, title: "Contact Info", icon: Phone },
        { id: 3, title: "Emergency", icon: Heart },
        { id: 4, title: "Medical History", icon: Activity },
        { id: 5, title: "Service Details", icon: FileText },
    ];


    // --- Validation Logic ---
    const handleNext = () => {
        const currentFields = STEP_REQUIRED_FIELDS[step] || [];

        for (let i = 0; i < patientAdmissionList.length; i++) {
            const rowData = patientAdmissionList[i];
            const rowNum = i + 1;

            // 1. Check Standard Fields
            for (const key of currentFields) {
                const val = rowData[key];
                if (!val || (typeof val === 'string' && val.trim() === "") || (Array.isArray(val) && val.length === 0)) {
                    // Formatting field name for alert
                    const formatName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    alert(`Row ${rowNum}: Please fill the required field: ${formatName}`);
                    return;
                }
            }
        }

        // Proceed
        setStep(Math.min(5, step + 1));
    };

    // Calculate Dynamic Fields (Exclude Hardcoded ones)
    const knownFields = new Set([
        'patient_name', 'patient_last_name', 'gender', 'date_of_birth', 'age', 'patient_blood', 'patient_marital_status',
        'nationality', 'religion', 'aadhaar', 'id_proof_type', 'id_proof_number',
        'email_id', 'mobile_number', 'door_number', 'street', 'state', 'district', 'city', 'pin_code', 'district_other',
        'relational_name', 'relational_relationship', 'relational_mobile', 'relational_mobile_alternative', 'emergency_address',
        'patient_current_status', 'patient_medical_history', 'patient_surgery', 'patient_allergy',
        'room_type', 'check_in_date', 'check_out_date', 'attender_name', 'caretaker_name', 'hospital_location', 'pain_point', 'providing_services',
        'member_id_key', 'date'
    ]);

    const renderedDynamicFields = React.useMemo(() => {
        return dynamicFields.filter(f => !knownFields.has(f.name));
    }, [dynamicFields]);

    const renderDynamicField = (field, formData, index) => {
        if (!field) return null;
        const val = formData[field.name] || '';
        const required = isFieldRequired(field.name);

        if (field.data_type === 'dropdown' || (field.options && field.options.length > 0)) {
            return (
                <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label} {required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                        name={field.name}
                        value={val}
                        required={required}
                        onChange={(e) => handleRowChange(index, e)}
                        className="w-full h-9 border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="">Select {field.label}</option>
                        {(field.options || []).map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            );
        }

        return (
            <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                    type={field.data_type === 'number' ? 'number' : (field.data_type === 'date' ? 'date' : 'text')}
                    name={field.name}
                    value={val}
                    required={required}
                    onChange={(e) => handleRowChange(index, e)}
                    className="w-full h-9 border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
            </div>
        );
    };

    return (
        <div className="w-full p-4 bg-gray-50 min-h-screen">

            {/* Top Toolbar */}
            <div className="flex justify-end mb-4 px-1">
                <button
                    onClick={() => setShowViewModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
                >
                    <FileText className="w-4 h-4" />
                    View Admissions
                </button>
            </div>



            {/* Progress Steps */}
            <div className="mb-3">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />

                    {steps.map((s, idx) => {
                        const isActive = step >= s.id;
                        const isCurrent = step === s.id;
                        return (
                            <div key={s.id} className="flex flex-col items-center bg-gray-50 px-2 cursor-pointer" onClick={() => setStep(s.id)}>
                                <div
                                    className={`
                                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                                ${isActive ? 'bg-green-600 text-white shadow-lg scale-110' : 'bg-white border-2 border-gray-300 text-gray-400'}
                            `}
                                >
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <span className={`text-sm mt-2 font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {s.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white  shadow-xl border border-gray-100 overflow-hidden mb-8">
                <div className="p-5">

                    {/* Step 1: Personal Details */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            {patientAdmissionList.map((formData, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-md font-bold text-gray-700">Patient {index + 1}</h3>
                                        {patientAdmissionList.length > 1 && (
                                            <button
                                                onClick={() => removeRow(index)}
                                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                title="Remove Patient"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Member Select Per Row */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Member (Auto-fill)</label>
                                        <div className="relative">
                                            <select
                                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 text-sm"
                                                onChange={(e) => handleMemberSelect(index, e)}
                                                value={availablePatientOptions.find(o => o.id === formData.member_id) ? formData.member_id : ''}
                                            >
                                                <option value="">-- Select Member ID --</option>
                                                {availablePatientOptions.map((opt) => (
                                                    <option key={opt.key} value={opt.id}>
                                                        {opt.id} - {opt.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>

                                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Personal Information</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                MemberIdKey <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="member_id"
                                                value={formData.member_id || ''}
                                                readOnly
                                                className="w-full h-9 border border-gray-300 rounded-md px-4 py-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
                                            />
                                        </div>
                                        {renderDynamicField(step1Fields.find(f => f.name === 'patient_name') || { name: 'patient_name', label: 'First Name', data_type: 'text' }, formData, index)}
                                        {renderDynamicField(step1Fields.find(f => f.name === 'patient_last_name') || { name: 'patient_last_name', label: 'Last Name', data_type: 'text' }, formData, index)}

                                        {renderDynamicField(step1Fields.find(f => f.name === 'gender') || { name: 'gender', label: 'Gender', data_type: 'dropdown', options: ['Male', 'Female', 'Other'] }, formData, index)}
                                        {renderDynamicField(step1Fields.find(f => f.name === 'date_of_birth') || { name: 'date_of_birth', label: 'Date of Birth', data_type: 'date' }, formData, index)}
                                        {renderDynamicField(step1Fields.find(f => f.name === 'age') || { name: 'age', label: 'Age', data_type: 'number' }, formData, index)}

                                        {renderDynamicField(step1Fields.find(f => f.name === 'patient_blood') || { name: 'patient_blood', label: 'Blood Group', data_type: 'dropdown' }, formData, index)}
                                        {renderDynamicField(step1Fields.find(f => f.name === 'patient_marital_status') || { name: 'patient_marital_status', label: 'Marital Status', data_type: 'dropdown' }, formData, index)}
                                        {renderDynamicField(step1Fields.find(f => f.name === 'nationality') || { name: 'nationality', label: 'Nationality', data_type: 'dropdown' }, formData, index)}

                                        {renderDynamicField(step1Fields.find(f => f.name === 'religion') || { name: 'religion', label: 'Religion', data_type: 'dropdown' }, formData, index)}
                                        {renderDynamicField(step1Fields.find(f => f.name === 'aadhaar') || { name: 'aadhaar', label: 'Aadhaar Number', data_type: 'number' }, formData, index)}

                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                {renderDynamicField(step1Fields.find(f => f.name === 'id_proof_type') || { name: 'id_proof_type', label: 'ID Proof', data_type: 'dropdown', options: ['Driving License', 'Aadhaar Card', 'PAN Card'] }, formData, index)}
                                            </div>
                                            <div className="flex-1">
                                                {renderDynamicField(step1Fields.find(f => f.name === 'id_proof_number') || { name: 'id_proof_number', label: 'ID Number', data_type: 'text' }, formData, index)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 2: Contact & Address */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            {patientAdmissionList.map((formData, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                                    <h3 className="text-md font-bold text-gray-700 mb-4">Patient {index + 1}: Contact & Address</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {renderDynamicField(step2Fields.find(f => f.name === 'email_id') || { name: 'email_id', label: 'Email ID', data_type: 'email' }, formData, index)}
                                        {renderDynamicField(step2Fields.find(f => f.name === 'mobile_number') || { name: 'mobile_number', label: 'Mobile Number', data_type: 'tel' }, formData, index)}

                                        {renderDynamicField(step2Fields.find(f => f.name === 'door_number') || { name: 'door_number', label: 'Door Number', data_type: 'text' }, formData, index)}
                                        {renderDynamicField(step2Fields.find(f => f.name === 'street') || { name: 'street', label: 'Street', data_type: 'text' }, formData, index)}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
                                            <div>
                                                {renderDynamicField({ ...step2Fields.find(f => f.name === 'state'), name: 'state', label: 'State', data_type: 'dropdown', options: indianStates }, formData, index)}
                                                {formData.state === 'Other' && (
                                                    <div className="mt-2">
                                                        {renderDynamicField({ name: 'state_other', label: 'Specify State', data_type: 'text' }, formData, index)}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                {renderDynamicField({ ...step2Fields.find(f => f.name === 'district'), name: 'district', label: 'District', data_type: 'dropdown', options: getDistrictsForState(formData.state) }, formData, index)}
                                                {formData.district === 'Other' && (
                                                    <div className="mt-2">
                                                        {renderDynamicField({ name: 'district_other', label: 'Specify District', data_type: 'text' }, formData, index)}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                {renderDynamicField({ ...step2Fields.find(f => f.name === 'city'), name: 'city', label: 'City', data_type: 'dropdown', options: getCitiesForDistrict(formData.district) }, formData, index)}
                                                {formData.city === 'Other' && (
                                                    <div className="mt-2">
                                                        {renderDynamicField({ name: 'city_other', label: 'Specify City', data_type: 'text' }, formData, index)}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                {renderDynamicField(step2Fields.find(f => f.name === 'pin_code') || { name: 'pin_code', label: 'Pincode', data_type: 'number', placeholder: '6-digit pincode' }, formData, index)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 3: Emergency Contact */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            {patientAdmissionList.map((formData, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                                    <h3 className="text-md font-bold text-gray-700 mb-4">Patient {index + 1}: Emergency Contact</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {renderDynamicField(step3Fields.find(f => f.name === 'relational_name') || { name: 'relational_name', label: 'Contact Name', data_type: 'text' }, formData, index)}
                                        {renderDynamicField(step3Fields.find(f => f.name === 'relational_relationship') || { name: 'relational_relationship', label: 'Relationship', data_type: 'dropdown', options: ['Spouse', 'Parent', 'Sibling', 'Friend', 'Other'] }, formData, index)}

                                        {renderDynamicField(step3Fields.find(f => f.name === 'relational_mobile') || { name: 'relational_mobile', label: 'Contact Number', data_type: 'tel' }, formData, index)}
                                        {renderDynamicField(step3Fields.find(f => f.name === 'relational_mobile_alternative') || { name: 'relational_mobile_alternative', label: 'Alternate Contact (Optional)', data_type: 'tel' }, formData, index)}

                                        <div className="col-span-1 md:col-span-2">
                                            {renderDynamicField(step3Fields.find(f => f.name === 'emergency_address') || { name: 'emergency_address', label: 'Address', data_type: 'textarea' }, formData, index)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 4: Medical History */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            {patientAdmissionList.map((formData, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                                    <h3 className="text-md font-bold text-gray-700 mb-4">Patient {index + 1}: Medical History</h3>
                                    <div className="space-y-4">
                                        {/* Existing Conditions Checkboxes */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Existing Conditions <span className="text-red-500">*</span></label>
                                            <div className="flex flex-wrap gap-4">
                                                {['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Other'].map(cond => (
                                                    <label key={cond} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={(formData.patient_current_status || '').includes(cond)}
                                                            onChange={(e) => {
                                                                const current = (formData.patient_current_status || '').split(',').filter(Boolean);
                                                                let updated;
                                                                if (e.target.checked) updated = [...current, cond];
                                                                else updated = current.filter(c => c !== cond);
                                                                const event = { target: { name: 'patient_current_status', value: updated.join(',') } };
                                                                handleRowChange(index, event);
                                                            }}
                                                            className="rounded text-green-600 focus:ring-green-500"
                                                        />
                                                        <span className="text-sm text-gray-700">{cond}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {renderDynamicField(step4Fields.find(f => f.name === 'patient_medical_history') || { name: 'patient_medical_history', label: 'Current Medications', data_type: 'textarea', placeholder: 'List current medications...' }, formData, index)}
                                        {renderDynamicField(step4Fields.find(f => f.name === 'patient_surgery') || { name: 'patient_surgery', label: 'Past Surgeries / Hospitalizations', data_type: 'textarea' }, formData, index)}
                                        {renderDynamicField(step4Fields.find(f => f.name === 'patient_allergy') || { name: 'patient_allergy', label: 'Allergies', data_type: 'text', placeholder: 'e.g. Penicillin, Peanuts' }, formData, index)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 5: Service Details */}
                    {step === 5 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            {patientAdmissionList.map((formData, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                                    <h3 className="text-md font-bold text-gray-700 mb-4">Patient {index + 1}: Service Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {renderDynamicField(step5Fields.find(f => f.name === 'room_type') || { name: 'room_type', label: 'Room Type', data_type: 'dropdown', options: ['Single', 'Twin'] }, formData, index)}
                                        {renderDynamicField(step5Fields.find(f => f.name === 'check_in_date') || { name: 'check_in_date', label: 'Check-In Date', data_type: 'date' }, formData, index)}

                                        {renderDynamicField(step5Fields.find(f => f.name === 'check_out_date') || { name: 'check_out_date', label: 'Check-Out Date (Optional)', data_type: 'date' }, formData, index)}
                                        {renderDynamicField(step5Fields.find(f => f.name === 'attender_name') || { name: 'attender_name', label: 'Attender Name', data_type: 'text' }, formData, index)}

                                        {renderDynamicField(step5Fields.find(f => f.name === 'caretaker_name') || { name: 'caretaker_name', label: 'Caretaker/Nurse Name', data_type: 'text' }, formData, index)}
                                        {renderDynamicField(step5Fields.find(f => f.name === 'hospital_location') || { name: 'hospital_location', label: 'Hospital Location', data_type: 'dropdown', options: ['Main Block', 'East Wing'] }, formData, index)}

                                        {renderDynamicField(step5Fields.find(f => f.name === 'pain_point') || { name: 'pain_point', label: 'Pain Point', data_type: 'dropdown', options: ['Joints', 'Muscle', 'Nerve'] }, formData, index)}

                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Providing Services <span className="text-red-500">*</span></label>
                                            <div className="flex flex-wrap gap-4">
                                                {['Consultation', 'Surgery', 'Therapy', 'Diagnostics', 'Medication', 'Nursing Care', 'Emergency Care'].map(srv => (
                                                    <label key={srv} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={(formData.providing_services || '').includes(srv)}
                                                            onChange={(e) => {
                                                                const current = (formData.providing_services || '').split(',').filter(Boolean);
                                                                let updated;
                                                                if (e.target.checked) updated = [...current, srv];
                                                                else updated = current.filter(s => s !== srv);
                                                                const event = { target: { name: 'providing_services', value: updated.join(',') } };
                                                                handleRowChange(index, event);
                                                            }}
                                                            className="rounded text-green-600 focus:ring-green-500"
                                                        />
                                                        <span className="text-sm text-gray-700">{srv}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}



                    {/* Footer Navigation */}
                    <div className="px-8 py-2 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                        <button
                            onClick={() => setStep(Math.max(1, step - 1))}
                            disabled={step === 1}
                            className="flex items-center px-4 py-2  text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 mr-2" />
                            Previous
                        </button>

                        {
                            step < 5 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center px-8 py-2 bg-green-600 text-white  shadow-lg hover:bg-green-700 transition-transform transform hover:-translate-y-0.5"
                                >
                                    Next Step
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex items-center px-8 py-2 bg-green-600 text-white  shadow-lg hover:bg-green-700 transition-transform transform hover:-translate-y-0.5"
                                >
                                    {loading ? 'Submitting...' : 'Complete Admission'}
                                    <Check className="w-5 h-5 ml-2" />
                                </button>
                            )
                        }
                    </div>
                </div>
            </div>
            {/* View Admissions Modal */}
            {showViewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Patient Admissions ({admissionRecords.length})
                            </h3>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {loadingAdmissions ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : admissionRecords.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    No admission records found.
                                </div>
                            ) : (
                                <table className="min-w-full text-sm text-left text-gray-500 border-collapse">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
                                        <tr>
                                            {Object.keys(admissionRecords[0] || {}).map((key) => (
                                                <th key={key} className="px-4 py-3 border-b border-gray-200 whitespace-nowrap">
                                                    {key.replace(/_/g, ' ')}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admissionRecords.map((record, index) => (
                                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                                {Object.values(record).map((val, i) => (
                                                    <td key={i} className="px-4 py-3 border-b border-gray-100 whitespace-nowrap max-w-xs truncate">
                                                        {val}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdmissionRegistration;
