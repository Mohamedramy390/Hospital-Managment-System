import React, { useEffect, useState } from 'react';
import { assignSurgeon, getPendingSurgeryRequests, assignNurse, getAllInvoices, generateInvoice, processPayment } from '../api/modules';
import { getDoctors, getPatients, getActiveVisits, getAvailableBeds, getNurses, admitPatient } from '../api/logistics';
import { UserPlus, Trash2, Edit, Scissors, Bed, UserCheck, DollarSign, CreditCard } from 'lucide-react';

const AdminDashboard = () => {
    const [pendingSurgeries, setPendingSurgeries] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [activeVisits, setActiveVisits] = useState([]);
    const [availableBeds, setAvailableBeds] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [invoices, setInvoices] = useState([]);

    const [surgeryAssign, setSurgeryAssign] = useState({ requestId: '', surgeonStaffId: '' });
    const [emergencyAdmit, setEmergencyAdmit] = useState({ patientId: '', bedId: '' });
    const [nurseAssign, setNurseAssign] = useState({ visitId: '', staffId: '' });
    const [paymentProcess, setPaymentProcess] = useState({ invoiceId: '', amount: '' });
    const [invoiceGen, setInvoiceGen] = useState({ visitId: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [sRes, dRes, pRes, vRes, bRes, nRes, iRes] = await Promise.all([
                getPendingSurgeryRequests(),
                getDoctors(),
                getPatients(),
                getActiveVisits(),
                getAvailableBeds(),
                getNurses(),
                getAllInvoices()
            ]);
            setPendingSurgeries(sRes.data);
            setDoctors(dRes.data);
            setPatients(pRes.data);
            setActiveVisits(vRes.data);
            setAvailableBeds(bRes.data);
            setNurses(nRes.data);
            setInvoices(iRes.data);
        } catch (err) {
            console.error('Error loading admin data:', err);
        }
    };

    const handleAssignSurgeon = async (e) => {
        e.preventDefault();
        try {
            await assignSurgeon(surgeryAssign.requestId, { surgeonStaffId: Number(surgeryAssign.surgeonStaffId) });
            setSurgeryAssign({ requestId: '', surgeonStaffId: '' });
            alert('Surgeon assigned');
            loadData();
        } catch (err) {
            alert('Failed to assign surgeon');
        }
    };

    const handleEmergencyAdmit = async (e) => {
        e.preventDefault();
        try {
            await admitPatient({ patientId: Number(emergencyAdmit.patientId), type: 'Emergency', bedId: Number(emergencyAdmit.bedId) });
            setEmergencyAdmit({ patientId: '', bedId: '' });
            alert('Emergency admission completed');
            loadData();
        } catch (err) {
            alert('Failed to admit');
        }
    };

    const handleAssignNurse = async (e) => {
        e.preventDefault();
        try {
            await assignNurse({ visitId: Number(nurseAssign.visitId), staffId: Number(nurseAssign.staffId) });
            setNurseAssign({ visitId: '', staffId: '' });
            alert('Nurse assigned');
            loadData();
        } catch (err) {
            alert('Failed to assign nurse');
        }
    };

    const handleGenerateInvoice = async (e) => {
        e.preventDefault();
        try {
            await generateInvoice(invoiceGen.visitId);
            setInvoiceGen({ visitId: '' });
            alert('Invoice Generated');
            loadData();
        } catch (err) {
            alert('Failed to generate invoice');
        }
    };

    const handleProcessPayment = async (invoiceId, totalAmount) => {
        const amount = prompt(`Enter Payment Amount (Total: $${totalAmount})`);
        if (!amount) return;
        try {
            await processPayment({ invoiceId, amount: Number(amount), method: 'Cash' }); // Default to Cash for now
            alert('Payment Processed');
            loadData();
        } catch (err) {
            alert('Payment Failed');
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>

            {/* Pending Surgery Assignments */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
                <div className="flex items-center space-x-2 text-red-600 mb-4">
                    <Scissors />
                    <h3 className="text-lg font-bold">Pending Surgery Requests</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                        {pendingSurgeries.length === 0 ? <p className="text-gray-500">No pending requests.</p> : (
                            pendingSurgeries.map(req => (
                                <div key={req.RequestID} className="border p-3 rounded bg-red-50 flex justify-between items-center cursor-pointer hover:bg-red-100"
                                    onClick={() => setSurgeryAssign(prev => ({ ...prev, requestId: req.RequestID }))}>
                                    <div>
                                        <p className="font-bold text-gray-800">Req #{req.RequestID}: {req.PatientFirstName} {req.PatientLastName}</p>
                                        <p className="text-sm text-gray-600">Requested by Dr. {req.DocLastName}</p>
                                    </div>
                                    <button className="text-xs bg-white border border-red-300 px-2 py-1 rounded text-red-600 font-bold">Select</button>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded border">
                        <h4 className="font-bold text-gray-700 mb-3">Assign Surgeon</h4>
                        <form onSubmit={handleAssignSurgeon} className="space-y-3">
                            <div>
                                <label className="block text-sm text-gray-600">Request ID</label>
                                <input className="w-full border p-2 rounded bg-white" value={surgeryAssign.requestId} readOnly placeholder="Select from list..." required />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600">Select Surgeon</label>
                                <select className="w-full border p-2 rounded bg-white" value={surgeryAssign.surgeonStaffId} onChange={e => setSurgeryAssign({ ...surgeryAssign, surgeonStaffId: e.target.value })} required>
                                    <option value="">-- Choose Surgeon --</option>
                                    {doctors.map(d => <option key={d.StaffID} value={d.StaffID}>Dr. {d.FirstName} {d.LastName}</option>)}
                                </select>
                            </div>
                            <button className="w-full bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700">Assign Surgeon</button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Emergency Admit */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center space-x-2 text-purple-600 mb-3">
                        <Bed />
                        <h3 className="font-bold">Emergency Admit</h3>
                    </div>
                    <form onSubmit={handleEmergencyAdmit} className="space-y-3">
                        <select className="w-full border p-2 rounded" value={emergencyAdmit.patientId} onChange={e => setEmergencyAdmit({ ...emergencyAdmit, patientId: e.target.value })} required>
                            <option value="">-- Select Patient --</option>
                            {patients.map(p => <option key={p.PatientID} value={p.PatientID}>{p.FirstName} {p.LastName}</option>)}
                        </select>
                        <select className="w-full border p-2 rounded" value={emergencyAdmit.bedId} onChange={e => setEmergencyAdmit({ ...emergencyAdmit, bedId: e.target.value })} required>
                            <option value="">-- Select Bed --</option>
                            {availableBeds.map(b => <option key={b.BedID} value={b.BedID}>{b.RoomNumber}</option>)}
                        </select>
                        <button className="w-full bg-purple-600 text-white py-2 rounded">Admit</button>
                    </form>
                </div>

                {/* Assign Nurse */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center space-x-2 text-green-600 mb-3">
                        <Edit />
                        <h3 className="font-bold">Assign Nurse to Visit</h3>
                    </div>
                    <form onSubmit={handleAssignNurse} className="space-y-3">
                        <select className="w-full border p-2 rounded" value={nurseAssign.visitId} onChange={e => setNurseAssign({ ...nurseAssign, visitId: e.target.value })} required>
                            <option value="">-- Select Active Visit --</option>
                            {activeVisits.map(v => <option key={v.VisitID} value={v.VisitID}>Visit #{v.VisitID} - {v.FirstName} {v.LastName}</option>)}
                        </select>
                        <select className="w-full border p-2 rounded" value={nurseAssign.staffId} onChange={e => setNurseAssign({ ...nurseAssign, staffId: e.target.value })} required>
                            <option value="">-- Select Nurse --</option>
                            {nurses.map(n => <option key={n.StaffID} value={n.StaffID}>{n.FirstName} {n.LastName}</option>)}
                        </select>
                        <button className="w-full bg-green-600 text-white py-2 rounded">Assign</button>
                    </form>
                </div>
            </div>

            {/* Finance Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-200">
                <div className="flex items-center justify-between text-emerald-600 mb-4">
                    <div className="flex items-center space-x-2">
                        <DollarSign />
                        <h3 className="text-lg font-bold">Finance & Billing</h3>
                    </div>
                    {/* Generate Invoice Form */}
                    <form onSubmit={handleGenerateInvoice} className="flex space-x-2">
                        <select className="border p-2 rounded text-sm" value={invoiceGen.visitId} onChange={e => setInvoiceGen({ visitId: e.target.value })} required>
                            <option value="">-- Active Visit for Invoice --</option>
                            {activeVisits.map(v => <option key={v.VisitID} value={v.VisitID}>#{v.VisitID} {v.FirstName} {v.LastName}</option>)}
                        </select>
                        <button className="bg-emerald-600 text-white px-3 rounded text-sm font-bold">Generate Invoice</button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-emerald-50 text-emerald-800">
                            <tr>
                                <th className="p-3">Invoice ID</th>
                                <th className="p-3">Patient</th>
                                <th className="p-3">Total Amount</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {invoices.length === 0 ? <tr><td colSpan="5" className="p-3 text-center text-gray-500">No invoices found.</td></tr> : (
                                invoices.map(inv => (
                                    <tr key={inv.InvoiceID}>
                                        <td className="p-3">#{inv.InvoiceID}</td>
                                        <td className="p-3">{inv.FirstName} {inv.LastName}</td>
                                        <td className="p-3 font-bold">${inv.TotalAmount}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${inv.Status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {inv.Status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            {inv.Status !== 'Paid' && (
                                                <button onClick={() => handleProcessPayment(inv.InvoiceID, inv.TotalAmount)} className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-800">
                                                    <CreditCard size={16} /> <span>Pay</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
