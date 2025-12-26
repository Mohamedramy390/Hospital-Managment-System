import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import LogisticsDashboard from './pages/LogisticsDashboard';
import ClinicalDashboard from './pages/ClinicalDashboard';
import LabDashboard from './pages/LabDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import PatientDashboard from './pages/PatientDashboard';
import NurseDashboard from './pages/NurseDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import InsuranceDashboard from './pages/InsuranceDashboard';
import AuditLogs from './pages/AuditLogs';




function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              {/* Module Routes Placeholder */}
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/audit-logs" element={<AuditLogs />} />
              <Route path="logistics" element={<LogisticsDashboard />} />
              <Route path="clinical" element={<ClinicalDashboard />} />
              <Route path="staffing" element={<NurseDashboard />} />
              <Route path="labs" element={<LabDashboard />} />
              <Route path="pharmacy" element={<PharmacistDashboard />} />
              <Route path="finance" element={<FinanceDashboard />} />
              <Route path="reception" element={<ReceptionistDashboard />} />
              <Route path="portal" element={<PatientDashboard />} />
              <Route path="nursing" element={<NurseDashboard />} />
              <Route path="insurance" element={<InsuranceDashboard />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
