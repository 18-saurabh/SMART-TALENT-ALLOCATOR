import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, BarChart3, Settings, AlertCircle, UserCog, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import ProfileCard from '../components/ProfileCard';
import PerformanceCard from '../components/PerformanceCard';
import ProjectsGrid from '../components/ProjectsGrid';
import ActivityFeed from '../components/ActivityFeed';
import CalendarModal from '../components/CalendarModal';
import PerformanceModal from '../components/PerformanceModal';
import AIInsightsCard from '../components/AIInsightsCard';

export default function EmployeeDashboard() {
  const { userProfile } = useAuth();
  const { projects, loading } = useProjects();
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Calculate quick stats for sidebar
  const overdueProjects = projects.filter(p => new Date() > p.deadline && p.status !== 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float-up"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float-down"></div>
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4 animate-pulse-glow"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-6 sm:py-8 md:py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float-up"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float-down"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float-rotate"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 relative z-10">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6 text-blue-600 animate-float-rotate" />
            <span className="text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
              Employee Dashboard
            </span>
            <button
              onClick={handleRefresh}
              className="ml-auto p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 group"
              title="Refresh dashboard"
            >
              <RefreshCw className={`h-4 w-4 group-hover:animate-spin ${refreshKey > 0 ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 animate-float-up">
            Welcome back, <span className="gradient-text">{userProfile?.name || 'Employee'}</span>!
          </h1>
              <p className="text-gray-600 mt-2 animate-float-down">
            Here's your personalized dashboard overview
          </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 md:space-y-8 relative z-10">
          {/* Main Content - Full Width */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* 1. My Profile */}
            <div className="animate-float-up">
              <ProfileCard />
            </div>
            
            {/* 2. My Performance */}
            <div className="animate-float-down" style={{ animationDelay: '0.1s' }}>
              <PerformanceCard />
            </div>
            
            {/* 2.5. AI Insights */}
            <div className="animate-float-up" style={{ animationDelay: '0.15s' }}>
              <AIInsightsCard />
            </div>
            
            {/* 3. My Projects */}
            <div className="animate-float-up" style={{ animationDelay: '0.2s' }}>
              <ProjectsGrid key={`projects-${refreshKey}`} />
            </div>

            {/* 4. Recent Activity */}
            <div className="animate-float-down" style={{ animationDelay: '0.3s' }}>
              <ActivityFeed key={`activity-${refreshKey}`} />
            </div>

            {/* Quick Actions - Moved to full width */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-float-up" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={() => setIsCalendarModalOpen(true)}
                className="modern-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <Calendar className="h-8 w-8 text-blue-600 mb-3 mx-auto group-hover:animate-pulse" />
                <h3 className="font-semibold text-gray-900 text-center mb-1">View Calendar</h3>
                <p className="text-sm text-gray-500 text-center">Check deadlines</p>
              </button>

              <Link
                to="/employee-profile?tab=edit"
                className="modern-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <UserCog className="h-8 w-8 text-purple-600 mb-3 mx-auto group-hover:animate-pulse" />
                <h3 className="font-semibold text-gray-900 text-center mb-1">Profile Settings</h3>
                <p className="text-sm text-gray-500 text-center">Edit profile & skills</p>
              </Link>

              <Link
                to="/employee-profile?tab=profile"
                className="modern-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <Settings className="h-8 w-8 text-gray-600 mb-3 mx-auto group-hover:animate-pulse" />
                <h3 className="font-semibold text-gray-900 text-center mb-1">View Profile</h3>
                <p className="text-sm text-gray-500 text-center">Profile overview</p>
              </Link>

              <button
                onClick={handleRefresh}
                className="modern-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <RefreshCw className="h-8 w-8 text-green-600 mb-3 mx-auto group-hover:animate-pulse" />
                <h3 className="font-semibold text-gray-900 text-center mb-1">Refresh Data</h3>
                <p className="text-sm text-gray-500 text-center">Update dashboard</p>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="modern-card p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {overdueProjects > 0 && (
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <span className="text-sm text-gray-600">Overdue Projects</span>
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
                      <span className="text-sm font-medium text-red-600">{overdueProjects}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Projects</span>
                  <span className="text-sm font-medium text-blue-600">{projects.length}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">Completed Projects</span>
                  <span className="text-sm font-medium text-green-600">{projects.filter(p => p.status === 'completed').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
      />
      
      <PerformanceModal
        isOpen={isPerformanceModalOpen}
        onClose={() => setIsPerformanceModalOpen(false)}
      />
    </div>
  );
}