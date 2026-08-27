// frontend/src/components/employees/EmployeeManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    FaSearch, FaPlus, FaEdit, FaTrash, FaEye, 
    FaUser, FaEnvelope, FaPhone, FaBuilding,
    FaFilter, FaDownload, FaUpload, FaArrowLeft,
    FaSave, FaTimes, FaBriefcase, FaCreditCard,
    FaFileAlt, FaCamera, FaUsers, FaSpinner,
    FaSync, FaUserPlus
} from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Layout from '../layout/Layout';

const EmployeeManager = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // ============================================
    // STATES
    // ============================================
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [department, setDepartment] = useState('');
    const [status, setStatus] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showProfile, setShowProfile] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [selectedDocFile, setSelectedDocFile] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', middle_name: '',
        birth_date: '', gender: 'male', civil_status: 'single',
        contact_number: '', email: '', address: '', city: '', province: '', zip_code: '',
        emergency_contact_name: '', emergency_contact_number: '',
        department_id: '', position_id: '', supervisor_id: '',
        employment_type: 'regular', date_hired: '', date_regularized: '',
        bank_name: '', bank_account_number: '', sss_number: '',
        philhealth_number: '', pagibig_number: '', tin_number: '',
        status: 'active'
    });

    // ============================================
    // GET IMAGE URL
    // ============================================
    const getImageUrl = (path) => {
        if (!path) return null;
        return `http://localhost/Lord%20help/backend/uploads/${path}`;
    };

    // ============================================
    // PERMISSION CHECKS
    // ============================================
    const canViewAllEmployees = () => {
        if (!user) return false;
        return ['super_admin', 'hr_manager', 'department_head'].includes(user.user_type);
    };

    const canEditEmployee = (employeeUserId = null) => {
        if (!user) return false;
        if (['super_admin', 'hr_manager'].includes(user.user_type)) {
            return true;
        }
        if (user.user_type === 'employee') {
            if (employeeUserId !== null) {
                return employeeUserId === user.id;
            }
            return true;
        }
        return false;
    };

    const canDeleteEmployee = () => {
        if (!user) return false;
        return ['super_admin'].includes(user.user_type);
    };

    const canAddEmployee = () => {
        if (!user) return false;
        return ['super_admin', 'hr_manager'].includes(user.user_type);
    };

    const canImportExport = () => {
        if (!user) return false;
        return ['super_admin', 'hr_manager', 'department_head'].includes(user.user_type);
    };

    // ============================================
    // CHECK USER
    // ============================================
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // ============================================
    // FETCH DATA
    // ============================================
    useEffect(() => {
        if (user) {
            fetchEmployees();
            fetchDepartments();
            fetchPositions();
        }
    }, [search, department, status]);

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/api/departments.php');
            if (response.data.status === 1) {
                setDepartments(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
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
        }
    };

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (department) params.append('department_id', department);
            if (status) params.append('status', status);
            
            const response = await api.get(`/api/employees.php?${params}`);
            if (response.data.status === 1) {
                let employeeData = response.data.data || [];
                
                // ✅ Employee: Sarili lang ang makikita
                if (user?.user_type === 'employee') {
                    const myEmployee = employeeData.filter(emp => emp.user_id === user.id);
                    setEmployees(myEmployee);
                } else {
                    // ✅ Admin/HR/Dept Head: Lahat ng employees
                    setEmployees(employeeData);
                }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const fetchDocuments = async (employeeId) => {
        try {
            const response = await api.get(`/api/employee-documents.php?employee_id=${employeeId}`);
            if (response.data.status === 1) {
                setDocuments(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    // ============================================
    // CRUD OPERATIONS
    // ============================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/api/employees.php?id=${editingId}`, formData);
                toast.success('Employee updated successfully');
            } else {
                await api.post('/api/employees.php', formData);
                toast.success('Employee created successfully');
            }
            resetForm();
            fetchEmployees();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(editingId ? 'Failed to update' : 'Failed to create');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!canDeleteEmployee()) {
            toast.error('You do not have permission to delete employees');
            return;
        }
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            await api.delete(`/api/employees.php?id=${id}`);
            toast.success('Employee deleted successfully');
            fetchEmployees();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete employee');
        }
    };

    const handleEdit = (employee) => {
        if (!canEditEmployee(employee.user_id)) {
            toast.error('You do not have permission to edit this employee');
            return;
        }
        setFormData(employee);
        setEditingId(employee.employee_id);
        setShowForm(true);
        setShowProfile(null);
    };

    const handleView = (employee) => {
        setShowProfile(employee);
        setShowForm(false);
        fetchDocuments(employee.employee_id);
    };

    const resetForm = () => {
        setFormData({
            first_name: '', last_name: '', middle_name: '',
            birth_date: '', gender: 'male', civil_status: 'single',
            contact_number: '', email: '', address: '', city: '', province: '', zip_code: '',
            emergency_contact_name: '', emergency_contact_number: '',
            department_id: '', position_id: '', supervisor_id: '',
            employment_type: 'regular', date_hired: '', date_regularized: '',
            bank_name: '', bank_account_number: '', sss_number: '',
            philhealth_number: '', pagibig_number: '', tin_number: '',
            status: 'active'
        });
        setEditingId(null);
        setShowForm(false);
        setShowProfile(null);
        setDocuments([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ============================================
    // PHOTO UPLOAD
    // ============================================
    const handlePhotoUpload = async (employeeId, file) => {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('employee_id', employeeId);
        formData.append('photo', file);

        try {
            const response = await api.post('/api/employee-photo.php', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            if (response.data.status === 1) {
                toast.success('Profile photo updated successfully!');
                await fetchEmployees();
                if (showProfile) {
                    setShowProfile({
                        ...showProfile, 
                        profile_photo: response.data.photo_url
                    });
                }
            } else {
                toast.error(response.data.message || 'Failed to upload photo');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload photo. Please try again.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    // ============================================
    // DOCUMENT UPLOAD
    // ============================================
    const handleUploadDocument = async (employeeId) => {
        if (!selectedDocFile) {
            toast.error('Please select a file');
            return;
        }
        setUploadingDoc(true);
        const formData = new FormData();
        formData.append('employee_id', employeeId);
        formData.append('document', selectedDocFile);

        try {
            const response = await api.post('/api/employee-documents.php', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            if (response.data.status === 1) {
                toast.success('Document uploaded successfully');
                fetchDocuments(employeeId);
                setSelectedDocFile(null);
                setShowDocumentModal(false);
            } else {
                toast.error(response.data.message || 'Failed to upload document');
            }
        } catch (error) {
            console.error('Document upload error:', error);
            toast.error('Failed to upload document');
        } finally {
            setUploadingDoc(false);
        }
    };

    const handleDeleteDocument = async (documentId) => {
        if (!window.confirm('Delete this document?')) return;
        try {
            await api.delete(`/api/employee-documents.php?id=${documentId}`);
            toast.success('Document deleted');
            if (showProfile) {
                fetchDocuments(showProfile.employee_id);
            }
        } catch (error) {
            console.error('Delete document error:', error);
            toast.error('Failed to delete document');
        }
    };

    // ============================================
    // IMPORT / EXPORT
    // ============================================
    const handleImport = async () => {
        if (!importFile) {
            toast.error('Please select a file');
            return;
        }
        setImporting(true);
        const formData = new FormData();
        formData.append('file', importFile);

        try {
            const response = await api.post('/api/import-employees.php', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            if (response.data.status === 1) {
                toast.success(`Imported ${response.data.imported_count || 0} employees`);
                fetchEmployees();
                setShowImportModal(false);
                setImportFile(null);
            } else {
                toast.error(response.data.message || 'Failed to import');
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Failed to import');
        } finally {
            setImporting(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/api/export-employees.php', {
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'employees_' + new Date().toISOString().slice(0,10) + '.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Export successful');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export');
        }
    };

    // ============================================
    // HELPERS
    // ============================================
    const getStatusBadge = (status) => {
        const badges = {
            active: 'bg-green-100 text-green-700 border-green-200',
            inactive: 'bg-gray-100 text-gray-700 border-gray-200',
            resigned: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            terminated: 'bg-red-100 text-red-700 border-red-200',
            on_leave: 'bg-blue-100 text-blue-700 border-blue-200',
        };
        return badges[status] || badges.active;
    };

    const getInitials = (first, last) => {
        return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
    };

    const getEmploymentTypeLabel = (type) => {
        const labels = {
            regular: 'Regular',
            probationary: 'Probationary',
            contractual: 'Contractual',
            'project-based': 'Project-Based',
            intern: 'Intern',
            freelance: 'Freelance',
            part_time: 'Part Time'
        };
        return labels[type] || type || 'N/A';
    };

    const getDepartmentName = (id) => {
        const dept = departments.find(d => d.department_id === id || d.id === id);
        return dept ? dept.name || dept.department_name : 'N/A';
    };

    const getPositionName = (id) => {
        const pos = positions.find(p => p.position_id === id || p.id === id);
        return pos ? pos.title || pos.position_title : 'N/A';
    };

    // ============================================
    // RENDER: PROFILE VIEW
    // ============================================
    if (showProfile) {
        const emp = showProfile;
        return (
            <Layout>
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-xl transition">
                            <FaArrowLeft className="text-gray-600" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Employee Profile</h2>
                            <p className="text-sm text-gray-500">{emp.employee_number}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Avatar */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-gray-200">
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 rounded-full bg-blue-100 mx-auto flex items-center justify-center text-blue-600 text-3xl font-bold overflow-hidden border-4 border-white shadow-lg">
                                        {emp.profile_photo ? (
                                            <img 
                                                src={getImageUrl(emp.profile_photo)} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.textContent = getInitials(emp.first_name, emp.last_name);
                                                }}
                                            />
                                        ) : (
                                            getInitials(emp.first_name, emp.last_name)
                                        )}
                                    </div>
                                    {canEditEmployee(emp.user_id) && (
                                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition text-xs shadow-lg">
                                            {uploadingPhoto ? <FaSpinner className="animate-spin" /> : <FaCamera />}
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={(e) => {
                                                    if (e.target.files[0]) {
                                                        handlePhotoUpload(emp.employee_id, e.target.files[0]);
                                                    }
                                                }} 
                                                disabled={uploadingPhoto}
                                            />
                                        </label>
                                    )}
                                </div>
                                {uploadingPhoto && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
                                
                                <h3 className="text-lg font-bold text-gray-800 mt-3">{emp.first_name} {emp.last_name}</h3>
                                <p className="text-sm text-gray-500">{emp.employee_number}</p>
                                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(emp.status)}`}>
                                    {emp.status || 'Active'}
                                </span>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    {canEditEmployee(emp.user_id) && (
                                        <button onClick={() => handleEdit(emp)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                                            <FaEdit className="inline mr-2" /> Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Details */}
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FaUser className="text-blue-600" /> Personal
                                    </h4>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Birth Date:</span>
                                        <span className="font-medium">{emp.birth_date || 'N/A'}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Gender:</span>
                                        <span className="font-medium capitalize">{emp.gender || 'N/A'}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Civil Status:</span>
                                        <span className="font-medium capitalize">{emp.civil_status || 'N/A'}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Nationality:</span>
                                        <span className="font-medium">{emp.nationality || 'N/A'}</span>
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FaEnvelope className="text-blue-600" /> Contact
                                    </h4>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Email:</span>
                                        <span className="font-medium">{emp.email || 'N/A'}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Phone:</span>
                                        <span className="font-medium">{emp.contact_number || 'N/A'}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Address:</span>
                                        <span className="font-medium">{emp.address || 'N/A'}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Emergency:</span>
                                        <span className="font-medium">{emp.emergency_contact_name || 'N/A'}</span>
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FaBuilding className="text-blue-600" /> Job
                                    </h4>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Department:</span>
                                        <span className="font-medium">{getDepartmentName(emp.department_id)}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Position:</span>
                                        <span className="font-medium">{getPositionName(emp.position_id)}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Type:</span>
                                        <span className="font-medium">{getEmploymentTypeLabel(emp.employment_type)}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Hired:</span>
                                        <span className="font-medium">{emp.date_hired || 'N/A'}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Salary:</span>
                                        <span className="font-medium">₱{emp.salary ? Number(emp.salary).toLocaleString() : 'N/A'}</span>
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FaCreditCard className="text-blue-600" /> Banking & Government
                                    </h4>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Bank:</span>
                                        <span className="font-medium">{emp.bank_name || 'N/A'}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Account:</span>
                                        <span className="font-medium">{emp.bank_account_number || 'N/A'}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">SSS:</span>
                                        <span className="font-medium">{emp.sss_number || 'N/A'}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">PhilHealth:</span>
                                        <span className="font-medium">{emp.philhealth_number || 'N/A'}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">Pag-IBIG:</span>
                                        <span className="font-medium">{emp.pagibig_number || 'N/A'}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                        <span className="text-gray-500">TIN:</span>
                                        <span className="font-medium">{emp.tin_number || 'N/A'}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="mt-4 bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                        <FaFileAlt className="text-blue-600" /> Documents
                                    </h4>
                                    <button 
                                        onClick={() => setShowDocumentModal(true)}
                                        className="text-sm text-blue-600 hover:underline font-medium"
                                    >
                                        + Upload
                                    </button>
                                </div>
                                {documents.length === 0 ? (
                                    <p className="text-sm text-gray-500">No documents uploaded</p>
                                ) : (
                                    <div className="space-y-2">
                                        {documents.map((doc) => (
                                            <div key={doc.document_id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <FaFileAlt className="text-gray-400" />
                                                    <span className="text-sm text-gray-700">{doc.document_name}</span>
                                                    <span className="text-xs text-gray-400">({(doc.file_size / 1024).toFixed(1)} KB)</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <a href={getImageUrl(doc.file_path)} download className="text-blue-600 hover:underline text-sm">Download</a>
                                                    <button onClick={() => handleDeleteDocument(doc.document_id)} className="text-red-600 hover:underline text-sm">Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Document Upload Modal */}
                    {showDocumentModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Upload Document</h3>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-4">
                                    <FaFileAlt className="text-4xl text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Select a file to upload</p>
                                    <input type="file" className="hidden" id="docFile"
                                        onChange={(e) => setSelectedDocFile(e.target.files[0])}
                                    />
                                    <label htmlFor="docFile" className="block mt-2 text-blue-600 hover:underline cursor-pointer text-sm">
                                        Choose File
                                    </label>
                                    {selectedDocFile && (
                                        <p className="mt-2 text-sm text-gray-700">{selectedDocFile.name}</p>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => handleUploadDocument(showProfile?.employee_id)} disabled={uploadingDoc}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                                        {uploadingDoc ? <><FaSpinner className="animate-spin inline mr-2" /> Uploading...</> : 'Upload'}
                                    </button>
                                    <button onClick={() => { setShowDocumentModal(false); setSelectedDocFile(null); }}
                                        className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Layout>
        );
    }

    // ============================================
    // RENDER: FORM
    // ============================================
    if (showForm) {
        return (
            <Layout>
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-xl transition">
                            <FaArrowLeft className="text-gray-600" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingId ? 'Edit Employee' : 'Add New Employee'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {editingId ? 'Update employee information' : 'Create a new employee profile'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Personal Information */}
                            <div className="md:col-span-3">
                                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <FaUser className="text-blue-600" /> Personal Information
                                </h3>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                                <input type="text" name="middle_name" value={formData.middle_name || ''} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                                <input type="date" name="birth_date" value={formData.birth_date || ''} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition">
                                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Civil Status</label>
                                <select name="civil_status" value={formData.civil_status} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition">
                                    <option value="single">Single</option><option value="married">Married</option>
                                    <option value="divorced">Divorced</option><option value="widowed">Widowed</option>
                                </select>
                            </div>

                            {/* Contact Details */}
                            <div className="md:col-span-3 mt-4">
                                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <FaEnvelope className="text-blue-600" /> Contact Details
                                </h3>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" value={formData.email || ''} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                <input type="text" name="contact_number" value={formData.contact_number || ''} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input type="text" name="address" value={formData.address || ''} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                                <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name || ''} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Number</label>
                                <input type="text" name="emergency_contact_number" value={formData.emergency_contact_number || ''} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" />
                            </div>

                            {/* Job Details */}
                            <div className="md:col-span-3 mt-4">
                                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <FaBriefcase className="text-blue-600" /> Job Details
                                </h3>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                                <select name="employment_type" value={formData.employment_type} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition">
                                    <option value="regular">Regular</option><option value="probationary">Probationary</option>
                                    <option value="contractual">Contractual</option><option value="project-based">Project-Based</option>
                                    <option value="intern">Intern</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date Hired</label>
                                <input type="date" name="date_hired" value={formData.date_hired || ''} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition">
                                    <option value="active">Active</option><option value="inactive">Inactive</option>
                                    <option value="resigned">Resigned</option><option value="terminated">Terminated</option>
                                </select>
                            </div>

                            {/* Bank Details */}
                            <div className="md:col-span-3 mt-4">
                                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <FaCreditCard className="text-blue-600" /> Bank & Government Details
                                </h3>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input type="text" name="bank_name" value={formData.bank_name || ''} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
                                <input type="text" name="bank_account_number" value={formData.bank_account_number || ''} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SSS Number</label>
                                <input type="text" name="sss_number" value={formData.sss_number || ''} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">PhilHealth Number</label>
                                <input type="text" name="philhealth_number" value={formData.philhealth_number || ''} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pag-IBIG Number</label>
                                <input type="text" name="pagibig_number" value={formData.pagibig_number || ''} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">TIN Number</label>
                                <input type="text" name="tin_number" value={formData.tin_number || ''} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t-2 border-gray-200">
                            <button type="submit" disabled={loading}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50">
                                <FaSave /> {loading ? <><FaSpinner className="animate-spin" /> Saving...</> : (editingId ? 'Update' : 'Create')}
                            </button>
                            <button type="button" onClick={resetForm}
                                className="px-6 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center gap-2">
                                <FaTimes /> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </Layout>
        );
    }

    // ============================================
    // RENDER: EMPLOYEE LIST
    // ============================================
    return (
        <Layout>
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FaUsers className="text-blue-600" /> 
                            {user?.user_type === 'employee' ? 'My Profile' : 'Employee Directory'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {user?.user_type === 'employee' 
                                ? 'View and manage your profile' 
                                : `Manage ${employees.length} employees in the system`}
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {canImportExport() && (
                            <>
                                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">
                                    <FaDownload className="text-gray-500" /> Export
                                </button>
                                <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">
                                    <FaUpload className="text-gray-500" /> Import
                                </button>
                            </>
                        )}
                        
                        {canAddEmployee() && (
                            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                                <FaPlus /> Add Employee
                            </button>
                        )}
                        
                        <button onClick={fetchEmployees} className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">
                            <FaSync className="text-gray-500" /> Refresh
                        </button>
                    </div>
                </div>

                {/* Search & Filters */}
                {canViewAllEmployees() && (
                    <>
                        <div className="flex flex-col md:flex-row gap-3 mb-6">
                            <div className="flex-1 relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name, email or employee ID..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition" />
                            </div>
                            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">
                                <FaFilter className="text-gray-500" /> Filters
                            </button>
                        </div>

                        {showFilters && (
                            <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                                <select value={department} onChange={(e) => setDepartment(e.target.value)}
                                    className="px-4 py-2 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 text-sm">
                                    <option value="">All Departments</option>
                                    {departments.map(dept => (
                                        <option key={dept.department_id || dept.id} value={dept.department_id || dept.id}>
                                            {dept.name || dept.department_name}
                                        </option>
                                    ))}
                                </select>
                                <select value={status} onChange={(e) => setStatus(e.target.value)}
                                    className="px-4 py-2 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 text-sm">
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="resigned">Resigned</option>
                                    <option value="terminated">Terminated</option>
                                </select>
                                <button onClick={() => { setDepartment(''); setStatus(''); }}
                                    className="text-sm text-gray-500 hover:text-blue-600 font-medium">Clear Filters</button>
                            </div>
                        )}
                    </>
                )}

                {/* Employee Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-500">Loading employees...</p>
                    </div>
                ) : employees.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-2">
                            {user?.user_type === 'employee' ? '👤' : '👥'}
                        </div>
                        <p className="text-lg font-semibold text-gray-700">
                            {user?.user_type === 'employee' ? 'No profile found' : 'No employees found'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {user?.user_type === 'employee' 
                                ? 'Your employee profile has not been set up yet. Please contact HR.' 
                                : 'Add your first employee to get started.'}
                        </p>
                        {canAddEmployee() && (
                            <button 
                                onClick={() => setShowForm(true)} 
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                            >
                                <FaPlus className="inline mr-2" /> Add Employee
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Contact</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Department</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp) => (
                                    <tr key={emp.employee_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden">
                                                    {emp.profile_photo ? (
                                                        <img 
                                                            src={getImageUrl(emp.profile_photo)} 
                                                            alt="Profile" 
                                                            className="w-full h-full rounded-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.parentElement.textContent = getInitials(emp.first_name, emp.last_name);
                                                            }}
                                                        />
                                                    ) : (
                                                        getInitials(emp.first_name, emp.last_name)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{emp.first_name} {emp.last_name}</p>
                                                    <p className="text-xs text-gray-500">{emp.employee_number}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 hidden md:table-cell">
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <FaEnvelope className="text-gray-400 text-xs" /> {emp.email || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                                <FaPhone className="text-gray-400 text-xs" /> {emp.contact_number || 'N/A'}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4 hidden lg:table-cell">
                                            <p className="text-sm text-gray-600 font-medium">
                                                {getDepartmentName(emp.department_id)}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {getEmploymentTypeLabel(emp.employment_type)}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(emp.status)}`}>
                                                {emp.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleView(emp)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                                                    <FaEye />
                                                </button>
                                                
                                                {canEditEmployee(emp.user_id) && (
                                                    <button onClick={() => handleEdit(emp)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition" title="Edit">
                                                        <FaEdit />
                                                    </button>
                                                )}
                                                
                                                {canDeleteEmployee() && (
                                                    <button onClick={() => handleDelete(emp.employee_id, `${emp.first_name} ${emp.last_name}`)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
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
                    <span>Showing {employees.length} employee{employees.length !== 1 ? 's' : ''}</span>
                    {employees.length > 0 && (
                        <span className="text-xs text-gray-400">
                            Active: {employees.filter(e => e.status === 'active').length} | 
                            Total: {employees.length}
                        </span>
                    )}
                </div>

                {/* Import Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Import Employees</h3>
                            <p className="text-sm text-gray-500 mb-4">Upload CSV or Excel file</p>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-4">
                                <FaUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Drop your file here or click to browse</p>
                                <input type="file" accept=".csv,.xlsx,.xls" className="hidden" id="importFileInput"
                                    onChange={(e) => setImportFile(e.target.files[0])}
                                />
                                <label htmlFor="importFileInput" className="block mt-2 text-blue-600 hover:underline cursor-pointer text-sm">
                                    Choose File
                                </label>
                                {importFile && (
                                    <p className="mt-2 text-sm text-gray-700">{importFile.name}</p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={handleImport} disabled={importing}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                                    {importing ? <><FaSpinner className="animate-spin inline mr-2" /> Importing...</> : 'Import'}
                                </button>
                                <button onClick={() => { setShowImportModal(false); setImportFile(null); }}
                                    className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default EmployeeManager;