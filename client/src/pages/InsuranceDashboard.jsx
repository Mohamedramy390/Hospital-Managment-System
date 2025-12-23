import React, { useEffect, useState } from 'react';
import { getAllInvoices } from '../api/modules';
import { getInsuranceProviders, getAllClaims, createClaim, updateClaimStatus, getClaimHistory, processApprovedClaim } from '../api/insurance';
import { Shield, Plus, Edit, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const InsuranceDashboard = () => {
    const [providers, setProviders] = useState([]);
    const [claims, setClaims] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [activeTab, setActiveTab] = useState('claims');

    // Form states
    const [newClaim, setNewClaim] = useState({ invoiceId: '', providerId: '', claimAmount: '' });
    const [statusUpdate, setStatusUpdate] = useState({ claimId: '', status: '', notes: '' });
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [claimHistory, setClaimHistory] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [pRes, cRes, iRes] = await Promise.all([
                getInsuranceProviders(),
                getAllClaims(),
                getAllInvoices()
            ]);
            setProviders(pRes.data);
            setClaims(cRes.data);
            setInvoices(iRes.data.filter(inv => inv.Status !== 'Paid')); // Only unpaid/partially paid
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateClaim = async (e) => {
        e.preventDefault();
        try {
            await createClaim(newClaim);
            setNewClaim({ invoiceId: '', providerId: '', claimAmount: '' });
            alert('Claim created successfully!');
            loadData();
        } catch (err) {
            alert('Failed to create claim');
        }
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        try {
            // Update the claim status
            await updateClaimStatus(statusUpdate);

            // If status is "Approved", automatically process the payment
            if (statusUpdate.status === 'Approved' || statusUpdate.status === 'Partially Approved') {
                const claim = claims.find(c => c.ClaimID == statusUpdate.claimId);
                if (claim) {
                    try {
                        const approvedAmount = statusUpdate.approvedAmount ? Number(statusUpdate.approvedAmount) : claim.ClaimAmount;

                        const result = await processApprovedClaim({
                            claimId: statusUpdate.claimId,
                            approvedAmount: approvedAmount,
                            notes: statusUpdate.notes
                        });

                        alert(`Status updated and payment processed!\n\nInsurance Paid: $${result.data.totalPaid}\nPatient Remaining Balance: $${result.data.remainingBalance}`);
                    } catch (paymentErr) {
                        console.error('Payment processing error:', paymentErr);
                        alert('Status updated but payment processing failed. Please process payment manually.');
                    }
                } else {
                    alert('Status updated!');
                }
            } else {
                alert('Status updated!');
            }

            setStatusUpdate({ claimId: '', status: '', notes: '' });
            loadData();
            if (selectedClaim) {
                loadClaimHistory(selectedClaim.ClaimID);
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const loadClaimHistory = async (claimId) => {
        try {
            const res = await getClaimHistory(claimId);
            setClaimHistory(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const viewClaimDetails = (claim) => {
        setSelectedClaim(claim);
        loadClaimHistory(claim.ClaimID);
        setStatusUpdate({ ...statusUpdate, claimId: claim.ClaimID });
    };

    const getStatusColor = (status) => {
        if (!status) return 'bg-gray-100 text-gray-700';
        if (status.includes('Approved') || status === 'Paid') return 'bg-green-100 text-green-700';
        if (status === 'Denied') return 'bg-red-100 text-red-700';
        if (status.includes('Review')) return 'bg-yellow-100 text-yellow-700';
        return 'bg-blue-100 text-blue-700';
    };

    const getStatusIcon = (status) => {
        if (!status) return <Clock size={16} />;
        if (status.includes('Approved') || status === 'Paid') return <CheckCircle size={16} />;
        if (status === 'Denied') return <XCircle size={16} />;
        if (status.includes('Review')) return <AlertCircle size={16} />;
        return <Clock size={16} />;
    };

    // Calculate statistics
    const stats = {
        total: claims.length,
        pending: claims.filter(c => c.CurrentStatus && (c.CurrentStatus === 'Pending' || c.CurrentStatus.includes('Review'))).length,
        approved: claims.filter(c => c.CurrentStatus && c.CurrentStatus.includes('Approved')).length,
        denied: claims.filter(c => c.CurrentStatus === 'Denied').length,
        totalClaimed: claims.reduce((sum, c) => sum + parseFloat(c.ClaimAmount || 0), 0)
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Insurance Claims Management</h2>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                    <p className="text-sm text-gray-600">Total Claims</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-200">
                    <p className="text-sm text-blue-600">Pending</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.pending}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-200">
                    <p className="text-sm text-green-600">Approved</p>
                    <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl shadow-sm border border-red-200">
                    <p className="text-sm text-red-600">Denied</p>
                    <p className="text-2xl font-bold text-red-700">{stats.denied}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl shadow-sm border border-purple-200">
                    <p className="text-sm text-purple-600">Total Claimed</p>
                    <p className="text-2xl font-bold text-purple-700">${stats.totalClaimed.toFixed(2)}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b">
                {['claims', 'create-claim', 'update-status'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-4 font-medium capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Claims List */}
            {activeTab === 'claims' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="text-lg font-bold mb-4">All Claims</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left">Claim ID</th>
                                    <th className="p-3 text-left">Patient</th>
                                    <th className="p-3 text-left">Provider</th>
                                    <th className="p-3 text-left">Invoice</th>
                                    <th className="p-3 text-left">Claim Amount</th>
                                    <th className="p-3 text-left">Status</th>
                                    <th className="p-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {claims.map(claim => (
                                    <tr key={claim.ClaimID}>
                                        <td className="p-3 font-medium">#{claim.ClaimID}</td>
                                        <td className="p-3">{claim.FirstName} {claim.LastName}</td>
                                        <td className="p-3">{claim.ProviderName}</td>
                                        <td className="p-3">${claim.InvoiceAmount}</td>
                                        <td className="p-3 font-bold">${claim.ClaimAmount}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold flex items-center space-x-1 w-fit ${getStatusColor(claim.CurrentStatus)}`}>
                                                {getStatusIcon(claim.CurrentStatus)}
                                                <span>{claim.CurrentStatus || 'Pending'}</span>
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => viewClaimDetails(claim)}
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Claim Details Modal */}
                    {selectedClaim && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                                <h3 className="text-xl font-bold mb-4">Claim #{selectedClaim.ClaimID} Details</h3>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-600">Patient</p>
                                        <p className="font-bold">{selectedClaim.FirstName} {selectedClaim.LastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Insurance Provider</p>
                                        <p className="font-bold">{selectedClaim.ProviderName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Invoice Amount</p>
                                        <p className="font-bold">${selectedClaim.InvoiceAmount}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Claim Amount</p>
                                        <p className="font-bold">${selectedClaim.ClaimAmount}</p>
                                    </div>
                                </div>

                                <h4 className="font-bold mb-2">Status History</h4>
                                <div className="space-y-2 mb-4">
                                    {claimHistory.map((status, idx) => (
                                        <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(status.Status)}`}>
                                                    {status.Status}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(status.Date).toLocaleString()}
                                                </span>
                                            </div>
                                            {status.Notes && <p className="text-sm text-gray-600 mt-1">{status.Notes}</p>}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setSelectedClaim(null)}
                                    className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create Claim */}
            {activeTab === 'create-claim' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center space-x-2 text-green-600 mb-4">
                        <Plus size={24} />
                        <h3 className="text-lg font-bold">Create New Insurance Claim</h3>
                    </div>
                    <form onSubmit={handleCreateClaim} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Select Invoice</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={newClaim.invoiceId}
                                onChange={(e) => {
                                    const inv = invoices.find(i => i.InvoiceID == e.target.value);
                                    setNewClaim({
                                        ...newClaim,
                                        invoiceId: e.target.value,
                                        claimAmount: inv ? inv.TotalAmount : ''
                                    });
                                }}
                                required
                            >
                                <option value="">Select Invoice</option>
                                {invoices.map(inv => (
                                    <option key={inv.InvoiceID} value={inv.InvoiceID}>
                                        Invoice #{inv.InvoiceID} - Visit #{inv.VisitID} - ${inv.TotalAmount}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Insurance Provider</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={newClaim.providerId}
                                onChange={(e) => setNewClaim({ ...newClaim, providerId: e.target.value })}
                                required
                            >
                                <option value="">Select Provider</option>
                                {providers.map(prov => (
                                    <option key={prov.ProviderID} value={prov.ProviderID}>
                                        {prov.ProviderName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Claim Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full border p-2 rounded"
                                placeholder="Enter claim amount"
                                value={newClaim.claimAmount}
                                onChange={(e) => setNewClaim({ ...newClaim, claimAmount: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                            Create Claim
                        </button>
                    </form>
                </div>
            )}

            {/* Update Status */}
            {activeTab === 'update-status' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center space-x-2 text-blue-600 mb-4">
                        <Edit size={24} />
                        <h3 className="text-lg font-bold">Update Claim Status</h3>
                    </div>
                    <form onSubmit={handleUpdateStatus} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Select Claim</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={statusUpdate.claimId}
                                onChange={(e) => {
                                    const c = claims.find(c => c.ClaimID == e.target.value);
                                    setStatusUpdate({
                                        ...statusUpdate,
                                        claimId: e.target.value,
                                        approvedAmount: c ? c.ClaimAmount : '' // Default to claim amount
                                    });
                                }}
                                required
                            >
                                <option value="">Select Claim</option>
                                {claims.map(claim => (
                                    <option key={claim.ClaimID} value={claim.ClaimID}>
                                        Claim #{claim.ClaimID} - {claim.FirstName} {claim.LastName} - ${claim.ClaimAmount}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">New Status</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={statusUpdate.status}
                                onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                                required
                            >
                                <option value="">Select Status</option>
                                <option value="Submitted">Submitted</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Additional Info Required">Additional Info Required</option>
                                <option value="Approved">Approved</option>
                                <option value="Partially Approved">Partially Approved</option>
                                <option value="Denied">Denied</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>

                        {/* Approved Amount Input - Only for Approved/Partially Approved */}
                        {(statusUpdate.status === 'Approved' || statusUpdate.status === 'Partially Approved') && (
                            <div>
                                <label className="block text-sm font-medium mb-1 text-green-700">
                                    Approved Amount to Pay ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full border p-2 rounded border-green-300 bg-green-50"
                                    placeholder="Enter amount insurance will pay"
                                    value={statusUpdate.approvedAmount || ''}
                                    onChange={(e) => setStatusUpdate({ ...statusUpdate, approvedAmount: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-green-600 mt-1">
                                    This amount will be recorded as paid by Insurance. The patient will owe the remaining balance.
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Notes</label>
                            <textarea
                                className="w-full border p-2 rounded"
                                rows="3"
                                placeholder="Add notes about this status update"
                                value={statusUpdate.notes}
                                onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                            Update Status & Process Payment
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default InsuranceDashboard;
