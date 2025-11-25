import { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ContextApi } from '../context/ContextApi';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, loading } = useContext(ContextApi);
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access
  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;