import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingScreen from '../../pages/default/loading.jsx';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isLoading, hasAnyRole } = useAuth();
  const location = useLocation();

  // 1. Prevent UI flickers or false redirects while checking session
  if (isLoading) {
    return <LoadingScreen/>;
  }

  // 2. Redirect unauthenticated users to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Check if user holds at least ONE allowed role
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Access Granted
  return <Outlet />;
};