import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('speakup_token');
    const storedUser = localStorage.getItem('speakup_user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Verify token is still valid
      authAPI.getMe()
        .then(res => setUser(res.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('speakup_token', res.token);
    localStorage.setItem('speakup_user', JSON.stringify(res.user));
    setUser(res.user);
    return res;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    localStorage.setItem('speakup_token', res.token);
    localStorage.setItem('speakup_user', JSON.stringify(res.user));
    setUser(res.user);
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('speakup_token');
    localStorage.removeItem('speakup_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) => {
    setUser(updated);
    localStorage.setItem('speakup_user', JSON.stringify(updated));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
