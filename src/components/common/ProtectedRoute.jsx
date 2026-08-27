// frontend/src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
    const { user, loading, hasRole } = useAuth();

    console.log('🔒 ProtectedRoute - user:', user);
    console.log('🔒 ProtectedRoute - loading:', loading);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // ✅ Check if user exists - if not, redirect to login
    if (!user) {
        console.warn('🔒 No user, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    // ✅ Check for required roles
    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
        console.warn(`🔒 User does not have required roles: ${requiredRoles.join(', ')}`);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <div className="text-6xl mb-4">⛔</div>
                    <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
                    <p className="text-gray-500 mt-2">
                        You don't have permission to access this page.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // ✅ User is authenticated, show children
    return children;
};

export default ProtectedRoute;