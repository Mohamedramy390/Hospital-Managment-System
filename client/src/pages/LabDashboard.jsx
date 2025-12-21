import React, { useState, useEffect } from 'react';
import { getTestTypes, addLabResult, getPendingLabTests, getLabDevices } from '../api/modules';
import { Beaker, Upload, CheckCircle, FileText } from 'lucide-react';

const LabDashboard = () => {
    const [testTypes, setTestTypes] = useState([]);
    const [testId, setTestId] = useState('');
    const [resultValue, setResultValue] = useState('');
    const [files, setFiles] = useState(null);
    const [deviceId, setDeviceId] = useState('');
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pendingTests, setPendingTests] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getTestTypes();
                setTestTypes(res.data);
                const p = await getPendingLabTests();
                setPendingTests(p.data);
                const d = await getLabDevices();
                setDevices(d.data);
            } catch (err) {
                console.error(err);
            }
        };
        load();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('testId', testId);
            formData.append('resultValue', resultValue);
            formData.append('deviceId', deviceId);
            if (files) {
                for (let i = 0; i < files.length; i++) {
                    formData.append('files', files[i]);
                }
            }

            await addLabResult(formData);
            alert('Result uploaded successfully');
            setTestId('');
            setResultValue('');
            setDeviceId('');
            setFiles(null);

            // Reload pending tests
            const p = await getPendingLabTests();
            setPendingTests(p.data);
        } catch (err) {
            alert('Error uploading result');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Lab Technician Portal</h2>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3 mb-6 text-blue-600">
                    <Beaker size={28} />
                    <h3 className="text-xl font-bold text-gray-800">Submit Test Result</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Test ID</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter Test ID from order"
                                value={testId}
                                onChange={e => setTestId(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lab Device</label>
                            <select
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                                value={deviceId}
                                onChange={e => setDeviceId(e.target.value)}
                                required
                            >
                                <option value="">Select Device</option>
                                {devices.map(d => (
                                    <option key={d.DeviceID} value={d.DeviceID}>{d.DeviceName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Result Value</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. 140 mg/dL"
                                value={resultValue}
                                onChange={e => setResultValue(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (Scan/Report)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition cursor-pointer relative">
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                        Upload files
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            multiple
                                            onChange={e => setFiles(e.target.files)}
                                        />
                                    </span>
                                    <p className="pl-1 text-gray-500">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                                {files && <p className="text-sm text-green-600 font-bold">{files.length} file(s) selected</p>}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <CheckCircle size={20} />
                                <span>Submit Result</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Pending Tests */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center space-x-3 mb-6 text-indigo-600">
                    <Beaker size={28} />
                    <h3 className="text-xl font-bold text-gray-800">Pending Tests</h3>
                </div>
                {pendingTests.length === 0 ? (
                    <p className="text-gray-500">No pending tests.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-600">
                                    <th className="py-2 pr-4">Test ID</th>
                                    <th className="py-2 pr-4">Patient</th>
                                    <th className="py-2 pr-4">Test</th>
                                    <th className="py-2 pr-4">Order Date</th>
                                    <th className="py-2 pr-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingTests.map(t => (
                                    <tr key={t.TestID} className="border-t">
                                        <td className="py-2 pr-4 font-mono">{t.TestID}</td>
                                        <td className="py-2 pr-4">{t.FirstName} {t.LastName}</td>
                                        <td className="py-2 pr-4">{t.TestName}</td>
                                        <td className="py-2 pr-4">{new Date(t.OrderDate).toLocaleString()}</td>
                                        <td className="py-2 pr-4">
                                            <button
                                                className="px-3 py-1 rounded bg-indigo-600 text-white"
                                                onClick={() => setTestId(String(t.TestID))}
                                            >
                                                Fill Result
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-blue-50 p-4 rounded-xl flex items-start space-x-3 text-blue-700 border border-blue-200">
                <FileText className="mt-1" />
                <p className="text-sm">
                    <strong>Note:</strong> Submitting a result will automatically notify the requesting doctor and the patient.
                    The status of the test will be updated to 'Completed' in the visit record.
                </p>
            </div>
        </div>
    );
};

export default LabDashboard;
