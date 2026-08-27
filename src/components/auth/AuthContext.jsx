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

    // ✅ Check session on mount
    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        console.log('🔍 Checking session...');
        try {
            const response = await authAPI.me();
            console.log('🔍 Session response:', response.data);
            
            if (response.data.status === 1 && response.data.success) {
                setUser(response.data.data.user);
                console.log('✅ User loaded:', response.data.data.user);
            } else {
                console.log('❌ No active session');
                setUser(null);
            }
        } catch (error) {
            console.error('❌ Session check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        console.log('🔑 Login attempt:', username);
        try {
            const response = await authAPI.login(username, password);
            console.log('🔑 Login response:', response.data);
            
            if (response.data.status === 1 && response.data.success) {
                setUser(response.data.data.user);
                toast.success(`Welcome, ${response.data.data.user.first_name}!`);
                return { success: true, user: response.data.data.user };
            } else {
                toast.error(response.data.message || 'Login failed');
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            
            if (response.data.status === 1 && response.data.success) {
                toast.success('Registration successful! Please login.');
                return { success: true };
            } else {
                toast.error(response.data.message || 'Registration failed');
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            toast.success('Logged out');
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        refresh: checkSession,
        roles: {
            isSuperAdmin: user?.user_type === 'super_admin',
            isHRManager: user?.user_type === 'hr_manager',
            isDepartmentHead: user?.user_type === 'department_head',
            isEmployee: user?.user_type === 'employee',
        },
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};