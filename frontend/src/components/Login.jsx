import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Activity } from 'lucide-react';
import { login } from '../services/api';
import BackButton from './BackButton';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData.email, formData.password);
      console.log('Login successful:', response);
      
      // Store token and user info
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.userId);
      localStorage.setItem('fullName', response.fullName);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side - Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-6">
            <BackButton label="Back" fallbackPath="/" />
          </div>
          {/* Logo/Brand Mobile */}
          <div className="flex items-center gap-2 mb-8 text-teal-600 font-bold text-2xl">
            <Activity className="h-8 w-8" />
            <span>DermaDetect</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Please enter your details to access your dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                  placeholder="doctor@example.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
              </div>
              <div className="flex justify-end mt-2">
                <a href="#" className="text-sm font-medium text-teal-600 hover:text-teal-500">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
              Create free account
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image/Banner (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-teal-600 justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-teal-600 to-teal-800 opacity-90"></div>
        <div className="relative z-10 text-white px-12 text-center">
            {/* You can replace this placeholder with a medical image later */}
            <h2 className="text-4xl font-bold mb-4">AI-Powered Skin Diagnostics</h2>
            <p className="text-lg text-teal-100">
              Advanced machine learning models to help identify and analyze skin conditions in seconds.
            </p>
            <img src="https://cdn.vectorstock.com/i/500p/72/81/skin-cancer-screening-diagnosis-vector-59987281.jpg" className='mt-5 rounded-lg opacity-50' alt="img"/>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-teal-500 opacity-20 blur-3xl"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-teal-400 opacity-20 blur-3xl"></div>
      </div>
    </div>
  );
};

export default Login;