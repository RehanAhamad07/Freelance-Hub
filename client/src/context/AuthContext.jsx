import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return null;
    }
    const res = await api.get('/auth/profile');
    setUser(res.data);
    return res.data;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error(error);
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Login Successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Registration Successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Logged out');
  };

  const googleLogin = async (credential) => {
    try {
      const res = await api.post('/auth/google', { credential });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Google Login Successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Google login failed');
      return false;
    }
  };

  const toggleSavedService = async (serviceId) => {
    if (!user) return toast.error('Please login to save services');
    try {
      const res = await api.post(`/auth/save-service/${serviceId}`);
      setUser({ ...user, savedServices: res.data.savedServices });
    } catch (error) {
      console.error('Failed to update saved services:', error.response?.data || error);
      toast.error('Failed to update saved services');
    }
  };

  const toggleSavedJob = async (jobId) => {
    if (!user) return toast.error('Please login to save jobs');
    try {
      const res = await api.post(`/auth/save-job/${jobId}`);
      setUser({ ...user, savedJobs: res.data.savedJobs });
    } catch (error) {
      console.error('Failed to update saved jobs:', error.response?.data || error);
      toast.error('Failed to update saved jobs');
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message || 'OTP sent to your email');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
      return false;
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success(res.data.message || 'Password reset successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, refreshUser, login, register, logout, loading, googleLogin, toggleSavedService, toggleSavedJob, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
