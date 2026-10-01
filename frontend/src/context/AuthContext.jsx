import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getAuthenticatedUser } from '../api/users.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on initial page load / refresh
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await getAuthenticatedUser();
        setUser(userData);
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      navigate("/");
    }
  };

  // Check if user has ANY of the specified roles
  const hasAnyRole = (requiredRoles = []) => {
    if (!user || !user.roles) return false;
    if (requiredRoles.length === 0) return true; // No specific role required

    return requiredRoles.some((role) => user.roles.includes(role));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, hasAnyRole, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
