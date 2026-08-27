// frontend/src/components/attendance/AttendanceManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import { 
    FaClock, FaSignInAlt, FaSignOutAlt, FaCoffee,
    FaDownload, FaFileAlt, FaSpinner, FaPlus, FaSync
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AttendanceManager = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clockedIn, setClockedIn] = useState(false);
    const [todayRecord, setTodayRecord] = useState(null);
    const [onBreak, setOnBreak] = useState(false);
    const [dateFrom, setDateFrom] = useState(new Date().toISOString().slice(0,7) + '-01');
    const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0,10));
    const [employeeFilter, setEmployeeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showManualEntry, setShowManualEntry] = useState(false);

    // ============================================
    // PERMISSION CHECKS
    // ============================================
    const canManageAll = () => {
        if (!user) return false;
        return ['super_admin', 'hr_manager'].includes(user.user_type);
    };

    const canClock = () => {
        if (!user) return false;
        return ['super_admin', 'hr_manager', 'department_head', 'employee'].includes(user.user_type);
    };

    // ============================================
    // FETCH DATA
    // ============================================
    useEffect(() => {
        fetchEmployees();
        fetchAttendance();
        checkTodayAttendance();
    }, [dateFrom, dateTo, employeeFilter, statusFilter]);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/api/employees.php');
            if (response.data.status === 1) {
                let data = response.data.data || [];
                if (user?.user_type === 'employee') {
                    data = data.filter(emp => emp.user_id === user.id);
                }
                setEmployees(data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                date_from: dateFrom,
                date_to: dateTo
            });
            if (employeeFilter) params.append('employee_id', employeeFilter);
            if (statusFilter) params.append('status', statusFilter);
            
            const response = await api.get(`/api/attendance.php?${params}`);
            if (response.data.status === 1) {
                setAttendance(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            toast.error('Failed to load attendance');
        } finally {
            setLoading(false);
        }
    };

    const checkTodayAttendance = async () => {
        if (!user) return;
        try {
            const response = await api.get('/api/attendance.php?today=1');
            if (response.data.status === 1) {
                const records = response.data.data || [];
                let myRecord = records[0];
                if (user?.user_type === 'employee') {
                    const emp = employees.find(e => e.user_id === user.id);
                    if (emp) {
                        myRecord = records.find(r => r.employee_id === emp.employee_id);
                    }
                }
                if (myRecord) {
                    setTodayRecord(myRecord);
                    setClockedIn(!!myRecord.clock_in && !myRecord.clock_out);
                    setOnBreak(!!myRecord.break_start && !myRecord.break_end);
                }
            }
        } catch (error) {
            console.error('Error checking attendance:', error);
        }
    };

    // ============================================
    // CLOCK IN / OUT / BREAK
    // ============================================
    const handleClockIn = async () => {
        if (!canClock()) {
            toast.error('You do not have permission');
            return;
        }
        const employeeId = employees.find(e => e.user_id === user.id)?.employee_id;
        if (!employeeId) {
            toast.error('No employee profile found');
            return;
        }
        try {
            const response = await api.post('/api/attendance.php', {
                action: 'clock_in',
                employee_id: employeeId
            });
            if (response.data.status === 1) {
                toast.success('Clocked in successfully!');
                checkTodayAttendance();
                fetchAttendance();
            } else {
                toast.error(response.data.message || 'Failed to clock in');
            }
        } catch (error) {
            toast.error('Failed to clock in');
        }
    };

    const handleClockOut = async () => {
        const employeeId = employees.find(e => e.user_id === user.id)?.employee_id;
        if (!employeeId) {
            toast.error('No employee profile found');
            return;
        }
        try {
            const response = await api.post('/api/attendance.php', {
                action: 'clock_out',
                employee_id: employeeId
            });
            if (response.data.status === 1) {
                toast.success('Clocked out successfully!');
                checkTodayAttendance();
                fetchAttendance();
            } else {
                toast.error(response.data.message || 'Failed to clock out');
            }
        } catch (error) {
            toast.error('Failed to clock out');
        }
    };

    const handleBreak = async () => {
        const employeeId = employees.find(e => e.user_id === user.id)?.employee_id;
        if (!employeeId) {
            toast.error('No employee profile found');
            return;
        }
        try {
            const response = await api.post('/api/attendance.php', {
                action: 'break',
                break_action: onBreak ? 'end' : 'start',
                employee_id: employeeId
            });
            if (response.data.status === 1) {
                toast.success(response.data.message);
                checkTodayAttendance();
            } else {
                toast.error(response.data.message || 'Failed to update break');
            }
        } catch (error) {
            toast.error('Failed to update break');
        }
    };

    // ============================================
    // MANUAL ENTRY (HR Only)
    // ============================================
    const handleManualEntry = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        try {
            const response = await api.post('/api/attendance.php', {
                action: 'manual_entry',
                employee_id: formData.get('employee_id'),
                date: formData.get('date'),
                clock_in: formData.get('clock_in'),
                clock_out: formData.get('clock_out'),
                status: formData.get('status')
            });
            if (response.data.status === 1) {
                toast.success('Manual entry saved!');
                setShowManualEntry(false);
                fetchAttendance();
            } else {
                toast.error(response.data.message || 'Failed to save');
            }
        } catch (error) {
            toast.error('Failed to save manual entry');
        }
    };

    // ============================================
    // EXPORT
    // ============================================
    const handleExport = () => {
        const url = `/api/attendance.php?export=1&date_from=${dateFrom}&date_to=${dateTo}`;
        window.open(url, '_blank');
        toast.success('Exporting attendance data...');
    };

    // ============================================
    // HELPERS
    // ============================================
    const getStatusBadge = (status) => {
        const badges = {
            present: 'bg-green-100 text-green-700 border-green-200',
            absent: 'bg-red-100 text-red-700 border-red-200',
            late: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'half-day': 'bg-orange-100 text-orange-700 border-orange-200',
            holiday: 'bg-purple-100 text-purple-700 border-purple-200',
            leave: 'bg-blue-100 text-blue-700 border-blue-200'
        };
        return badges[status] || badges.present;
    };

    const getEmployeeName = (id) => {
        const emp = employees.find(e => e.employee_id === id);
        return emp ? `${emp.first_name} ${emp.last_name}` : 'N/A';
    };

    // ============================================
    // RENDER
    // ============================================
    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaClock className="text-blue-600" /> Attendance Management
                            </h1>
                            <p className="text-sm text-gray-500">Track and manage employee attendance</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {canClock() && (
                                <div className="flex gap-2">
                                    {!clockedIn ? (
                                        <button onClick={handleClockIn} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                                            <FaSignInAlt /> Clock In
                                        </button>
                                    ) : (
                                        <>
                                            <button onClick={handleBreak} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${onBreak ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                                                <FaCoffee /> {onBreak ? 'End Break' : 'Start Break'}
                                            </button>
                                            <button onClick={handleClockOut} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition">
                                                <FaSignOutAlt /> Clock Out
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                            {canManageAll() && (
                                <button onClick={() => setShowManualEntry(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                                    <FaPlus /> Manual Entry
                                </button>
                            )}
                            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">
                                <FaDownload /> Export
                            </button>
                            <button onClick={fetchAttendance} className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">
                                <FaSync /> Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Today's Status */}
                {todayRecord && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="font-semibold text-gray-700">Today's Status:</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(todayRecord.status)}`}>
                                {todayRecord.status}
                            </span>
                            {todayRecord.clock_in && (
                                <span className="text-sm text-gray-600">Clock In: <span className="font-medium">{todayRecord.clock_in}</span></span>
                            )}
                            {todayRecord.clock_out && (
                                <span className="text-sm text-gray-600">Clock Out: <span className="font-medium">{todayRecord.clock_out}</span></span>
                            )}
                            {todayRecord.total_hours && (
                                <span className="text-sm text-gray-600">Total Hours: <span className="font-medium">{todayRecord.total_hours}h</span></span>
                            )}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Date From</label>
                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Date To</label>
                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                        </div>
                        {canManageAll() && (
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Employee</label>
                                <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500">
                                    <option value="">All Employees</option>
                                    {employees.map(emp => (
                                        <option key={emp.employee_id} value={emp.employee_id}>{emp.first_name} {emp.last_name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500">
                                <option value="">All Status</option>
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                                <option value="half-day">Half Day</option>
                                <option value="holiday">Holiday</option>
                                <option value="leave">Leave</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaFileAlt className="text-blue-600" /> Attendance Logs
                    </h3>
                    {loading ? (
                        <div className="text-center py-12">
                            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-500">Loading attendance...</p>
                        </div>
                    ) : attendance.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-4xl mb-2">📋</div>
                            <p>No attendance records found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Employee</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Clock In</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Clock Out</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Hours</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((record) => (
                                        <tr key={record.attendance_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="py-3 px-4">
                                                <span className="text-sm font-medium text-gray-800">{new Date(record.date).toLocaleDateString()}</span>
                                            </td>
                                            <td className="py-3 px-4 hidden md:table-cell">
                                                <span className="text-sm text-gray-600">{record.employee_name || getEmployeeName(record.employee_id)}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-gray-600">{record.clock_in || '-'}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-gray-600">{record.clock_out || '-'}</span>
                                            </td>
                                            <td className="py-3 px-4 hidden lg:table-cell">
                                                <span className="text-sm text-gray-600">{record.total_hours || '0'}h</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="mt-4 text-sm text-gray-500">Showing {attendance.length} records</div>
                </div>
            </div>

            {/* Manual Entry Modal */}
            {showManualEntry && canManageAll() && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Manual Attendance Entry</h3>
                        <form onSubmit={handleManualEntry} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                                <select name="employee_id" className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" required>
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp.employee_id} value={emp.employee_id}>{emp.first_name} {emp.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" name="date" className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Clock In</label>
                                <input type="time" name="clock_in" className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Clock Out</label>
                                <input type="time" name="clock_out" className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500">
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="late">Late</option>
                                    <option value="half-day">Half Day</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4 border-t">
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">Save</button>
                                <button type="button" onClick={() => setShowManualEntry(false)} className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AttendanceManager;