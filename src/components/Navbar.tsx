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
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Users className="h-8 w-8 text-blue-600 group-hover:text-purple-600 transition-colors duration-300" />
                <Sparkles className="h-3 w-3 text-purple-600 absolute -top-1 -right-1 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                Smart Talent Allocator
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-all duration-300 relative group"
              >
                <span className="relative z-10">{item.name}</span>
                <div className="absolute inset-0 bg-blue-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></div>
              </Link>
            ))}
            
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={userProfile?.role === 'manager' ? '/manager-dashboard' : '/employee-dashboard'}
                  className="modern-btn text-sm flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-all duration-300 flex items-center space-x-2 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/signin"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-blue-50 rounded-lg"
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
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md border-t border-gray-100">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-all duration-300 hover:bg-blue-50 rounded-lg"
                >
                  {item.name}
                </Link>
              ))}
              
              {currentUser ? (
                <div className="space-y-1">
                  <Link
                    to={userProfile?.role === 'manager' ? '/manager-dashboard' : '/employee-dashboard'}
                    onClick={() => setIsOpen(false)}
                    className="bg-blue-600 text-white block px-3 py-2 text-base font-medium hover:bg-blue-700 transition-all duration-300 rounded-lg"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="text-red-600 hover:text-red-800 block px-3 py-2 text-base font-medium transition-all duration-300 w-full text-left hover:bg-red-50 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/signin"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-all duration-300 hover:bg-blue-50 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="bg-blue-600 text-white block px-3 py-2 text-base font-medium hover:bg-blue-700 transition-all duration-300 rounded-lg"
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