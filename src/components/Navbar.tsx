import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Users, Sparkles, Lightbulb } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsOpen(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const navigation = currentUser ? [
    {
      name: 'AI Insights',
      href: '/ai-insights',
      icon: Lightbulb,
      description: userProfile?.role === 'manager'
        ? 'Team insights and skill gaps'
        : 'Career growth and skill recommendations'
    }
  ] : [];

  return (
    <nav className={`glass-bg fixed top-0 left-0 right-0 z-50 border-b border-[rgba(75,106,255,0.1)] transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-[#4B6AFF] group-hover:text-[#5C7CFF] transition-colors duration-300" />
                <Sparkles className="h-3 w-3 text-[#4B6AFF] absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-base sm:text-lg md:text-xl font-semibold text-[#1A1A1A] hidden xs:block" style={{ fontFamily: 'var(--font-heading)' }}>
                Smart Talent Allocator
              </span>
              <span className="text-base font-semibold text-[#1A1A1A] xs:hidden" style={{ fontFamily: 'var(--font-heading)' }}>
                STA
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="navbar-link flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-[#E8EDFF] transition-all duration-300 group"
                  title={item.description}
                >
                  <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
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
                  className="modern-btn-secondary text-sm flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/signin"
                  className="navbar-link px-4 py-2"
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

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#1A1A1A] hover:text-[#4B6AFF] p-2 hover:bg-[#E8EDFF] rounded-lg transition-all duration-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden animate-fadeIn">
            <div className="px-2 pt-2 pb-3 space-y-2 border-t border-[rgba(75,106,255,0.1)]">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className="navbar-link flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-[#E8EDFF] transition-all duration-300"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              {currentUser ? (
                <div className="space-y-2 pt-2">
                  <Link
                    to={userProfile?.role === 'manager' ? '/manager-dashboard' : '/employee-dashboard'}
                    onClick={() => setIsOpen(false)}
                    className="modern-btn w-full block text-center px-3 py-2 rounded-lg"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="modern-btn-secondary w-full px-3 py-2 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link
                    to="/signin"
                    onClick={() => setIsOpen(false)}
                    className="navbar-link block px-3 py-2 rounded-lg hover:bg-[#E8EDFF] transition-all duration-300 text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="modern-btn w-full block text-center px-3 py-2 rounded-lg"
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
