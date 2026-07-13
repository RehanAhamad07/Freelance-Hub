import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { showToast } from '../services/toast.jsx';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Currency Preferences (INR / USD)
  const [preferredCurrency, setPreferredCurrency] = useState(
    localStorage.getItem('preferredCurrency') || 'USD'
  );

  const changePreferredCurrency = (curr) => {
    localStorage.setItem('preferredCurrency', curr);
    setPreferredCurrency(curr);
  };

  const getCurrencySymbol = () => {
    return preferredCurrency === 'INR' ? '₹' : '$';
  };

  const convertPrice = (amount, originalCurrency = 'USD') => {
    const num = Number(amount || 0);
    if (preferredCurrency === originalCurrency) return num;
    if (originalCurrency === 'USD' && preferredCurrency === 'INR') return num * 80;
    if (originalCurrency === 'INR' && preferredCurrency === 'USD') return num / 80;
    return num;
  };

  const formatPrice = (amount, originalCurrency = 'USD') => {
    const num = Number(amount || 0);
    if (preferredCurrency === originalCurrency) {
      return preferredCurrency === 'INR' ? `₹${num.toLocaleString()}` : `$${num.toLocaleString()}`;
    }
    if (originalCurrency === 'USD' && preferredCurrency === 'INR') {
      const converted = num * 80;
      return `₹${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (originalCurrency === 'INR' && preferredCurrency === 'USD') {
      const converted = num / 80;
      return `$${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return preferredCurrency === 'INR' ? `₹${num.toLocaleString()}` : `$${num.toLocaleString()}`;
  };

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
      showToast.success('You have been successfully logged in', 'Login Successful');
      return true;
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Login failed', 'Authentication Error');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      showToast.success('Your account has been created successfully', 'Registration Complete');
      return true;
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Registration failed', 'Registration Error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    showToast.info('You have been logged out successfully', 'Goodbye');
    window.location.href = '/login';
  };

  const googleLogin = async (credential) => {
    try {
      const res = await api.post('/auth/google', { credential });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      showToast.success('Welcome back! You have been logged in with Google', 'Login Successful');
      return true;
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Google login failed', 'Authentication Error');
      return false;
    }
  };

  const toggleSavedService = async (serviceId) => {
    if (!user) return showToast.warning('Please login to save services', 'Login Required');
    try {
      const res = await api.post(`/auth/save-service/${serviceId}`);
      setUser({ ...user, savedServices: res.data.savedServices });
      showToast.success('Service has been added to your favorites', 'Saved');
    } catch (error) {
      console.error('Failed to update saved services:', error.response?.data || error);
      showToast.error('Failed to save service. Please try again', 'Error');
    }
  };

  const toggleSavedJob = async (jobId) => {
    if (!user) return showToast.warning('Please login to save jobs', 'Login Required');
    try {
      const res = await api.post(`/auth/save-job/${jobId}`);
      setUser({ ...user, savedJobs: res.data.savedJobs });
      showToast.success('Job has been added to your favorites', 'Saved');
    } catch (error) {
      console.error('Failed to update saved jobs:', error.response?.data || error);
      showToast.error('Failed to save job. Please try again', 'Error');
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      showToast.success(res.data.message || 'OTP sent to your email', 'Email Sent');
      return true;
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Failed to send OTP', 'Error');
      return false;
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      showToast.success(res.data.message || 'Password reset successfully', 'Success');
      return true;
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Failed to reset password', 'Error');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      refreshUser, 
      login, 
      register, 
      logout, 
      loading, 
      googleLogin, 
      toggleSavedService, 
      toggleSavedJob, 
      forgotPassword, 
      resetPassword,
      preferredCurrency,
      changePreferredCurrency,
      convertPrice,
      formatPrice,
      getCurrencySymbol
    }}>
      {children}
    </AuthContext.Provider>
  );
};
