import React from 'react';

const Dashboard = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-gray-500 text-sm font-medium uppercase">Total Patients</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">1,234</p>
                <div className="mt-4 flex items-center text-green-600 text-sm">
                    <span>+12%</span>
                    <span className="text-gray-400 ml-2">from last month</span>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-gray-500 text-sm font-medium uppercase">Appointments Today</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">42</p>
                <div className="mt-4 flex items-center text-blue-600 text-sm">
                    <span>8 Pending</span>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-gray-500 text-sm font-medium uppercase">Staff on Duty</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">18</p>
                <div className="mt-4 flex items-center text-purple-600 text-sm">
                    <span>Active Now</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
