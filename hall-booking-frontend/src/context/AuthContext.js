import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as loginApi, getCurrentUser, logout as logoutApi } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = JSON.parse(localStorage.getItem('user'));
          if (userData) {
            setUser(userData);
          } else {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
          }
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const response = await loginApi(credentials);

    console.log('Login response from backend:', response);

    // Backend returns user object directly (no JWT token)
    // Use user ID as "token" for session management
    const userToken = response.id || response._id || response.authId || response.emailId || 'session-active';
    const userData = {
      id: response.id || response._id || response.authId || response.emailId,
      email: response.emailId || response.email,
      emailId: response.emailId || response.email,
      firstName: response.details?.firstName,
      lastName: response.details?.lastName,
      phoneNumber: response.details?.phoneNumber || response.details?.contactNbr,
      role: response.details?.role || 'USER',
      isActive: response.isActive
    };

    console.log('Processed user data:', userData);

    setToken(userToken);
    setUser(userData);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));

    return { token: userToken, user: userData };
  };

  const logout = () => {
    logoutApi();
    setToken(null);
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isVendor = () => {
    return user?.role === 'VENDOR';
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token,
    isAdmin,
    isVendor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
