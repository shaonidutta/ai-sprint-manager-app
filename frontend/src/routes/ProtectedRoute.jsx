import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] Current state:', {
    user,
    loading,
    pathname: location.pathname,
    isAuthenticated: !!user
  });

  if (loading) {
    console.log('[ProtectedRoute] Loading state, showing spinner');
    return <LoadingSpinner />;
  }

  if (!user) {
    console.log('[ProtectedRoute] No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.email_verified && location.pathname !== '/verify-otp') {
    console.log('[ProtectedRoute] Unverified user, redirecting to OTP verification');
    return <Navigate to="/verify-otp" state={{ from: location }} replace />;
  }

  console.log('[ProtectedRoute] User authenticated, rendering protected content');
  return <Outlet />;
};

export default ProtectedRoute; 