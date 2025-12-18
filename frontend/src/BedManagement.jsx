import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutGrid, Users, Calendar, CheckCircle, XCircle, AlertCircle, Bed, User, Plus, Sparkles } from 'lucide-react';

import API_BASE_URL from './config';

const BedManagement = () => {
    const [beds, setBeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, occupied: 0, available: 0 });
    const [selectedBed, setSelectedBed] = useState(null);
    const [showAllocationModal, setShowAllocationModal] = useState(false);
    const [patients, setPatients] = useState([]);
    const [patientHeaders, setPatientHeaders] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        patient_name: '',
        member_id: '',
        gender: '',
        admission_date: new Date().toISOString().split('T')[0],
        discharge_date: '',
        pain_point: '',
        room_type: 'Single'
    });

    // Complaint & Feedback State
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [editingDischargeDate, setEditingDischargeDate] = useState('');
    const [complaintData, setComplaintData] = useState({ complaint_type: '', description: '' });
    const [feedbackData, setFeedbackData] = useState({
        patient_name: '',
        rating_comfort: 5,
        rating_cleanliness: 5,
        rating_staff: 5,
        comments: ''
    });

    const handleComplaintClick = (bed, e) => {
        e.stopPropagation(); // Prevent allocation click
        setSelectedBed(bed);
        setComplaintData({ complaint_type: '', description: '' });
        setShowComplaintModal(true);
    };

    const submitComplaint = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/complaints`, {
                room_no: selectedBed.room_no,
                patient_name: selectedBed.patient_name, // Assuming bed object has this
                ...complaintData
            });
            setShowComplaintModal(false);
            alert("Complaint logged.");
        } catch (error) {
            alert("Error logging complaint");
        }
    };

    const submitFeedback = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/feedback`, feedbackData);
            setShowFeedbackModal(false);
            alert("Feedback submitted.");
        } catch (error) {
            alert("Error submitting feedback");
        }
    };

    useEffect(() => {
        fetchBeds();
        fetchPatients();
    }, []);

    useEffect(() => {
        // Calculate stats
        const total = beds.length;
        const occupied = beds.filter(b => b.status === "Occupied").length;
        setStats({
            total,
            occupied,
            available: total - occupied
        });
    }, [beds]);

    const fetchBeds = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/beds`);
            setBeds(response.data.beds || []);
        } catch (error) {
            console.error("Error fetching beds:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/search_data?limit=1000`);
            console.log("BedManagement: Received patients", response.data);
            setPatients(response.data.rows || []);
            setPatientHeaders(response.data.headers || []);
        } catch (error) {
            console.error("Error fetching patients:", error);
        }
    };

    const handleAllocateClick = (bed) => {
        // Gender Constraint Logic
        let forcedGender = '';
        if (bed.room_type === 'Twin') {
            const roomBeds = beds.filter(b => b.room_no === bed.room_no);
            const otherBed = roomBeds.find(b => b.bed_index !== bed.bed_index);
            if (otherBed && otherBed.status === 'Occupied') {
                forcedGender = otherBed.gender;
            }
        }

        setSelectedBed(bed);
        setFormData(prev => ({
            ...prev,
            room_type: bed.room_type,
            room_no: bed.room_no,
            gender: forcedGender,
            member_id: '',
            patient_name: '',
        }));

        setShowAllocationModal(true);
    };

    // Memoize header indices
    const headerIndices = React.useMemo(() => {
        if (!patientHeaders || !patientHeaders.length) return { idIdx: -1, nameIdx: -1, genderIdx: -1, painIdx: -1 };
        return {
            idIdx: patientHeaders.findIndex(h => /member.*id|key/i.test(h)),
            nameIdx: patientHeaders.findIndex(h => /name|patient/i.test(h)),
            genderIdx: patientHeaders.findIndex(h => /gender/i.test(h)),
            painIdx: patientHeaders.findIndex(h => /pain|diagnosis|complaint|problem/i.test(h))
        };
    }, [patientHeaders]);

    // Memoize occupied IDs
    const occupiedMemberIds = React.useMemo(() => {
        return new Set(beds.filter(b => b.status === 'Occupied' && b.member_id).map(b => String(b.member_id).trim()));
    }, [beds]);

    // Memoize filtered patient list for dropdown
    const availablePatientOptions = React.useMemo(() => {
        if (!patients || !patients.length) return [];

        return patients.map((row, i) => {
            let rowVals = [];
            if (Array.isArray(row)) rowVals = row;
            else if (typeof row === 'object') rowVals = Object.values(row);

            rowVals = rowVals.map(v => String(v).trim());

            // Smart detection
            const idRegex = /MID-\d{4}-\d{2}-\d{2}-\d+/i;
            const nameRegex = /^[A-Za-z\s]{3,}$/;

            let id = '';
            let name = 'Unknown';
            let foundName = '';

            // 1. Find ID
            for (const v of rowVals) {
                if (idRegex.test(v)) {
                    id = v;
                    break;
                }
            }

            // 2. Find Name (First non-ID text field)
            for (const v of rowVals) {
                if (v === id) continue;
                // Avoid dates, emails, gender, etc? 
                if (/male|active|inactive|good|bad|interested/i.test(v)) continue;
                if (/\d/.test(v)) continue; // skip numbers
                if (/@/.test(v)) continue; // skip emails

                if (!foundName && nameRegex.test(v)) {
                    foundName = v;
                    break;
                }
            }
            if (foundName) name = foundName;

            if (!id) return null; // Must have ID
            if (occupiedMemberIds.has(id)) return null;

            return { id, name, key: i, original: row };
        }).filter(item => item !== null);
    }, [patients, occupiedMemberIds]);

    const handleMemberIdSelect = (e) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, member_id: val }));

        if (!val || !availablePatientOptions.length) return;

        const selectedOption = availablePatientOptions.find(opt => opt.id === val);
        if (!selectedOption) return;

        const row = selectedOption.original;

        // Smart Parse
        let rowVals = [];
        if (Array.isArray(row)) rowVals = row;
        else if (typeof row === 'object') rowVals = Object.values(row);

        rowVals = rowVals.map(v => String(v).trim());

        let foundName = '';
        let foundGender = '';
        let foundPain = '';

        // Regex helpers
        const idRegex = /MID-\d{4}-\d{2}-\d{2}-\d+/i;
        const genderRegex = /^(male|female|other)$/i;
        const nameRegex = /^[A-Za-z\s]{3,}$/;
        const emailRegex = /@/;

        // 1. Identify explicit fields
        for (const v of rowVals) {
            if (!v) continue;
            if (!foundGender && genderRegex.test(v)) foundGender = v;
        }

        // 2. Identify Name (First valid text that isn't ID, Gender, Email, Date-ish)
        for (const v of rowVals) {
            if (!v) continue;
            if (idRegex.test(v)) continue;
            if (genderRegex.test(v)) continue;
            if (emailRegex.test(v)) continue;
            if (/\d/.test(v)) continue; // Name usually no digits
            if (/active|inactive|good|bad|interested/i.test(v)) continue; // Status keywords

            if (!foundName) {
                foundName = v;
                continue; // Found name, keep looking for Pain Point
            }

            // 3. Identify Pain Point (Subsequent text field?)
            // Heuristic: If we found name, the NEXT significant text field might be Pain Point / Service.
            // Or maybe column keywords if we had them, but we don't trust indices.
            // Let's look for known service keywords.
            if (!foundPain && /care|therapy|nursing|living|checkup|consultation|emergency|diagnosis/i.test(v)) {
                foundPain = v;
            }
        }

        // Fallback for Pain Point if no keyword match: take longest remaining text? 
        // Or just the one after City/Location? Hard to say. 
        // Let's trust the keyword match first.

        setFormData(prev => ({
            ...prev,
            patient_name: foundName || selectedOption.name || '',
            gender: foundGender || prev.gender,
            pain_point: foundPain || ''
        }));
    };

    const submitAllocation = async (e) => {
        e.preventDefault();

        // Close modal immediately for better UX
        setShowAllocationModal(false);

        try {
            await axios.post(`${API_BASE_URL}/api/beds/allocate`, {
                ...formData,
                room_no: selectedBed.room_no,
                bed_index: selectedBed.bed_index,
                room_type: selectedBed.room_type
            });
            fetchBeds(); // Refresh in background
            alert("Bed allocated successfully!");
        } catch (error) {
            alert("Allocation failed: " + (error.response?.data?.detail || error.message));
            // Reopen modal on error so user can retry
            setShowAllocationModal(true);
        }
    };

    const handleBedClick = (bed) => {
        if (bed.status === 'Occupied') {
            setSelectedPatient(bed);
            setEditingDischargeDate(bed.discharge_date || '');
            setShowPatientModal(true);
        } else {
            handleAllocateClick(bed);
        }
    };

    const handleUpdateDischargeDate = async () => {
        if (!selectedPatient) return;

        // Close modal immediately for better UX
        setShowPatientModal(false);
        setSelectedPatient(null);

        try {
            await axios.post(`${API_BASE_URL}/api/beds/update-discharge`, null, {
                params: {
                    room_no: selectedPatient.room_no,
                    bed_index: selectedPatient.bed_index,
                    discharge_date: editingDischargeDate
                }
            });
            fetchBeds(); // Refresh in background
            alert("Discharge date updated successfully!");
        } catch (error) {
            alert("Update failed: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleDischarge = async () => {
        if (!selectedPatient) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedPatient.discharge_date) {
            const dischargeDate = new Date(selectedPatient.discharge_date);
            dischargeDate.setHours(0, 0, 0, 0);

            if (dischargeDate > today) {
                alert(`Cannot discharge patient. Discharge date is ${selectedPatient.discharge_date}. Please wait until discharge date or update it.`);
                return;
            }
        }

        if (!window.confirm(`Are you sure you want to discharge ${selectedPatient.patient_name}?`)) {
            return;
        }

        // Close modal immediately for better UX
        setShowPatientModal(false);
        setSelectedPatient(null);

        try {
            await axios.post(`${API_BASE_URL}/api/beds/discharge`, null, {
                params: {
                    room_no: selectedPatient.room_no,
                    bed_index: selectedPatient.bed_index
                }
            });
            fetchBeds(); // Refresh in background
            alert("Patient discharged successfully!");
        } catch (error) {
            alert("Discharge failed: " + (error.response?.data?.detail || error.message));
        }
    };

    const calculateDaysOccupied = (admissionDate) => {
        if (!admissionDate) return 0;
        const admission = new Date(admissionDate);
        const today = new Date();
        const diffTime = Math.abs(today - admission);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const truncateName = (name, maxLength = 10) => {
        if (!name) return '';
        return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
    };

    const getLastDigits = (id, digits = 5) => {
        if (!id) return '';
        const idStr = String(id);
        return idStr.length > digits ? '...' + idStr.slice(-digits) : idStr;
    };


    const groupedBeds = beds.reduce((acc, bed) => {
        if (!acc[bed.room_no]) acc[bed.room_no] = [];
        acc[bed.room_no].push(bed);
        return acc;
    }, {});


    const getBedColorClass = (bed, roomBeds) => {
        if (bed.status !== 'Occupied') return 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200 cursor-pointer';

        // Occupied logic - Female=Dark Pink, Male=Dark Blue
        if (bed.room_type === 'Twin') {
            if (bed.gender === 'Female') return 'bg-pink-200 border-pink-400 text-pink-800';
            if (bed.gender === 'Male') return 'bg-blue-200 border-green-400 text-blue-800';
        }

        return 'bg-red-200 border-red-400 text-red-800'; // Default occupied (Single or unknown gender)
    };

    const getBedIcon = (bed) => {
        if (bed.status !== 'Occupied') return <Bed className="w-6 h-6" />;
        return <User className="w-6 h-6" />;
    };

    return (
        <div className="space-y-6">
            <div className="bg-white  shadow-xl p-4 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Bed Availability Management</h2>
                        <p className="text-gray-600 mt-2">Manage hospital beds, track occupancy, and handle patient allocation.</p>
                        <button onClick={() => setShowFeedbackModal(true)} className="mt-2 text-base text-green-600 hover:underline flex items-center gap-1">
                            <Sparkles className="w-4 h-4" /> Submit Feedback
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-base font-semibold border border-green-200">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div> Available
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-base font-semibold border border-pink-200">
                            <div className="w-3 h-3 rounded-full bg-pink-500"></div> Female
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-base font-semibold border border-blue-200">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div> Male
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8">
                    <div className="p-4 bg-blue-50  border border-blue-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-bold uppercase tracking-wider">Total capacity</p>
                            <h4 className="text-3xl font-extrabold text-blue-900 mt-1">{stats.total}</h4>
                        </div>
                        <div className="p-3 bg-blue-500 text-white  shadow-lg shadow-blue-200"><LayoutGrid className="w-8 h-8" /></div>
                    </div>
                    <div className="p-4 bg-green-50  border border-green-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-bold uppercase tracking-wider">Available Beds</p>
                            <h4 className="text-3xl font-extrabold text-green-900 mt-1">{stats.available}</h4>
                        </div>
                        <div className="p-3 bg-green-500 text-white  shadow-lg shadow-green-200"><Bed className="w-8 h-8" /></div>
                    </div>
                    <div className="p-4 bg-red-50  border border-red-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-bold uppercase tracking-wider">Occupied</p>
                            <h4 className="text-3xl font-extrabold text-red-900 mt-1">{stats.occupied}</h4>
                        </div>
                        <div className="p-3 bg-red-500 text-white  shadow-lg shadow-red-200"><Users className="w-8 h-8" /></div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div><p className="mt-4 text-gray-500">Loading bed map...</p></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        {Object.entries(groupedBeds).map(([roomNo, roomBeds]) => {
                            const roomType = roomBeds[0].room_type;
                            return (
                                <div key={roomNo} className="bg-slate-50  p-4 border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                                        <h3 className="font-bold text-gray-700 text-lg">Room {roomNo}</h3>
                                        <span className={`text-sm px-2 py-1 rounded font-medium ${roomType === 'Single' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>{roomType}</span>
                                    </div>
                                    <div className="flex gap-3 justify-center">
                                        {roomBeds.map((bed, idx) => {
                                            const statusClass = getBedColorClass(bed, roomBeds);
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleBedClick(bed)}
                                                    className={`
                                                        relative group flex flex-col items-center justify-center 
                                                        w-20 h-24  border-2 transition-all shadow-sm cursor-pointer
                                                        ${statusClass}
                                                    `}
                                                >
                                                    {getBedIcon(bed)}
                                                    <div className="mt-1 text-center w-full px-1">
                                                        {bed.status === 'Occupied' ? (
                                                            <>
                                                                <span className="block text-[9px] font-bold leading-tight truncate" title={bed.member_id}>{getLastDigits(bed.member_id)}</span>
                                                                <span className="block text-[9px] truncate w-full" title={bed.patient_name}>{truncateName(bed.patient_name)}</span>
                                                                {bed.discharge_date && (
                                                                    <span className="block text-[8px] text-gray-600 mt-0.5" title={`Discharge: ${bed.discharge_date}`}>
                                                                        {bed.discharge_date}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-sm font-bold">Open</span>
                                                        )}
                                                    </div>

                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full mb-2 w-max max-w-[150px] bg-gray-900 text-white text-sm p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                                                        <p>Bed {idx + 1}</p>
                                                        {bed.status === 'Occupied' ? (
                                                            <>
                                                                <p className="font-bold">{bed.patient_name}</p>
                                                                <p className="opacity-75">Admitted: {bed.admission_date}</p>
                                                                {bed.discharge_date && (
                                                                    <p className="opacity-75">Discharge: {bed.discharge_date}</p>
                                                                )}
                                                                <p className="text-yellow-300 mt-1">Click for details</p>
                                                                <div className="mt-2 pt-2 border-t border-gray-700">
                                                                    <button
                                                                        onClick={(e) => handleComplaintClick(bed, e)}
                                                                        className="flex items-center gap-1 text-red-300 hover:text-red-100 w-full justify-center"
                                                                    >
                                                                        <AlertCircle className="w-3 h-3" /> Log Complaint
                                                                    </button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <p>Click to allocate</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Allocation Modal */}
            {showAllocationModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white  shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-blue-600 p-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus className="w-6 h-6" /> Allocate Bed {selectedBed?.room_no}
                            </h3>
                            <button onClick={() => setShowAllocationModal(false)} className="text-white/80 hover:text-white"><XCircle className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={submitAllocation} className="p-4 space-y-2">
                            {/* Member ID Select */}
                            <div>
                                <label className="block text-base font-semibold text-gray-700 mb-1">Member ID</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-blue-500"
                                    value={formData.member_id}
                                    onChange={handleMemberIdSelect}
                                    required
                                >
                                    <option value="">Select Member ID to Auto-fill</option>
                                    {availablePatientOptions.map((opt) => (
                                        <option key={opt.key} value={opt.id}>
                                            {opt.id} - {opt.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-sm text-gray-500 mt-1">Select Member ID to auto-fill details from Sheet1.</p>
                            </div>

                            {/* Patient Name - Read only or Editable */}
                            <div>
                                <label className="block text-base font-semibold text-gray-700 mb-1">Patient Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300  bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Name will appear here"
                                    value={formData.patient_name}
                                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-base font-semibold text-gray-700 mb-1">Gender</label>
                                    <select
                                        className={`w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-blue-500 ${selectedBed?.room_type === 'Twin' && beds.find(b => b.room_no === selectedBed.room_no && b.bed_index !== selectedBed.bed_index && b.status === "Occupied") ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        required
                                        disabled={selectedBed?.room_type === 'Twin' && beds.some(b => b.room_no === selectedBed.room_no && b.bed_index !== selectedBed.bed_index && b.status === "Occupied")}
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    {selectedBed?.room_type === 'Twin' && beds.some(b => b.room_no === selectedBed.room_no && b.bed_index !== selectedBed.bed_index && b.status === "Occupied") && (
                                        <p className="text-sm text-red-500 mt-1">Gender locked to match roommate.</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-base font-semibold text-gray-700 mb-1">Admission Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-blue-500"
                                        value={formData.admission_date}
                                        onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-base font-semibold text-gray-700 mb-1">Discharge Date (Optional)</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-blue-500"
                                    value={formData.discharge_date}
                                    onChange={(e) => setFormData({ ...formData, discharge_date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-base font-semibold text-gray-700 mb-1">Pain Point / Diagnosis</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-blue-500"
                                    value={formData.pain_point}
                                    onChange={(e) => setFormData({ ...formData, pain_point: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowAllocationModal(false)} className="flex-1 py-2 border border-gray-300 text-gray-700 font-semibold  hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-green-600 text-white font-semibold  hover:bg-green-700 shadow-lg">Allocate Bed</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Complaint Modal */}
            {showComplaintModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white  shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-red-600 p-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <AlertCircle className="w-6 h-6" /> Log Complaint - Room {selectedBed?.room_no}
                            </h3>
                            <button onClick={() => setShowComplaintModal(false)} className="text-white/80 hover:text-white"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={submitComplaint} className="p-4 space-y-2">
                            <div>
                                <label className="block text-base font-semibold text-gray-700 mb-1">Complaint Type</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-red-500"
                                    value={complaintData.complaint_type}
                                    onChange={(e) => setComplaintData({ ...complaintData, complaint_type: e.target.value })}
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="Cleanliness">Cleanliness</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Noise">Noise</option>
                                    <option value="Staff">Staff Behavior</option>
                                    <option value="food">Food Quality</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-base font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-red-500 h-32"
                                    value={complaintData.description}
                                    onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                                    placeholder="Describe the issue..."
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full py-2 bg-red-600 text-white font-semibold  hover:bg-red-700 shadow-lg">Log Complaint</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white  shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-purple-600 p-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-6 h-6" /> Patient Feedback
                            </h3>
                            <button onClick={() => setShowFeedbackModal(false)} className="text-white/80 hover:text-white"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={submitFeedback} className="p-4 space-y-6">
                            <div>
                                <label className="block text-base font-semibold text-gray-700 mb-1">Patient Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-purple-500"
                                    value={feedbackData.patient_name}
                                    onChange={(e) => setFeedbackData({ ...feedbackData, patient_name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-base font-semibold text-gray-700">Comfort</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button type="button" key={n} onClick={() => setFeedbackData({ ...feedbackData, rating_comfort: n })} className={`w-8 h-8 rounded-full ${feedbackData.rating_comfort >= n ? 'bg-yellow-400' : 'bg-gray-200'}`}>★</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <label className="text-base font-semibold text-gray-700">Cleanliness</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button type="button" key={n} onClick={() => setFeedbackData({ ...feedbackData, rating_cleanliness: n })} className={`w-8 h-8 rounded-full ${feedbackData.rating_cleanliness >= n ? 'bg-yellow-400' : 'bg-gray-200'}`}>★</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <label className="text-base font-semibold text-gray-700">Staff Service</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button type="button" key={n} onClick={() => setFeedbackData({ ...feedbackData, rating_staff: n })} className={`w-8 h-8 rounded-full ${feedbackData.rating_staff >= n ? 'bg-yellow-400' : 'bg-gray-200'}`}>★</button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-base font-semibold text-gray-700 mb-1">Comments</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300  focus:ring-2 focus:ring-purple-500 h-24"
                                    value={feedbackData.comments}
                                    onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                                    placeholder="Any additional thoughts?"
                                />
                            </div>
                            <button type="submit" className="w-full py-2 bg-purple-600 text-white font-semibold  hover:bg-purple-700 shadow-lg">Submit Feedback</button>
                        </form>
                    </div>
                </div>
            )}



            {/* Patient Details Modal */}
            {showPatientModal && selectedPatient && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white  shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <User className="w-6 h-6" /> Patient Details - Room {selectedPatient.room_no}
                            </h3>
                            <button onClick={() => setShowPatientModal(false)} className="text-white/80 hover:text-white">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-4 space-y-2">
                            {/* Patient Information Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gray-50 p-4 ">
                                    <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Patient Name</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedPatient.patient_name}</p>
                                </div>
                                <div className="bg-gray-50 p-4 ">
                                    <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Member ID</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedPatient.member_id || 'N/A'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 ">
                                    <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Gender</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedPatient.gender}</p>
                                </div>
                                <div className="bg-gray-50 p-4 ">
                                    <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Room Type</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedPatient.room_type}</p>
                                </div>
                            </div>

                            {/* Dates and Duration */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-blue-50 p-4  border border-blue-200">
                                    <p className="text-sm text-blue-600 uppercase font-semibold mb-1">Admission Date</p>
                                    <p className="text-base font-bold text-blue-900">{selectedPatient.admission_date || 'N/A'}</p>
                                </div>
                                <div className="bg-green-50 p-4  border border-green-200">
                                    <p className="text-sm text-green-600 uppercase font-semibold mb-2">Discharge Date</p>
                                    <input
                                        type="date"
                                        className="w-full px-2 py-1 text-base border border-green-300 rounded focus:ring-2 focus:ring-green-500"
                                        value={editingDischargeDate}
                                        onChange={(e) => setEditingDischargeDate(e.target.value)}
                                    />
                                    {editingDischargeDate !== (selectedPatient.discharge_date || '') && (
                                        <button
                                            onClick={handleUpdateDischargeDate}
                                            className="mt-2 w-full text-sm bg-green-600 text-white py-1 rounded hover:bg-green-700 transition-all"
                                        >
                                            Save Date
                                        </button>
                                    )}
                                </div>
                                <div className="bg-purple-50 p-4  border border-purple-200">
                                    <p className="text-sm text-purple-600 uppercase font-semibold mb-1">Days Occupied</p>
                                    <p className="text-lg font-semibold text-purple-900">{calculateDaysOccupied(selectedPatient.admission_date)}</p>
                                </div>
                            </div>

                            {/* Pain Point */}
                            {selectedPatient.pain_point && (
                                <div className="bg-yellow-50 p-4  border border-yellow-200">
                                    <p className="text-sm text-yellow-700 uppercase font-semibold mb-1">Pain Point / Notes</p>
                                    <p className="text-sm text-gray-900">{selectedPatient.pain_point}</p>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="pt-4 border-t">
                                <button
                                    onClick={handleDischarge}
                                    className="w-full py-2 bg-red-600 text-white font-semibold  hover:bg-red-700 shadow-lg flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" /> Discharge Patient
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BedManagement;
