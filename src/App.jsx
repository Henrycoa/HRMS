// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext'; // 👈 ADD THIS
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Pages
import Dashboard from './components/dashboard/Dashboard';
import EmployeeManager from './components/employees/EmployeeManager';
import CompanyStructure from './components/company/CompanyStructure';
import AttendanceManager from './components/attendance/AttendanceManager';
import LeaveManager from './components/leaves/LeaveManager';
import PayrollManager from './components/payroll/PayrollManager';
import RecruitmentManager from './components/recruitment/RecruitmentManager';
import PerformanceManager from './components/performance/PerformanceManager';
import Profile from './components/profile/Profile';
import MyProfile from './components/profile/MyProfile';
import TrainingManager from './components/training/TrainingManager';
import EmployeeDashboard from './components/selfservice/EmployeeDashboard';
import ReportsManager from './components/reports/ReportsManager';
import Settings from './components/settings/Settings';

function App() {
    console.log('🚀 App rendering...');

    return (
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider> {/* 👈 WRAP WITH THEME PROVIDER */}
                    <ErrorBoundary>
                        <Toaster 
                            position="top-right"
                            toastOptions={{
                                style: {
                                    background: 'var(--toast-bg)',
                                    color: 'var(--toast-color)',
                                },
                            }}
                        />
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Protected Routes */}
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/employees" element={<ProtectedRoute><EmployeeManager /></ProtectedRoute>} />
                            <Route path="/company" element={<ProtectedRoute><CompanyStructure /></ProtectedRoute>} />
                            <Route path="/attendance" element={<ProtectedRoute><AttendanceManager /></ProtectedRoute>} />
                            <Route path="/leaves" element={<ProtectedRoute><LeaveManager /></ProtectedRoute>} />
                            <Route path="/payroll" element={<ProtectedRoute><PayrollManager /></ProtectedRoute>} />
                            <Route path="/recruitment" element={<ProtectedRoute><RecruitmentManager /></ProtectedRoute>} />
                            <Route path="/performance" element={<ProtectedRoute><PerformanceManager /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                            <Route path="/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
                            <Route path="/training" element={<ProtectedRoute><TrainingManager /></ProtectedRoute>} />
                            <Route path="/employee-dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
                            <Route path="/reports" element={<ProtectedRoute><ReportsManager /></ProtectedRoute>} />
                            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                            {/* Redirects */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </ErrorBoundary>
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;