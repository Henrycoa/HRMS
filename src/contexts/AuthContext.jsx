// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // ============================================
    // FETCH USER ON MOUNT
    // ============================================
    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await authAPI.me();
            if (response.data.status === 1 && response.data.success) {
                setUser(response.data.data.user);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // 1.1 LOGIN SYSTEM
    // ============================================
    const login = async (username, password, remember_me = false) => {
        try {
            const response = await authAPI.login(username, password, remember_me);

            if (response.data.requires_2fa) {
                return { 
                    requires_2fa: true, 
                    user_id: response.data.user_id 
                };
            }

            if (response.data.status === 1 && response.data.success) {
                const { token, data } = response.data;
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                setToken(token);
                setUser(data.user);
                
                toast.success(`Welcome back, ${data.user.first_name}!`);
                return { success: true, user: data.user };
            } else {
                toast.error(response.data.message || 'Login failed');
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    // ============================================
    // ✅ 1.1 REGISTER SYSTEM - FIXED
    // ============================================
    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            
            if (response.data.status === 1 && response.data.success) {
                toast.success('Registration successful! Please login.');
                return { 
                    success: true, 
                    user: response.data.data,
                    message: response.data.message 
                };
            } else {
                const message = response.data.message || 'Registration failed';
                toast.error(message);
                return { success: false, message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    // ============================================
    // 1.3 TWO-FACTOR AUTHENTICATION
    // ============================================
    const verify2FA = async (userId, otp) => {
        try {
            const response = await authAPI.verify2FA(userId, otp);
            
            if (response.data.status === 1 && response.data.success) {
                const { token, data } = response.data;
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                setToken(token);
                setUser(data.user);
                
                toast.success('2FA verified successfully!');
                return { success: true, user: data.user };
            } else {
                toast.error(response.data.message || 'Invalid OTP');
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid OTP';
            toast.error(message);
            return { success: false, message };
        }
    };

    const enable2FA = async () => {
        try {
            const response = await authAPI.enable2FA();
            if (response.data.status === 1) {
                toast.success('2FA enabled successfully!');
                return { success: true };
            }
            toast.error(response.data.message || 'Failed to enable 2FA');
            return { success: false };
        } catch (error) {
            toast.error('Failed to enable 2FA');
            return { success: false };
        }
    };

    const disable2FA = async () => {
        try {
            const response = await authAPI.disable2FA();
            if (response.data.status === 1) {
                toast.success('2FA disabled successfully!');
                return { success: true };
            }
            toast.error(response.data.message || 'Failed to disable 2FA');
            return { success: false };
        } catch (error) {
            toast.error('Failed to disable 2FA');
            return { success: false };
        }
    };

    // ============================================
    // 1.4 FORGOT PASSWORD
    // ============================================
    const forgotPassword = async (email) => {
        try {
            const response = await authAPI.forgotPassword(email);
            
            if (response.data.status === 1 && response.data.success) {
                toast.success('Password reset link sent to your email');
                return { success: true };
            } else {
                toast.error(response.data.message || 'Failed to send reset link');
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send reset link';
            toast.error(message);
            return { success: false, message };
        }
    };

    const resetPassword = async (data) => {
        try {
            const response = await authAPI.resetPassword(data);
            
            if (response.data.status === 1 && response.data.success) {
                toast.success('Password reset successfully!');
                return { success: true };
            } else {
                toast.error(response.data.message || 'Failed to reset password');
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to reset password';
            toast.error(message);
            return { success: false, message };
        }
    };

    // ============================================
    // 1.5 LOGOUT
    // ============================================
    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            toast.success('Logged out successfully');
        }
    };

    // ============================================
    // 1.6 SESSION MANAGEMENT
    // ============================================
    const getSessions = async () => {
        try {
            const response = await authAPI.getSessions();
            if (response.data.status === 1 && response.data.success) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Failed to get sessions:', error);
            return [];
        }
    };

    const revokeSession = async (sessionId) => {
        try {
            const response = await authAPI.revokeSession(sessionId);
            if (response.data.status === 1 && response.data.success) {
                toast.success('Session revoked successfully');
                return { success: true };
            }
            toast.error('Failed to revoke session');
            return { success: false };
        } catch (error) {
            toast.error('Failed to revoke session');
            return { success: false };
        }
    };

    const revokeAllSessions = async () => {
        try {
            const response = await authAPI.revokeAllSessions();
            if (response.data.status === 1 && response.data.success) {
                toast.success('All other sessions revoked');
                return { success: true };
            }
            toast.error('Failed to revoke sessions');
            return { success: false };
        } catch (error) {
            toast.error('Failed to revoke sessions');
            return { success: false };
        }
    };

    // ============================================
    // 1.7 IP RESTRICTION
    // ============================================
    const updateIPRestrictions = async (ips) => {
        try {
            const response = await authAPI.updateIPRestrictions(ips);
            if (response.data.status === 1 && response.data.success) {
                toast.success('IP restrictions updated');
                return { success: true };
            }
            toast.error('Failed to update IP restrictions');
            return { success: false };
        } catch (error) {
            toast.error('Failed to update IP restrictions');
            return { success: false };
        }
    };

    // ============================================
    // 1.2 ROLE-BASED ACCESS
    // ============================================
    const hasRole = (roles) => {
        if (!user) return false;
        if (user.user_type === 'super_admin') return true;
        return roles.includes(user.user_type);
    };

    const hasPermission = (permission) => {
        if (!user) return false;
        if (user.user_type === 'super_admin') return true;
        if (permission === '*') return false;
        
        const permissions = {
            super_admin: ['*'],
            hr_manager: [
                'view_employees', 'manage_employees', 
                'view_attendance', 'manage_attendance',
                'view_leaves', 'manage_leaves',
                'view_payroll', 'manage_payroll',
                'view_reports', 'manage_reports',
                'view_trainings', 'manage_trainings',
                'view_recruitment', 'manage_recruitment',
                'view_performance', 'manage_performance'
            ],
            department_head: [
                'view_employees', 'manage_team',
                'view_attendance', 'approve_leaves',
                'view_performance', 'manage_performance',
                'view_reports'
            ],
            employee: [
                'view_profile', 'update_profile',
                'view_attendance', 'apply_leave',
                'view_payroll', 'view_performance',
                'view_trainings', 'enroll_trainings'
            ]
        };

        return permissions[user.user_type]?.includes(permission) || false;
    };

    // ============================================
    // ✅ AUTH VALUE OBJECT - REGISTER INCLUDED
    // ============================================
    const value = {
        // State
        user,
        loading,
        token,
        isAuthenticated: !!user,

        // Login & Register - ✅ REGISTER IS HERE
        login,
        register,  // ✅ REGISTER FUNCTION - MAKE SURE THIS IS HERE
        logout,

        // 2FA
        verify2FA,
        enable2FA,
        disable2FA,

        // Password Reset
        forgotPassword,
        resetPassword,

        // Session Management
        getSessions,
        revokeSession,
        revokeAllSessions,

        // IP Restrictions
        updateIPRestrictions,

        // Role & Permissions
        hasRole,
        hasPermission,

        // Role Shortcuts
        roles: {
            isSuperAdmin: user?.user_type === 'super_admin',
            isHRManager: user?.user_type === 'hr_manager',
            isDepartmentHead: user?.user_type === 'department_head',
            isEmployee: user?.user_type === 'employee',
        },

        // Helper
        refreshUser: fetchUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};