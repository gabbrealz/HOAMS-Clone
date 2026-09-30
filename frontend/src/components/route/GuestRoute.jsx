import { Navigate, Outlet } from 'react-router-dom';
import LoadingScreen from '../../pages/default/loading.jsx';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/navigation.js';

export const GuestRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen/>;
  }

  // If user is already logged in, redirect them to their dashboard
  if (user) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }

  // User is not logged in; allow access to login/register pages
  return <Outlet />;
};