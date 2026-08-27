// frontend/src/components/common/RoleGuard.jsx
import React from 'react';

// ✅ Correct import path
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const RoleGuard = ({ children, allowedRoles = [] }) => {
    const { user, hasRole } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
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

    return children;
};

export default RoleGuard;