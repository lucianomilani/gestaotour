import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDefaultPath } from '../utils/permissions';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, loading, user, canAccessPage } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has permission to access this page
    if (user && !canAccessPage(location.pathname)) {
        // Redirect to user's default page based on their role
        const defaultPath = getDefaultPath(user.role);
        return <Navigate to={defaultPath} replace />;
    }

    return <>{children}</>;
};
