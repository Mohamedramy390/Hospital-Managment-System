import React, { useEffect, useState } from 'react';
import { getPatients, getAvailableBeds, admitPatient, createPatient } from '../api/logistics';
import { Users, BedDouble, UserPlus, Activity } from 'lucide-react';

const LogisticsDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [beds, setBeds] = useState([]);
    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [showPatientModal, setShowPatientModal] = useState(false);

    // Form States
    const [newPatient, setNewPatient] = useState({ firstName: '', lastName: '', dob: '' });
    const [admitData, setAdmitData] = useState({ patientId: '', type: 'Inpatient', bedId: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [pRes, bRes] = await Promise.all([getPatients(), getAvailableBeds()]);
            setPatients(pRes.data);
            setBeds(bRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreatePatient = async (e) => {
        e.preventDefault();
        try {
            const res = await createPatient({ ...newPatient, userId: null });
            setShowPatientModal(false);
            loadData();
            if (res.data.credentials) {
                alert(`Patient Created!\nUsername: ${res.data.credentials.username}\nPassword: ${res.data.credentials.password}\n\nPLEASE SAVE THIS INFO.`);
            }
        } catch (error) {
            alert('Error creating patient');
            console.error(error);
        }
    };

    const handleAdmit = async (e) => {
        e.preventDefault();
        try {
            await admitPatient(admitData);
            setShowAdmitModal(false);
            loadData();
            alert('Patient admitted successfully!');
        } catch (error) {
            // Show specific error message from backend
            const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Error admitting patient';

            // If it's a treatment plan error, show helpful message
            if (errorMessage.includes('Treatment plan')) {
                alert(`⚠️ ${errorMessage}\n\n💡 To admit this inpatient:\n1. Go to Clinical Dashboard\n2. Select the patient\n3. Create a treatment plan first\n4. Then come back to assign the bed`);
            } else {
                alert(errorMessage);
            }
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Patient & Logistics</h2>

            {/* Vitals/Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Patients</p>
                        <p className="text-3xl font-bold text-gray-800">{patients.length}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <Users size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Available Beds</p>
                        <p className="text-3xl font-bold text-gray-800">{beds.length}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                        <BedDouble size={24} />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
                <button onClick={() => setShowPatientModal(true)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <UserPlus size={18} />
                    <span>Register Patient</span>
                </button>
                <button onClick={() => setShowAdmitModal(true)} className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                    <Activity size={18} />
                    <span>Admit / Visit</span>
                </button>
            </div>

            {/* Patient List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">Recent Patients</div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {patients.map((p) => (
                            <tr key={p.PatientID}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{p.FirstName} {p.LastName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(p.DateOfBirth).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-blue-600 cursor-pointer hover:underline">View</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {showPatientModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4">Register New Patient</h3>
                        <form onSubmit={handleCreatePatient} className="space-y-4">
                            <input placeholder="First Name" className="w-full border p-2 rounded" value={newPatient.firstName} onChange={e => setNewPatient({ ...newPatient, firstName: e.target.value })} required />
                            <input placeholder="Last Name" className="w-full border p-2 rounded" value={newPatient.lastName} onChange={e => setNewPatient({ ...newPatient, lastName: e.target.value })} required />
                            <input type="date" className="w-full border p-2 rounded" value={newPatient.dob} onChange={e => setNewPatient({ ...newPatient, dob: e.target.value })} required />
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowPatientModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAdmitModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4">Admit Patient</h3>
                        <form onSubmit={handleAdmit} className="space-y-4">
                            <select className="w-full border p-2 rounded" value={admitData.patientId} onChange={e => setAdmitData({ ...admitData, patientId: e.target.value })} required>
                                <option value="">Select Patient</option>
                                {patients.map(p => <option key={p.PatientID} value={p.PatientID}>{p.FirstName} {p.LastName}</option>)}
                            </select>
                            <select className="w-full border p-2 rounded" value={admitData.type} onChange={e => setAdmitData({ ...admitData, type: e.target.value })}>
                                <option value="Inpatient">Inpatient</option>
                                <option value="Emergency">Emergency</option>
                                <option value="Outpatient">Outpatient</option>
                            </select>
                            {admitData.type === 'Inpatient' && (
                                <>
                                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                                        <p className="text-blue-800 font-medium mb-1">ℹ️ Inpatient Admission</p>
                                        <p className="text-blue-700 text-xs">
                                            Note: A <strong>treatment plan must be created</strong> before assigning a bed.
                                            If you haven't created one yet, go to Clinical Dashboard first.
                                        </p>
                                    </div>
                                    <select className="w-full border p-2 rounded" value={admitData.bedId} onChange={e => setAdmitData({ ...admitData, bedId: e.target.value })}>
                                        <option value="">Select Bed (Optional)</option>
                                        {beds.map(b => <option key={b.BedID} value={b.BedID}>{b.RoomNumber}</option>)}
                                    </select>
                                </>
                            )}
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowAdmitModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">Admit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogisticsDashboard;
