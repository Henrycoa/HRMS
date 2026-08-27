// frontend/src/components/auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FaLock, FaEye, FaEyeSlash, FaBuilding, 
    FaArrowRight, FaUsers, FaChartLine, FaCalendarCheck,
    FaShieldAlt, FaEnvelope, FaSun, FaMoon
} from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext'; // 👈 IMPORT THEME
import API from '../../config';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    // 👈 GET THEME
    const { isDark, toggleTheme } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(username, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className={`login-container ${isDark ? 'dark' : ''}`}>
            
            {/* Theme Toggle Button */}
            {/* <button
                onClick={toggleTheme}
                className={`theme-toggle ${isDark ? 'dark' : ''}`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {isDark ? <FaSun /> : <FaMoon />}
            </button> */}

            {/* ===== LEFT SIDE ===== */}
            <div className={`login-left ${isDark ? 'dark' : ''}`}>
                {/* Logo */}
                <div className="logo">
                    <div className={`logo-icon ${isDark ? 'dark' : ''}`}>
                        <FaBuilding />
                    </div>
                    <div>
                        <span className={`logo-text ${isDark ? 'dark' : ''}`}>HRMS</span>
                        <span className={`logo-sub ${isDark ? 'dark' : ''}`}>Enterprise Suite</span>
                    </div>
                </div>

                {/* Hero */}
                <div className={`hero ${isDark ? 'dark' : ''}`}>
                    <h1>
                        Streamline Your{' '}
                        <span className={`highlight ${isDark ? 'dark' : ''}`}>HR Operations</span>
                    </h1>

                    <p>Manage employees, attendance, payroll, and performance in one secure platform.</p>

                    {/* Features */}
                    <div className={`features ${isDark ? 'dark' : ''}`}>
                        <div className={`feature-item ${isDark ? 'dark' : ''}`}>
                            <div className={`feature-icon ${isDark ? 'dark' : ''}`}><FaUsers /></div>
                            <div>
                                <span className={`feature-label ${isDark ? 'dark' : ''}`}>Employee</span>
                                <span className={`feature-sub ${isDark ? 'dark' : ''}`}>Management</span>
                            </div>
                        </div>
                        <div className={`feature-item ${isDark ? 'dark' : ''}`}>
                            <div className={`feature-icon ${isDark ? 'dark' : ''}`}><FaChartLine /></div>
                            <div>
                                <span className={`feature-label ${isDark ? 'dark' : ''}`}>Real-time</span>
                                <span className={`feature-sub ${isDark ? 'dark' : ''}`}>Analytics</span>
                            </div>
                        </div>
                        <div className={`feature-item ${isDark ? 'dark' : ''}`}>
                            <div className={`feature-icon ${isDark ? 'dark' : ''}`}><FaCalendarCheck /></div>
                            <div>
                                <span className={`feature-label ${isDark ? 'dark' : ''}`}>Attendance</span>
                                <span className={`feature-sub ${isDark ? 'dark' : ''}`}>Tracking</span>
                            </div>
                        </div>
                        <div className={`feature-item ${isDark ? 'dark' : ''}`}>
                            <div className={`feature-icon ${isDark ? 'dark' : ''}`}><FaShieldAlt /></div>
                            <div>
                                <span className={`feature-label ${isDark ? 'dark' : ''}`}>Secure</span>
                                <span className={`feature-sub ${isDark ? 'dark' : ''}`}>Access</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`footer ${isDark ? 'dark' : ''}`}>
                    <span>© 2026 HRMS</span>
                    <div className={`footer-links ${isDark ? 'dark' : ''}`}>
                        <Link to="/privacy">Privacy</Link>
                        <Link to="/terms">Terms</Link>
                        <Link to="/support">Support</Link>
                    </div>
                </div>
            </div>

            {/* ===== RIGHT SIDE ===== */}
            <div className={`login-right ${isDark ? 'dark' : ''}`}>
                <div className={`login-card ${isDark ? 'dark' : ''}`}>
                    {/* Mobile Logo */}
                    <div className={`login-mobile-logo ${isDark ? 'dark' : ''}`}>
                        <div className={`icon ${isDark ? 'dark' : ''}`}>
                            <FaBuilding />
                        </div>
                        <div>
                            <span className={`title ${isDark ? 'dark' : ''}`}>HRMS</span>
                            <span className={`sub ${isDark ? 'dark' : ''}`}>Enterprise Suite</span>
                        </div>
                    </div>

                    {/* Header */}
                    <div className={`login-card-header ${isDark ? 'dark' : ''}`}>
                        <p className={`login-subtitle ${isDark ? 'dark' : ''}`}>Sign in to your account</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className={`error-box ${isDark ? 'dark' : ''}`}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className={`login-form ${isDark ? 'dark' : ''}`}>
                        <div className={`form-group ${isDark ? 'dark' : ''}`}>
                            <label className={isDark ? 'dark' : ''}>Username or Email</label>
                            <div className={`input-wrapper ${isDark ? 'dark' : ''}`}>
                                <FaEnvelope className={`input-icon ${isDark ? 'dark' : ''}`} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username or email"
                                    required
                                    disabled={loading}
                                    className={isDark ? 'dark' : ''}
                                />
                            </div>
                        </div>

                        <div className={`form-group ${isDark ? 'dark' : ''}`}>
                            <div className={`flex-row ${isDark ? 'dark' : ''}`}>
                                <label className={isDark ? 'dark' : ''}>Password</label>
                                <Link to="/forgot-password" className={`forgot-link ${isDark ? 'dark' : ''}`}>
                                    Forgot?
                                </Link>
                            </div>
                            <div className={`password-wrapper ${isDark ? 'dark' : ''}`}>
                                <FaLock className={`input-icon ${isDark ? 'dark' : ''}`} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                    className={isDark ? 'dark' : ''}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`password-toggle ${isDark ? 'dark' : ''}`}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className={`btn-submit ${isDark ? 'dark' : ''}`}>
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
                    <div className={`register-link ${isDark ? 'dark' : ''}`}>
                        Don't have an account?{' '}
                        <Link to="/register" className={isDark ? 'dark' : ''}>Create one now</Link>
                    </div>

                    {/* Demo */}
                    <div className={`demo-box ${isDark ? 'dark' : ''}`}>
                        <div className={`demo-row ${isDark ? 'dark' : ''}`}>
                            <span className={`demo-label ${isDark ? 'dark' : ''}`}>🔑 Demo Access</span>
                            <div className={`demo-codes ${isDark ? 'dark' : ''}`}>
                                <code className={`demo-code ${isDark ? 'dark' : ''}`}>hr</code>
                                <span className={`demo-sep ${isDark ? 'dark' : ''}`}>/</span>
                                <code className={`demo-code ${isDark ? 'dark' : ''}`}>password123</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;