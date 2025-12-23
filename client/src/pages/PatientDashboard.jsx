import React, { useEffect, useState } from 'react';
import { getMyVisits, getMyResults, getMyInvoices, getMyAppointments, getMyPrescriptions, getMyDiagnoses, getMyInsuranceClaims, portalPayPayment } from '../api/portal';
import { Calendar, FileText, Activity, CreditCard, DollarSign, Clock, Pill, Stethoscope, Shield } from 'lucide-react';

const PatientDashboard = () => {
    const [visits, setVisits] = useState([]);
    const [results, setResults] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [diagnoses, setDiagnoses] = useState([]);
    const [insuranceClaims, setInsuranceClaims] = useState([]);
    const [activeTab, setActiveTab] = useState('appointments');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [vRes, rRes, iRes, aRes, pRes, dRes, icRes] = await Promise.all([
                getMyVisits(),
                getMyResults(),
                getMyInvoices(),
                getMyAppointments(),
                getMyPrescriptions(),
                getMyDiagnoses(),
                getMyInsuranceClaims()
            ]);
            setVisits(vRes.data);
            setResults(rRes.data);
            setInvoices(iRes.data);
            setAppointments(aRes.data);
            setPrescriptions(pRes.data);
            setDiagnoses(dRes.data);
            setInsuranceClaims(icRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePay = async (invoiceId, amount) => {
        if (!window.confirm(`Pay $${amount} for Invoice #${invoiceId}?`)) return;
        try {
            await portalPayPayment({ invoiceId, amount, method: 'Card' });
            alert('Payment Successful!');
            loadData();
        } catch (err) {
            alert('Payment failed');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Patient Portal</h2>

            {/* Tabs */}
            <div className="flex space-x-4 border-b overflow-x-auto">
                {['appointments', 'visits', 'diagnoses', 'prescriptions', 'results', 'insurance', 'billing'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-4 font-medium capitalize whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white p-6 rounded-xl shadow-sm border min-h-[400px]">

                {/* Appointments */}
                {activeTab === 'appointments' && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-purple-600 mb-2">
                            <Calendar /> <h3 className="font-bold">My Appointments</h3>
                        </div>
                        {appointments.length === 0 ? <p className="text-gray-500">No upcoming appointments.</p> : (
                            <div className="grid gap-4">
                                {appointments.map(apt => (
                                    <div key={apt.AppointmentID} className="border p-4 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">{new Date(apt.AppointmentTime).toLocaleString()}</p>
                                            <p className="text-sm text-gray-600">Dr. {apt.DoctorFirstName} {apt.DoctorLastName}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs ${apt.Status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {apt.Status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Visits */}
                {activeTab === 'visits' && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-blue-600 mb-2">
                            <Clock /> <h3 className="font-bold">Visit History</h3>
                        </div>
                        {visits.length === 0 ? <p className="text-gray-500">No visit history.</p> : (
                            <div className="space-y-3">
                                {visits.map(v => (
                                    <div key={v.VisitID} className="border p-4 rounded-lg bg-gray-50">
                                        <div className="flex justify-between">
                                            <span className="font-bold">Visit #{v.VisitID} ({v.VisitType})</span>
                                            <span className="text-sm text-gray-500">{new Date(v.AdmissionTime).toLocaleDateString()}</span>
                                        </div>
                                        {v.DischargeTime && <p className="text-xs text-gray-400 mt-1">Discharged: {new Date(v.DischargeTime).toLocaleDateString()}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Diagnoses */}
                {activeTab === 'diagnoses' && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-red-600 mb-2">
                            <Stethoscope /> <h3 className="font-bold">My Diagnoses</h3>
                        </div>
                        {diagnoses.length === 0 ? <p className="text-gray-500">No diagnoses recorded.</p> : (
                            <div className="space-y-3">
                                {diagnoses.map(diag => (
                                    <div key={diag.DiagnosisID} className="border p-4 rounded-lg bg-red-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-sm text-gray-500">{new Date(diag.AdmissionTime).toLocaleDateString()} - {diag.VisitType}</p>
                                                <p className="text-xs text-gray-400">Dr. {diag.DoctorFirstName} {diag.DoctorLastName}</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-800 whitespace-pre-wrap">{diag.DiagnosisNotes}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Prescriptions */}
                {activeTab === 'prescriptions' && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-green-600 mb-2">
                            <Pill /> <h3 className="font-bold">My Prescriptions</h3>
                        </div>
                        {prescriptions.length === 0 ? <p className="text-gray-500">No prescriptions found.</p> : (
                            <div className="space-y-3">
                                {prescriptions.map(presc => (
                                    <div key={presc.PrescriptionID} className="border p-4 rounded-lg bg-green-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-gray-800">Prescription #{presc.PrescriptionID}</p>
                                                <p className="text-sm text-gray-500">{new Date(presc.AdmissionTime).toLocaleDateString()} - {presc.VisitType}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-sm font-medium text-gray-600">Medications:</p>
                                            <p className="text-gray-800">{presc.Medications || 'No medications listed'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Lab Results */}
                {activeTab === 'results' && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                            <Activity /> <h3 className="font-bold">Lab Results</h3>
                        </div>
                        {results.length === 0 ? <p className="text-gray-500">No lab results available.</p> : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 uppercase text-xs">
                                        <tr>
                                            <th className="p-3">Test</th>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Result</th>
                                            <th className="p-3">Ref Range</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {results.map((res, idx) => (
                                            <tr key={idx}>
                                                <td className="p-3 font-medium">{res.TestName}</td>
                                                <td className="p-3">{new Date(res.AdmissionTime).toLocaleDateString()}</td>
                                                <td className="p-3 font-bold text-gray-800">{res.ResultValue}</td>
                                                <td className="p-3 text-gray-500">{res.ReferenceRange}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Insurance Claims */}
                {activeTab === 'insurance' && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-blue-600 mb-2">
                            <Shield /> <h3 className="font-bold">My Insurance Claims</h3>
                        </div>
                        {insuranceClaims.length === 0 ? <p className="text-gray-500">No insurance claims found.</p> : (
                            <div className="space-y-3">
                                {insuranceClaims.map(claim => {
                                    const getStatusColor = (status) => {
                                        if (!status) return 'bg-gray-100 text-gray-700';
                                        if (status.includes('Approved') || status === 'Paid') return 'bg-green-100 text-green-700';
                                        if (status === 'Denied') return 'bg-red-100 text-red-700';
                                        if (status.includes('Review')) return 'bg-yellow-100 text-yellow-700';
                                        return 'bg-blue-100 text-blue-700';
                                    };

                                    return (
                                        <div key={claim.ClaimID} className="border p-4 rounded-lg bg-blue-50">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-gray-800">Claim #{claim.ClaimID}</p>
                                                    <p className="text-sm text-gray-600">{claim.ProviderName}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Visit: {new Date(claim.AdmissionTime).toLocaleDateString()} ({claim.VisitType})
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(claim.CurrentStatus)}`}>
                                                    {claim.CurrentStatus || 'Pending'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Invoice Amount:</span>
                                                    <span className="font-bold ml-2">${claim.InvoiceAmount}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Claim Amount:</span>
                                                    <span className="font-bold ml-2">${claim.ClaimAmount}</span>
                                                </div>
                                            </div>
                                            {claim.LastUpdated && (
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Last updated: {new Date(claim.LastUpdated).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Billing */}
                {activeTab === 'billing' && (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-green-600 mb-2">
                            <DollarSign /> <h3 className="font-bold">Invoices & Payments</h3>
                        </div>
                        {invoices.length === 0 ? <p className="text-gray-500">No invoices found.</p> : (
                            <div className="space-y-3">
                                {invoices.map(inv => {
                                    // Calculate remaining balance (Total - Already Paid)
                                    const totalPaid = parseFloat(inv.TotalPaid || 0);
                                    const totalAmount = parseFloat(inv.TotalAmount || 0);
                                    const remainingBalance = totalAmount - totalPaid;

                                    return (
                                        <div key={inv.InvoiceID} className="border p-4 rounded-lg">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-bold text-gray-800">Invoice #{inv.InvoiceID}</p>
                                                    <p className="text-xs text-gray-500">Date: {new Date(inv.AdmissionTime).toLocaleDateString()}</p>
                                                </div>
                                                {/* Logic to determine badge: If balance > 0, it is at least Partially Paid or Unpaid, never fully Paid */}
                                                <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${remainingBalance <= 0.01 ? 'bg-green-100 text-green-700' :
                                                    totalPaid > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {remainingBalance <= 0.01 ? 'Paid' : totalPaid > 0 ? 'Partially Paid' : 'Unpaid'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                                <div>
                                                    <span className="text-gray-600">Total Amount:</span>
                                                    <span className="font-bold ml-2">${totalAmount.toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Paid (Insurance/You):</span>
                                                    <span className="font-bold ml-2 text-green-600">${totalPaid.toFixed(2)}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-gray-600">Your Balance:</span>
                                                    <span className="font-bold ml-2 text-lg text-blue-600">${remainingBalance.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            {remainingBalance > 0.01 ? (
                                                <button
                                                    onClick={() => handlePay(inv.InvoiceID, remainingBalance.toFixed(2))}
                                                    className="w-full bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 flex items-center justify-center space-x-2 mt-2"
                                                >
                                                    <CreditCard size={16} />
                                                    <span>Pay Balance ${remainingBalance.toFixed(2)}</span>
                                                </button>
                                            ) : (
                                                <div className="text-center text-sm text-green-600 font-bold mt-2 border-t pt-2">
                                                    Fully Paid
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default PatientDashboard;
// Re-build force updated status logic
