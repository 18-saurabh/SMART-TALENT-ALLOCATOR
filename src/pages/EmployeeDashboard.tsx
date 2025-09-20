import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Calendar, CheckCircle, Clock, Target, BarChart3, AlertCircle, TrendingUp } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';

export default function EmployeeDashboard() {
  const { userProfile } = useAuth();
  const { projects, loading, updateProjectStatus } = useProjects();

  // Calculate statistics
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const projectsInReview = projects.filter(p => p.status === 'review').length;
  const overdueProjects = projects.filter(p => new Date() > p.deadline && p.status !== 'completed').length;
  const totalHours = projects.reduce((sum, p) => sum + (p.progress * 0.4), 0); // Estimated hours based on progress
  const averageProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;

  const stats = [
    {
      icon: <Target className="h-6 w-6 text-blue-600" />,
      title: "Active Projects",
      value: activeProjects.toString(),
      change: `${completedProjects} completed`
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      title: "In Review",
      value: projectsInReview.toString(),
      change: "Awaiting feedback"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      title: "Average Progress",
      value: `${averageProgress}%`,
      change: "Across all projects"
    },
    {
      icon: <AlertCircle className="h-6 w-6 text-red-600" />,
      title: "Overdue",
      value: overdueProjects.toString(),
      change: overdueProjects > 0 ? "Need attention" : "All on track"
    }
  ];

  const upcomingDeadlines = projects
    .filter(p => p.status !== 'completed')
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    .slice(0, 5);

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
            Here's your dashboard overview for today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className={`text-sm ${stat.title === 'Overdue' && overdueProjects > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
            <span className="text-sm text-gray-500">{projects.length} total</span>
          </div>
          
          {projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Assigned</h3>
              <p className="text-gray-600">You don't have any projects assigned yet. Check back later or contact your manager.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isManager={false}
                  onStatusUpdate={updateProjectStatus}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400 mt-1">Your project activities will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project) => {
                    const isOverdue = new Date() > project.deadline && project.status !== 'completed';
                    
                    return (
                      <div key={project.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                        <div className={`w-3 h-3 rounded-full ${
                          project.status === 'completed' ? 'bg-green-500' :
                          project.status === 'in-progress' ? 'bg-blue-500' :
                          project.status === 'review' ? 'bg-purple-500' :
                          project.status === 'on-hold' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`} />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{project.title}</h3>
                          <p className="text-sm text-gray-600">
                            {project.status.replace('-', ' ').toUpperCase()} • {project.progress}% complete
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {project.deadline.toLocaleDateString()}
                          </p>
                          {isOverdue && (
                            <p className="text-xs text-red-500">Overdue</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Profile & Quick Actions */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{userProfile?.name}</h3>
                  <p className="text-gray-600 text-sm capitalize">{userProfile?.role}</p>
                  <p className="text-gray-500 text-sm">{userProfile?.email}</p>
                </div>
              </div>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
                Edit Profile
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">View Calendar</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">My Performance</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3">
                  <User className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Update Profile</span>
                </button>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming deadlines</p>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((project) => {
                    const daysLeft = Math.ceil((project.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysLeft < 0;
                    
                    return (
                      <div key={project.id} className={`p-3 rounded-lg ${isOverdue ? 'bg-red-50' : daysLeft <= 3 ? 'bg-yellow-50' : 'bg-blue-50'}`}>
                        <p className={`text-sm font-medium ${isOverdue ? 'text-red-900' : daysLeft <= 3 ? 'text-yellow-900' : 'text-blue-900'}`}>
                          {project.title}
                        </p>
                        <p className={`text-xs ${isOverdue ? 'text-red-700' : daysLeft <= 3 ? 'text-yellow-700' : 'text-blue-700'}`}>
                          {isOverdue ? `Overdue by ${Math.abs(daysLeft)} days` : `${daysLeft} days left`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}