import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData.email, formData.password);
    if (success) navigate('/dashboard');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const success = await googleLogin(credentialResponse.credential);
    if (success) navigate('/dashboard');
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#060a12] dark:via-[#0c1222] dark:to-[#070b14] p-4 relative overflow-hidden">
      {/* Dotted Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0"></div>

      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-blue/5 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-brand-purple/5 rounded-full blur-3xl z-0"></div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 shadow-3d-lg dark:shadow-3d-dark-lg rounded-3xl border border-gray-200/50 dark:border-dark-border/60 hover-3d z-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-extrabold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input-primary w-full text-sm font-semibold focus:ring-1 focus:ring-brand-blue"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs font-bold text-brand-green hover:text-emerald-600 transition">Forgot Password?</Link>
            </div>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-primary w-full text-sm font-semibold focus:ring-1 focus:ring-brand-blue"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full btn-success py-3.5 mt-2 rounded-xl text-sm font-bold shadow-3d-md hover:scale-[1.02] hover:shadow-glow-primary active:scale-[0.98] transition-all flex items-center justify-center"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="w-1/5 border-b border-gray-200 dark:border-dark-border lg:w-1/4"></span>
          <span className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">or login with</span>
          <span className="w-1/5 border-b border-gray-200 dark:border-dark-border lg:w-1/4"></span>
        </div>

        <div className="mt-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
          />
        </div>

        <p className="text-center mt-8 text-sm font-semibold text-slate-500 dark:text-slate-400">
          Don't have an account? <Link to="/register" className="text-brand-green font-bold hover:underline ml-1">Join now</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
