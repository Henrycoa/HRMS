// frontend/src/components/company/CompanyStructure.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import { 
    FaBuilding, FaPlus, FaEdit, FaTrash, FaEye,
    FaUser, FaBriefcase, FaMoneyBill, FaSitemap,
    FaChevronDown, FaChevronRight, FaUsers,
    FaSearch, FaFilter, FaTimes, FaSave, FaSpinner,
    FaSync
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const CompanyStructure = () => {
    const { user } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [orgChart, setOrgChart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('departments');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        department_name: '',
        department_code: '',
        description: '',
        head_employee_id: '',
        parent_department_id: '',
        status: 'active'
    });
    const [positionForm, setPositionForm] = useState({
        title: '',
        description: '',
        department_id: '',
        salary_grade: '',
        min_salary: '',
        max_salary: '',
        status: 'active'
    });
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');

    // ============================================
    // PERMISSION CHECKS
    // ============================================
    const canManage = () => {
        if (!user) return false;
        return ['super_admin', 'hr_manager'].includes(user.user_type);
    };

    // ============================================
    // FETCH DATA
    // ============================================
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchDepartments(),
                fetchPositions(),
                fetchOrgChart(),
                fetchEmployees()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load company data');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/api/departments.php');
            if (response.data.status === 1) {
                setDepartments(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
            toast.error('Failed to load departments');
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await api.get('/api/positions.php');
            if (response.data.status === 1) {
                setPositions(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching positions:', error);
            toast.error('Failed to load positions');
        }
    };

    const fetchOrgChart = async () => {
        try {
            const response = await api.get('/api/org-chart.php');
            if (response.data.status === 1) {
                setOrgChart(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching org chart:', error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/api/employees.php');
            if (response.data.status === 1) {
                setEmployees(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    // ============================================
    // DEPARTMENT CRUD
    // ============================================
    const handleDepartmentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/api/departments.php?id=${editingId}`, formData);
                toast.success('Department updated successfully');
            } else {
                await api.post('/api/departments.php', formData);
                toast.success('Department created successfully');
            }
            resetForm();
            await fetchAllData();
        } catch (error) {
            console.error('Department submit error:', error);
            toast.error(error.response?.data?.message || 'Failed to save department');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDepartment = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await api.delete(`/api/departments.php?id=${id}`);
            toast.success('Department deleted successfully');
            await fetchAllData();
        } catch (error) {
            console.error('Delete department error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete department');
        }
    };

    const handleEditDepartment = (department) => {
        setFormData(department);
        setEditingId(department.department_id);
        setShowForm(true);
    };

    // ============================================
    // POSITION CRUD
    // ============================================
    const handlePositionSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/api/positions.php?id=${editingId}`, positionForm);
                toast.success('Position updated successfully');
            } else {
                await api.post('/api/positions.php', positionForm);
                toast.success('Position created successfully');
            }
            resetPositionForm();
            await fetchAllData();
        } catch (error) {
            console.error('Position submit error:', error);
            toast.error(error.response?.data?.message || 'Failed to save position');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePosition = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        try {
            await api.delete(`/api/positions.php?id=${id}`);
            toast.success('Position deleted successfully');
            await fetchAllData();
        } catch (error) {
            console.error('Delete position error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete position');
        }
    };

    const handleEditPosition = (position) => {
        setPositionForm(position);
        setEditingId(position.position_id);
        setShowForm(true);
    };

    // ============================================
    // FORM HELPERS
    // ============================================
    const resetForm = () => {
        setFormData({
            department_name: '',
            department_code: '',
            description: '',
            head_employee_id: '',
            parent_department_id: '',
            status: 'active'
        });
        setEditingId(null);
        setShowForm(false);
    };

    const resetPositionForm = () => {
        setPositionForm({
            title: '',
            description: '',
            department_id: '',
            salary_grade: '',
            min_salary: '',
            max_salary: '',
            status: 'active'
        });
        setEditingId(null);
        setShowForm(false);
    };

    const getDepartmentName = (id) => {
        const dept = departments.find(d => d.department_id === parseInt(id) || d.id === parseInt(id));
        return dept ? dept.department_name || dept.name : 'N/A';
    };

    const getEmployeeName = (id) => {
        const emp = employees.find(e => e.employee_id === parseInt(id));
        return emp ? `${emp.first_name} ${emp.last_name}` : 'N/A';
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: 'bg-green-100 text-green-700 border-green-200',
            inactive: 'bg-gray-100 text-gray-700 border-gray-200'
        };
        return badges[status] || badges.active;
    };

    // ============================================
    // RENDER: ORGANIZATIONAL CHART
    // ============================================
    const renderOrgChart = () => {
        if (!orgChart) {
            return (
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center py-12">
                    <FaSitemap className="text-4xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No organizational data available</p>
                    <p className="text-sm text-gray-400 mt-1">Add departments and assign employees to build your org chart</p>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FaSitemap className="text-blue-600" /> Organizational Chart
                    </h3>
                    <button 
                        onClick={fetchOrgChart}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                        <FaSync /> Refresh
                    </button>
                </div>
                <div className="min-w-[600px]">
                    {orgChart.departments && orgChart.departments.map((dept) => (
                        <div key={dept.department_id} className="mb-4 border border-gray-200 rounded-xl p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <FaBuilding className="text-blue-600" />
                                    <span className="font-bold text-gray-800">{dept.department_name}</span>
                                    <span className="text-xs text-gray-400">({dept.department_code})</span>
                                </div>
                                {dept.head_name && (
                                    <span className="text-sm text-gray-600">
                                        Head: <span className="font-medium">{dept.head_name}</span>
                                    </span>
                                )}
                            </div>
                            <div className="ml-6 pl-4 border-l-2 border-gray-300">
                                {orgChart.employees && orgChart.employees
                                    .filter(emp => emp.department_id === dept.department_id)
                                    .map(emp => (
                                        <div key={emp.employee_id} className="flex items-center gap-2 py-1">
                                            <FaUser className="text-gray-400 text-xs" />
                                            <span className="text-sm text-gray-700">{emp.name}</span>
                                            {orgChart.positions && orgChart.positions
                                                .filter(p => p.position_id === emp.position_id)
                                                .map(p => (
                                                    <span key={p.position_id} className="text-xs text-gray-400">- {p.title}</span>
                                                ))
                                            }
                                        </div>
                                    ))
                                }
                                {orgChart.employees && orgChart.employees.filter(emp => emp.department_id === dept.department_id).length === 0 && (
                                    <div className="text-xs text-gray-400 py-1">No employees assigned</div>
                                )}
                            </div>
                        </div>
                    ))}
                    {orgChart.departments && orgChart.departments.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No departments found. Create your first department!</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ============================================
    // RENDER: DEPARTMENTS LIST
    // ============================================
    const renderDepartments = () => {
        const filtered = departments.filter(d => 
            d.department_name.toLowerCase().includes(search.toLowerCase()) ||
            (d.department_code && d.department_code.toLowerCase().includes(search.toLowerCase()))
        );

        return (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FaBuilding className="text-blue-600" /> Departments
                        </h3>
                        <p className="text-sm text-gray-500">Manage company departments</p>
                    </div>
                    <div className="flex gap-2">
                        {canManage() && (
                            <button 
                                onClick={() => { resetForm(); setShowForm(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                            >
                                <FaPlus /> Add Department
                            </button>
                        )}
                        <button 
                            onClick={fetchDepartments}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                        >
                            <FaSync /> Refresh
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search departments..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Department</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Code</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Head</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                {canManage() && (
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8">
                                        <FaSpinner className="animate-spin text-blue-600 mx-auto text-2xl" />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                        No departments found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((dept) => (
                                    <tr key={dept.department_id || dept.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <FaBuilding className="text-blue-600" />
                                                <span className="font-medium text-gray-800">{dept.department_name || dept.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 hidden md:table-cell">
                                            <span className="text-sm text-gray-600">{dept.department_code || dept.code}</span>
                                        </td>
                                        <td className="py-3 px-4 hidden lg:table-cell">
                                            <span className="text-sm text-gray-600">
                                                {getEmployeeName(dept.head_employee_id)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(dept.status)}`}>
                                                {dept.status}
                                            </span>
                                        </td>
                                        {canManage() && (
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleEditDepartment(dept)}
                                                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteDepartment(dept.department_id || dept.id, dept.department_name || dept.name)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-sm text-gray-500">Showing {filtered.length} departments</div>
            </div>
        );
    };

    // ============================================
    // RENDER: POSITIONS LIST
    // ============================================
    const renderPositions = () => {
        const filtered = positions.filter(p => 
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
        );

        return (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FaBriefcase className="text-blue-600" /> Positions
                        </h3>
                        <p className="text-sm text-gray-500">Manage job positions and salary grades</p>
                    </div>
                    <div className="flex gap-2">
                        {canManage() && (
                            <button 
                                onClick={() => { resetPositionForm(); setShowForm(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                            >
                                <FaPlus /> Add Position
                            </button>
                        )}
                        <button 
                            onClick={fetchPositions}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                        >
                            <FaSync /> Refresh
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search positions..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Title</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Department</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Salary Grade</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Range</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                {canManage() && (
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8">
                                        <FaSpinner className="animate-spin text-blue-600 mx-auto text-2xl" />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        No positions found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((pos) => (
                                    <tr key={pos.position_id || pos.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <FaBriefcase className="text-blue-600" />
                                                <span className="font-medium text-gray-800">{pos.title}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 hidden md:table-cell">
                                            <span className="text-sm text-gray-600">{getDepartmentName(pos.department_id)}</span>
                                        </td>
                                        <td className="py-3 px-4 hidden lg:table-cell">
                                            <span className="text-sm text-gray-600">{pos.salary_grade || 'N/A'}</span>
                                        </td>
                                        <td className="py-3 px-4 hidden lg:table-cell">
                                            <span className="text-sm text-gray-600">
                                                {pos.min_salary ? `₱${Number(pos.min_salary).toLocaleString()}` : 'N/A'}
                                                {pos.max_salary ? ` - ₱${Number(pos.max_salary).toLocaleString()}` : ''}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(pos.status)}`}>
                                                {pos.status}
                                            </span>
                                        </td>
                                        {canManage() && (
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleEditPosition(pos)}
                                                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeletePosition(pos.position_id || pos.id, pos.title)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-sm text-gray-500">Showing {filtered.length} positions</div>
            </div>
        );
    };

    // ============================================
    // RENDER: FORM (Department)
    // ============================================
    if (showForm && activeTab === 'departments') {
        return (
            <Layout>
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button onClick={() => { resetForm(); }} className="p-2 hover:bg-gray-100 rounded-xl transition">
                            <FaTimes className="text-gray-600" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingId ? 'Edit Department' : 'Add New Department'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {editingId ? 'Update department information' : 'Create a new department'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleDepartmentSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                                <input
                                    type="text"
                                    value={formData.department_name}
                                    onChange={(e) => setFormData({...formData, department_name: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department Code *</label>
                                <input
                                    type="text"
                                    value={formData.department_code}
                                    onChange={(e) => setFormData({...formData, department_code: e.target.value.toUpperCase()})}
                                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                    placeholder="HR, IT, FIN"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department Head</label>
                                <select
                                    value={formData.head_employee_id || ''}
                                    onChange={(e) => setFormData({...formData, head_employee_id: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                >
                                    <option value="">Select Department Head</option>
                                    {employees.filter(e => e.status === 'active').map(emp => (
                                        <option key={emp.employee_id} value={emp.employee_id}>
                                            {emp.first_name} {emp.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Department</label>
                                <select
                                    value={formData.parent_department_id || ''}
                                    onChange={(e) => setFormData({...formData, parent_department_id: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                >
                                    <option value="">No Parent</option>
                                    {departments.filter(d => (d.department_id || d.id) !== editingId).map(dept => (
                                        <option key={dept.department_id || dept.id} value={dept.department_id || dept.id}>
                                            {dept.department_name || dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t-2 border-gray-200">
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
                                <FaSave /> {loading ? <><FaSpinner className="animate-spin" /> Saving...</> : (editingId ? 'Update' : 'Create')}
                            </button>
                            <button type="button" onClick={resetForm} className="px-6 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </Layout>
        );
    }

    // ============================================
    // RENDER: FORM (Position)
    // ============================================
    if (showForm && activeTab === 'positions') {
        return (
            <Layout>
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button onClick={() => { resetPositionForm(); }} className="p-2 hover:bg-gray-100 rounded-xl transition">
                            <FaTimes className="text-gray-600" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingId ? 'Edit Position' : 'Add New Position'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {editingId ? 'Update position information' : 'Create a new position'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handlePositionSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Position Title *</label>
                                <input
                                    type="text"
                                    value={positionForm.title}
                                    onChange={(e) => setPositionForm({...positionForm, title: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select
                                    value={positionForm.department_id || ''}
                                    onChange={(e) => setPositionForm({...positionForm, department_id: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                >
                                    <option value="">Select Department</option>
                                    {departments.filter(d => d.status === 'active').map(dept => (
                                        <option key={dept.department_id || dept.id} value={dept.department_id || dept.id}>
                                            {dept.department_name || dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={positionForm.description || ''}
                                    onChange={(e) => setPositionForm({...positionForm, description: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                    rows="2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Grade</label>
                                <input
                                    type="text"
                                    value={positionForm.salary_grade || ''}
                                    onChange={(e) => setPositionForm({...positionForm, salary_grade: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                    placeholder="Grade 8, Grade 9"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={positionForm.status}
                                    onChange={(e) => setPositionForm({...positionForm, status: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Salary</label>
                                <input
                                    type="number"
                                    value={positionForm.min_salary || ''}
                                    onChange={(e) => setPositionForm({...positionForm, min_salary: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                    placeholder="25000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Salary</label>
                                <input
                                    type="number"
                                    value={positionForm.max_salary || ''}
                                    onChange={(e) => setPositionForm({...positionForm, max_salary: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
                                    placeholder="45000"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t-2 border-gray-200">
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
                                <FaSave /> {loading ? <><FaSpinner className="animate-spin" /> Saving...</> : (editingId ? 'Update' : 'Create')}
                            </button>
                            <button type="button" onClick={resetPositionForm} className="px-6 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </Layout>
        );
    }

    // ============================================
    // MAIN RENDER
    // ============================================
    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaBuilding className="text-blue-600" /> Company Structure
                            </h1>
                            <p className="text-sm text-gray-500">Manage departments, positions, and organizational structure</p>
                        </div>
                        <button 
                            onClick={fetchAllData}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                        >
                            <FaSync /> Refresh All
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b-2 border-gray-200">
                    <button
                        onClick={() => { setActiveTab('departments'); setSearch(''); }}
                        className={`px-6 py-3 font-medium transition border-b-2 -mb-[2px] ${
                            activeTab === 'departments'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FaBuilding className="inline mr-2" /> Departments
                        <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {departments.length}
                        </span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('positions'); setSearch(''); }}
                        className={`px-6 py-3 font-medium transition border-b-2 -mb-[2px] ${
                            activeTab === 'positions'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FaBriefcase className="inline mr-2" /> Positions
                        <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {positions.length}
                        </span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('orgchart'); setSearch(''); }}
                        className={`px-6 py-3 font-medium transition border-b-2 -mb-[2px] ${
                            activeTab === 'orgchart'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FaSitemap className="inline mr-2" /> Org Chart
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'departments' && renderDepartments()}
                {activeTab === 'positions' && renderPositions()}
                {activeTab === 'orgchart' && renderOrgChart()}
            </div>
        </Layout>
    );
};

export default CompanyStructure;