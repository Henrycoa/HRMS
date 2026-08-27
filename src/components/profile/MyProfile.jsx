// frontend/src/components/profile/MyProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import { 
    FaUser, FaEnvelope, FaPhone, FaMapMarker, 
    FaCamera, FaSpinner, FaSave, FaTimes, FaEdit,
    FaCreditCard, FaBuilding, FaBriefcase, FaCalendar,
    FaVenusMars, FaHeart, FaGlobe, FaPhoneAlt,
    FaCheckCircle, FaSync
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import API from '../../config';

const MyProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [employee, setEmployee] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        birth_date: '',
        gender: 'male',
        civil_status: 'single',
        nationality: '',
        contact_number: '',
        email: '',
        address: '',
        city: '',
        province: '',
        zip_code: '',
        emergency_contact_name: '',
        emergency_contact_number: '',
        department_id: '',
        position_id: '',
        employment_type: 'regular',
        date_hired: '',
        bank_name: '',
        bank_account_number: '',
        sss_number: '',
        philhealth_number: '',
        pagibig_number: '',
        tin_number: ''
    });

    // ============================================
    // FETCH DATA
    // ============================================
    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchDepartments();
            fetchPositions();
        }
    }, [user]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get(API.EMPLOYEES);
            if (res.data.status === 1) {
                const employees = res.data.data || [];
                let myEmployee = employees.find(emp => emp.user_id === user.id);
                
                if (!myEmployee) {
                    myEmployee = employees.find(emp => String(emp.user_id) === String(user.id));
                }
                
                if (myEmployee) {
                    setEmployee(myEmployee);
                    setFormData({
                        first_name: myEmployee.first_name || '',
                        last_name: myEmployee.last_name || '',
                        middle_name: myEmployee.middle_name || '',
                        birth_date: myEmployee.birth_date || '',
                        gender: myEmployee.gender || 'male',
                        civil_status: myEmployee.civil_status || 'single',
                        nationality: myEmployee.nationality || '',
                        contact_number: myEmployee.contact_number || '',
                        email: myEmployee.email || user?.email || '',
                        address: myEmployee.address || '',
                        city: myEmployee.city || '',
                        province: myEmployee.province || '',
                        zip_code: myEmployee.zip_code || '',
                        emergency_contact_name: myEmployee.emergency_contact_name || '',
                        emergency_contact_number: myEmployee.emergency_contact_number || '',
                        department_id: myEmployee.department_id || '',
                        position_id: myEmployee.position_id || '',
                        employment_type: myEmployee.employment_type || 'regular',
                        date_hired: myEmployee.date_hired || '',
                        bank_name: myEmployee.bank_name || '',
                        bank_account_number: myEmployee.bank_account_number || '',
                        sss_number: myEmployee.sss_number || '',
                        philhealth_number: myEmployee.philhealth_number || '',
                        pagibig_number: myEmployee.pagibig_number || '',
                        tin_number: myEmployee.tin_number || ''
                    });
                } else {
                    toast.error('No employee profile found. Please contact HR.');
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        }
        setLoading(false);
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get(API.DEPARTMENTS);
            if (res.data.status === 1) {
                setDepartments(res.data.data || []);
            }
        } catch (error) { console.error(error); }
    };

    const fetchPositions = async () => {
        try {
            const res = await api.get(API.POSITIONS);
            if (res.data.status === 1) {
                setPositions(res.data.data || []);
            }
        } catch (error) { console.error(error); }
    };

    // ============================================
    // PHOTO UPLOAD
    // ============================================
    const handlePhotoUpload = async (file) => {
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
        formData.append('employee_id', employee?.employee_id);
        formData.append('photo', file);

        try {
            const res = await api.post(API.EMPLOYEE_PHOTO, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            if (res.data.status === 1) {
                toast.success('Profile photo updated!');
                fetchProfile();
            } else {
                toast.error(res.data.message || 'Failed to upload photo');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    // ============================================
    // UPDATE PROFILE
    // ============================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = API.EMPLOYEE_UPDATE(employee?.employee_id);
            const res = await api.put(url, formData);
            if (res.data.status === 1) {
                toast.success('Profile updated successfully!');
                setIsEditing(false);
                fetchProfile();
            } else {
                toast.error(res.data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update profile');
        }
        setSaving(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ============================================
    // HELPERS
    // ============================================
    const getInitials = (first, last) => {
        return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        return `http://localhost/Lord%20help/backend/${path}`;
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: 'bg-green-100 text-green-700 border-green-200',
            inactive: 'bg-gray-100 text-gray-700 border-gray-200',
            resigned: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            terminated: 'bg-red-100 text-red-700 border-red-200',
            on_leave: 'bg-blue-100 text-blue-700 border-blue-200'
        };
        return badges[status] || badges.active;
    };

    const getDepartmentName = (id) => {
        const dept = departments.find(d => d.department_id === id || d.id === id);
        return dept ? dept.name || dept.department_name : 'N/A';
    };

    const getPositionName = (id) => {
        const pos = positions.find(p => p.position_id === id || p.id === id);
        return pos ? pos.title || pos.position_title : 'N/A';
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

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                        <p className="text-gray-500">Loading profile...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!employee) {
        return (
            <Layout>
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">👤</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">No Profile Found</h2>
                        <p className="text-gray-500">Your employee profile has not been set up yet.</p>
                        <p className="text-sm text-gray-400 mt-2">Please contact HR to create your profile.</p>
                        
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-left text-xs text-gray-400 max-w-md mx-auto">
                            <p><strong>Debug Info:</strong></p>
                            <p>User ID: {user?.id}</p>
                            <p>Username: {user?.username}</p>
                            <p>User Type: {user?.user_type}</p>
                            <p>API Endpoint: {API.EMPLOYEES}</p>
                        </div>
                        
                        <button 
                            onClick={fetchProfile}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
                        >
                            <FaSync /> Refresh
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // ============================================
    // RENDER PROFILE
    // ============================================
    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaUser className="text-blue-600" /> My Profile
                            </h1>
                            <p className="text-sm text-gray-500">View and manage your personal information</p>
                        </div>
                        <div className="flex gap-2">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                                >
                                    <FaEdit /> Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        <FaSave /> {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => { setIsEditing(false); fetchProfile(); }}
                                        className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                                    >
                                        <FaTimes /> Cancel
                                    </button>
                                </>
                            )}
                            <button
                                onClick={fetchProfile}
                                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                            >
                                <FaSync /> Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT COLUMN - AVATAR & BASIC INFO */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-gray-200">
                                {/* Avatar with Upload */}
                                <div className="relative inline-block group">
                                    <div className="w-32 h-32 rounded-full bg-blue-100 mx-auto flex items-center justify-center text-blue-600 text-5xl font-bold overflow-hidden border-4 border-white shadow-lg">
                                        {employee?.profile_photo ? (
                                            <img 
                                                src={getImageUrl(employee.profile_photo)} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.textContent = getInitials(employee.first_name, employee.last_name);
                                                }}
                                            />
                                        ) : (
                                            getInitials(employee.first_name, employee.last_name)
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition text-xs shadow-lg">
                                        {uploadingPhoto ? <FaSpinner className="animate-spin" /> : <FaCamera />}
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    handlePhotoUpload(e.target.files[0]);
                                                }
                                            }} 
                                            disabled={uploadingPhoto}
                                        />
                                    </label>
                                </div>
                                {uploadingPhoto && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}

                                <h3 className="text-xl font-bold text-gray-800 mt-4">
                                    {employee.first_name} {employee.last_name}
                                </h3>
                                <p className="text-sm text-gray-500">{employee.employee_number}</p>
                                
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(employee.status)}`}>
                                        {employee.status || 'Active'}
                                    </span>
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                        {getEmploymentTypeLabel(employee.employment_type)}
                                    </span>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200 text-left">
                                    <p className="text-xs text-gray-400 flex justify-between">
                                        <span>Employee ID:</span>
                                        <span className="font-medium text-gray-600">{employee.employee_number}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 flex justify-between">
                                        <span>Department:</span>
                                        <span className="font-medium text-gray-600">{getDepartmentName(employee.department_id)}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 flex justify-between">
                                        <span>Position:</span>
                                        <span className="font-medium text-gray-600">{getPositionName(employee.position_id)}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 flex justify-between">
                                        <span>Date Hired:</span>
                                        <span className="font-medium text-gray-600">{formatDate(employee.date_hired)}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN - DETAILS */}
                        <div className="lg:col-span-2">
                            {!isEditing ? (
                                /* VIEW MODE */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <FaUser className="text-blue-600" /> Personal
                                        </h4>
                                        <div className="space-y-1 text-sm">
                                            <p className="flex justify-between"><span className="text-gray-500">Full Name:</span> <span className="font-medium">{employee.first_name} {employee.middle_name} {employee.last_name}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">Birth Date:</span> <span className="font-medium">{formatDate(employee.birth_date)}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">Gender:</span> <span className="font-medium capitalize">{employee.gender || 'N/A'}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">Civil Status:</span> <span className="font-medium capitalize">{employee.civil_status || 'N/A'}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">Nationality:</span> <span className="font-medium">{employee.nationality || 'N/A'}</span></p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <FaEnvelope className="text-blue-600" /> Contact
                                        </h4>
                                        <div className="space-y-1 text-sm">
                                            <p className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium">{employee.email || 'N/A'}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-medium">{employee.contact_number || 'N/A'}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">Address:</span> <span className="font-medium">{employee.address || 'N/A'}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">Emergency Contact:</span> <span className="font-medium">{employee.emergency_contact_name || 'N/A'}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">Emergency Phone:</span> <span className="font-medium">{employee.emergency_contact_number || 'N/A'}</span></p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <FaBriefcase className="text-blue-600" /> Job
                                        </h4>
                                        <div className="space-y-1 text-sm">
                                            <p className="flex justify-between"><span className="text-gray-500">Department:</span> <span className="font-medium">{getDepartmentName(employee.department_id)}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">Position:</span> <span className="font-medium">{getPositionName(employee.position_id)}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">Employment Type:</span> <span className="font-medium">{getEmploymentTypeLabel(employee.employment_type)}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">Date Hired:</span> <span className="font-medium">{formatDate(employee.date_hired)}</span></p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <FaCreditCard className="text-blue-600" /> Banking & Government
                                        </h4>
                                        <div className="space-y-1 text-sm">
                                            <p className="flex justify-between"><span className="text-gray-500">Bank:</span> <span className="font-medium">{employee.bank_name || 'N/A'}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">Account Number:</span> <span className="font-medium">{employee.bank_account_number || 'N/A'}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">SSS Number:</span> <span className="font-medium">{employee.sss_number || 'N/A'}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">PhilHealth:</span> <span className="font-medium">{employee.philhealth_number || 'N/A'}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">Pag-IBIG:</span> <span className="font-medium">{employee.pagibig_number || 'N/A'}</span></p>
                                            <p className="flex justify-between"><span className="text-gray-500">TIN:</span> <span className="font-medium">{employee.tin_number || 'N/A'}</span></p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* EDIT MODE */
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <FaUser className="text-blue-600" /> Personal Information
                                            </h4>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                                            <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                                            <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500">
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Civil Status</label>
                                            <select name="civil_status" value={formData.civil_status} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500">
                                                <option value="single">Single</option>
                                                <option value="married">Married</option>
                                                <option value="divorced">Divorced</option>
                                                <option value="widowed">Widowed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                                            <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>

                                        <div className="md:col-span-2 mt-4">
                                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <FaEnvelope className="text-blue-600" /> Contact Details
                                            </h4>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                                            <input type="text" name="province" value={formData.province} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                                            <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>

                                        <div className="md:col-span-2 mt-4">
                                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <FaPhoneAlt className="text-blue-600" /> Emergency Contact
                                            </h4>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                                            <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Number</label>
                                            <input type="text" name="emergency_contact_number" value={formData.emergency_contact_number} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>

                                        <div className="md:col-span-2 mt-4">
                                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <FaCreditCard className="text-blue-600" /> Banking & Government
                                            </h4>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                            <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
                                            <input type="text" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">SSS Number</label>
                                            <input type="text" name="sss_number" value={formData.sss_number} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">PhilHealth Number</label>
                                            <input type="text" name="philhealth_number" value={formData.philhealth_number} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pag-IBIG Number</label>
                                            <input type="text" name="pagibig_number" value={formData.pagibig_number} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">TIN Number</label>
                                            <input type="text" name="tin_number" value={formData.tin_number} onChange={handleChange} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" />
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MyProfile;