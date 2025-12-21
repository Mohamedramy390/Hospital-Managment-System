import React, { useState, useEffect } from 'react';
import { getAvailableBeds, getPatients, admitPatient, getDoctors, createPatient, createAppointment } from '../api/logistics';
import { Grid, Bed, Activity, UserPlus } from 'lucide-react';

const ReceptionistDashboard = () => {
    const [allBeds, setAllBeds] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [showAdmitModal, setShowAdmitModal] = useState(false);
    const [selectedBed, setSelectedBed] = useState(null);
    const [admitData, setAdmitData] = useState({ patientId: '', type: 'Inpatient' });

    const [newPatient, setNewPatient] = useState({ firstName: '', lastName: '', dob: '' });
    const [appt, setAppt] = useState({ patientId: '', staffId: '', time: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/logistics/beds/all', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const bedsData = await res.json();
            setAllBeds(bedsData);

            const pRes = await getPatients();
            setPatients(pRes.data);

            const dRes = await getDoctors();
            setDoctors(dRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAdmit = async (e) => {
        e.preventDefault();
        try {
            await admitPatient({ ...admitData, bedId: selectedBed.BedID });
            setShowAdmitModal(false);
            loadData();
        } catch (error) {
            alert('Admission failed');
        }
    };

    const handleCreatePatient = async (e) => {
        e.preventDefault();
        try {
            await createPatient({ firstName: newPatient.firstName, lastName: newPatient.lastName, dob: newPatient.dob });
            setNewPatient({ firstName: '', lastName: '', dob: '' });
            loadData();
        } catch (err) {
            alert('Failed to create patient');
        }
    };

    const handleScheduleAppt = async (e) => {
        e.preventDefault();
        try {
            await createAppointment(appt);
            setAppt({ patientId: '', staffId: '', time: '' });
            loadData();
        } catch (err) {
            alert('Failed to schedule appointment');
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Receptionist</h2>

            {/* Add Patient & Select Doctor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4 text-green-600">
                        <UserPlus />
                        <h3 className="font-bold">Add Patient</h3>
                    </div>
                    <form onSubmit={handleCreatePatient} className="space-y-4">
                        <input className="w-full border p-2 rounded" placeholder="First Name" value={newPatient.firstName} onChange={e=>setNewPatient({...newPatient, firstName:e.target.value})} required />
                        <input className="w-full border p-2 rounded" placeholder="Last Name" value={newPatient.lastName} onChange={e=>setNewPatient({...newPatient, lastName:e.target.value})} required />
                        <input className="w-full border p-2 rounded" type="date" value={newPatient.dob} onChange={e=>setNewPatient({...newPatient, dob:e.target.value})} required />
                        <button className="w-full bg-green-600 text-white py-2 rounded">Create</button>
                    </form>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4 text-blue-600">
                        <Grid />
                        <h3 className="font-bold">Schedule Doctor</h3>
                    </div>
                    <form onSubmit={handleScheduleAppt} className="space-y-4">
                        <select className="w-full border p-2 rounded" value={appt.patientId} onChange={e=>setAppt({...appt, patientId:e.target.value})} required>
                            <option value="">Select Patient</option>
                            {patients.map(p => <option key={p.PatientID} value={p.PatientID}>{p.FirstName} {p.LastName}</option>)}
                        </select>
                        <select className="w-full border p-2 rounded" value={appt.staffId} onChange={e=>setAppt({...appt, staffId:e.target.value})} required>
                            <option value="">Select Doctor</option>
                            {doctors.map(d => <option key={d.StaffID} value={d.StaffID}>{d.FirstName} {d.LastName}</option>)}
                        </select>
                        <input className="w-full border p-2 rounded" type="datetime-local" value={appt.time} onChange={e=>setAppt({...appt, time:e.target.value})} required />
                        <button className="w-full bg-blue-600 text-white py-2 rounded">Schedule</button>
                    </form>
                </div>
            </div>

            {/* Bed Grid */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Hospital Facility Overview</h3>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-gray-600">Occupied</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {allBeds.map(bed => (
                    <div
                        key={bed.BedID}
                        onClick={() => bed.IsAvailable && (setSelectedBed(bed), setShowAdmitModal(true))}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer transform hover:scale-105 ${bed.IsAvailable
                                ? 'bg-green-50 border-green-200 hover:border-green-400'
                                : 'bg-red-50 border-red-200 grayscale-[0.5] opacity-80'
                            }`}
                    >
                        <div className="flex flex-col items-center text-center space-y-2">
                            <Bed size={32} className={bed.IsAvailable ? 'text-green-600' : 'text-red-600'} />
                            <div>
                                <p className="font-bold text-gray-800">{bed.RoomNumber}</p>
                                <p className="text-xs font-semibold uppercase tracking-tighter text-gray-500">
                                    {bed.IsAvailable ? 'Empty' : 'In Use'}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Admit Modal */}
            {showAdmitModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center space-x-3 mb-6 text-purple-600">
                            <Activity size={24} />
                            <h3 className="text-xl font-bold text-gray-800">Admit to {selectedBed.RoomNumber}</h3>
                        </div>

                        <form onSubmit={handleAdmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search Patient</label>
                                <select
                                    className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-purple-500 focus:outline-none"
                                    value={admitData.patientId}
                                    onChange={e => setAdmitData({ ...admitData, patientId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select --</option>
                                    {patients.map(p => (
                                        <option key={p.PatientID} value={p.PatientID}>{p.FirstName} {p.LastName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => setShowAdmitModal(false)} className="py-3 bg-gray-100 text-gray-600 font-bold rounded-xl">Cancel</button>
                                <button type="submit" className="py-3 bg-purple-600 text-white font-bold rounded-xl">Confirm Admission</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceptionistDashboard;
