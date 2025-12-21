import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileText, Beaker, Receipt, Calendar, Download } from 'lucide-react';

const PatientPortal = () => {
    const [visits, setVisits] = useState([]);
    const [results, setResults] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [activeTab, setActiveTab] = useState('results');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [vRes, rRes, iRes] = await Promise.all([
                api.get('/portal/visits'),
                api.get('/portal/results'),
                api.get('/portal/invoices')
            ]);
            setVisits(vRes.data);
            setResults(rRes.data);
            setInvoices(iRes.data);
        } catch (error) {
            console.error('Failed to load portal data');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 rounded-3xl text-white shadow-xl">
                <h2 className="text-3xl font-extrabold mb-2">My Health Records</h2>
                <p className="opacity-90">Manage your visits, view lab results, and track your medical expenses.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 max-w-md">
                <button
                    onClick={() => setActiveTab('results')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold transition ${activeTab === 'results' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <Beaker size={18} />
                    <span>Results</span>
                </button>
                <button
                    onClick={() => setActiveTab('visits')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold transition ${activeTab === 'visits' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <Calendar size={18} />
                    <span>Visits</span>
                </button>
                <button
                    onClick={() => setActiveTab('billing')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold transition ${activeTab === 'billing' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <Receipt size={18} />
                    <span>Billing</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 gap-6">
                {activeTab === 'results' && (
                    <div className="space-y-4">
                        {results.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed text-gray-400">No test results available yet.</div>
                        ) : (
                            results.map(res => (
                                <div key={res.ResultID} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                            <Beaker />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg">{res.TestName}</h3>
                                            <p className="text-sm text-gray-500">Recorded on {new Date(res.AdmissionTime).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center space-x-8">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Result</p>
                                            <p className="text-xl font-extrabold text-blue-600">{res.ResultValue}</p>
                                            <p className="text-xs text-gray-400">Ref: {res.ReferenceRange}</p>
                                        </div>
                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Download size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'visits' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {visits.map(visit => (
                            <div key={visit.VisitID} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block ${visit.VisitType === 'Emergency' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {visit.VisitType.toUpperCase()}
                                </span>
                                <h3 className="text-lg font-bold text-gray-800">Hospital Visit #{visit.VisitID}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Admitted on {new Date(visit.AdmissionTime).toLocaleString()}
                                </p>
                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center space-x-2 text-blue-600 font-bold text-sm cursor-pointer hover:translate-x-1 transition-transform">
                                    <span>View medical details</span>
                                    <FileText size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <th className="px-8 py-4">Invoice #</th>
                                    <th className="px-8 py-4">Date</th>
                                    <th className="px-8 py-4">Amount</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {invoices.map(inv => (
                                    <tr key={inv.InvoiceID} className="hover:bg-gray-50/50 transition">
                                        <td className="px-8 py-5 font-bold text-gray-800">INV-{inv.InvoiceID}</td>
                                        <td className="px-8 py-5 text-gray-500">{new Date(inv.AdmissionTime).toLocaleDateString()}</td>
                                        <td className="px-8 py-5 font-extrabold text-gray-900">${parseFloat(inv.TotalAmount).toFixed(2)}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${inv.Status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {inv.Status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-blue-600 font-bold text-sm hover:underline">View Receipt</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientPortal;
