import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutGrid, Users, Calendar, CheckCircle, XCircle, AlertCircle, Bed, User, Plus, Sparkles } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const BedManagement = () => {
    const [beds, setBeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, occupied: 0, available: 0 });
    const [selectedBed, setSelectedBed] = useState(null);
    const [showAllocationModal, setShowAllocationModal] = useState(false);
    const [patients, setPatients] = useState([]);

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
            // Using search endpoint to get recent patients or all
            // Ideally we need a full list, but for now lets get top 50
            const response = await axios.get(`${API_BASE_URL}/search_data?limit=100`);
            setPatients(response.data.rows || []);
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
            gender: forcedGender, // Auto-select if forced
        }));

        // Show alert or just restrict? Restricting via state is better.
        // We'll pass forcedGender to the modal (or use a new state)
        // For simplicity, we just set it in formData and will disable the select if set.
        setShowAllocationModal(true);
    };

    const handlePatientSelect = (e) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, patient_name: val }));

        // Try to autofill gender/id from patient list
        const patient = patients.find(p => {
            // Basic heuristic to find patient in row array
            // We need to map row indices to names
            // Checking map or array content
            return p.some(cell => String(cell).includes(val));
        });

        if (patient && patients.headers) {
            // Currently patients is just array of arrays (rows)
            // We'd need header config to map correctly. 
            // Logic simplified: If backend returned headers we could map. 
            // Assuming we don't have headers easily here without extra call or finding in search response
        }
    };

    const submitAllocation = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/beds/allocate`, {
                ...formData,
                room_no: selectedBed.room_no,
                bed_index: selectedBed.bed_index,
                room_type: selectedBed.room_type
            });
            setShowAllocationModal(false);
            fetchBeds(); // Refresh
            alert("Bed allocated successfully!");
        } catch (error) {
            alert("Allocation failed: " + (error.response?.data?.detail || error.message));
        }
    };

    const groupedBeds = beds.reduce((acc, bed) => {
        if (!acc[bed.room_no]) acc[bed.room_no] = [];
        acc[bed.room_no].push(bed);
        return acc;
    }, {});


    const getBedColorClass = (bed, roomBeds) => {
        if (bed.status !== 'Occupied') return 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200 cursor-pointer';

        // Occupied logic
        if (bed.room_type === 'Twin') {
            if (bed.gender === 'Female') return 'bg-blue-100 border-blue-300 text-blue-700';
            if (bed.gender === 'Male') return 'bg-purple-100 border-purple-300 text-purple-700';
        }

        return 'bg-red-100 border-red-300 text-red-700'; // Default occupied (Single or unknown gender)
    };

    const getBedIcon = (bed) => {
        if (bed.status !== 'Occupied') return <Bed className="w-6 h-6" />;
        return <User className="w-6 h-6" />;
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Bed Availability Management</h2>
                        <p className="text-gray-600 mt-2">Manage hospital beds, track occupancy, and handle patient allocation.</p>
                        <button onClick={() => setShowFeedbackModal(true)} className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1">
                            <Sparkles className="w-4 h-4" /> Submit Feedback
                        </button>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div> Available
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold border border-red-200">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div> Occupied
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div> Female (Twin)
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold border border-purple-200">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div> Male (Twin)
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-bold uppercase tracking-wider">Total capacity</p>
                            <h4 className="text-3xl font-extrabold text-blue-900 mt-1">{stats.total}</h4>
                        </div>
                        <div className="p-3 bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-200"><LayoutGrid className="w-8 h-8" /></div>
                    </div>
                    <div className="p-6 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-bold uppercase tracking-wider">Available Beds</p>
                            <h4 className="text-3xl font-extrabold text-green-900 mt-1">{stats.available}</h4>
                        </div>
                        <div className="p-3 bg-green-500 text-white rounded-lg shadow-lg shadow-green-200"><Bed className="w-8 h-8" /></div>
                    </div>
                    <div className="p-6 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-bold uppercase tracking-wider">Occupied</p>
                            <h4 className="text-3xl font-extrabold text-red-900 mt-1">{stats.occupied}</h4>
                        </div>
                        <div className="p-3 bg-red-500 text-white rounded-lg shadow-lg shadow-red-200"><Users className="w-8 h-8" /></div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20"><div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div><p className="mt-4 text-gray-500">Loading bed map...</p></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Object.entries(groupedBeds).map(([roomNo, roomBeds]) => {
                            const roomType = roomBeds[0].room_type;
                            return (
                                <div key={roomNo} className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                                        <h3 className="font-bold text-gray-700 text-lg">Room {roomNo}</h3>
                                        <span className={`text-xs px-2 py-1 rounded font-medium ${roomType === 'Single' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>{roomType}</span>
                                    </div>
                                    <div className="flex gap-3 justify-center">
                                        {roomBeds.map((bed, idx) => {
                                            const statusClass = getBedColorClass(bed, roomBeds);
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => bed.status !== 'Occupied' && handleAllocateClick(bed)}
                                                    className={`
                                                        relative group flex flex-col items-center justify-center 
                                                        w-20 h-24 rounded-lg border-2 transition-all shadow-sm
                                                        ${statusClass}
                                                    `}
                                                >
                                                    {getBedIcon(bed)}
                                                    <span className="mt-1 text-xs font-bold">{bed.status === 'Occupied' ? bed.gender : 'Open'}</span>

                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full mb-2 w-max max-w-[150px] bg-gray-900 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                                                        <p>Bed {idx + 1}</p>
                                                        {bed.status === 'Occupied' ? (
                                                            <>
                                                                <p className="font-bold">{bed.patient_name}</p>
                                                                <p className="opacity-75">{bed.admission_date}</p>
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-blue-600 p-6 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus className="w-6 h-6" /> Allocate Bed {selectedBed?.room_no}
                            </h3>
                            <button onClick={() => setShowAllocationModal(false)} className="text-white/80 hover:text-white"><XCircle className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={submitAllocation} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Patient Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Select or enter name"
                                    value={formData.patient_name}
                                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                                    list="patient-list"
                                    required
                                />
                                <datalist id="patient-list">
                                    {/* Populate from search data if available, or just heuristic */}
                                </datalist>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Member ID</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={formData.member_id}
                                        onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                                        placeholder="Auto-gen or Manual"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                                    <select
                                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${selectedBed?.room_type === 'Twin' && beds.find(b => b.room_no === selectedBed.room_no && b.bed_index !== selectedBed.bed_index && b.status === "Occupied") ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                                        <p className="text-xs text-red-500 mt-1">Gender locked to match roommate.</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Admission Date</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.admission_date}
                                    onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Pain Point / Diagnosis</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.pain_point}
                                    onChange={(e) => setFormData({ ...formData, pain_point: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowAllocationModal(false)} className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg">Allocate Bed</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Complaint Modal */}
            {showComplaintModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-red-600 p-6 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <AlertCircle className="w-6 h-6" /> Log Complaint - Room {selectedBed?.room_no}
                            </h3>
                            <button onClick={() => setShowComplaintModal(false)} className="text-white/80 hover:text-white"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={submitComplaint} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Complaint Type</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
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
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 h-32"
                                    value={complaintData.description}
                                    onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                                    placeholder="Describe the issue..."
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-lg">Log Complaint</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-purple-600 p-6 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-6 h-6" /> Patient Feedback
                            </h3>
                            <button onClick={() => setShowFeedbackModal(false)} className="text-white/80 hover:text-white"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={submitFeedback} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Patient Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    value={feedbackData.patient_name}
                                    onChange={(e) => setFeedbackData({ ...feedbackData, patient_name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-gray-700">Comfort</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button type="button" key={n} onClick={() => setFeedbackData({ ...feedbackData, rating_comfort: n })} className={`w-8 h-8 rounded-full ${feedbackData.rating_comfort >= n ? 'bg-yellow-400' : 'bg-gray-200'}`}>★</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-gray-700">Cleanliness</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button type="button" key={n} onClick={() => setFeedbackData({ ...feedbackData, rating_cleanliness: n })} className={`w-8 h-8 rounded-full ${feedbackData.rating_cleanliness >= n ? 'bg-yellow-400' : 'bg-gray-200'}`}>★</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-gray-700">Staff Service</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button type="button" key={n} onClick={() => setFeedbackData({ ...feedbackData, rating_staff: n })} className={`w-8 h-8 rounded-full ${feedbackData.rating_staff >= n ? 'bg-yellow-400' : 'bg-gray-200'}`}>★</button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Comments</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 h-24"
                                    value={feedbackData.comments}
                                    onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                                    placeholder="Any additional thoughts?"
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 shadow-lg">Submit Feedback</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BedManagement;
