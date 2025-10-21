import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Users, UserCheck } from 'lucide-react';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee' as 'manager' | 'employee'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signUp, signInWithGoogle, userProfile } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect when user profile is loaded after successful authentication
  useEffect(() => {
    if (userProfile) {
      const dashboardPath = userProfile.role === 'manager' ? '/manager-dashboard' : '/employee-dashboard';
      navigate(dashboardPath, { replace: true });
    }
  }, [userProfile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signUp(formData.email, formData.password, formData.role, formData.name);
      // Navigation will be handled by useEffect when userProfile updates
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
      setLoading(false);
    } finally {
      // Don't set loading to false here as we want to show loading during redirect
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle(formData.role);
      // Navigation will be handled by useEffect when userProfile updates
    } catch (error: any) {
      setError(error.message || 'Failed to sign up with Google');
      setLoading(false);
    } finally {
      // Don't set loading to false here as we want to show loading during redirect
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center animate-fadeIn">
          <h2 className="text-4xl font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Create your account</h2>
          <p className="text-lg text-[#4A4A4A]" style={{ fontFamily: 'var(--font-body)' }}>Join the Smart Talent Allocator platform</p>
        </div>

        <div className="modern-card p-8 animate-fadeInUp">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'employee' })}
                className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all duration-200 ${
                  formData.role === 'employee'
                    ? 'border-[#4B6AFF] bg-[#E8EDFF] text-[#4B6AFF] shadow-lg'
                    : 'border-[#DCE3FF] hover:border-[#4B6AFF] hover:shadow-md'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <User className="h-6 w-6" />
                <span className="font-medium">Employee</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'manager' })}
                className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all duration-200 ${
                  formData.role === 'manager'
                    ? 'border-[#4B6AFF] bg-[#E8EDFF] text-[#4B6AFF] shadow-lg'
                    : 'border-[#DCE3FF] hover:border-[#4B6AFF] hover:shadow-md'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <UserCheck className="h-6 w-6" />
                <span className="font-medium">Manager</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Full Name
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A0A0A0]" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="modern-input pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A0A0A0]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="modern-input pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A0A0A0]" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="modern-input pl-10 pr-12"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] hover:text-[#4A4A4A]"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A0A0A0]" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="modern-input pl-10 pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] hover:text-[#4A4A4A]"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="modern-btn w-full py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[#4A4A4A]" style={{ fontFamily: 'var(--font-body)' }}>Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="mt-3 w-full modern-btn-secondary py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[#4A4A4A]" style={{ fontFamily: 'var(--font-body)' }}>
              Already have an account?{' '}
              <Link to="/signin" className="text-[#4B6AFF] hover:text-[#5C7CFF] font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}