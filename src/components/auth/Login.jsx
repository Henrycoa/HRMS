// frontend/src/components/auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FaLock, FaEye, FaEyeSlash, FaBuilding, 
    FaArrowRight, FaUsers, FaChartLine, FaCalendarCheck,
    FaShieldAlt, FaEnvelope
} from 'react-icons/fa';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(username, password);

            if (result.success) {
                navigate('/dashboard');
            } else if (result.requires_2fa) {
                navigate('/2fa', { state: { userId: result.user_id } });
            } else {
                setError(result.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* ===== LEFT SIDE ===== */}
            <div className="login-left">
                {/* Logo */}
                <div className="logo">
                    <div className="logo-icon">
                        <FaBuilding />
                    </div>
                    <div>
                        <span className="logo-text">HRMS</span>
                        <span className="logo-sub">Enterprise Suite</span>
                    </div>
                </div>

                {/* Hero */}
                <div className="hero">
                    <h1>
                        Streamline Your{' '}
                        <span className="highlight">HR Operations</span>
                    </h1>

                    <p>Manage employees, attendance, payroll, and performance in one secure platform.</p>

                    {/* Features */}
                    <div className="features">
                        <div className="feature-item">
                            <div className="feature-icon"><FaUsers /></div>
                            <div>
                                <span className="feature-label">Employee</span>
                                <span className="feature-sub">Management</span>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon"><FaChartLine /></div>
                            <div>
                                <span className="feature-label">Real-time</span>
                                <span className="feature-sub">Analytics</span>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon"><FaCalendarCheck /></div>
                            <div>
                                <span className="feature-label">Attendance</span>
                                <span className="feature-sub">Tracking</span>
                            </div>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon"><FaShieldAlt /></div>
                            <div>
                                <span className="feature-label">Secure</span>
                                <span className="feature-sub">Access</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="footer">
                    <span>© 2026 HRMS</span>
                    <div className="footer-links">
                        <Link to="/privacy">Privacy</Link>
                        <Link to="/terms">Terms</Link>
                        <Link to="/support">Support</Link>
                    </div>
                </div>
            </div>

            {/* ===== RIGHT SIDE ===== */}
            <div className="login-right">
                <div className="login-card">
                    {/* Mobile Logo */}
                    <div className="login-mobile-logo">
                        <div className="icon">
                            <FaBuilding />
                        </div>
                        <div>
                            <span className="title">HRMS</span>
                            <span className="sub">Enterprise Suite</span>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="login-card-header">
                        <p className="login-subtitle">Sign in to your account</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="error-box">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label>Username or Email</label>
                            <div className="input-wrapper">
                                <FaEnvelope className="input-icon" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username or email"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="flex-row">
                                <label>Password</label>
                                <Link to="/forgot-password" className="forgot-link">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="password-wrapper">
                                <FaLock className="input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-submit">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="spinner"></span>
                                    Signing in...
                                </span>
                            ) : (
                                <>
                                    Sign In <FaArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register */}
                    <div className="register-link">
                        Don't have an account?{' '}
                        <Link to="/register">Create one now</Link>
                    </div>

                    {/* Demo */}
                    <div className="demo-box">
                        <div className="demo-row">
                            <span className="demo-label">🔑 Demo Access</span>
                            <div className="demo-codes">
                                <code className="demo-code">admin</code>
                                <span className="demo-sep">/</span>
                                <code className="demo-code">password</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
