import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Shield, Users, Stethoscope, ClipboardList, Beaker, Pill,
    LogOut, LayoutDashboard, Landmark, Heart, Monitor
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </Link>
    );
};

const Layout = () => {
    const { user, logout } = useAuth();
    const role = user?.role || '';
    const roleLower = role.toLowerCase();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return <Outlet />; // Should be handled by ProtectedRoute but for safety

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white shadow-xl flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Hospital MS
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">v1.0.0</p>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />

                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Modules</p>
                    </div>

                    {(user.role === 'Admin' || user.role === 'Staff') && (
                        <SidebarItem icon={Shield} label="Admin" to="/admin" />
                    )}

                    {(user.role === 'Admin' || user.role === 'Receptionist') && (
                        <>
                            <SidebarItem icon={Users} label="Patient Logistics" to="/logistics" />
                            <SidebarItem icon={Monitor} label="Facility View" to="/reception" />
                            <SidebarItem icon={Monitor} label="Insurance" to="/insurance" />
                        </>
                    )}

                    {(user.role === 'Admin' || user.role === 'Doctor') && (
                        <SidebarItem icon={Stethoscope} label="Doctor & EMR" to="/clinical" />
                    )}

                    {(user.role === 'Admin' || user.role === 'Nurse') && (
                        <SidebarItem icon={ClipboardList} label="Nurse & Staffing" to="/staffing" />
                    )}

                    {(role === 'Admin' || role === 'Staff' || role === 'Doctor' || role === 'LabTech' || role === 'Lab Technician' || roleLower.includes('lab')) && (
                        <SidebarItem icon={Beaker} label="Labs" to="/labs" />
                    )}

                    {(user.role === 'Admin' || user.role === 'Pharmacist') && (
                        <SidebarItem icon={Pill} label="Pharmacy" to="/pharmacy" />
                    )}

                    {(user.role === 'Admin' || user.role === 'Receptionist' || user.role === 'Staff') && (
                        <SidebarItem icon={Landmark} label="Finance" to="/finance" />
                    )}

                    {user.role === 'Patient' && (
                        <SidebarItem icon={Heart} label="My Portal" to="/portal" />
                    )}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center space-x-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">{user.username}</p>
                            <p className="text-xs text-gray-400">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg transition-all"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Overview
                    </h2>
                    <div className="flex items-center space-x-4">
                        {/* Add User/Notif/etc here */}
                    </div>
                </header>
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
