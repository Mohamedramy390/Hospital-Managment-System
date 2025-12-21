import React, { useState } from 'react';
import { generateInvoice, getInvoice, processPayment } from '../api/modules';
import { Landmark, Receipt, CreditCard, CheckCircle, Search } from 'lucide-react';

const FinanceDashboard = () => {
    const [visitId, setVisitId] = useState('');
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentModal, setPaymentModal] = useState(false);
    const [payAmount, setPayAmount] = useState('');

    const handleGenerate = async () => {
        if (!visitId) return;
        setLoading(true);
        try {
            const res = await generateInvoice(visitId);
            const invRes = await getInvoice(res.data.invoiceId);
            setInvoice(invRes.data);
        } catch (err) {
            alert('Failed to generate invoice. Make sure visit ID exists and tests/beds are assigned.');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            await processPayment({
                invoiceId: invoice.InvoiceID,
                amount: payAmount,
                method: 'Card'
            });
            alert('Payment processed');
            setPaymentModal(false);
            // Reload invoice
            const invRes = await getInvoice(invoice.InvoiceID);
            setInvoice(invRes.data);
        } catch (err) {
            alert('Payment failed');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Billing & Finance</h2>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Patient Visit ID</label>
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Search visit to bill..."
                            value={visitId}
                            onChange={e => setVisitId(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                    <Receipt size={18} />
                    <span>{loading ? 'Processing...' : 'Generate Invoice'}</span>
                </button>
            </div>

            {invoice && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in duration-500">
                    <div className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Invoice #{invoice.InvoiceID}</h3>
                            <p className="text-sm text-gray-500 text-uppercase">Visit ID: {invoice.VisitID}</p>
                        </div>
                        <span className={`px-4 py-1 rounded-full text-sm font-bold ${invoice.Status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {invoice.Status.toUpperCase()}
                        </span>
                    </div>

                    <div className="p-8">
                        <table className="w-full mb-8">
                            <thead>
                                <tr className="border-b-2 border-gray-100 text-left text-gray-400 text-sm uppercase tracking-wider">
                                    <th className="pb-4">Description</th>
                                    <th className="pb-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {invoice.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="py-4 text-gray-700 font-medium">{item.Description}</td>
                                        <td className="py-4 text-right text-gray-900 font-bold">${parseFloat(item.Amount).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="text-xl font-bold text-gray-900">
                                    <td className="pt-6 border-t border-gray-200">Total Amount</td>
                                    <td className="pt-6 text-right border-t border-gray-200">${parseFloat(invoice.TotalAmount).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>

                        {invoice.Status !== 'Paid' && (
                            <button
                                onClick={() => setPaymentModal(true)}
                                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition"
                            >
                                <CreditCard size={20} />
                                <span>Process Card Payment</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {paymentModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center space-x-3 mb-6 text-green-600">
                            <Landmark size={28} />
                            <h3 className="text-xl font-bold">Secure Payment</h3>
                        </div>

                        <form onSubmit={handlePayment} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Pay ($)</label>
                                <input
                                    type="number"
                                    className="w-full border-2 border-gray-100 rounded-xl p-4 text-2xl font-bold text-center focus:border-green-500 focus:outline-none"
                                    value={payAmount}
                                    onChange={e => setPayAmount(e.target.value)}
                                    max={invoice.TotalAmount}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => setPaymentModal(false)} className="py-3 bg-gray-100 text-gray-600 font-bold rounded-xl">Cancel</button>
                                <button type="submit" className="py-3 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center space-x-2">
                                    <CheckCircle size={18} />
                                    <span>Confirm</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceDashboard;
