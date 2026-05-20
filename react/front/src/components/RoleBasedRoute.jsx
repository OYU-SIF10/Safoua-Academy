import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_ROUTES } from '../constants';

// Enhanced role-based route with comprehensive redirects
const RoleBasedRoute = ({ children, allowedRoles, redirectTo }) => {
  const { isAuthenticated, user, loading, isEtudiant, isEnseignant, isAdmin } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0faf4]">
        <div className="w-10 h-10 border-4 border-[#1a7a4a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Use custom redirect or default to role-based route
    const destination = redirectTo || ROLE_ROUTES[user?.role] || '/';
    return <Navigate to={destination} replace />;
  }

  return children;
};

export default RoleBasedRoute;
