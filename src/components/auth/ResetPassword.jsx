// frontend/src/components/auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaLock, FaCheckCircle, FaEye, FaEyeSlash, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const { resetPassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const email = queryParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            toast.error('Invalid reset link. Please request a new one.');
            navigate('/forgot-password');
        }
    }, [token, email, navigate]);

    // Check password strength
    useEffect(() => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;
        setPasswordStrength(strength);
    }, [password]);

    const getStrengthColor = () => {
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
        return colors[Math.min(passwordStrength, 3)] || 'bg-gray-300';
    };

    const getStrengthLabel = () => {
        const labels = ['Weak', 'Fair', 'Good', 'Strong'];
        return labels[Math.min(passwordStrength, 3)] || '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const result = await resetPassword({ token, email, password });

            if (result.success) {
                setSuccess(true);
                toast.success('Password reset successfully!');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(result.message || 'Failed to reset password');
                toast.error(result.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            setError('Failed to reset password. Please try again.');
            toast.error('Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                    <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Password Reset! 🎉</h2>
                    <p className="text-gray-500 mt-2">
                        Your password has been reset successfully.
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                        Redirecting to login...
                    </p>
                    <Link 
                        to="/login"
                        className="block mt-6 text-blue-600 hover:underline font-medium"
                    >
                        Click here if not redirected
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                        <FaLock className="text-white text-3xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Set New Password</h1>
                    <p className="text-gray-500 text-sm mt-2">
                        Create a strong password for your account
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                placeholder="Min 8 characters"
                                required
                                disabled={loading}
                                minLength="8"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        
                        {/* Password Strength Indicator */}
                        {password.length > 0 && (
                            <div className="mt-2">
                                <div className="flex gap-1 h-1.5">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 rounded-full transition ${
                                                i <= passwordStrength ? getStrengthColor() : 'bg-gray-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs text-gray-500">
                                        Strength: <span className="font-medium">{getStrengthLabel()}</span>
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {password.length}/8+ characters
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className={`w-full pl-10 pr-3 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                                    passwordConfirmation && password !== passwordConfirmation
                                        ? 'border-red-500'
                                        : 'border-gray-200'
                                }`}
                                placeholder="Confirm your password"
                                required
                                disabled={loading}
                            />
                        </div>
                        {passwordConfirmation && password !== passwordConfirmation && (
                            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                        )}
                        {passwordConfirmation && password === passwordConfirmation && password.length >= 8 && (
                            <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || password.length < 8 || password !== passwordConfirmation}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" /> Resetting...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <Link 
                        to="/login" 
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 transition"
                    >
                        <FaArrowLeft size={12} /> Back to Login
                    </Link>
                </div>

                <div className="mt-4 text-center text-xs text-gray-400">
                    <p>Password must be at least 8 characters with a mix of letters, numbers, and symbols.</p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;