import React, { useEffect, useState } from 'react';
import { getNurseTasks, getNurseAssignments, completeNurseTask, getShifts, getMyAttendance, clockIn, clockOut } from '../api/modules';
import { Clipboard, User, Calendar, CheckSquare, Clock, LogIn, LogOut } from 'lucide-react';

const NurseDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [shifts, setShifts] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [selectedShift, setSelectedShift] = useState('');
    const [activeTab, setActiveTab] = useState('assignments');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [tRes, aRes, sRes, attRes] = await Promise.all([
                getNurseTasks(),
                getNurseAssignments(),
                getShifts(),
                getMyAttendance()
            ]);
            setTasks(tRes.data);
            setAssignments(aRes.data);
            setShifts(sRes.data);
            setAttendance(attRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleComplete = async (taskId) => {
        try {
            await completeNurseTask(taskId);
            loadData();
        } catch (err) {
            alert('Failed to complete task');
        }
    };

    const handleClockIn = async () => {
        if (!selectedShift) {
            alert('Please select a shift');
            return;
        }
        try {
            await clockIn({ shiftId: selectedShift });
            alert('Clocked in successfully!');
            loadData();
            setSelectedShift('');
        } catch (err) {
            alert('Failed to clock in');
        }
    };

    const handleClockOut = async (attendanceId) => {
        try {
            await clockOut(attendanceId);
            alert('Clocked out successfully!');
            loadData();
        } catch (err) {
            alert('Failed to clock out');
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Nurse Dashboard</h2>

            {/* Tabs */}
            <div className="flex space-x-4 border-b">
                {['assignments', 'tasks', 'attendance'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-4 font-medium capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
                <>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
                        <div className="flex items-center space-x-2 text-blue-600 mb-4">
                            <User />
                            <h3 className="text-lg font-bold">My Assigned Patients</h3>
                        </div>
                        {assignments.length === 0 ? <p className="text-gray-500">No active assignments.</p> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {assignments.map(assign => (
                                    <div key={assign.VisitID} className="border p-4 rounded-lg hover:shadow-md cursor-pointer transition"
                                        onClick={() => setSelectedVisit(assign)}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-lg text-gray-800">{assign.FirstName} {assign.LastName}</p>
                                                <p className="text-sm text-gray-500">DOB: {new Date(assign.DateOfBirth).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Visit #{assign.VisitID}</span>
                                                <p className="text-xs text-gray-400 mt-1">Admitted: {new Date(assign.AdmissionTime).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedVisit && (
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                            <h3 className="font-bold text-blue-800 mb-2">Patient Details: {selectedVisit.FirstName} {selectedVisit.LastName}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block font-medium text-gray-600">Visit Type</span>
                                    <span>{selectedVisit.VisitType}</span>
                                </div>
                                <div>
                                    <span className="block font-medium text-gray-600">Admission Date</span>
                                    <span>{new Date(selectedVisit.AdmissionTime).toLocaleString()}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedVisit(null)} className="mt-4 text-sm text-blue-600 hover:underline">Close Details</button>
                        </div>
                    )}
                </>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200">
                    <div className="flex items-center space-x-2 text-green-600 mb-4">
                        <Clipboard />
                        <h3 className="text-lg font-bold">My Tasks</h3>
                    </div>
                    {tasks.length === 0 ? <p className="text-gray-500">No pending tasks.</p> : (
                        <div className="space-y-3">
                            {tasks.map(task => (
                                <div key={task.TaskID} className="flex justify-between items-center border p-3 rounded-lg bg-green-50">
                                    <div>
                                        <p className="font-medium text-gray-800">{task.Description}</p>
                                        <p className="text-xs text-gray-500">Patient: {task.PatientName} {task.PatientLastName}</p>
                                    </div>
                                    <button onClick={() => handleComplete(task.TaskID)}
                                        className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm">
                                        <CheckSquare size={16} /> <span>Complete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-200">
                        <div className="flex items-center space-x-2 text-purple-600 mb-4">
                            <Clock />
                            <h3 className="text-lg font-bold">Clock In/Out</h3>
                        </div>
                        <div className="flex items-center space-x-3">
                            <select
                                className="border p-2 rounded flex-1"
                                value={selectedShift}
                                onChange={(e) => setSelectedShift(e.target.value)}
                            >
                                <option value="">Select Shift</option>
                                {shifts.map(shift => (
                                    <option key={shift.ShiftID} value={shift.ShiftID}>
                                        {shift.ShiftName}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleClockIn}
                                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                            >
                                <LogIn size={18} />
                                <span>Clock In</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center space-x-2 text-gray-700 mb-4">
                            <Calendar />
                            <h3 className="text-lg font-bold">My Attendance History</h3>
                        </div>
                        {attendance.length === 0 ? <p className="text-gray-500">No attendance records.</p> : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-left">Shift</th>
                                            <th className="p-3 text-left">Clock In</th>
                                            <th className="p-3 text-left">Clock Out</th>
                                            <th className="p-3 text-left">Duration</th>
                                            <th className="p-3 text-left">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {attendance.map(att => {
                                            const duration = att.ClockOutTime
                                                ? Math.round((new Date(att.ClockOutTime) - new Date(att.ClockInTime)) / (1000 * 60 * 60) * 10) / 10
                                                : null;
                                            return (
                                                <tr key={att.AttendanceID}>
                                                    <td className="p-3 font-medium">{att.ShiftName}</td>
                                                    <td className="p-3">{new Date(att.ClockInTime).toLocaleString()}</td>
                                                    <td className="p-3">
                                                        {att.ClockOutTime ? new Date(att.ClockOutTime).toLocaleString() : (
                                                            <span className="text-green-600 font-medium">Active</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">{duration ? `${duration}h` : '-'}</td>
                                                    <td className="p-3">
                                                        {!att.ClockOutTime && (
                                                            <button
                                                                onClick={() => handleClockOut(att.AttendanceID)}
                                                                className="flex items-center space-x-1 bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs"
                                                            >
                                                                <LogOut size={14} />
                                                                <span>Clock Out</span>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NurseDashboard;
