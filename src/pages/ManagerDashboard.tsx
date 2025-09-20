import React from 'react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Target, TrendingUp, Calendar, Plus, UserCheck, AlertCircle, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import CreateProjectModal from '../components/CreateProjectModal';
import ProjectCard from '../components/ProjectCard';

export default function ManagerDashboard() {
  const { userProfile } = useAuth();
  const { projects, employees, loading, updateProjectStatus } = useProjects();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Calculate statistics
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const projectsInReview = projects.filter(p => p.status === 'review').length;
  const overdueProjects = projects.filter(p => new Date() > p.deadline && p.status !== 'completed').length;
  const totalEmployees = employees.length;
  const averageProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;

  const stats = [
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Team Members",
      value: totalEmployees.toString(),
      change: `${totalEmployees} total employees`
    },
    {
      icon: <Target className="h-6 w-6 text-green-600" />,
      title: "Active Projects",
      value: activeProjects.toString(),
      change: `${completedProjects} completed`
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      title: "Average Progress",
      value: `${averageProgress}%`,
      change: `${projectsInReview} in review`
    },
    {
      icon: <AlertCircle className="h-6 w-6 text-red-600" />,
      title: "Overdue Projects",
      value: overdueProjects.toString(),
      change: overdueProjects > 0 ? "Needs attention" : "All on track"
    }
  ];

  const recentProjects = projects.slice(0, 6);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manager Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {userProfile?.name || 'Manager'}! Here's your team overview
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2">
              onClick={() => setIsCreateModalOpen(true)}
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </button>
          </div>
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
              <p className={`text-sm ${stat.title === 'Overdue Projects' && overdueProjects > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
            {projects.length > 6 && (
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                View All Projects
              </button>
            )}
          </div>
          
          {projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-600 mb-6">Create your first project to get started with team management.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isManager={true}
                  onStatusUpdate={updateProjectStatus}
                />
              ))}
            </div>
            
            {/* Projects Pending Review */}
            {projectsInReview > 0 && (
              <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                  Projects Pending Review ({projectsInReview})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects
                    .filter(p => p.status === 'review')
                    .map((project) => (
                      <div key={project.id} className="border border-purple-200 rounded-lg p-4 bg-purple-50 hover:shadow-md transition-shadow duration-200">
                        <h4 className="font-medium text-gray-900 mb-2">{project.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Submitted by: {project.assignedEmployeeNames.join(', ')}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-600">Progress: {project.progress}%</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateProjectStatus(project.id, 'completed', 100)}
                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                          >
                            Approve & Complete
                          </button>
                          <button
                            onClick={() => updateProjectStatus(project.id, 'in-progress', Math.max(project.progress - 10, 0))}
                            className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors duration-200"
                          >
                            Request Changes
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Overview */}
          <div className="lg:col-span-2">
            {/* Team Members */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Team Overview</h2>
                <span className="text-sm text-gray-500">{employees.length} members</span>
              </div>
              
              {employees.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No team members found</p>
                  <p className="text-sm text-gray-400 mt-1">Employees will appear here once they sign up</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employees.map((employee) => {
                    const employeeProjects = projects.filter(p => 
                      p.assignedEmployees.includes(employee.uid)
                    );
                    const activeProjects = employeeProjects.filter(p => 
                      p.status === 'in-progress' || p.status === 'review'
                    );
                    
                    return (
                      <div key={employee.uid} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {employee.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                            <p className="text-sm text-gray-600">{employee.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Active Projects:</span>
                          <span className="font-medium text-gray-900">{activeProjects.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-gray-600">Total Projects:</span>
                          <span className="font-medium text-gray-900">{employeeProjects.length}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3"
                >
                  <Plus className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Create Project</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">View Reports</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Manage Team</span>
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

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          employees={employees}
        />
      </div>
    </div>
  );
}