import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../api/modules';
import { FileText, Clock, User, Shield } from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await getAuditLogs();
            setLogs(res.data);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 text-gray-800">
                <Shield size={32} className="text-blue-600" />
                <h1 className="text-2xl font-bold">System Audit Logs</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b">
                            <tr>
                                <th className="p-4">Time</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">
                                        No audit logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.LogID} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-600 whitespace-nowrap flex items-center space-x-2">
                                            <Clock size={16} className="text-gray-400" />
                                            <span>{new Date(log.Timestamp).toLocaleString()}</span>
                                        </td>
                                        <td className="p-4 font-medium text-gray-800">
                                            <div className="flex items-center space-x-2">
                                                <User size={16} className="text-blue-500" />
                                                <span>{log.Username || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">
                                                {log.Role || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-700">
                                            <div className="flex items-center space-x-2">
                                                <FileText size={16} className="text-gray-400" />
                                                <span>{log.ActionDescription}</span>
                                            </div>
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

export default AuditLogs;
