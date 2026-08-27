// frontend/src/components/payroll/PayrollManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import { 
    FaMoneyBill, FaPlus, FaEdit, FaTrash, FaEye,
    FaCheck, FaTimes, FaClock, FaFilter, FaDownload,
    FaSearch, FaSpinner, FaUser, FaFileAlt,
    FaCheckCircle, FaTimesCircle, FaCalendar,
    FaPrint, FaEnvelope, FaChartBar, FaSync
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PayrollManager = () => {
    const { user } = useAuth();
    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRunModal, setShowRunModal] = useState(false);
    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [periodStart, setPeriodStart] = useState(new Date().toISOString().slice(0,7) + '-01');
    const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().slice(0,10));
    const [employeeFilter, setEmployeeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [salaryData, setSalaryData] = useState({
        basic_salary: '',
        transportation_allowance: '',
        housing_allowance: '',
        meal_allowance: '',
        other_allowances: '',
        effective_date: ''
    });
    const [summary, setSummary] = useState({
        total_employees: 0,
        total_gross: 0,
        total_net: 0,
        total_deductions: 0
    });

    // ============================================
    // PERMISSION CHECKS
    // ============================================
    const canManagePayroll = () => {
        if (!user) return false;
        return ['super_admin', 'hr_manager'].includes(user.user_type);
    };

    const canViewPayroll = () => {
        if (!user) return false;
        return ['super_admin', 'hr_manager', 'department_head', 'employee'].includes(user.user_type);
    };

    // ============================================
    // FETCH DATA
    // ============================================
    useEffect(() => {
        if (canViewPayroll()) {
            fetchEmployees();
            fetchPayroll();
        }
    }, [employeeFilter, statusFilter]);

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

    const fetchPayroll = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (employeeFilter) params.append('employee_id', employeeFilter);
            if (statusFilter) params.append('status', statusFilter);
            
            const response = await api.get(`/api/payroll.php?${params}`);
            if (response.data.status === 1) {
                const data = response.data.data || [];
                setPayrolls(data);
                calculateSummary(data);
            }
        } catch (error) {
            console.error('Error fetching payroll:', error);
            toast.error('Failed to load payroll');
        } finally {
            setLoading(false);
        }
    };

    const fetchSalaryStructure = async (employeeId) => {
        try {
            const response = await api.get(`/api/payroll.php?salary_structure=1&employee_id=${employeeId}`);
            if (response.data.status === 1 && response.data.data) {
                setSalaryData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching salary structure:', error);
        }
    };

    // ============================================
    // SUMMARY CALCULATION
    // ============================================
    const calculateSummary = (data) => {
        let total_gross = 0;
        let total_net = 0;
        let total_deductions = 0;
        
        data.forEach(p => {
            total_gross += parseFloat(p.gross_pay || 0);
            total_net += parseFloat(p.net_pay || 0);
            total_deductions += parseFloat((p.sss_contribution || 0) + (p.philhealth_contribution || 0) + 
                                          (p.pagibig_contribution || 0) + (p.withholding_tax || 0));
        });
        
        setSummary({
            total_employees: data.length,
            total_gross,
            total_net,
            total_deductions
        });
    };

    // ============================================
    // PAYROLL OPERATIONS
    // ============================================
    const handleRunPayroll = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/payroll.php?run=1&period_start=${periodStart}&period_end=${periodEnd}&generated_by=${user.id}`);
            if (response.data.status === 1) {
                toast.success(response.data.message || 'Payroll generated successfully!');
                setShowRunModal(false);
                fetchPayroll();
            } else {
                toast.error(response.data.message || 'Failed to run payroll');
            }
        } catch (error) {
            console.error('Run payroll error:', error);
            toast.error('Failed to run payroll');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (payrollId, action) => {
        const actionLabels = {
            generate: 'generate',
            approve: 'approve',
            pay: 'mark as paid',
            cancel: 'cancel'
        };
        
        if (!window.confirm(`Are you sure you want to ${actionLabels[action] || action} this payroll?`)) return;
        
        try {
            const response = await api.post('/api/payroll.php', {
                action: action,
                payroll_id: payrollId,
                user_id: user.id
            });
            if (response.data.status === 1) {
                toast.success(response.data.message || `Payroll ${action}ed successfully`);
                fetchPayroll();
            } else {
                toast.error(response.data.message || `Failed to ${action} payroll`);
            }
        } catch (error) {
            console.error('Update status error:', error);
            toast.error(`Failed to ${action} payroll`);
        }
    };

    const handleUpdateSalary = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.put('/api/payroll.php', {
                ...salaryData,
                employee_id: selectedEmployee
            });
            if (response.data.status === 1) {
                toast.success('Salary structure updated!');
                setShowSalaryModal(false);
                fetchPayroll();
            } else {
                toast.error(response.data.message || 'Failed to update salary');
            }
        } catch (error) {
            console.error('Update salary error:', error);
            toast.error('Failed to update salary');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // EXPORT
    // ============================================
    const handleExport = () => {
        const url = `/api/payroll.php?export=1&period_start=${periodStart}&period_end=${periodEnd}`;
        window.open(url, '_blank');
        toast.success('Exporting payroll data...');
    };

    // ============================================
    // HELPERS
    // ============================================
    const getStatusBadge = (status) => {
        const badges = {
            draft: 'bg-gray-100 text-gray-700 border-gray-200',
            generated: 'bg-blue-100 text-blue-700 border-blue-200',
            approved: 'bg-green-100 text-green-700 border-green-200',
            paid: 'bg-purple-100 text-purple-700 border-purple-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200'
        };
        return badges[status] || badges.draft;
    };

    const getStatusIcon = (status) => {
        const icons = {
            draft: <FaClock className="text-gray-500" />,
            generated: <FaClock className="text-blue-500" />,
            approved: <FaCheckCircle className="text-green-500" />,
            paid: <FaMoneyBill className="text-purple-500" />,
            cancelled: <FaTimesCircle className="text-red-500" />
        };
        return icons[status] || icons.draft;
    };

    const getEmployeeName = (id) => {
        const emp = employees.find(e => e.employee_id === id);
        return emp ? `${emp.first_name} ${emp.last_name}` : 'N/A';
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₱0.00';
        return `₱${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
                                <FaMoneyBill className="text-blue-600" /> Payroll Management
                            </h1>
                            <p className="text-sm text-gray-500">Manage employee payroll and compensation</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {canManagePayroll() && (
                                <>
                                    <button 
                                        onClick={() => { setShowRunModal(true); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                                    >
                                        <FaClock /> Run Payroll
                                    </button>
                                    <button 
                                        onClick={handleExport}
                                        className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                                    >
                                        <FaDownload /> Export
                                    </button>
                                </>
                            )}
                            <button 
                                onClick={fetchPayroll}
                                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                            >
                                <FaSync /> Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                {payrolls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 text-center">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Employees</p>
                            <p className="text-2xl font-bold text-blue-600">{summary.total_employees}</p>
                        </div>
                        <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 text-center">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Total Gross</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_gross)}</p>
                        </div>
                        <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 text-center">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Total Deductions</p>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.total_deductions)}</p>
                        </div>
                        <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 text-center">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Total Net Pay</p>
                            <p className="text-2xl font-bold text-purple-600">{formatCurrency(summary.total_net)}</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Period Start</label>
                            <input 
                                type="date" 
                                value={periodStart}
                                onChange={(e) => setPeriodStart(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Period End</label>
                            <input 
                                type="date" 
                                value={periodEnd}
                                onChange={(e) => setPeriodEnd(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        {canManagePayroll() && (
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Employee</label>
                                <select 
                                    value={employeeFilter}
                                    onChange={(e) => setEmployeeFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">All Employees</option>
                                    {employees.map(emp => (
                                        <option key={emp.employee_id} value={emp.employee_id}>
                                            {emp.first_name} {emp.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                            >
                                <option value="">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="generated">Generated</option>
                                <option value="approved">Approved</option>
                                <option value="paid">Paid</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Payroll Table */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaFileAlt className="text-blue-600" /> Payroll Records
                    </h3>

                    {loading ? (
                        <div className="text-center py-12">
                            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-500">Loading...</p>
                        </div>
                    ) : payrolls.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-4xl mb-2">💰</div>
                            <p>No payroll records found</p>
                            {canManagePayroll() && (
                                <button 
                                    onClick={() => setShowRunModal(true)}
                                    className="mt-4 text-blue-600 hover:underline flex items-center gap-2 mx-auto"
                                >
                                    <FaClock /> Run first payroll
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Period</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Gross Pay</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Deductions</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Net Pay</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        {canManagePayroll() && (
                                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {payrolls.map((p) => (
                                        <tr key={p.payroll_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <FaUser className="text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {getEmployeeName(p.employee_id)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 hidden md:table-cell">
                                                <span className="text-sm text-gray-600">
                                                    {new Date(p.period_start).toLocaleDateString()} - {new Date(p.period_end).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className="text-sm font-medium text-gray-800">
                                                    {formatCurrency(p.gross_pay)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right hidden lg:table-cell">
                                                <span className="text-sm text-gray-600">
                                                    {formatCurrency((p.sss_contribution || 0) + (p.philhealth_contribution || 0) + (p.pagibig_contribution || 0) + (p.withholding_tax || 0))}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className="text-sm font-bold text-green-600">
                                                    {formatCurrency(p.net_pay)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(p.status)}`}>
                                                    {getStatusIcon(p.status)} {p.status}
                                                </span>
                                            </td>
                                            {canManagePayroll() && (
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {p.status === 'draft' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(p.payroll_id, 'generate')}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                    title="Generate"
                                                                >
                                                                    <FaCheck />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(p.payroll_id, 'cancel')}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                    title="Cancel"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </>
                                                        )}
                                                        {p.status === 'generated' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(p.payroll_id, 'approve')}
                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                                    title="Approve"
                                                                >
                                                                    <FaCheckCircle />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(p.payroll_id, 'cancel')}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                    title="Cancel"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </>
                                                        )}
                                                        {p.status === 'approved' && (
                                                            <button 
                                                                onClick={() => handleUpdateStatus(p.payroll_id, 'pay')}
                                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                                                title="Mark as Paid"
                                                            >
                                                                <FaMoneyBill />
                                                            </button>
                                                        )}
                                                        {p.status === 'paid' && (
                                                            <button 
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                title="View Payslip"
                                                            >
                                                                <FaEye />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="mt-4 text-sm text-gray-500 flex justify-between">
                        <span>Showing {payrolls.length} records</span>
                        {payrolls.length > 0 && (
                            <span className="text-xs text-gray-400">
                                Total: {formatCurrency(summary.total_net)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================
                RUN PAYROLL MODAL
            ============================================ */}
            {showRunModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaClock className="text-blue-600" /> Run Payroll
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Generate payroll for the selected period. This will create payroll records for all active employees.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Period Start</label>
                                <input 
                                    type="date" 
                                    value={periodStart}
                                    onChange={(e) => setPeriodStart(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Period End</label>
                                <input 
                                    type="date" 
                                    value={periodEnd}
                                    onChange={(e) => setPeriodEnd(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="bg-blue-50 p-3 rounded-xl text-sm text-blue-700">
                                <p className="font-semibold">⚠️ Note:</p>
                                <p>This will generate payroll for ALL active employees. Make sure all attendance and leave data are up to date.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6 pt-4 border-t">
                            <button 
                                onClick={handleRunPayroll}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {loading ? <><FaSpinner className="animate-spin inline mr-2" /> Generating...</> : 'Generate Payroll'}
                            </button>
                            <button 
                                onClick={() => setShowRunModal(false)}
                                className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================
                SALARY STRUCTURE MODAL
            ============================================ */}
            {showSalaryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FaEdit className="text-blue-600" /> Salary Structure
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Update salary structure for: <strong>{getEmployeeName(selectedEmployee)}</strong>
                        </p>
                        <form onSubmit={handleUpdateSalary}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
                                    <input 
                                        type="number" 
                                        value={salaryData.basic_salary || ''}
                                        onChange={(e) => setSalaryData({...salaryData, basic_salary: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Transportation Allowance</label>
                                    <input 
                                        type="number" 
                                        value={salaryData.transportation_allowance || ''}
                                        onChange={(e) => setSalaryData({...salaryData, transportation_allowance: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Housing Allowance</label>
                                    <input 
                                        type="number" 
                                        value={salaryData.housing_allowance || ''}
                                        onChange={(e) => setSalaryData({...salaryData, housing_allowance: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meal Allowance</label>
                                    <input 
                                        type="number" 
                                        value={salaryData.meal_allowance || ''}
                                        onChange={(e) => setSalaryData({...salaryData, meal_allowance: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Allowances</label>
                                    <input 
                                        type="number" 
                                        value={salaryData.other_allowances || ''}
                                        onChange={(e) => setSalaryData({...salaryData, other_allowances: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                                    <input 
                                        type="date" 
                                        value={salaryData.effective_date || ''}
                                        onChange={(e) => setSalaryData({...salaryData, effective_date: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {loading ? <><FaSpinner className="animate-spin inline mr-2" /> Saving...</> : 'Save Structure'}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setShowSalaryModal(false)}
                                    className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default PayrollManager;