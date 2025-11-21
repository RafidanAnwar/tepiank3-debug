import { createContext, useState, useEffect } from "react";
import { authService } from '../services/authService';

export const ContextApi = createContext(null);

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      const authStatus = authService.isAuthenticated();
      
      setUser(currentUser);
      setIsAuthenticated(authStatus);
      setLoading(false);
    };

    initAuth();

    // Listen for storage changes (for multi-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'loggedUser' || e.key === 'authToken') {
        initAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    login,
    logout
  };

  return (
    <ContextApi.Provider value={value}>
      {children}
    </ContextApi.Provider>
  );
};