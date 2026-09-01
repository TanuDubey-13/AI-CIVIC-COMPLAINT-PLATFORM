<<<<<<< HEAD
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
=======
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { login as loginApi, register as registerApi, getProfile, logout as logoutApi } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
>>>>>>> 0488c86f666544cf90ab8d11d465f34d47f64c49
      setLoading(false);
      return;
    }

    try {
<<<<<<< HEAD
      const data = await authAPI.getProfile();
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.warn('Session check failed or expired:', err.message);
      // If token expired/invalid, clear it
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
=======
      const res = await getProfile();
      setUser(res.data.user);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
>>>>>>> 0488c86f666544cf90ab8d11d465f34d47f64c49
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
<<<<<<< HEAD
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
=======
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const res = await loginApi(credentials);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await registerApi(data);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
>>>>>>> 0488c86f666544cf90ab8d11d465f34d47f64c49
  };

  const logout = async () => {
    try {
<<<<<<< HEAD
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
=======
      await logoutApi();
    } catch {
      // proceed with local logout even if API fails
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  const isAdmin = user?.role === "admin" || user?.role === "officer";

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
>>>>>>> 0488c86f666544cf90ab8d11d465f34d47f64c49
