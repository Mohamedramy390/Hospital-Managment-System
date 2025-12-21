import React, { useState, useEffect } from 'react';
import { getPatients, getNurses } from '../api/logistics';
import { addDiagnosis, getPatientHistory, getActiveVisit, addDiagnosisWithNotes, addTreatmentPlanWithTasks, getDoctorNotesByVisit, getTreatmentPlansByVisit, getMyPatients } from '../api/clinical';
import { createLabOrder, getTestTypes, createPrescription, requestSurgery, getAssignedSurgeries, getAvailableOpRooms, scheduleSurgery, getLabOrdersByVisit, getMedicine } from '../api/modules';
import { FileText, Activity, AlertCircle, Beaker, Clipboard, Scissors, Clock, UserCheck, Layout, Stethoscope, ClipboardList, Users } from 'lucide-react';

const ClinicalDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [activeVisit, setActiveVisit] = useState(null);
    const [history, setHistory] = useState([]);
    const [diagnosis, setDiagnosis] = useState('');
    const [error, setError] = useState('');

    const [testTypes, setTestTypes] = useState([]);
    const [selectedTests, setSelectedTests] = useState([]);
    const [labOrders, setLabOrders] = useState([]);

    const [medicines, setMedicines] = useState([]);
    const [medicineId, setMedicineId] = useState('');
    const [customMedicineName, setCustomMedicineName] = useState('');
    const [useCustomMedicine, setUseCustomMedicine] = useState(false);
    const [dosage, setDosage] = useState('');

    // Surgery State
    const [assignedSurgeries, setAssignedSurgeries] = useState([]);
    const [opRooms, setOpRooms] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [scheduleData, setScheduleData] = useState({});

    // New combined operations state
    const [diagnosisNotes, setDiagnosisNotes] = useState('');
    const [doctorNotes, setDoctorNotes] = useState('');
    const [treatmentPlanDetails, setTreatmentPlanDetails] = useState('');
    const [selectedNurse, setSelectedNurse] = useState('');
    const [customTasks, setCustomTasks] = useState('');
    const [doctorNotesHistory, setDoctorNotesHistory] = useState([]);
    const [treatmentPlans, setTreatmentPlans] = useState([]);

    useEffect(() => {
        loadPatients();
        loadTestTypes();
        loadMedicines();
        loadSurgeryData();
    }, []);

    useEffect(() => {
        if (selectedPatient) {
            loadPatientDetails(selectedPatient);
        }
    }, [selectedPatient]);

    const loadPatients = async () => {
        try {
            const res = await getMyPatients();
            setPatients(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadTestTypes = async () => {
        try {
            const res = await getTestTypes();
            setTestTypes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadMedicines = async () => {
        try {
            const res = await getMedicine();
            setMedicines(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadSurgeryData = async () => {
        try {
            const sRes = await getAssignedSurgeries();
            setAssignedSurgeries(sRes.data);
            const rRes = await getAvailableOpRooms();
            setOpRooms(rRes.data);
            const nRes = await getNurses();
            setNurses(nRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadPatientDetails = async (pid) => {
        setHistory([]);
        setActiveVisit(null);
        setLabOrders([]);
        setDoctorNotesHistory([]);
        setTreatmentPlans([]);
        setError('');

        try {
            const hRes = await getPatientHistory(pid);
            setHistory(hRes.data);

            const vRes = await getActiveVisit(pid);
            setActiveVisit(vRes.data);

            // If active visit, fetch lab orders, doctor notes, and treatment plans
            if (vRes.data) {
                const lRes = await getLabOrdersByVisit(vRes.data.VisitID);
                setLabOrders(lRes.data);

                try {
                    const notesRes = await getDoctorNotesByVisit(vRes.data.VisitID);
                    setDoctorNotesHistory(notesRes.data);
                } catch (err) {
                    console.log('No doctor notes yet');
                }

                try {
                    const plansRes = await getTreatmentPlansByVisit(vRes.data.VisitID);
                    setTreatmentPlans(plansRes.data);
                } catch (err) {
                    console.log('No treatment plans yet');
                }
            }
        } catch (err) {
            if (err.response?.status === 404) setError('No active visit found for this patient.');
        }
    };

    const handleAddDiagnosisWithNotes = async (e) => {
        e.preventDefault();
        if (!activeVisit) return;

        try {
            await addDiagnosisWithNotes({
                visitId: activeVisit.VisitID,
                diagnosisNotes,
                doctorNotes
            });
            setDiagnosisNotes('');
            setDoctorNotes('');
            alert('Diagnosis and notes added successfully!');
            loadPatientDetails(selectedPatient);
        } catch (err) {
            alert('Failed to add diagnosis and notes: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleAddTreatmentPlanWithTasks = async (e) => {
        e.preventDefault();
        if (!activeVisit || !selectedNurse) {
            alert('Please select a nurse to assign tasks');
            return;
        }

        try {
            const tasksArray = customTasks
                ? customTasks.split('\n').filter(t => t.trim())
                : [];

            await addTreatmentPlanWithTasks({
                visitId: activeVisit.VisitID,
                details: treatmentPlanDetails,
                assignedNurseId: selectedNurse,
                customTasks: tasksArray
            });
            setTreatmentPlanDetails('');
            setCustomTasks('');
            setSelectedNurse('');
            alert('Treatment plan created and nurse tasks assigned successfully!');
            loadPatientDetails(selectedPatient);
        } catch (err) {
            alert('Failed to create treatment plan: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleLabOrder = async (e) => {
        e.preventDefault();
        if (!activeVisit) {
            alert('No active visit found');
            return;
        }
        if (selectedTests.length === 0) {
            alert('Please select at least one test');
            return;
        }
        try {
            await createLabOrder({ visitId: activeVisit.VisitID, tests: selectedTests.map(id => ({ testTypeId: id })) });
            setSelectedTests([]);
            alert('Lab order created successfully');
            // Refresh orders
            const lRes = await getLabOrdersByVisit(activeVisit.VisitID);
            setLabOrders(lRes.data);
        } catch (err) {
            console.error(err);
            alert('Failed to create lab order: ' + (err.response?.data?.message || err.message));
        }
    };

    const toggleTestSelection = (id) => {
        setSelectedTests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handlePrescription = async (e) => {
        e.preventDefault();
        if (!activeVisit || !dosage) return;
        if (!useCustomMedicine && !medicineId) return;
        if (useCustomMedicine && !customMedicineName) return;

        try {
            const prescriptionData = {
                visitId: activeVisit.VisitID,
                items: [{
                    medicineId: useCustomMedicine ? null : Number(medicineId),
                    customMedicineName: useCustomMedicine ? customMedicineName : null,
                    dosage
                }]
            };
            await createPrescription(prescriptionData);
            setMedicineId('');
            setCustomMedicineName('');
            setDosage('');
            setUseCustomMedicine(false);
            alert('Prescription created');
        } catch (err) {
            alert('Failed to create prescription: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleSurgeryRequest = async () => {
        if (!activeVisit) {
            alert('No active visit found');
            return;
        }
        try {
            await requestSurgery({ visitId: activeVisit.VisitID });
            alert('Surgery request sent to Admin successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to request surgery: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleScheduleSurgery = async (requestId) => {
        const data = scheduleData[requestId];
        if (!data || !data.opRoomId || !data.scheduledTime || !data.nurseStaffId) {
            alert('Please fill all fields');
            return;
        }
        try {
            await scheduleSurgery(requestId, {
                opRoomId: Number(data.opRoomId),
                scheduledTime: data.scheduledTime,
                nurseStaffId: Number(data.nurseStaffId)
            });
            alert('Surgery scheduled successfully');
            loadSurgeryData();
        } catch (err) {
            console.error(err);
            alert('Failed to schedule surgery: ' + (err.response?.data?.message || err.message));
        }
    };

    const updateScheduleData = (requestId, field, value) => {
        setScheduleData(prev => ({
            ...prev,
            [requestId]: { ...prev[requestId], [field]: value }
        }));
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Doctor Dashboard & EMR</h2>

            {/* My Surgery Schedule Section */}
            {assignedSurgeries.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
                    <div className="flex items-center space-x-2 text-purple-700 mb-4">
                        <Scissors />
                        <h3 className="text-lg font-bold">My Surgery Schedule (Assigned to Me)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assignedSurgeries.filter(s => s.Status === 'Pending' || s.Status === 'In Progress').map(req => (
                            <div key={req.RequestID} className="border p-4 rounded-lg bg-purple-50 space-y-3">
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-700">Patient: {req.FirstName} {req.LastName}</span>
                                    <span className="text-xs bg-white px-2 py-1 rounded border">{req.Status}</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <label className="block text-gray-600">Operation Room</label>
                                        <select
                                            className="w-full border rounded p-1"
                                            value={scheduleData[req.RequestID]?.opRoomId || ''}
                                            onChange={e => updateScheduleData(req.RequestID, 'opRoomId', e.target.value)}
                                        >
                                            <option value="">Select Room</option>
                                            {opRooms.map(r => <option key={r.OpRoomID} value={r.OpRoomID}>{r.RoomName}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-600">Nurse</label>
                                        <select
                                            className="w-full border rounded p-1"
                                            value={scheduleData[req.RequestID]?.nurseStaffId || ''}
                                            onChange={e => updateScheduleData(req.RequestID, 'nurseStaffId', e.target.value)}
                                        >
                                            <option value="">Select Nurse</option>
                                            {nurses.map(n => <option key={n.StaffID} value={n.StaffID}>{n.FirstName} {n.LastName}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-600">Time</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full border rounded p-1"
                                            value={scheduleData[req.RequestID]?.scheduledTime || ''}
                                            onChange={e => updateScheduleData(req.RequestID, 'scheduledTime', e.target.value)}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleScheduleSurgery(req.RequestID)}
                                        className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                                    >
                                        Confirm Schedule
                                    </button>
                                </div>
                            </div>
                        ))}
                        {assignedSurgeries.filter(s => s.Status === 'Pending' || s.Status === 'In Progress').length === 0 && (
                            <p className="text-gray-500">No pending surgeries assigned.</p>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select From My Patients (Scheduled/Assigned)</label>
                <select className="w-full border border-gray-300 rounded-lg p-2" onChange={(e) => setSelectedPatient(e.target.value)}>
                    <option value="">-- Choose My Patient --</option>
                    {patients.map(p => (
                        <option key={p.PatientID} value={p.PatientID}>{p.FirstName} {p.LastName}</option>
                    ))}
                </select>
            </div>

            {selectedPatient && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Visit */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                        <div className="flex items-center space-x-2 text-blue-600">
                            <Activity />
                            <h3 className="text-lg font-bold">Current Visit</h3>
                        </div>

                        {activeVisit ? (
                            <>
                                <div className="mb-2 text-sm text-gray-600">
                                    <p><strong>Visit ID:</strong> #{activeVisit.VisitID}</p>
                                    <p><strong>Type:</strong> {activeVisit.VisitType}</p>
                                    {activeVisit.BedID && <p className="text-green-600 font-bold">Bed Assigned: {activeVisit.BedID}</p>}
                                    <p><strong>Admitted:</strong> {new Date(activeVisit.AdmissionTime).toLocaleString()}</p>
                                </div>

                                {/* Combined Diagnosis with Notes */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center space-x-2 text-blue-700 mb-3">
                                        <Stethoscope />
                                        <h4 className="font-bold">Add Diagnosis with Notes</h4>
                                    </div>
                                    <form onSubmit={handleAddDiagnosisWithNotes} className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                                            <textarea
                                                className="w-full border border-gray-300 rounded-lg p-3 h-24"
                                                placeholder="Enter diagnosis..."
                                                value={diagnosisNotes}
                                                onChange={(e) => setDiagnosisNotes(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Notes (Optional)</label>
                                            <textarea
                                                className="w-full border border-gray-300 rounded-lg p-3 h-20"
                                                placeholder="Additional notes, observations, recommendations..."
                                                value={doctorNotes}
                                                onChange={(e) => setDoctorNotes(e.target.value)}
                                            />
                                        </div>
                                        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
                                            Save Diagnosis & Notes
                                        </button>
                                    </form>
                                </div>

                                {/* Treatment Plan with Nurse Tasks */}
                                {activeVisit.BedID ? (
                                    <div className="mt-6 bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border border-green-200">
                                        <div className="flex items-center space-x-2 text-green-700 mb-3">
                                            <ClipboardList />
                                            <h4 className="font-bold">Create Treatment Plan & Assign Tasks</h4>
                                        </div>
                                        <form onSubmit={handleAddTreatmentPlanWithTasks} className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Plan Details</label>
                                                <textarea
                                                    className="w-full border border-gray-300 rounded-lg p-3 h-24"
                                                    placeholder="e.g., IV Antibiotics q12h, Oxygen therapy, Bed rest..."
                                                    value={treatmentPlanDetails}
                                                    onChange={(e) => setTreatmentPlanDetails(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Assign Nurse <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    className="w-full border border-gray-300 rounded-lg p-2"
                                                    value={selectedNurse}
                                                    onChange={(e) => setSelectedNurse(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select Nurse</option>
                                                    {nurses.map(n => (
                                                        <option key={n.StaffID} value={n.StaffID}>
                                                            {n.FirstName} {n.LastName}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    ✓ Default tasks will be auto-created
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Custom Tasks (Optional, one per line)
                                                </label>
                                                <textarea
                                                    className="w-full border border-gray-300 rounded-lg p-3 h-20 font-mono text-sm"
                                                    placeholder={"Administer IV medication at 8am\nCheck wound dressing every 2 hours\nMonitor oxygen saturation"}
                                                    value={customTasks}
                                                    onChange={(e) => setCustomTasks(e.target.value)}
                                                />
                                            </div>
                                            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium">
                                                Create Plan & Assign Tasks
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="mt-6 flex items-center space-x-2 text-yellow-600 bg-yellow-50 p-4 rounded-lg">
                                        <AlertCircle size={20} />
                                        <p>Patient must be assigned to a bed before creating a treatment plan with nurse tasks.</p>
                                    </div>
                                )}

                                {/* Doctor Notes History */}
                                {doctorNotesHistory.length > 0 && (
                                    <div className="mt-6 border-t pt-4">
                                        <h5 className="font-bold text-gray-700 mb-2 text-sm flex items-center space-x-1">
                                            <FileText size={16} />
                                            <span>Doctor Notes for This Visit</span>
                                        </h5>
                                        <div className="space-y-2">
                                            {doctorNotesHistory.map((note, idx) => (
                                                <div key={idx} className="text-sm border p-3 rounded bg-blue-50">
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        {new Date(note.Date).toLocaleString()}
                                                    </p>
                                                    <p className="text-gray-800 whitespace-pre-wrap">{note.NoteText}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Treatment Plans for This Visit */}
                                {treatmentPlans.length > 0 && (
                                    <div className="mt-4 border-t pt-4">
                                        <h5 className="font-bold text-gray-700 mb-2 text-sm flex items-center space-x-1">
                                            <ClipboardList size={16} />
                                            <span>Treatment Plans for This Visit</span>
                                        </h5>
                                        <div className="space-y-2">
                                            {treatmentPlans.map((plan, idx) => (
                                                <div key={idx} className="text-sm border p-3 rounded bg-green-50">
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        Created: {new Date(plan.Date).toLocaleString()}
                                                    </p>
                                                    <p className="text-gray-800 whitespace-pre-wrap font-medium">{plan.PlanDetails}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Lab Order */}
                                <div className="mt-6">
                                    <div className="flex items-center space-x-2 text-indigo-600 mb-2"><Beaker /><h4 className="font-bold">Request Lab Tests</h4></div>
                                    {testTypes.length === 0 ? (
                                        <p className="text-sm text-gray-500 mb-2">No test types available</p>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            {testTypes.map(tt => (
                                                <label key={tt.TestTypeID} className={`border rounded p-2 cursor-pointer ${selectedTests.includes(tt.TestTypeID) ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200'}`}>
                                                    <input type="checkbox" className="mr-2" checked={selectedTests.includes(tt.TestTypeID)} onChange={() => toggleTestSelection(tt.TestTypeID)} />
                                                    {tt.TestName}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    <button onClick={handleLabOrder} className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Create Lab Order</button>
                                </div>

                                {/* Lab Results List */}
                                <div className="mt-4 border-t pt-4">
                                    <h5 className="font-bold text-gray-700 mb-2 text-sm">Lab Orders & Results</h5>
                                    {labOrders.length === 0 ? <p className="text-xs text-gray-400">No labs ordered for this visit.</p> : (
                                        <div className="space-y-2">
                                            {labOrders.map(order => (
                                                <div key={order.OrderID} className="text-sm border p-2 rounded bg-gray-50">
                                                    <div className="flex justify-between font-bold">
                                                        <span>Order #{order.OrderID}</span>
                                                        <span>{new Date(order.OrderDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="mt-1 space-y-1">
                                                        {order.Tests && order.Tests.map((test, idx) => (
                                                            <div key={idx} className="flex justify-between text-xs items-center">
                                                                <span>{test.TestName}</span>
                                                                <span className={`px-1 rounded ${test.Status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-600'}`}>
                                                                    {test.Status}
                                                                </span>
                                                                {test.ResultValue && <span className="ml-2 font-mono text-gray-800">Res: {test.ResultValue}</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Prescription */}
                                <div className="mt-6">
                                    <div className="flex items-center space-x-2 text-green-600 mb-2"><Clipboard /><h4 className="font-bold">Write Prescription</h4></div>
                                    <form onSubmit={handlePrescription} className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="customMedicine"
                                                checked={useCustomMedicine}
                                                onChange={(e) => {
                                                    setUseCustomMedicine(e.target.checked);
                                                    setMedicineId('');
                                                    setCustomMedicineName('');
                                                }}
                                                className="w-4 h-4"
                                            />
                                            <label htmlFor="customMedicine" className="text-sm text-gray-600">Medicine not in system</label>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            {useCustomMedicine ? (
                                                <input
                                                    className="border p-2 rounded"
                                                    placeholder="Enter Medicine Name"
                                                    value={customMedicineName}
                                                    onChange={e => setCustomMedicineName(e.target.value)}
                                                    required
                                                />
                                            ) : (
                                                <select
                                                    className="border p-2 rounded"
                                                    value={medicineId}
                                                    onChange={e => setMedicineId(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select Medicine</option>
                                                    {medicines.map(med => (
                                                        <option key={med.MedicineID} value={med.MedicineID}>
                                                            {med.Name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            <input className="border p-2 rounded" placeholder="Dosage" value={dosage} onChange={e => setDosage(e.target.value)} required />
                                            <button className="bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                                        </div>
                                    </form>
                                </div>

                                {/* Surgery */}
                                <div className="mt-6">
                                    <div className="flex items-center space-x-2 text-red-600 mb-2"><Scissors /><h4 className="font-bold">Request Surgery</h4></div>
                                    <button onClick={handleSurgeryRequest} className="w-full bg-red-600 text-white py-2 rounded-lg">Request Surgery</button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 p-4 rounded-lg">
                                <AlertCircle size={20} />
                                <p>No active visit. Patient must be admitted first.</p>
                            </div>
                        )}
                    </div>

                    {/* History */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center space-x-2 mb-4 text-gray-700">
                            <FileText />
                            <h3 className="text-lg font-bold">Medical History</h3>
                        </div>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto">
                            {history.length === 0 ? (
                                <p className="text-gray-400 italic">No previous records found.</p>
                            ) : (
                                history.map((record) => (
                                    <div key={record.DiagnosisID} className="border-l-4 border-blue-200 pl-4 py-2">
                                        <p className="text-xs text-gray-500">{new Date(record.Date).toLocaleString()}</p>
                                        <p className="text-gray-800 mt-1">{record.DiagnosisNotes}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClinicalDashboard;

