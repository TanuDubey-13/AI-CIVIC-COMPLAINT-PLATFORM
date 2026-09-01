import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authAPI from '../services/authAPI';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshProfile = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await authAPI.getProfile();
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.warn('Session check failed or expired:', err.message);
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials) => {
    setError(null);
    try {
      const data = await authAPI.login(credentials);
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
      }
      throw new Error(data.message || 'Login failed');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const data = await authAPI.register(userData);
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.warn('Logout API warning:', err.message);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const isCitizen = user?.role === 'citizen';
  const isOfficer = user?.role === 'officer';
  const isAdmin = user?.role === 'admin';
  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        refreshProfile,
        isAuthenticated,
        isCitizen,
        isOfficer,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
