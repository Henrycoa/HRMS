// frontend/src/components/common/QuickActions.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaSignInAlt, FaSignOutAlt, FaCoffee, FaCalendarPlus } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [clockedIn, setClockedIn] = useState(false);
    const [onBreak, setOnBreak] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [employeeId, setEmployeeId] = useState(null);

    useEffect(() => {
        if (user) {
            fetchEmployee();
        }
    }, [user]);

    const fetchEmployee = async () => {
        try {
            const res = await api.get('/api/employees.php');
            if (res.data.status === 1) {
                const employees = res.data.data || [];
                const emp = employees.find(e => e.user_id === user.id);
                if (emp) {
                    setEmployeeId(emp.employee_id);
                    checkTodayAttendance(emp.employee_id);
                    setEmployees(employees);
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
            }
        } catch (e) { toast.error('Failed to update break'); }
    };

    // Only show for employees
    if (user?.user_type !== 'employee') return null;

    return (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
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
    );
};

export default QuickActions;