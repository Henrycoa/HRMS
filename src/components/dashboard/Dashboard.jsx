// frontend/src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    FaUsers, FaClock, FaBuilding, FaCalendar,
    FaUserPlus, FaFileAlt, FaShieldAlt, FaSpinner,
    FaMoneyBill, FaChartLine, FaBriefcase, FaUserCheck,
    FaSync, FaSignInAlt, FaSignOutAlt, FaCoffee, FaCalendarPlus
} from 'react-icons/fa';
import api from '../../services/api';
import Layout from '../layout/Layout';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [clockedIn, setClockedIn] = useState(false);
    const [onBreak, setOnBreak] = useState(false);
    const [employeeId, setEmployeeId] = useState(null);
    const [stats, setStats] = useState({
        total_employees: 0,
        active_employees: 0,
        total_departments: 0,
        pending_leaves: 0,
        approved_leaves: 0,
        today_attendance: 0,
        total_payroll: 0,
        total_performance_reviews: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);

    // ============================================
    // FETCH DASHBOARD DATA
    // ============================================
    useEffect(() => {
        if (user) {
            fetchDashboardData();
            if (user?.user_type === 'employee') {
                fetchEmployeeId();
            }
        }
    }, [user]);

    const fetchEmployeeId = async () => {
        try {
            const res = await api.get('/api/employees.php');
            if (res.data.status === 1) {
                const employees = res.data.data || [];
                const emp = employees.find(e => e.user_id === user.id);
                if (emp) {
                    setEmployeeId(emp.employee_id);
                    checkTodayAttendance(emp.employee_id);
                }
            }
        } catch (e) { console.error(e); }
    };

    const checkTodayAttendance = async (empId) => {
        try {
            const res = await api.get('/api/attendance.php?today=1');
            if (res.data.status === 1) {
                const records = res.data.data || [];
                const record = records.find(r => r.employee_id === empId);
                if (record) {
                    setClockedIn(!!record.clock_in && !record.clock_out);
                    setOnBreak(!!record.break_start && !record.break_end);
                }
            }
        } catch (e) { console.error(e); }
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch all data in parallel
            const [employeesRes, departmentsRes, leavesRes, attendanceRes, payrollRes, performanceRes] = await Promise.all([
                api.get('/api/employees.php'),
                api.get('/api/departments.php'),
                api.get('/api/leaves.php'),
                api.get('/api/attendance.php?today=1'),
                api.get('/api/payroll.php?report=1'),
                api.get('/api/performance.php?reviews=1')
            ]);

            // Process Employees
            const employees = employeesRes.data.data || [];
            const activeEmployees = employees.filter(emp => emp.status === 'active');
            
            // Process Departments
            const departments = departmentsRes.data.data || [];
            
            // Process Leaves
            const leaves = leavesRes.data.data || [];
            const pendingLeaves = leaves.filter(l => l.status === 'pending');
            const approvedLeaves = leaves.filter(l => l.status === 'approved');
            
            // Process Attendance
            const attendance = attendanceRes.data.data || [];
            
            // Process Payroll
            const payroll = payrollRes.data.data || [];
            const totalPayroll = payroll.reduce((sum, p) => sum + parseFloat(p.net_pay || 0), 0);
            
            // Process Performance
            const performance = performanceRes.data.data || [];

            setStats({
                total_employees: employees.length,
                active_employees: activeEmployees.length,
                total_departments: departments.length,
                pending_leaves: pendingLeaves.length,
                approved_leaves: approvedLeaves.length,
                today_attendance: attendance.length,
                total_payroll: totalPayroll,
                total_performance_reviews: performance.length
            });

            // Set recent activities (last 5 leaves or attendance)
            const recent = [
                ...leaves.slice(0, 3).map(l => ({
                    id: l.leave_request_id,
                    type: 'leave',
                    message: `${l.employee_name || 'Employee'} requested ${l.leave_type_name || 'leave'}`,
                    time: l.created_at,
                    status: l.status
                })),
                ...attendance.slice(0, 2).map(a => ({
                    id: a.attendance_id,
                    type: 'attendance',
                    message: `${a.employee_name || 'Employee'} clocked in`,
                    time: a.clock_in,
                    status: 'present'
                }))
            ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

            setRecentActivities(recent);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Set fallback data if API fails
            setStats({
                total_employees: 0,
                active_employees: 0,
                total_departments: 0,
                pending_leaves: 0,
                approved_leaves: 0,
                today_attendance: 0,
                total_payroll: 0,
                total_performance_reviews: 0
            });
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // QUICK ACTIONS (Clock In/Out)
    // ============================================
    const handleClockIn = async () => {
        if (!employeeId) {
            toast.error('No employee profile found');
            return;
        }
        try {
            const res = await api.post('/api/attendance.php', {
                action: 'clock_in',
                employee_id: employeeId
            });
            if (res.data.status === 1) {
                toast.success('Clocked in!');
                setClockedIn(true);
                fetchDashboardData();
            }
        } catch (e) { toast.error('Failed to clock in'); }
    };

    const handleClockOut = async () => {
        if (!employeeId) return;
        try {
            const res = await api.post('/api/attendance.php', {
                action: 'clock_out',
                employee_id: employeeId
            });
            if (res.data.status === 1) {
                toast.success('Clocked out!');
                setClockedIn(false);
                setOnBreak(false);
                fetchDashboardData();
            }
        } catch (e) { toast.error('Failed to clock out'); }
    };

    const handleBreak = async () => {
        if (!employeeId) return;
        try {
            const res = await api.post('/api/attendance.php', {
                action: 'break',
                break_action: onBreak ? 'end' : 'start',
                employee_id: employeeId
            });
            if (res.data.status === 1) {
                toast.success(onBreak ? 'Break ended' : 'Break started');
                setOnBreak(!onBreak);
                fetchDashboardData();
            }
        } catch (e) { toast.error('Failed to update break'); }
    };

    // ============================================
    // HELPERS
    // ============================================
    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'text-yellow-500 bg-yellow-50',
            approved: 'text-green-500 bg-green-50',
            rejected: 'text-red-500 bg-red-50',
            cancelled: 'text-gray-500 bg-gray-50',
            present: 'text-green-500 bg-green-50'
        };
        return colors[status] || 'text-blue-500 bg-blue-50';
    };

    const getTimeAgo = (date) => {
        if (!date) return 'Just now';
        const diff = Math.floor((new Date() - new Date(date)) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    // ============================================
    // LOADING STATE
    // ============================================
    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-500">Loading dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // ============================================
    // CHECK USER
    // ============================================
    if (!user) {
        navigate('/login');
        return null;
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <Layout>
            <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none"></div>
                    <div className="relative z-10">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 inline-block mb-3">
                            NEXT-GEN HR PLATFORM
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                            Welcome back, {user?.first_name || 'User'}! 👋
                        </h1>
                        <p className="text-gray-500 text-sm mt-1.5 font-medium">
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                {user?.user_type?.replace('_', ' ') || 'Employee'}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                Active
                            </span>
                            {user?.user_type === 'employee' && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${clockedIn ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                    {clockedIn ? '✅ Clocked In' : '⏳ Clocked Out'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 👈 QUICK ACTIONS - For Employees Only */}
                {user?.user_type === 'employee' && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FaClock className="text-blue-600" /> Quick Actions
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {!clockedIn ? (
                                <button
                                    onClick={handleClockIn}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm flex-1 sm:flex-none justify-center"
                                >
                                    <FaSignInAlt /> Clock In
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleBreak}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition text-sm flex-1 sm:flex-none justify-center ${
                                            onBreak 
                                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                    >
                                        <FaCoffee /> {onBreak ? 'End Break' : 'Start Break'}
                                    </button>
                                    <button
                                        onClick={handleClockOut}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm flex-1 sm:flex-none justify-center"
                                    >
                                        <FaSignOutAlt /> Clock Out
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => navigate('/leaves')}
                                className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm flex-1 sm:flex-none justify-center"
                            >
                                <FaCalendarPlus /> Apply Leave
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-white rounded-2xl shadow-sm p-5 border-2 border-gray-200 hover:border-blue-300 transition group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Employees</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">{stats.total_employees}</p>
                                <p className="text-xs text-green-600 mt-1">
                                    <span className="font-semibold">{stats.active_employees}</span> active
                                </p>
                            </div>
                            <div className="bg-blue-50 group-hover:bg-blue-600 transition p-3 rounded-xl text-blue-600 group-hover:text-white">
                                <FaUsers className="text-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-5 border-2 border-gray-200 hover:border-emerald-300 transition group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Today's Attendance</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">{stats.today_attendance}</p>
                                <p className="text-xs text-gray-500 mt-1">Checked in today</p>
                            </div>
                            <div className="bg-emerald-50 group-hover:bg-emerald-600 transition p-3 rounded-xl text-emerald-600 group-hover:text-white">
                                <FaClock className="text-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-5 border-2 border-gray-200 hover:border-purple-300 transition group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Departments</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">{stats.total_departments}</p>
                                <p className="text-xs text-gray-500 mt-1">Active departments</p>
                            </div>
                            <div className="bg-purple-50 group-hover:bg-purple-600 transition p-3 rounded-xl text-purple-600 group-hover:text-white">
                                <FaBuilding className="text-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-5 border-2 border-gray-200 hover:border-amber-300 transition group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Pending Leaves</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">{stats.pending_leaves}</p>
                                <p className="text-xs text-green-600 mt-1">
                                    <span className="font-semibold">{stats.approved_leaves}</span> approved
                                </p>
                            </div>
                            <div className="bg-amber-50 group-hover:bg-amber-600 transition p-3 rounded-xl text-amber-600 group-hover:text-white">
                                <FaCalendar className="text-lg" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Stats - Second Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-white rounded-2xl shadow-sm p-5 border-2 border-gray-200 hover:border-blue-300 transition group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Payroll</p>
                                <p className="text-2xl font-black text-blue-600 mt-1">{formatCurrency(stats.total_payroll)}</p>
                                <p className="text-xs text-gray-500 mt-1">Current period</p>
                            </div>
                            <div className="bg-blue-50 group-hover:bg-blue-600 transition p-3 rounded-xl text-blue-600 group-hover:text-white">
                                <FaMoneyBill className="text-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-5 border-2 border-gray-200 hover:border-purple-300 transition group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Performance Reviews</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">{stats.total_performance_reviews}</p>
                                <p className="text-xs text-gray-500 mt-1">Total completed</p>
                            </div>
                            <div className="bg-purple-50 group-hover:bg-purple-600 transition p-3 rounded-xl text-purple-600 group-hover:text-white">
                                <FaChartLine className="text-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-5 border-2 border-gray-200 hover:border-emerald-300 transition group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Active Employees</p>
                                <p className="text-2xl font-black text-green-600 mt-1">{stats.active_employees}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {stats.total_employees > 0 ? Math.round((stats.active_employees / stats.total_employees) * 100) : 0}% of total
                                </p>
                            </div>
                            <div className="bg-green-50 group-hover:bg-green-600 transition p-3 rounded-xl text-green-600 group-hover:text-white">
                                <FaUserCheck className="text-lg" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-extrabold text-gray-900">Quick Shortcuts</h3>
                        <button 
                            onClick={fetchDashboardData}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                            <FaSync className={loading ? 'animate-spin' : ''} /> Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div 
                            onClick={() => navigate('/employees')} 
                            className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer group text-center"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 group-hover:text-white transition">
                                <FaUserPlus className="text-xl" />
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm">Employees</h4>
                            <p className="text-xs text-gray-500 mt-1">Manage & view</p>
                        </div>

                        <div 
                            onClick={() => navigate('/attendance')} 
                            className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border-2 border-gray-200 hover:border-emerald-500 hover:shadow-md transition cursor-pointer group text-center"
                        >
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-600 group-hover:text-white transition">
                                <FaClock className="text-xl" />
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm">Attendance</h4>
                            <p className="text-xs text-gray-500 mt-1">Track & view</p>
                        </div>

                        <div 
                            onClick={() => navigate('/leaves')} 
                            className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border-2 border-gray-200 hover:border-amber-500 hover:shadow-md transition cursor-pointer group text-center"
                        >
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-600 group-hover:text-white transition">
                                <FaCalendar className="text-xl" />
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm">Leave Request</h4>
                            <p className="text-xs text-gray-500 mt-1">Apply & track</p>
                        </div>

                        <div 
                            onClick={() => navigate('/performance')} 
                            className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border-2 border-gray-200 hover:border-purple-500 hover:shadow-md transition cursor-pointer group text-center"
                        >
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-600 group-hover:text-white transition">
                                <FaChartLine className="text-xl" />
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm">Performance</h4>
                            <p className="text-xs text-gray-500 mt-1">Reviews & goals</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                {recentActivities.length > 0 && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
                        <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                            <FaFileAlt className="text-blue-600" /> Recent Activity
                        </h3>
                        <div className="space-y-3">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition">
                                    <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                                        {activity.type === 'leave' ? <FaCalendar /> : <FaClock />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                                        <p className="text-xs text-gray-500">{getTimeAgo(activity.time)}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                                        {activity.status || 'active'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;