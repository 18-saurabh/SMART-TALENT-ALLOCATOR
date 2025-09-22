import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const navigation = [
  ];

  return (
    <nav className="bg-over-spline shadow-lg sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Users className="h-8 w-8 text-white group-hover:text-blue-200 transition-colors duration-300 animate-float-up" />
                <Sparkles className="h-3 w-3 text-blue-200 absolute -top-1 -right-1 animate-pulse-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-xl font-bold text-over-spline">
                Smart Talent Allocator
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={userProfile?.role === 'manager' ? '/manager-dashboard' : '/employee-dashboard'}
                  className="modern-btn text-sm flex items-center space-x-2 animate-pulse-glow"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-over-spline hover:text-red-300 px-3 py-2 text-sm font-medium transition-all duration-300 flex items-center space-x-2 hover:bg-red-500/20 rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/signin"
                  className="text-over-spline hover:text-blue-200 px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-blue-500/20 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="modern-btn text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-all duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden animate-float-down">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-over-spline border-t border-white/20">
              {currentUser ? (
                <div className="space-y-1">
                  <Link
                    to={userProfile?.role === 'manager' ? '/manager-dashboard' : '/employee-dashboard'}
                    onClick={() => setIsOpen(false)}
                    className="modern-btn block px-3 py-2 text-base font-medium transition-all duration-300 rounded-lg"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="text-red-300 hover:text-red-100 block px-3 py-2 text-base font-medium transition-all duration-300 w-full text-left hover:bg-red-500/20 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/signin"
                    onClick={() => setIsOpen(false)}
                    className="text-over-spline hover:text-blue-200 block px-3 py-2 text-base font-medium transition-all duration-300 hover:bg-blue-500/20 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="modern-btn block px-3 py-2 text-base font-medium transition-all duration-300 rounded-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}