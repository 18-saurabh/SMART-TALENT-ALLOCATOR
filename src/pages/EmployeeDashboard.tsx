import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, BarChart3, Settings, AlertCircle, UserCog } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userProfile?.name || 'Employee'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your personalized dashboard overview
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-3 space-y-8">
            {/* 1. My Profile */}
            <ProfileCard />
            
            {/* 2. My Performance */}
            <PerformanceCard />
            
            {/* 3. My Projects */}
            <ProjectsGrid />
            
            {/* 4. Recent Activity */}
            <ActivityFeed />
          </div>

          {/* Quick Actions Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsCalendarModalOpen(true)}
                  className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3 border border-gray-200"
                >
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="text-gray-900 font-medium block">View Calendar</span>
                    <span className="text-gray-500 text-sm">Check deadlines</span>
                  </div>
                </button>
                
                <Link
                  to="/employee-profile?tab=edit"
                  className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3 border border-gray-200"
                >
                  <UserCog className="h-5 w-5 text-purple-600" />
                  <div>
                    <span className="text-gray-900 font-medium block">Profile Settings</span>
                    <span className="text-gray-500 text-sm">Edit profile & skills</span>
                  </div>
                </Link>
                
                <Link
                  to="/employee-profile?tab=profile"
                  className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3 border border-gray-200"
                >
                  <Settings className="h-5 w-5 text-gray-600" />
                  <div>
                    <span className="text-gray-900 font-medium block">View Profile</span>
                    <span className="text-gray-500 text-sm">Profile overview</span>
                  </div>
                </Link>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Quick Stats</h4>
                <div className="space-y-3">
                  {overdueProjects > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Overdue Projects</span>
                      <div className="flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-600">{overdueProjects}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Projects</span>
                    <span className="text-sm font-medium text-gray-900">{projects.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
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