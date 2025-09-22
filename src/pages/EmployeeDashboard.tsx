import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, BarChart3, Settings, AlertCircle, UserCog, Sparkles, TrendingUp } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import ProfileCard from '../components/ProfileCard';
import PerformanceCard from '../components/PerformanceCard';
import ProjectsGrid from '../components/ProjectsGrid';
import ActivityFeed from '../components/ActivityFeed';
import CalendarModal from '../components/CalendarModal';
import PerformanceModal from '../components/PerformanceModal';

export default function EmployeeDashboard() {
  const { userProfile } = useAuth();
  const { projects, loading } = useProjects();
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);

  // Calculate quick stats for sidebar
  const overdueProjects = projects.filter(p => new Date() > p.deadline && p.status !== 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4 animate-pulse-glow"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float-up"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float-down"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float-rotate"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 relative z-10">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6 text-blue-600 animate-float-rotate" />
            <span className="text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
              Employee Dashboard
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 animate-float-up">
            Welcome back, <span className="gradient-text">{userProfile?.name || 'Employee'}</span>!
          </h1>
          <p className="text-gray-600 mt-2 animate-float-down">
            Here's your personalized dashboard overview
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-3 space-y-8">
            {/* 1. My Profile */}
            <div className="animate-float-up">
              <ProfileCard />
            </div>
            
            {/* 2. My Performance */}
            <div className="animate-float-down" style={{ animationDelay: '0.1s' }}>
              <PerformanceCard />
            </div>
            
            {/* 3. My Projects */}
            <div className="animate-float-up" style={{ animationDelay: '0.2s' }}>
              <ProjectsGrid />
            </div>
            
            {/* 4. Recent Activity */}
            <div className="animate-float-down" style={{ animationDelay: '0.3s' }}>
              <ActivityFeed />
            </div>
          </div>

          {/* Quick Actions Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="modern-card p-6 sticky top-8 animate-float-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsCalendarModalOpen(true)}
                  className="w-full text-left p-4 hover:bg-blue-50 rounded-lg transition-all duration-300 flex items-center space-x-3 border border-gray-200 hover:border-blue-300 hover:shadow-md group"
                >
                  <Calendar className="h-5 w-5 text-blue-600 group-hover:animate-pulse" />
                  <div>
                    <span className="text-gray-900 font-medium block">View Calendar</span>
                    <span className="text-gray-500 text-sm">Check deadlines</span>
                  </div>
                </button>
                
                <Link
                  to="/employee-profile?tab=edit"
                  className="w-full text-left p-4 hover:bg-purple-50 rounded-lg transition-all duration-300 flex items-center space-x-3 border border-gray-200 hover:border-purple-300 hover:shadow-md group"
                >
                  <UserCog className="h-5 w-5 text-purple-600 group-hover:animate-pulse" />
                  <div>
                    <span className="text-gray-900 font-medium block">Profile Settings</span>
                    <span className="text-gray-500 text-sm">Edit profile & skills</span>
                  </div>
                </Link>
                
                <Link
                  to="/employee-profile?tab=profile"
                  className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-all duration-300 flex items-center space-x-3 border border-gray-200 hover:border-gray-300 hover:shadow-md group"
                >
                  <Settings className="h-5 w-5 text-gray-600 group-hover:animate-pulse" />
                  <div>
                    <span className="text-gray-900 font-medium block">View Profile</span>
                    <span className="text-gray-500 text-sm">Profile overview</span>
                  </div>
                </Link>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 animate-float-down">
                <h4 className="font-medium text-gray-900 mb-4">Quick Stats</h4>
                <div className="space-y-3">
                  {overdueProjects > 0 && (
                    <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <span className="text-sm text-gray-600">Overdue Projects</span>
                      <div className="flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
                        <span className="text-sm font-medium text-red-600">{overdueProjects}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Projects</span>
                    <span className="text-sm font-medium text-blue-600">{projects.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <span className="text-sm text-gray-600">Completed Projects</span>
                    <span className="text-sm font-medium text-green-600">{projects.filter(p => p.status === 'completed').length}</span>
                  </div>
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