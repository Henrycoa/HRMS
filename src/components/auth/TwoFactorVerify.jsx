// frontend/src/components/auth/TwoFactorVerify.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TwoFactorVerify = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const { verify2FA, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const userId = location.state?.userId;

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // If no userId, redirect to login
    useEffect(() => {
        if (!userId && !loading) {
            toast.error('Session expired. Please login again.');
            navigate('/login');
        }
    }, [userId, navigate, loading]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit code');
            setLoading(false);
            return;
        }

        try {
            const result = await verify2FA(userId, otp);

            if (result.success) {
                toast.success('2FA verified successfully!');
                navigate('/dashboard');
            } else {
                setError(result.message || 'Invalid verification code');
                toast.error(result.message || 'Invalid verification code');
            }
        } catch (error) {
            console.error('2FA verification error:', error);
            setError('Failed to verify. Please try again.');
            toast.error('Failed to verify. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;
        
        setLoading(true);
        try {
            // Call API to resend code
            const response = await api.post(API.RESEND_2FA, { user_id: userId });
            if (response.data.status === 1) {
                toast.success('New code sent to your email!');
                setResendCooldown(60); // 60 seconds cooldown
            } else {
                toast.error(response.data.message || 'Failed to resend code');
            }
        } catch (error) {
            console.error('Resend code error:', error);
            toast.error('Failed to resend code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 6) {
            setOtp(value);
        }
    };

    // Auto-submit when OTP is complete
    useEffect(() => {
        if (otp.length === 6 && !loading) {
            handleSubmit(new Event('submit'));
        }
    }, [otp]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                        <FaShieldAlt className="text-white text-3xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Two-Factor Authentication</h1>
                    <p className="text-gray-500 text-sm mt-2">
                        Enter the 6-digit code sent to your email
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={handleOtpChange}
                            maxLength="6"
                            className="w-full px-4 py-3 text-center text-2xl tracking-[0.5rem] border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="0 0 0 0 0 0"
                            required
                            disabled={loading}
                            autoFocus
                        />
                        <div className="flex justify-between mt-2">
                            <p className="text-xs text-gray-400">
                                Code expires in 5 minutes
                            </p>
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={resendCooldown > 0 || loading}
                                className={`text-xs font-medium transition ${
                                    resendCooldown > 0 || loading
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-blue-600 hover:text-blue-700'
                                }`}
                            >
                                {resendCooldown > 0 
                                    ? `Resend in ${resendCooldown}s` 
                                    : 'Resend Code'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length < 6}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" /> Verifying...
                            </>
                        ) : (
                            'Verify'
                        )}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 transition"
                    >
                        <FaArrowLeft size={12} /> Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorVerify;