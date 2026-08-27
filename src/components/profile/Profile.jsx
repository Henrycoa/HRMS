// frontend/src/components/profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../layout/Layout';
import api from '../../services/api';
import API, { API_BASE_URL } from '../../config';
import toast from 'react-hot-toast';
import { 
    FaUser, FaEnvelope, FaBuilding, FaCalendar, 
    FaUserTag, FaPhone, FaMapMarkerAlt, FaBriefcase,
    FaCreditCard, FaIdCard, FaCamera, FaSpinner,
    FaVenusMars, FaHeart, FaFileAlt, FaHome,
    FaSync, FaEdit
} from 'react-icons/fa';

const Profile = () => {
    const { user } = useAuth();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [error, setError] = useState(null);

    // ============================================
    // FETCH DATA
    // ============================================
    useEffect(() => {
        if (user) {
            console.log('Current user:', user); // 👈 Debug log
            fetchEmployeeProfile();
            fetchDepartments();
            fetchPositions();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchDepartments = async () => {
        try {
            const response = await api.get(API.DEPARTMENTS);
            if (response.data.status === 1) {
                setDepartments(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await api.get(API.POSITIONS);
            if (response.data.status === 1) {
                setPositions(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching positions:', error);
        }
    };

    const fetchEmployeeProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching employees from:', API.EMPLOYEES); // 👈 Debug log
            
            const response = await api.get(API.EMPLOYEES);
            console.log('Employees API Response:', response.data); // 👈 Debug log
            
            if (response.data.status === 1) {
                const employees = response.data.data || [];
                console.log('All employees:', employees); // 👈 Debug log
                console.log('Looking for user_id:', user.id); // 👈 Debug log
                
                // Try to find employee with matching user_id
                let myEmployee = employees.find(emp => emp.user_id === user.id);
                
                // If not found, try to find by user_id as string
                if (!myEmployee) {
                    myEmployee = employees.find(emp => String(emp.user_id) === String(user.id));
                }
                
                console.log('Found employee:', myEmployee); // 👈 Debug log
                setEmployee(myEmployee || null);
                
                if (!myEmployee) {
                    setError('No employee profile found. Please contact HR.');
                }
            } else {
                setError(response.data.message || 'Failed to load employee data');
                console.error('API error:', response.data);
            }
        } catch (error) {
            console.error('Error fetching employee profile:', error);
            setError('Failed to load profile. Please try again.');
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // PHOTO UPLOAD
    // ============================================
    const handlePhotoUpload = async (file) => {
        if (!file || !employee) {
            toast.error('Please select an image file');
            return;
        }
        
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
        formData.append('employee_id', employee.employee_id);
        formData.append('photo', file);

        try {
            const response = await api.post(API.EMPLOYEE_PHOTO, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            console.log('Photo upload response:', response.data); // 👈 Debug log
            
            if (response.data.status === 1) {
                toast.success('Profile photo updated!');
                fetchEmployeeProfile();
            } else {
                toast.error(response.data.message || 'Failed to upload photo');
            }
        } catch (error) {
            console.error('Photo upload error:', error);
            toast.error('Failed to upload photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    // ============================================
    // HELPERS
    // ============================================
    const getInitials = (first, last) => {
        return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
    };

    const getRoleLabel = () => {
        const labels = {
            super_admin: 'Super Admin',
            hr_manager: 'HR Manager',
            department_head: 'Department Head',
            employee: 'Employee',
        };
        return labels[user?.user_type] || user?.user_type || 'User';
    };

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

    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return date;
        }
    };

    // ============================================
    // RELOAD PROFILE
    // ============================================
    const handleRefresh = () => {
        fetchEmployeeProfile();
        toast.success('Refreshing profile...');
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

    // ============================================
    // ERROR STATE - If no employee found
    // ============================================
    if (error || !employee) {
        return (
            <Layout>
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">👤</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">No Profile Found</h2>
                        <p className="text-gray-500 mb-4">
                            {error || 'No employee profile linked to your account.'}
                        </p>
                        <p className="text-sm text-gray-400 mb-6">
                            Please contact HR to set up your employee profile.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={handleRefresh}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                            >
                                <FaSync /> Refresh
                            </button>
                        </div>
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl text-left text-xs text-gray-400">
                            <p><strong>Debug Info:</strong></p>
                            <p>User ID: {user?.id}</p>
                            <p>Username: {user?.username}</p>
                            <p>User Type: {user?.user_type}</p>
                            <p>API Endpoint: {API.EMPLOYEES}</p>
                        </div>
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
                            <button 
                                onClick={handleRefresh}
                                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm"
                            >
                                <FaSync /> Refresh
                            </button>
                            <button 
                                onClick={() => toast.info('Edit profile feature coming soon!')}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm"
                            >
                                <FaEdit /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* ============================================
                            LEFT COLUMN - AVATAR & BASIC INFO
                        ============================================ */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-gray-200">
                                {/* Avatar with Upload */}
                                <div className="relative inline-block group">
                                    <div className="w-32 h-32 rounded-full bg-blue-100 mx-auto flex items-center justify-center text-blue-600 text-5xl font-bold overflow-hidden border-4 border-white shadow-lg">
                                        {employee?.profile_photo ? (
                                            <img 
                                                src={`${API_BASE_URL}/uploads/${employee.profile_photo}`} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            getInitials(employee?.first_name || user?.first_name, employee?.last_name || user?.last_name)
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition text-xs shadow-lg">
                                        {uploadingPhoto ? (
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            <FaCamera />
                                        )}
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
                                {uploadingPhoto && <p className="text-xs text-gray-500 mt-2">Uploading...</p>}

                                <h3 className="text-xl font-bold text-gray-800 mt-4">
                                    {employee?.first_name || user?.first_name} {employee?.last_name || user?.last_name}
                                </h3>
                                <p className="text-sm text-gray-500">{employee?.employee_number || 'No Employee ID'}</p>
                                
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(employee?.status)}`}>
                                        {employee?.status || 'N/A'}
                                    </span>
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                        {getRoleLabel()}
                                    </span>
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                        {getEmploymentTypeLabel(employee?.employment_type)}
                                    </span>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200 text-left">
                                    <p className="text-xs text-gray-400 flex justify-between">
                                        <span>Employee ID:</span>
                                        <span className="font-medium text-gray-600">{employee?.employee_number || 'N/A'}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 flex justify-between">
                                        <span>User ID:</span>
                                        <span className="font-medium text-gray-600">#{user?.id}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 flex justify-between">
                                        <span>Username:</span>
                                        <span className="font-medium text-gray-600">{user?.username || 'N/A'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ============================================
                            RIGHT COLUMN - DETAILS
                        ============================================ */}
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Personal Information */}
                                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FaUser className="text-blue-600" /> Personal
                                    </h4>
                                    <div className="space-y-1">
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Full Name:</span>
                                            <span className="font-medium">{employee?.first_name} {employee?.last_name}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Birth Date:</span>
                                            <span className="font-medium">{formatDate(employee?.birth_date)}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Gender:</span>
                                            <span className="font-medium capitalize">{employee?.gender || 'N/A'}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Civil Status:</span>
                                            <span className="font-medium capitalize">{employee?.civil_status || 'N/A'}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Nationality:</span>
                                            <span className="font-medium">{employee?.nationality || 'N/A'}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FaEnvelope className="text-blue-600" /> Contact
                                    </h4>
                                    <div className="space-y-1">
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Email:</span>
                                            <span className="font-medium">{employee?.email || user?.email || 'N/A'}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Phone:</span>
                                            <span className="font-medium">{employee?.contact_number || 'N/A'}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Address:</span>
                                            <span className="font-medium">{employee?.address || 'N/A'}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Emergency Contact:</span>
                                            <span className="font-medium">{employee?.emergency_contact_name || 'N/A'}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Emergency Phone:</span>
                                            <span className="font-medium">{employee?.emergency_contact_number || 'N/A'}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Job Details */}
                                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FaBriefcase className="text-blue-600" /> Job
                                    </h4>
                                    <div className="space-y-1">
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Department:</span>
                                            <span className="font-medium">{getDepartmentName(employee?.department_id)}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Position:</span>
                                            <span className="font-medium">{getPositionName(employee?.position_id)}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Employment Type:</span>
                                            <span className="font-medium">{getEmploymentTypeLabel(employee?.employment_type)}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Date Hired:</span>
                                            <span className="font-medium">{formatDate(employee?.date_hired)}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Salary:</span>
                                            <span className="font-medium">₱{employee?.salary ? Number(employee.salary).toLocaleString() : 'N/A'}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Banking Details */}
                                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FaCreditCard className="text-blue-600" /> Banking & Government
                                    </h4>
                                    <div className="space-y-1">
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Bank:</span>
                                            <span className="font-medium">{employee?.bank_name || 'N/A'}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Account Number:</span>
                                            <span className="font-medium">{employee?.bank_account_number || 'N/A'}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">SSS Number:</span>
                                            <span className="font-medium">{employee?.sss_number || 'N/A'}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">PhilHealth:</span>
                                            <span className="font-medium">{employee?.philhealth_number || 'N/A'}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">Pag-IBIG:</span>
                                            <span className="font-medium">{employee?.pagibig_number || 'N/A'}</span>
                                        </p>
                                        <p className="text-sm flex justify-between">
                                            <span className="text-gray-500">TIN:</span>
                                            <span className="font-medium">{employee?.tin_number || 'N/A'}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;