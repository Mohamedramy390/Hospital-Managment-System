import React, { useEffect, useState } from 'react';
import { getMedicine, getInventory, dispenseMedicine } from '../api/modules';
import api from '../api/axios';
import { Package, AlertTriangle, Plus, Edit, Calendar, TrendingDown } from 'lucide-react';

const PharmacistDashboard = () => {
    const [medicines, setMedicines] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [inventoryWithWarnings, setInventoryWithWarnings] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [expiring, setExpiring] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    // Form states
    const [newMedicine, setNewMedicine] = useState('');
    const [newBatch, setNewBatch] = useState({ medicineId: '', expiryDate: '', quantity: '' });
    const [editInventory, setEditInventory] = useState({ inventoryId: '', quantity: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [mRes, invRes, warnRes, lowRes, expRes] = await Promise.all([
                getMedicine(),
                getInventory(),
                api.get('/pharmacy/inventory/warnings'),
                api.get('/pharmacy/low-stock'),
                api.get('/pharmacy/expiring')
            ]);
            setMedicines(mRes.data);
            setInventory(invRes.data);
            setInventoryWithWarnings(warnRes.data);
            setLowStock(lowRes.data);
            setExpiring(expRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        try {
            await api.post('/pharmacy/medicine', { name: newMedicine });
            setNewMedicine('');
            alert('Medicine added successfully!');
            loadData();
        } catch (err) {
            alert('Failed to add medicine');
        }
    };

    const handleAddBatch = async (e) => {
        e.preventDefault();
        try {
            await api.post('/pharmacy/batch', newBatch);
            setNewBatch({ medicineId: '', expiryDate: '', quantity: '' });
            alert('Batch added successfully!');
            loadData();
        } catch (err) {
            alert('Failed to add batch');
        }
    };

    const handleUpdateInventory = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/pharmacy/inventory/${editInventory.inventoryId}`, { quantity: editInventory.quantity });
            setEditInventory({ inventoryId: '', quantity: '' });
            alert('Inventory updated!');
            loadData();
        } catch (err) {
            alert('Failed to update inventory');
        }
    };

    const getStockStatusColor = (status) => {
        switch (status) {
            case 'LOW': return 'bg-red-100 text-red-700 border-red-300';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            default: return 'bg-green-100 text-green-700 border-green-300';
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Pharmacy Management</h2>

            {/* Warning Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl">
                    <div className="flex items-center space-x-2 text-red-600 mb-2">
                        <AlertTriangle size={24} />
                        <h3 className="font-bold">Low Stock Alert</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-700">{lowStock.length}</p>
                    <p className="text-sm text-red-600">Medicines need restocking</p>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl">
                    <div className="flex items-center space-x-2 text-yellow-600 mb-2">
                        <Calendar size={24} />
                        <h3 className="font-bold">Expiring Soon</h3>
                    </div>
                    <p className="text-3xl font-bold text-yellow-700">{expiring.length}</p>
                    <p className="text-sm text-yellow-600">Items expiring in 30 days</p>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
                    <div className="flex items-center space-x-2 text-blue-600 mb-2">
                        <Package size={24} />
                        <h3 className="font-bold">Total Medicines</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">{medicines.length}</p>
                    <p className="text-sm text-blue-600">In system</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b overflow-x-auto">
                {['overview', 'inventory', 'add-medicine', 'add-batch', 'alerts'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-4 font-medium capitalize whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="text-lg font-bold mb-4">Stock Status Overview</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left">Medicine</th>
                                    <th className="p-3 text-left">Total Quantity</th>
                                    <th className="p-3 text-left">Batches</th>
                                    <th className="p-3 text-left">Nearest Expiry</th>
                                    <th className="p-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {inventoryWithWarnings.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-3 font-medium">{item.MedicineName}</td>
                                        <td className="p-3">{item.TotalQuantity || 0}</td>
                                        <td className="p-3">{item.BatchCount}</td>
                                        <td className="p-3">
                                            {item.NearestExpiry ? new Date(item.NearestExpiry).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${getStockStatusColor(item.StockStatus)}`}>
                                                {item.StockStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="text-lg font-bold mb-4">Detailed Inventory</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left">Medicine</th>
                                    <th className="p-3 text-left">Batch ID</th>
                                    <th className="p-3 text-left">Quantity</th>
                                    <th className="p-3 text-left">Expiry Date</th>
                                    <th className="p-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {inventory.map((item) => (
                                    <tr key={item.InventoryID}>
                                        <td className="p-3 font-medium">{item.MedicineName}</td>
                                        <td className="p-3">{item.BatchID}</td>
                                        <td className="p-3 font-bold">{item.Quantity}</td>
                                        <td className="p-3">{new Date(item.ExpiryDate).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => setEditInventory({ inventoryId: item.InventoryID, quantity: item.Quantity })}
                                                className="text-blue-600 hover:underline text-xs flex items-center space-x-1"
                                            >
                                                <Edit size={14} /> <span>Edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Edit Inventory Form */}
                    {editInventory.inventoryId && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-bold mb-2">Update Inventory</h4>
                            <form onSubmit={handleUpdateInventory} className="flex items-center space-x-3">
                                <input
                                    type="number"
                                    className="border p-2 rounded flex-1"
                                    placeholder="New Quantity"
                                    value={editInventory.quantity}
                                    onChange={(e) => setEditInventory({ ...editInventory, quantity: e.target.value })}
                                    required
                                />
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    Update
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditInventory({ inventoryId: '', quantity: '' })}
                                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Add Medicine Tab */}
            {activeTab === 'add-medicine' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center space-x-2 text-green-600 mb-4">
                        <Plus size={24} />
                        <h3 className="text-lg font-bold">Add New Medicine</h3>
                    </div>
                    <form onSubmit={handleAddMedicine} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Medicine Name</label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded"
                                placeholder="Enter medicine name"
                                value={newMedicine}
                                onChange={(e) => setNewMedicine(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                            Add Medicine
                        </button>
                    </form>
                </div>
            )}

            {/* Add Batch Tab */}
            {activeTab === 'add-batch' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center space-x-2 text-purple-600 mb-4">
                        <Package size={24} />
                        <h3 className="text-lg font-bold">Add New Batch</h3>
                    </div>
                    <form onSubmit={handleAddBatch} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Medicine</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={newBatch.medicineId}
                                onChange={(e) => setNewBatch({ ...newBatch, medicineId: e.target.value })}
                                required
                            >
                                <option value="">Select Medicine</option>
                                {medicines.map(med => (
                                    <option key={med.MedicineID} value={med.MedicineID}>
                                        {med.Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Expiry Date</label>
                            <input
                                type="date"
                                className="w-full border p-2 rounded"
                                value={newBatch.expiryDate}
                                onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Quantity</label>
                            <input
                                type="number"
                                className="w-full border p-2 rounded"
                                placeholder="Enter quantity"
                                value={newBatch.quantity}
                                onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
                            Add Batch
                        </button>
                    </form>
                </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
                <div className="space-y-6">
                    {/* Low Stock */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
                        <div className="flex items-center space-x-2 text-red-600 mb-4">
                            <TrendingDown size={24} />
                            <h3 className="text-lg font-bold">Low Stock Medicines</h3>
                        </div>
                        {lowStock.length === 0 ? (
                            <p className="text-gray-500">No low stock items</p>
                        ) : (
                            <div className="space-y-2">
                                {lowStock.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-200">
                                        <span className="font-medium">{item.MedicineName}</span>
                                        <span className="text-red-700 font-bold">{item.TotalQuantity || 0} units</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Expiring Soon */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200">
                        <div className="flex items-center space-x-2 text-yellow-600 mb-4">
                            <Calendar size={24} />
                            <h3 className="text-lg font-bold">Expiring in 30 Days</h3>
                        </div>
                        {expiring.length === 0 ? (
                            <p className="text-gray-500">No expiring items</p>
                        ) : (
                            <div className="space-y-2">
                                {expiring.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-yellow-50 rounded border border-yellow-200">
                                        <div>
                                            <span className="font-medium block">{item.MedicineName}</span>
                                            <span className="text-xs text-gray-500">{item.Quantity} units</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-yellow-700 font-bold block">{new Date(item.ExpiryDate).toLocaleDateString()}</span>
                                            <span className="text-xs text-yellow-600">{item.DaysUntilExpiry} days left</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacistDashboard;
