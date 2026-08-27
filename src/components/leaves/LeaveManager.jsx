// frontend/src/components/leaves/LeaveManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import { 
    FaCalendar, FaPlus, FaEdit, FaTrash, FaEye,
    FaCheck, FaTimes, FaClock, FaFilter, FaDownload,
    FaSearch, FaSpinner, FaUser, FaFileAlt,
    FaCheckCircle, FaTimesCircle, FaSync
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const LeaveManager = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [balances, setBalances] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showTypes, setShowTypes] = useState(false);
    const [showDetails, setShowDetails] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingTypeId, setEditingTypeId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [approveReason, setApproveReason] = useState('');
    const [rejectReason, setRejectReason] = useState('');

    const [formData, setFormData] = useState({
        employee_id: '',
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: ''
    });

    const [typeForm, setTypeForm] = useState({
        name: '',
        code: '',
        description: '',
        days_per_year: 0,
        with_pay: 1,
        color: '#007bff',
        max_consecutive_days: ''
    });

    // ============================================
    // PERMISSION CHECKS
    // ============================================
    const isHR = () => {
        if (!user) return false;
        return ['super_admin', 'hr_manager'].includes(user.user_type);
    };

    const isDeptHead = () => {
        if (!user) return false;
        return ['super_admin', 'hr_manager', 'department_head'].includes(user.user_type);
    };

    // ============================================
    // FETCH DATA
    // ============================================
    useEffect(() => {
        fetchEmployees();
        fetchLeaveTypes();
        fetchLeaves();
        fetchLeaveBalances();
    }, [statusFilter]);

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

    const fetchLeaveTypes = async () => {
        try {
            const response = await api.get('/api/leaves.php?types=1');
            if (response.data.status === 1) {
                setLeaveTypes(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching leave types:', error);
        }
    };

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            
            if (user?.user_type === 'employee') {
                const emp = employees.find(e => e.user_id === user.id);
                if (emp) params.append('employee_id', emp.employee_id);
            }
            
            const response = await api.get(`/api/leaves.php?${params}`);
            if (response.data.status === 1) {
                setLeaves(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching leaves:', error);
            toast.error('Failed to load leaves');
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaveBalances = async () => {
        try {
            const emp = employees.find(e => e.user_id === user.id);
            if (!emp) return;
            
            const response = await api.get(`/api/leaves.php?balance=1&employee_id=${emp.employee_id}`);
            if (response.data.status === 1) {
                setBalances(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching balances:', error);
        }
    };

    // ============================================
    // LEAVE TYPE CRUD
    // ============================================
    const handleTypeSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingTypeId) {
                await api.put(`/api/leaves.php?id=${editingTypeId}`, {
                    action: 'update_type',
                    ...typeForm
                });
                toast.success('Leave type updated successfully!');
            } else {
                const response = await api.post('/api/leaves.php', {
                    action: 'type',
                    ...typeForm
                });
                if (response.data.status === 1) {
                    toast.success('Leave type created successfully!');
                } else {
                    toast.error(response.data.message || 'Failed to create leave type');
                    setLoading(false);
                    return;
                }
            }
            resetTypeForm();
            fetchLeaveTypes();
        } catch (error) {
            console.error('Leave type submit error:', error);
            toast.error(error.response?.data?.message || 'Failed to save leave type');
        } finally {
            setLoading(false);
        }
    };

    const handleEditType = (type) => {
        setTypeForm({
            name: type.name,
            code: type.code,
            description: type.description || '',
            days_per_year: type.days_per_year,
            with_pay: type.with_pay,
            color: type.color || '#007bff',
            max_consecutive_days: type.max_consecutive_days || ''
        });
        setEditingTypeId(type.leave_type_id);
        setShowTypes(true);
    };

    const handleDeleteType = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await api.delete(`/api/leaves.php?id=${id}`);
            toast.success('Leave type deleted successfully');
            fetchLeaveTypes();
        } catch (error) {
            console.error('Delete type error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete leave type');
        }
    };

    const resetTypeForm = () => {
        setTypeForm({
            name: '',
            code: '',
            description: '',
            days_per_year: 0,
            with_pay: 1,
            color: '#007bff',
            max_consecutive_days: ''
        });
        setEditingTypeId(null);
        setShowTypes(false);
    };

    // ============================================
    // LEAVE REQUEST CRUD
    // ============================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/api/leaves.php', {
                action: 'request',
                ...formData
            });
            if (response.data.status === 1) {
                toast.success('Leave request submitted!');
                resetForm();
                fetchLeaves();
                fetchLeaveBalances();
            } else {
                toast.error(response.data.message || 'Failed to submit');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Failed to submit leave request');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!approveReason.trim()) {
            toast.error('Please provide a reason for approval');
            return;
        }

        try {
            const response = await api.put(`/api/leaves.php?id=${showApproveModal}`, {
                status: 'approved',
                approved_by: employees.find(e => e.user_id === user.id)?.employee_id,
                comments: approveReason
            });
            if (response.data.status === 1) {
                toast.success('Leave approved!');
                setShowApproveModal(null);
                setApproveReason('');
                fetchLeaves();
                fetchLeaveBalances();
            }
        } catch (error) {
            console.error('Approve error:', error);
            toast.error('Failed to approve leave');
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            const response = await api.put(`/api/leaves.php?id=${showRejectModal}`, {
                status: 'rejected',
                rejection_reason: rejectReason
            });
            if (response.data.status === 1) {
                toast.success('Leave rejected');
                setShowRejectModal(null);
                setRejectReason('');
                fetchLeaves();
            }
        } catch (error) {
            console.error('Reject error:', error);
            toast.error('Failed to reject leave');
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this leave request?')) return;
        try {
            const response = await api.delete(`/api/leaves.php?id=${id}`);
            if (response.data.status === 1) {
                toast.success('Leave cancelled');
                fetchLeaves();
            }
        } catch (error) {
            console.error('Cancel error:', error);
            toast.error('Failed to cancel leave');
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedIds.length === 0) {
            toast.error('No leaves selected');
            return;
        }
        
        if (!window.confirm(`${action} ${selectedIds.length} leave requests?`)) return;
        
        try {
            const response = await api.post('/api/leaves.php', {
                action: 'bulk',
                action_type: action,
                leave_ids: selectedIds,
                approved_by: employees.find(e => e.user_id === user.id)?.employee_id
            });
            if (response.data.status === 1) {
                toast.success(response.data.message);
                setSelectedIds([]);
                fetchLeaves();
                fetchLeaveBalances();
            }
        } catch (error) {
            console.error('Bulk action error:', error);
            toast.error('Failed to process bulk action');
        }
    };

    const handleExport = () => {
        const from = new Date().getFullYear() + '-01-01';
        const to = new Date().getFullYear() + '-12-31';
        window.open(`/api/leaves.php?export=1&date_from=${from}&date_to=${to}`, '_blank');
        toast.success('Exporting leave data...');
    };

    const resetForm = () => {
        setFormData({
            employee_id: '',
            leave_type_id: '',
            start_date: '',
            end_date: '',
            reason: ''
        });
        setEditingId(null);
        setShowForm(false);
    };

    // ============================================
    // HELPERS
    // ============================================
    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            approved: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
            cancelled: 'bg-gray-100 text-gray-700 border-gray-200'
        };
        return badges[status] || badges.pending;
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <FaClock className="text-yellow-500" />,
            approved: <FaCheckCircle className="text-green-500" />,
            rejected: <FaTimesCircle className="text-red-500" />,
            cancelled: <FaTimes className="text-gray-500" />
        };
        return icons[status] || icons.pending;
    };

    const getEmployeeName = (id) => {
        const emp = employees.find(e => e.employee_id === id);
        return emp ? `${emp.first_name} ${emp.last_name}` : 'N/A';
    };

    const getLeaveTypeName = (id) => {
        const type = leaveTypes.find(t => t.leave_type_id === id);
        return type ? type.name : 'N/A';
    };

    const getLeaveTypeColor = (id) => {
        const type = leaveTypes.find(t => t.leave_type_id === id);
        return type ? type.color : '#007bff';
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
                                <FaCalendar className="text-blue-600" /> Leave Management
                            </h1>
                            <p className="text-sm text-gray-500">Manage employee leave requests</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {isHR() && (
                                <button 
                                    onClick={() => { resetTypeForm(); setShowTypes(true); }}
                                    className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                                >
                                    <FaEdit /> Leave Types
                                </button>
                            )}
                            <button 
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                            >
                                <FaPlus /> Request Leave
                            </button>
                            <button 
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                            >
                                <FaDownload /> Export
                            </button>
                            <button 
                                onClick={fetchLeaves}
                                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                            >
                                <FaSync /> Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Leave Balances */}
                {balances.length > 0 && (
                    <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Your Leave Balances</h3>
                        <div className="flex flex-wrap gap-3">
                            {balances.map((b) => (
                                <div key={b.balance_id} className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                                    <span className="text-xs text-gray-500">{b.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold" style={{ color: b.color }}>
                                            {b.balance}
                                        </span>
                                        <span className="text-xs text-gray-400">/ {b.used} used</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[200px] relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search leaves..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        {isHR() && (
                            <button 
                                onClick={() => handleBulkAction('approve')}
                                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                            >
                                <FaCheck className="inline mr-1" /> Bulk Approve
                            </button>
                        )}
                        {isHR() && (
                            <button 
                                onClick={() => handleBulkAction('reject')}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                            >
                                <FaTimes className="inline mr-1" /> Bulk Reject
                            </button>
                        )}
                    </div>
                </div>

                {/* Leave Table */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaFileAlt className="text-blue-600" /> Leave Requests
                    </h3>

                    {loading ? (
                        <div className="text-center py-12">
                            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-500">Loading...</p>
                        </div>
                    ) : leaves.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-4xl mb-2">📋</div>
                            <p>No leave requests found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        {isHR() && (
                                            <th className="py-3 px-4">
                                                <input 
                                                    type="checkbox"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedIds(leaves.map(l => l.leave_request_id));
                                                        } else {
                                                            setSelectedIds([]);
                                                        }
                                                    }}
                                                />
                                            </th>
                                        )}
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Leave Type</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Dates</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Days</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map((leave) => (
                                        <tr key={leave.leave_request_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            {isHR() && (
                                                <td className="py-3 px-4">
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedIds.includes(leave.leave_request_id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedIds([...selectedIds, leave.leave_request_id]);
                                                            } else {
                                                                setSelectedIds(selectedIds.filter(id => id !== leave.leave_request_id));
                                                            }
                                                        }}
                                                    />
                                                </td>
                                            )}
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <FaUser className="text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {getEmployeeName(leave.employee_id)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 hidden md:table-cell">
                                                <span 
                                                    className="text-sm px-2 py-1 rounded-full"
                                                    style={{ backgroundColor: getLeaveTypeColor(leave.leave_type_id) + '20', color: getLeaveTypeColor(leave.leave_type_id) }}
                                                >
                                                    {getLeaveTypeName(leave.leave_type_id)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-gray-600">
                                                    {new Date(leave.start_date).toLocaleDateString()}
                                                    <span className="text-xs text-gray-400 mx-1">→</span>
                                                    {new Date(leave.end_date).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 hidden lg:table-cell">
                                                <span className="text-sm text-gray-600">{leave.total_days} days</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(leave.status)}`}>
                                                    {getStatusIcon(leave.status)}
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => setShowDetails(leave)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </button>

                                                    {leave.status === 'pending' && isDeptHead() && (
                                                        <>
                                                            <button 
                                                                onClick={() => setShowApproveModal(leave.leave_request_id)}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                                title="Approve"
                                                            >
                                                                <FaCheck />
                                                            </button>
                                                            <button 
                                                                onClick={() => setShowRejectModal(leave.leave_request_id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                title="Reject"
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </>
                                                    )}
                                                    {leave.status === 'pending' && !isDeptHead() && (
                                                        <button 
                                                            onClick={() => handleCancel(leave.leave_request_id)}
                                                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                                                            title="Cancel"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="mt-4 text-sm text-gray-500 flex justify-between">
                        <span>Showing {leaves.length} records</span>
                        {leaves.length > 0 && (
                            <span className="text-xs text-gray-400">
                                Total: {leaves.reduce((sum, l) => sum + l.total_days, 0)} days
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================
                VIEW DETAILS MODAL
            ============================================ */}
            {showDetails && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FaInfoCircle className="text-blue-600" /> Leave Request Details
                            </h3>
                            <button 
                                onClick={() => setShowDetails(null)}
                                className="text-gray-400 hover:text-gray-600 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Employee</p>
                                    <p className="font-medium text-gray-800">{getEmployeeName(showDetails.employee_id)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Leave Type</p>
                                    <span 
                                        className="inline-block px-2 py-1 rounded-full text-sm"
                                        style={{ backgroundColor: getLeaveTypeColor(showDetails.leave_type_id) + '20', color: getLeaveTypeColor(showDetails.leave_type_id) }}
                                    >
                                        {getLeaveTypeName(showDetails.leave_type_id)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Start Date</p>
                                    <p className="font-medium text-gray-800">{new Date(showDetails.start_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">End Date</p>
                                    <p className="font-medium text-gray-800">{new Date(showDetails.end_date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">Total Days</p>
                                <p className="font-medium text-gray-800">{showDetails.total_days} days</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(showDetails.status)}`}>
                                    {getStatusIcon(showDetails.status)}
                                    {showDetails.status}
                                </span>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">Reason</p>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                    {showDetails.reason || 'No reason provided'}
                                </p>
                            </div>

                            {showDetails.comments && (
                                <div>
                                    <p className="text-xs text-gray-500">Approver Comments</p>
                                    <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-xl border border-green-200">
                                        {showDetails.comments}
                                    </p>
                                </div>
                            )}

                            {showDetails.rejection_reason && (
                                <div>
                                    <p className="text-xs text-gray-500">Rejection Reason</p>
                                    <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-xl border border-red-200">
                                        {showDetails.rejection_reason}
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                <button 
                                    onClick={() => setShowDetails(null)}
                                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================
                APPROVE MODAL WITH REASON
            ============================================ */}
            {showApproveModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <FaCheckCircle className="text-green-500 text-2xl" />
                            <h3 className="text-lg font-bold text-gray-800">Approve Leave</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Please provide a comment for this approval.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Approval Comment *</label>
                            <textarea
                                value={approveReason}
                                onChange={(e) => setApproveReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                rows="3"
                                placeholder="Enter approval comment..."
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleApprove}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                            >
                                Confirm Approve
                            </button>
                            <button 
                                onClick={() => { setShowApproveModal(null); setApproveReason(''); }}
                                className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================
                REJECT MODAL WITH REASON
            ============================================ */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <FaTimesCircle className="text-red-500 text-2xl" />
                            <h3 className="text-lg font-bold text-gray-800">Reject Leave</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Please provide a reason for rejection.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason *</label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                rows="3"
                                placeholder="Enter rejection reason..."
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleReject}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                            >
                                Confirm Reject
                            </button>
                            <button 
                                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                                className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Leave Request Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Request Leave</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {isHR() && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                                        <select
                                            value={formData.employee_id}
                                            onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Employee</option>
                                            {employees.map(emp => (
                                                <option key={emp.employee_id} value={emp.employee_id}>
                                                    {emp.first_name} {emp.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                                    <select
                                        value={formData.leave_type_id}
                                        onChange={(e) => setFormData({...formData, leave_type_id: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select Leave Type</option>
                                        {leaveTypes.map(type => (
                                            <option key={type.leave_type_id} value={type.leave_type_id}>
                                                {type.name} ({type.days_per_year} days)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                            required
                                            min={formData.start_date || new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                    <textarea
                                        value={formData.reason}
                                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                                        rows="3"
                                        placeholder="Please provide reason for leave..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                                    Submit Request
                                </button>
                                <button 
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Leave Types Modal */}
            {showTypes && isHR() && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingTypeId ? 'Edit Leave Type' : 'Leave Types'}
                            </h3>
                            <button 
                                onClick={() => { resetTypeForm(); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Add/Edit Form */}
                        <form onSubmit={handleTypeSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={typeForm.name}
                                        onChange={(e) => setTypeForm({...typeForm, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Code *</label>
                                    <input
                                        type="text"
                                        value={typeForm.code}
                                        onChange={(e) => setTypeForm({...typeForm, code: e.target.value.toUpperCase()})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                        placeholder="VL, SL, PL"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={typeForm.description}
                                        onChange={(e) => setTypeForm({...typeForm, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Days Per Year</label>
                                    <input
                                        type="number"
                                        value={typeForm.days_per_year}
                                        onChange={(e) => setTypeForm({...typeForm, days_per_year: parseInt(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                                    <input
                                        type="color"
                                        value={typeForm.color}
                                        onChange={(e) => setTypeForm({...typeForm, color: e.target.value})}
                                        className="w-full h-10 px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Max Consecutive Days</label>
                                    <input
                                        type="number"
                                        value={typeForm.max_consecutive_days}
                                        onChange={(e) => setTypeForm({...typeForm, max_consecutive_days: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                        placeholder="Leave blank for no limit"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">With Pay</label>
                                    <select
                                        value={typeForm.with_pay}
                                        onChange={(e) => setTypeForm({...typeForm, with_pay: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                    >
                                        <option value="1">Yes</option>
                                        <option value="0">No</option>
                                    </select>
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <FaSave /> {loading ? 'Saving...' : (editingTypeId ? 'Update Type' : 'Add Type')}
                            </button>
                        </form>

                        {/* Leave Types List */}
                        <div className="space-y-2">
                            {leaveTypes.map(type => (
                                <div key={type.leave_type_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: type.color }}></div>
                                        <div>
                                            <span className="font-medium text-gray-800">{type.name}</span>
                                            <span className="text-xs text-gray-400 ml-2">({type.code})</span>
                                            <p className="text-xs text-gray-500">{type.days_per_year} days/year</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleEditType(type)}
                                            className="text-yellow-600 hover:bg-yellow-50 p-1 rounded transition"
                                            title="Edit"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteType(type.leave_type_id, type.name)}
                                            className="text-red-600 hover:bg-red-50 p-1 rounded transition"
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {leaveTypes.length === 0 && (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                    No leave types added yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default LeaveManager;