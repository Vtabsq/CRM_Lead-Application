import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { Search, FileDown, Calculator, User, Calendar, IndianRupee, Activity, AlertCircle, Save, CheckCircle2, ChevronDown } from 'lucide-react';

const normalize_header = (h) => {
    return str(h).strip().lower().replace(" ", "").replace("_", "").replace("-", "")
}

const API_BASE_URL = 'http://localhost:8000';

const BillingSummary = () => {
    // Search & Data State
    const [allPatients, setAllPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const dropdownRef = useRef(null);

    // Selected Patient State
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [patientData, setPatientData] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Billing Logic State
    const [defaultCharges, setDefaultCharges] = useState({});
    const [calculatedDays, setCalculatedDays] = useState(1);
    const [roomType, setRoomType] = useState('General');

    // Billing Inputs (Rates/Period)
    const [billingInputs, setBillingInputs] = useState({
        room_charge: 0,
        bed_charge: 0,
        nurse_payment: 0,
        hospital_payment: 0,
        doctor_fee: 0,
        service_charge: 0
    });

    const [totals, setTotals] = useState({
        room: 0,
        bed: 0,
        nurse: 0,
        hospital: 0,
        doctor: 0,
        service: 0,
        grand: 0
    });

    // Saving State
    const [saving, setSaving] = useState(false);

    // --- 1. Initial Fetch (Patients & Charges) ---
    useEffect(() => {
        fetchPatients();
        fetchCharges();

        // Click outside to close dropdown
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchPatients = async () => {
        setLoadingPatients(true);
        try {
            // First try view endpoint which returns all rows from secondary
            let res = await axios.get(`${API_BASE_URL}/patient-admission/view`);
            if (res.data.status === 'success' && res.data.data.length > 0) {
                setAllPatients(res.data.data);
                setFilteredPatients(res.data.data);
            } else {
                // Fallback to search_data or similar if needed, but expectation is View has it
                // If secondary is empty, try /search_data limit=2000? 
                // Let's rely on view or search_data as fallback
                const searchRes = await axios.get(`${API_BASE_URL}/search_data?limit=1000`);
                if (searchRes.data.results) {
                    setAllPatients(searchRes.data.results);
                    setFilteredPatients(searchRes.data.results);
                }
            }
        } catch (err) {
            console.error("Failed to load patient list", err);
        } finally {
            setLoadingPatients(false);
        }
    };

    const fetchCharges = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/settings/charges`);
            setDefaultCharges(res.data);
        } catch (err) {
            console.error("Failed to load charges", err);
        }
    };

    // --- 2. Search filtering ---
    useEffect(() => {
        if (!searchQuery) {
            setFilteredPatients(allPatients);
            return;
        }
        const lower = searchQuery.toLowerCase();
        const filtered = allPatients.filter(p => {
            // Check keys like memberidkey, patientname, etc.
            const mid = findVal(p, ['memberidkey', 'memberid', 'id', 'mid']);
            const name = findVal(p, ['patientname', 'name', 'firstname', 'patient_name']);
            return (mid && mid.toLowerCase().includes(lower)) || (name && name.toLowerCase().includes(lower));
        });
        setFilteredPatients(filtered);
    }, [searchQuery, allPatients]);

    // Helper to find value from object by list of potential keys
    const findVal = (obj, keys) => {
        if (!obj) return '';
        // keys is array of strings
        // Normalize obj keys
        const normObj = {};
        Object.keys(obj).forEach(k => {
            normObj[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = obj[k];
        });

        for (let k of keys) {
            const val = normObj[k.toLowerCase().replace(/[^a-z0-9]/g, '')];
            if (val) return String(val).trim();
        }
        return '';
    };

    // --- 3. Selection & Details Fetch ---
    const handleSelectPatient = async (p) => {
        const mid = findVal(p, ['memberidkey', 'memberid', 'id', 'mid']);
        const name = findVal(p, ['patientname', 'name', 'patient_name', 'firstname']);

        setSearchQuery(`${mid} - ${name}`);
        setSelectedMemberId(mid);
        setIsDropdownOpen(false);
        setError('');
        setSuccessMsg('');

        // Fetch authoritative details
        setLoadingDetails(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/admission-details`, { params: { member_id: mid } });
            setPatientData(res.data);

            // Auto-populate logic
            calculateStayDays(res.data);
            populateBillingDefaults(res.data);

        } catch (err) {
            console.error("Fetch details error", err);
            setError("Could not fetch full details for this patient.");
            // Fallback to p if available?
            setPatientData(p);
            calculateStayDays(p);
            populateBillingDefaults(p);
        } finally {
            setLoadingDetails(false);
        }
    };

    // --- 4. Logic: Days & Defaults ---
    const calculateStayDays = (data) => {
        const checkInStr = findVal(data, ['checkindate', 'admissiondate', 'date']);
        const checkOutStr = findVal(data, ['checkoutdate', 'dischargedate']);

        let d = 1;
        if (checkInStr) {
            const start = new Date(checkInStr);
            const end = checkOutStr ? new Date(checkOutStr) : new Date(); // Default to today

            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                const diff = end - start;
                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                d = days > 0 ? days : 1;
            }
        }
        setCalculatedDays(d);
    };

    const populateBillingDefaults = (data) => {
        // Detect Room Type to pick rate
        // Keys: roomtype, room, bedtype
        const rType = findVal(data, ['roomtype', 'room', 'bedcategory']);
        setRoomType(rType || 'General');

        let roomRate = defaultCharges.general_bed_price || 0;
        const lowR = (rType || '').toLowerCase();
        if (lowR.includes('icu')) roomRate = defaultCharges.icu_bed_price || 0;
        else if (lowR.includes('single')) roomRate = defaultCharges.single_bed_price || 0;
        else if (lowR.includes('twin') || lowR.includes('double')) roomRate = defaultCharges.twin_bed_price || 0;

        setBillingInputs({
            room_charge: roomRate,
            bed_charge: defaultCharges.bed_service_charge || 0,
            nurse_payment: defaultCharges.nurse_fee || 0,
            hospital_payment: defaultCharges.registration_fee || 0,
            doctor_fee: defaultCharges.consultation_fee || 0,
            service_charge: defaultCharges.miscellaneous_fee || 0
        });
    };

    // --- 5. Auto Calculation ---
    useEffect(() => {
        const days = calculatedDays > 0 ? calculatedDays : 1;
        const { room_charge, bed_charge, nurse_payment, hospital_payment, doctor_fee, service_charge } = billingInputs;

        const tRoom = Number(room_charge) * days;
        const tBed = Number(bed_charge) * days;
        const tNurse = Number(nurse_payment) * days;
        const tHospital = Number(hospital_payment) * days;

        const subTotal = tRoom + tBed + tNurse + tHospital;
        const fixedVals = Number(doctor_fee) + Number(service_charge);
        const grand = subTotal + fixedVals;

        setTotals({
            room: tRoom,
            bed: tBed,
            nurse: tNurse,
            hospital: tHospital,
            doctor: Number(doctor_fee),
            service: Number(service_charge),
            grand: grand
        });

    }, [billingInputs, calculatedDays]);


    const handleSaveToSheet = async () => {
        if (!selectedMemberId || !patientData) return;
        setSaving(true);
        setError('');
        setSuccessMsg('');

        try {
            const payload = {
                member_id: selectedMemberId,
                billing_data: billingInputs,
                patient_data: patientData,
                total_days: calculatedDays,
                grand_total: totals.grand
            };

            await axios.post(`${API_BASE_URL}/billing-summary/save`, payload);
            setSuccessMsg("Billing saved to Google Sheet successfully!");

        } catch (err) {
            console.error("Save error", err);
            setError("Failed to save to Google Sheet.");
        } finally {
            setSaving(false);
        }
    };

    const handleExportExcel = async () => {
        if (!patientData) return;
        try {
            const payload = {
                member_id: selectedMemberId,
                patient_data: patientData,
                billing_inputs: billingInputs,
                total_amount: totals.grand
            };
            const response = await axios.post(`${API_BASE_URL}/billing-summary/export`, payload, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Billing_${selectedMemberId}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError("Failed to export Excel.");
        }
    };

    const handleDownloadPdf = async () => {
        if (!selectedMemberId || !patientData) return;

        const payload = {
            patient_data: patientData,
            billing_data: billingInputs,
            totals: totals,
            calculated_days: calculatedDays
        };

        const response = await axios.post(
            `${API_BASE_URL}/generate-discharge-summary`,
            payload,
            { responseType: "blob" }
        );

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Discharge_${selectedMemberId}.pdf`;
        link.click();
    };

    // UI Components Helpers
    const DetailItem = ({ label, keys }) => (
        <div>
            <span className="text-xs font-bold text-gray-400 uppercase block">{label}</span>
            <span className="text-sm font-medium text-gray-800 break-words">{findVal(patientData, keys) || '-'}</span>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 overflow-hidden">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <IndianRupee className="w-6 h-6 text-green-600" /> Billing Summary
                </h1>
                {/* Status Messages */}
                <div>
                    {successMsg && <div className="text-green-600 flex items-center gap-1 text-sm font-medium"><CheckCircle2 className="w-4 h-4" /> {successMsg}</div>}
                    {error && <div className="text-red-600 flex items-center gap-1 text-sm font-medium"><AlertCircle className="w-4 h-4" /> {error}</div>}
                </div>
            </div>

            <div className="flex gap-6 h-full overflow-hidden">
                {/* LEFT: Search & Details */}
                <div className="w-7/12 flex flex-col gap-4 overflow-hidden">
                    {/* Search Dropdown */}
                    <div className="relative z-50 flex-none" ref={dropdownRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search Patient</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
                                placeholder="Start typing Member ID or Name..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setIsDropdownOpen(true); }}
                                onFocus={() => setIsDropdownOpen(true)}
                            />
                            {loadingPatients ? (
                                <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)} />
                            )}
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                {filteredPatients.length === 0 ? (
                                    <div className="p-3 text-sm text-gray-500 text-center">No patients found.</div>
                                ) : (
                                    filteredPatients.map((p, idx) => {
                                        const mid = findVal(p, ['memberidkey', 'memberid', 'id', 'mid']);
                                        const name = findVal(p, ['patientname', 'name', 'patient_name', 'firstname']);
                                        return (
                                            <div
                                                key={idx}
                                                className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between"
                                                onClick={() => handleSelectPatient(p)}
                                            >
                                                <span className="font-medium text-gray-800">{mid}</span>
                                                <span className="text-gray-500 text-sm">{name}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Patient Details Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <h3 className="font-semibold text-gray-700">Patient Details</h3>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1">
                            {patientData ? (
                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    <DetailItem label="Member ID" keys={['memberidkey', 'memberid', 'id']} />
                                    <DetailItem label="Patient Name" keys={['patientname', 'name', 'patient_name', 'firstname']} />
                                    <DetailItem label="Gender" keys={['gender', 'sex']} />
                                    <DetailItem label="Age" keys={['age']} />
                                    <DetailItem label="Blood Group" keys={['bloodgroup', 'blood']} />
                                    <DetailItem label="Attender Name" keys={['attendername', 'emergencyname', 'relationalname']} />
                                    <DetailItem label="Contact" keys={['mobile', 'phone', 'contact', 'relationalmobile']} />
                                    <DetailItem label="Address" keys={['address', 'city', 'location']} />
                                    <div className="col-span-2 border-t border-dashed border-gray-200 my-1"></div>
                                    <DetailItem label="Check-In Date" keys={['checkindate', 'admissiondate', 'date']} />
                                    <DetailItem label="Check-Out Date" keys={['checkoutdate', 'dischargedate', 'checkout']} />
                                    <DetailItem label="Room Type" keys={['roomtype', 'room', 'bedcategory']} />
                                    <DetailItem label="Bed No" keys={['bedno', 'bed', 'bed_id']} />
                                    <DetailItem label="Doctor" keys={['doctorname', 'doctor']} />
                                    <DetailItem label="Service Provided" keys={['serviceprovided', 'service', 'purpose']} />
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                    <Search className="w-12 h-12 mb-2" />
                                    <p>Select a patient to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Calculation */}
                <div className="w-5/12 flex flex-col h-full overflow-hidden">
                    <div className="bg-white rounded-xl shadow-lg border border-blue-100 flex-1 flex flex-col overflow-hidden">
                        {/* Calc Header */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4">
                            <h3 className="font-bold flex items-center gap-2"><Calculator className="w-5 h-5" /> Cost Calculator</h3>
                            <div className="mt-2 flex items-center justify-between text-blue-100 text-sm">
                                <span>Calculated Stay:</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-white font-semibold">{calculatedDays} Day(s)</span>
                            </div>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1 space-y-5">
                            {/* Section 1: Daily Rates */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1"><Calendar className="w-3 h-3" /> Daily Charges (x {calculatedDays})</h4>
                                <div className="space-y-3">
                                    <InputRow label="Room Charge" name="room_charge" val={billingInputs.room_charge} set={setBillingInputs} total={totals.room} />
                                    <InputRow label="Bed Charge" name="bed_charge" val={billingInputs.bed_charge} set={setBillingInputs} total={totals.bed} />
                                    <InputRow label="Nurse Fee" name="nurse_payment" val={billingInputs.nurse_payment} set={setBillingInputs} total={totals.nurse} />
                                    <InputRow label="Hospital Fee" name="hospital_payment" val={billingInputs.hospital_payment} set={setBillingInputs} total={totals.hospital} />
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Section 2: Fixed */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1"><Activity className="w-3 h-3" /> Fixed Charges</h4>
                                <div className="space-y-3">
                                    <InputRow label="Doctor Fee" name="doctor_fee" val={billingInputs.doctor_fee} set={setBillingInputs} isFixed />
                                    <InputRow label="Service Charge" name="service_charge" val={billingInputs.service_charge} set={setBillingInputs} isFixed />
                                </div>
                            </div>
                        </div>

                        {/* Footer Totals & Actions */}
                        <div className="bg-gray-50 p-5 border-t border-gray-200">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-gray-600 font-bold">Grand Total</span>
                                <span className="text-3xl font-extrabold text-blue-700">₹{totals.grand.toLocaleString()}</span>
                            </div>

                            <div className="grid grid-cols-1">
                                <button
                                    onClick={handleDownloadPdf}
                                    disabled={!selectedMemberId}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg flex justify-center items-center gap-2 shadow md:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full"
                                >
                                    <FileDown className="w-4 h-4" /> Download Discharge Summary
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InputRow = ({ label, name, val, set, total, isFixed }) => (
    <div className="flex items-center justify-between group">
        <label className="text-sm font-medium text-gray-600 w-1/3">{label}</label>
        <div className="flex items-center gap-3 w-2/3 justify-end">
            <div className="relative w-28">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                <input
                    type="number"
                    value={val}
                    onChange={(e) => set(prev => ({ ...prev, [name]: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-6 pr-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none text-right font-medium text-gray-700 hover:border-gray-300 transition-colors"
                />
            </div>
            {!isFixed && (
                <span className="text-gray-400 font-medium text-sm w-16 text-right tabular-nums">
                    {total ? `₹${total.toLocaleString()}` : '-'}
                </span>
            )}
        </div>
    </div>
);

export default BillingSummary;
