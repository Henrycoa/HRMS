// frontend/src/components/selfservice/EmployeeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    FaUser, FaEnvelope, FaPhone, FaMapMarker, FaCreditCard,
    FaCalendar, FaClock, FaMoneyBill, FaChartLine,
    FaGraduationCap, FaCertificate, FaBullhorn, FaCalendarAlt,
    FaCog, FaEye, FaDownload, FaPlus, FaCheckCircle,
    FaSpinner, FaSync, FaBuilding, FaIdCard
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Layout from '../layout/Layout';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState(null);
    const [leaveBalance, setLeaveBalance] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [payslips, setPayslips] = useState([]);
    const [performance, setPerformance] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [trainings, setTrainings] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const [myEmployeeId, setMyEmployeeId] = useState(null);

    // ============================================
    // FETCH ALL DATA
    // ============================================
    useEffect(() => {
        if (user) {
            fetchAllData();
        }
    }, [user]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Get employee ID first
            const empRes = await api.get('/api/employees.php');
            if (empRes.data.status === 1) {
                const employees = empRes.data.data || [];
                const myEmp = employees.find(e => e.user_id === user.id);
                if (myEmp) {
                    setEmployee(myEmp);
                    setMyEmployeeId(myEmp.employee_id);
                    
                    // Fetch all data in parallel
                    await Promise.all([
                        fetchLeaveBalance(myEmp.employee_id),
                        fetchAttendance(myEmp.employee_id),
                        fetchPayslips(myEmp.employee_id),
                        fetchPerformance(myEmp.employee_id),
                        fetchCertificates(myEmp.employee_id),
                        fetchTrainings(myEmp.employee_id),
                    ]);
                }
            }
            
            // Fetch announcements (public)
            fetchAnnouncements();
            
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaveBalance = async (employeeId) => {
        try {
            const res = await api.get(`/api/leaves.php?balance=1&employee_id=${employeeId}`);
            if (res.data.status === 1) {
                setLeaveBalance(res.data.data || []);
            }
        } catch (e) { console.error(e); }
    };

    const fetchAttendance = async (employeeId) => {
        try {
            const res = await api.get(`/api/attendance.php?employee_id=${employeeId}`);
            if (res.data.status === 1) {
                setAttendance(res.data.data || []);
            }
        } catch (e) { console.error(e); }
    };

    const fetchPayslips = async (employeeId) => {
        try {
            const res = await api.get(`/api/payroll.php?employee_id=${employeeId}`);
            if (res.data.status === 1) {
                setPayslips(res.data.data || []);
            }
        } catch (e) { console.error(e); }
    };

    const fetchPerformance = async (employeeId) => {
        try {
            const res = await api.get(`/api/performance.php?reviews=1&employee_id=${employeeId}`);
            if (res.data.status === 1) {
                setPerformance(res.data.data || []);
            }
        } catch (e) { console.error(e); }
    };

    const fetchCertificates = async (employeeId) => {
        try {
            const res = await api.get(`/api/training.php?certificates=1&employee_id=${employeeId}`);
            if (res.data.status === 1) {
                setCertificates(res.data.data || []);
            }
        } catch (e) { console.error(e); }
    };

    const fetchTrainings = async (employeeId) => {
        try {
            const res = await api.get(`/api/training.php?history=1&employee_id=${employeeId}`);
            if (res.data.status === 1) {
                setTrainings(res.data.data || []);
            }
        } catch (e) { console.error(e); }
    };

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/api/announcements.php');
            if (res.data.status === 1) {
                setAnnouncements(res.data.data || []);
            }
        } catch (e) { console.error(e); }
    };

    // ============================================
    // HELPERS
    // ============================================
    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            approved: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
            completed: 'bg-green-100 text-green-700 border-green-200',
            scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
            paid: 'bg-purple-100 text-purple-700 border-purple-200',
            active: 'bg-green-100 text-green-700 border-green-200',
            inactive: 'bg-gray-100 text-gray-700 border-gray-200'
        };
        return badges[status] || badges.active;
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getInitials = (first, last) => {
        return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-500">Loading your dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold border-2 border-white/50">
                                {getInitials(user?.first_name, user?.last_name)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Welcome, {user?.first_name}! 👋</h1>
                                <p className="text-blue-100">{employee?.employee_number || 'Employee'}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/profile')}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition text-sm font-medium flex items-center gap-2"
                        >
                            <FaUser /> View Full Profile
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 text-center">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Leave Balance</p>
                        <p className="text-2xl font-bold text-blue-600">{leaveBalance.reduce((sum, l) => sum + l.balance, 0)}</p>
                        <p className="text-xs text-gray-400">Days remaining</p>
                    </div>
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 text-center">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Attendance</p>
                        <p className="text-2xl font-bold text-green-600">{attendance.filter(a => a.status === 'present').length}</p>
                        <p className="text-xs text-gray-400">Days present</p>
                    </div>
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 text-center">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Performance</p>
                        <p className="text-2xl font-bold text-purple-600">{performance.length}</p>
                        <p className="text-xs text-gray-400">Reviews completed</p>
                    </div>
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 text-center">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Certificates</p>
                        <p className="text-2xl font-bold text-orange-600">{certificates.length}</p>
                        <p className="text-xs text-gray-400">Earned</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-1 border-b-2 border-gray-200">
                    {[
                        { id: 'profile', icon: <FaUser />, label: 'Profile' },
                        { id: 'leave', icon: <FaCalendar />, label: 'Leave' },
                        { id: 'attendance', icon: <FaClock />, label: 'Attendance' },
                        { id: 'payslip', icon: <FaMoneyBill />, label: 'Payslips' },
                        { id: 'performance', icon: <FaChartLine />, label: 'Performance' },
                        { id: 'training', icon: <FaGraduationCap />, label: 'Trainings' },
                        { id: 'certificates', icon: <FaCertificate />, label: 'Certificates' },
                        { id: 'announcements', icon: <FaBullhorn />, label: 'Announcements' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 text-sm font-medium capitalize transition border-b-2 -mb-[2px] ${
                                activeTab === tab.id 
                                    ? 'border-blue-600 text-blue-600 bg-blue-50 rounded-t-lg' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg'
                            }`}
                        >
                            <span className="mr-1.5">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* =========================================================
                    TAB: PROFILE
                ========================================================= */}
                {activeTab === 'profile' && employee && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <div className="text-center">
                                    <div className="w-32 h-32 rounded-full bg-blue-100 mx-auto flex items-center justify-center text-blue-600 text-5xl font-bold border-4 border-white shadow-lg">
                                        {employee.profile_photo ? (
                                            <img src={`http://localhost/Lord%20help/backend/uploads/${employee.profile_photo}`} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            getInitials(employee.first_name, employee.last_name)
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mt-4">{employee.first_name} {employee.last_name}</h3>
                                    <p className="text-sm text-gray-500">{employee.employee_number}</p>
                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(employee.status)}`}>
                                        {employee.status || 'Active'}
                                    </span>
                                    <div className="mt-4 pt-4 border-t border-gray-200 text-left space-y-1 text-sm">
                                        <p><span className="text-gray-500">Email:</span> {employee.email || 'N/A'}</p>
                                        <p><span className="text-gray-500">Phone:</span> {employee.contact_number || 'N/A'}</p>
                                        <p><span className="text-gray-500">Department:</span> {employee.department_name || 'N/A'}</p>
                                        <p><span className="text-gray-500">Position:</span> {employee.position_title || 'N/A'}</p>
                                        <p><span className="text-gray-500">Date Hired:</span> {employee.date_hired || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaUser className="text-blue-600" /> Personal</h4>
                                        <p className="text-sm flex justify-between"><span className="text-gray-500">Birth Date:</span> <span className="font-medium">{employee.birth_date || 'N/A'}</span></p>
                                        <p className="text-sm flex justify-between"><span className="text-gray-500">Gender:</span> <span className="font-medium capitalize">{employee.gender || 'N/A'}</span></p>
                                        <p className="text-sm flex justify-between"><span className="text-gray-500">Civil Status:</span> <span className="font-medium capitalize">{employee.civil_status || 'N/A'}</span></p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaEnvelope className="text-blue-600" /> Contact</h4>
                                        <p className="text-sm flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium">{employee.email || 'N/A'}</span></p>
                                        <p className="text-sm flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-medium">{employee.contact_number || 'N/A'}</span></p>
                                        <p className="text-sm flex justify-between"><span className="text-gray-500">Address:</span> <span className="font-medium">{employee.address || 'N/A'}</span></p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaBuilding className="text-blue-600" /> Emergency Contact</h4>
                                        <p className="text-sm flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium">{employee.emergency_contact_name || 'N/A'}</span></p>
                                        <p className="text-sm flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-medium">{employee.emergency_contact_number || 'N/A'}</span></p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaCreditCard className="text-blue-600" /> Banking</h4>
                                        <p className="text-sm flex justify-between"><span className="text-gray-500">Bank:</span> <span className="font-medium">{employee.bank_name || 'N/A'}</span></p>
                                        <p className="text-sm flex justify-between"><span className="text-gray-500">Account:</span> <span className="font-medium">{employee.bank_account_number || 'N/A'}</span></p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate('/profile')}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                                >
                                    <FaEdit className="inline mr-2" /> Update Profile
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* =========================================================
                    TAB: LEAVE
                ========================================================= */}
                {activeTab === 'leave' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FaCalendar className="text-blue-600" /> My Leave
                            </h3>
                            <button 
                                onClick={() => navigate('/leaves')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <FaPlus /> Apply Leave
                            </button>
                        </div>
                        
                        {/* Leave Balance */}
                        {leaveBalance.length > 0 && (
                            <div className="flex flex-wrap gap-3 mb-4">
                                {leaveBalance.map((b) => (
                                    <div key={b.balance_id} className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                                        <span className="text-xs text-gray-500">{b.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold" style={{ color: b.color }}>{b.balance}</span>
                                            <span className="text-xs text-gray-400">/ {b.used} used</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Leave History */}
                        {attendance.filter(a => a.status === 'leave' || a.status === 'pending').length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead><tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Days</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    </tr></thead>
                                    <tbody>
                                        {attendance.filter(a => a.status === 'leave' || a.status === 'pending').map((a, i) => (
                                            <tr key={i} className="border-b border-gray-100">
                                                <td className="py-2 px-3 text-sm">{a.date}</td>
                                                <td className="py-2 px-3 text-sm">{a.leave_type || 'Leave'}</td>
                                                <td className="py-2 px-3 text-sm">{a.total_days || 1}</td>
                                                <td className="py-2 px-3"><span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(a.status)}`}>{a.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">No leave records found</div>
                        )}
                    </div>
                )}

                {/* =========================================================
                    TAB: ATTENDANCE
                ========================================================= */}
                {activeTab === 'attendance' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaClock className="text-blue-600" /> My Attendance
                        </h3>
                        {attendance.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead><tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Clock In</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Clock Out</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Hours</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    </tr></thead>
                                    <tbody>
                                        {attendance.slice(0, 10).map((a) => (
                                            <tr key={a.attendance_id} className="border-b border-gray-100">
                                                <td className="py-2 px-3 text-sm">{new Date(a.date).toLocaleDateString()}</td>
                                                <td className="py-2 px-3 text-sm">{a.clock_in || '-'}</td>
                                                <td className="py-2 px-3 text-sm">{a.clock_out || '-'}</td>
                                                <td className="py-2 px-3 text-sm">{a.total_hours || '0'}h</td>
                                                <td className="py-2 px-3"><span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(a.status)}`}>{a.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {attendance.length > 10 && (
                                    <p className="text-sm text-gray-500 mt-2">Showing 10 of {attendance.length} records</p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">No attendance records found</div>
                        )}
                        <button 
                            onClick={() => navigate('/attendance')}
                            className="mt-4 text-blue-600 hover:underline text-sm"
                        >
                            View All Attendance
                        </button>
                    </div>
                )}

                {/* =========================================================
                    TAB: PAYSLIPS
                ========================================================= */}
                {activeTab === 'payslip' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaMoneyBill className="text-blue-600" /> My Payslips
                        </h3>
                        {payslips.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {payslips.map((p) => (
                                    <div key={p.payroll_id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-800">{p.period}</p>
                                                <p className="text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex justify-between text-sm">
                                            <span className="text-gray-500">Net Pay:</span>
                                            <span className="font-bold text-green-600">{formatCurrency(p.net_pay)}</span>
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center gap-1">
                                                <FaEye /> View
                                            </button>
                                            <button className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition flex items-center gap-1">
                                                <FaDownload /> Download
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">No payslips found</div>
                        )}
                    </div>
                )}

                {/* =========================================================
                    TAB: PERFORMANCE
                ========================================================= */}
                {activeTab === 'performance' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaChartLine className="text-blue-600" /> My Performance
                        </h3>
                        {performance.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {performance.map((r) => (
                                    <div key={r.review_id} className="border border-gray-200 rounded-xl p-4">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-medium text-gray-800">{r.review_type} Review</p>
                                                <p className="text-sm text-gray-500">Period: {r.period_start} → {r.period_end}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(r.status)}`}>
                                                {r.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-sm text-gray-500">Rating:</span>
                                            <span className="text-lg font-bold text-blue-600">{r.overall_rating || 'N/A'}</span>
                                        </div>
                                        <button className="mt-2 text-blue-600 hover:underline text-sm">View Details</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">No performance reviews found</div>
                        )}
                    </div>
                )}

                {/* =========================================================
                    TAB: TRAININGS
                ========================================================= */}
                {activeTab === 'training' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaGraduationCap className="text-blue-600" /> My Trainings
                        </h3>
                        {trainings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {trainings.map((t) => (
                                    <div key={t.enrollment_id} className="border border-gray-200 rounded-xl p-4">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-medium text-gray-800">{t.program_title}</p>
                                                <p className="text-sm text-gray-500">{t.session_title}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(t.status)}`}>
                                                {t.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500">
                                            <p>Date: {new Date(t.start_date).toLocaleDateString()}</p>
                                            {t.completion_date && <p>Completed: {new Date(t.completion_date).toLocaleDateString()}</p>}
                                        </div>
                                        {t.certificate_issued && (
                                            <button className="mt-2 text-purple-600 hover:underline text-sm flex items-center gap-1">
                                                <FaCertificate /> View Certificate
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">No trainings found</div>
                        )}
                        <button 
                            onClick={() => navigate('/training')}
                            className="mt-4 text-blue-600 hover:underline text-sm"
                        >
                            View All Trainings
                        </button>
                    </div>
                )}

                {/* =========================================================
                    TAB: CERTIFICATES
                ========================================================= */}
                {activeTab === 'certificates' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaCertificate className="text-blue-600" /> My Certificates
                        </h3>
                        {certificates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {certificates.map((c) => (
                                    <div key={c.certificate_id} className="border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition">
                                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-3xl">
                                            <FaCertificate />
                                        </div>
                                        <h4 className="font-bold text-gray-800 mt-3">{c.title}</h4>
                                        <p className="text-sm text-gray-500">{c.issued_by}</p>
                                        <p className="text-xs text-gray-400">Issued: {new Date(c.issued_date).toLocaleDateString()}</p>
                                        <button className="mt-2 text-blue-600 hover:underline text-sm">Download</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">No certificates found</div>
                        )}
                    </div>
                )}

                {/* =========================================================
                    TAB: ANNOUNCEMENTS
                ========================================================= */}
                {activeTab === 'announcements' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaBullhorn className="text-blue-600" /> Announcements
                        </h3>
                        {announcements.length > 0 ? (
                            <div className="space-y-4">
                                {announcements.map((a) => (
                                    <div key={a.announcement_id} className="border-l-4 border-blue-500 bg-gray-50 rounded-xl p-4">
                                        <h4 className="font-bold text-gray-800">{a.title}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{a.content}</p>
                                        <p className="text-xs text-gray-400 mt-2">Posted: {new Date(a.created_at).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">No announcements found</div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default EmployeeDashboard;