// frontend/src/components/auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FaUser, FaEnvelope, FaLock, FaPhone,
    FaUserTag, FaEye, FaEyeSlash, FaArrowLeft, FaBuilding,
    FaCheckCircle, FaSun, FaMoon
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext'; // 👈 IMPORT THEME
import API from '../../config';
import './Login.css';

const Register = () => {
    const [formData, setFormData] = useState({
        user_fname: '',
        user_lname: '',
        user_email: '',
        user_password: '',
        user_number: '',
        gender: 'female',
        user_type: 'employee'
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    // 👈 GET THEME
    const { isDark, toggleTheme } = useTheme();

    // ============================================
    // HANDLE INPUT CHANGE
    // ============================================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // ============================================
    // VALIDATE FORM
    // ============================================
    const validate = () => {
        const newErrors = {};
        
        if (!formData.user_fname.trim()) {
            newErrors.user_fname = 'First name is required';
        }
        if (!formData.user_lname.trim()) {
            newErrors.user_lname = 'Last name is required';
        }
        if (!formData.user_email.trim()) {
            newErrors.user_email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
            newErrors.user_email = 'Invalid email format';
        }
        if (!formData.user_password.trim()) {
            newErrors.user_password = 'Password is required';
        } else if (formData.user_password.length < 6) {
            newErrors.user_password = 'Password must be at least 6 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ============================================
    // HANDLE SUBMIT
    // ============================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            toast.error('Please fix all errors');
            return;
        }

        setLoading(true);

        try {
            const result = await register(formData);

            if (result.success) {
                setSuccess(true);
                toast.success('Registration successful! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                toast.error(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // SUCCESS SCREEN (WITH DARK MODE)
    // ============================================
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <FaCheckCircle className="text-green-500 text-6xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Registration Successful! 🎉</h2>
                    <p className="text-gray-500 dark:text-slate-400 mt-2">
                        Your account has been created successfully.
                    </p>
                    <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">
                        Redirecting to login page...
                    </p>
                    <Link
                        to="/login"
                        className="block mt-6 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Click here if not redirected
                    </Link>
                </div>
            </div>
        );
    }

    // ============================================
    // REGISTER FORM (WITH DARK MODE)
    // ============================================
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4 relative">
            
            {/* Theme Toggle Button */}
            {/* <button
                onClick={toggleTheme}
                className="fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all hover:scale-110 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-yellow-400"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {isDark ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
            </button> */}

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-8">
                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-2xl mb-4">
                        <FaBuilding className="text-white text-3xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">HRMS</h1>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">Create your account</p>
                </div>

                <h2 className="text-xl font-semibold text-gray-700 dark:text-slate-200 mb-6 text-center">
                    Register New Account
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* First Name */}
                    <div className="mb-3">
                        <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-3 text-gray-400 dark:text-slate-500" />
                            <input
                                type="text"
                                name="user_fname"
                                value={formData.user_fname}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-white border-gray-300 dark:border-slate-600 ${
                                    errors.user_fname ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                                }`}
                                placeholder="John"
                                disabled={loading}
                                autoComplete="given-name"
                            />
                        </div>
                        {errors.user_fname && (
                            <p className="text-red-500 text-xs mt-1">{errors.user_fname}</p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div className="mb-3">
                        <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-3 text-gray-400 dark:text-slate-500" />
                            <input
                                type="text"
                                name="user_lname"
                                value={formData.user_lname}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-white border-gray-300 dark:border-slate-600 ${
                                    errors.user_lname ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                                }`}
                                placeholder="Doe"
                                disabled={loading}
                                autoComplete="family-name"
                            />
                        </div>
                        {errors.user_lname && (
                            <p className="text-red-500 text-xs mt-1">{errors.user_lname}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                        <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-3 text-gray-400 dark:text-slate-500" />
                            <input
                                type="email"
                                name="user_email"
                                value={formData.user_email}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-white border-gray-300 dark:border-slate-600 ${
                                    errors.user_email ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                                }`}
                                placeholder="john@example.com"
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>
                        {errors.user_email && (
                            <p className="text-red-500 text-xs mt-1">{errors.user_email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                        <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
                            Password <span className="text-red-500">*</span>
                            <span className="text-xs text-gray-400 dark:text-slate-500"> (min 6 chars)</span>
                        </label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-3 text-gray-400 dark:text-slate-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="user_password"
                                value={formData.user_password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-white border-gray-300 dark:border-slate-600 ${
                                    errors.user_password ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
                                }`}
                                placeholder="••••••••"
                                disabled={loading}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.user_password && (
                            <p className="text-red-500 text-xs mt-1">{errors.user_password}</p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div className="mb-3">
                        <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
                            Phone Number
                        </label>
                        <div className="relative">
                            <FaPhone className="absolute left-3 top-3 text-gray-400 dark:text-slate-500" />
                            <input
                                type="text"
                                name="user_number"
                                value={formData.user_number || ''}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
                                placeholder="09123456789"
                                disabled={loading}
                                autoComplete="tel"
                            />
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="mb-3">
                        <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
                            Gender
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
                            disabled={loading}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* User Type (Role) */}
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-1">
                            Account Type
                        </label>
                        <div className="relative">
                            <FaUserTag className="absolute left-3 top-3 text-gray-400 dark:text-slate-500" />
                            <select
                                name="user_type"
                                value={formData.user_type}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-800 dark:text-white"
                                disabled={loading}
                            >
                                <option value="employee">Employee</option>
                                <option value="department_head">Department Head</option>
                                <option value="hr_manager">HR Manager</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                            Select your role. Super Admin and HR Manager roles require approval.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Registering...
                            </span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="mt-4 text-center">
                    <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center gap-1">
                        <FaArrowLeft size={12} /> Back to Login
                    </Link>
                </div>

                {/* Terms */}
                <div className="mt-4 text-center text-xs text-gray-400 dark:text-slate-500">
                    <p>By registering, you agree to our Terms of Service</p>
                </div>
            </div>
        </div>
    );
};

export default Register;