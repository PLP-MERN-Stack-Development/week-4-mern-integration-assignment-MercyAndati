import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const currentUser = authService.getCurrentUser();
  setUser(currentUser || null); 
  setIsLoading(false);
}, []);

 const login = async (credentials) => {
  try {
    const response = await authService.login(credentials);
    // Force immediate UI update in two ways:
    setUser(response.data.user); // 1. Set from response
    setTimeout(() => {
      setUser(authService.getCurrentUser()); // 2. Force refresh from localStorage
    }, 0);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);