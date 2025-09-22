import React from 'react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Target, TrendingUp, Calendar, Plus, UserCheck, AlertCircle, BarChart3, Clock, CheckCircle, Search, Star } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useEmployees } from '../hooks/useEmployees';
import CreateProjectModal from '../components/CreateProjectModal';
import ReportsModal from '../components/ReportsModal';
import TeamManagementModal from '../components/TeamManagementModal';
import ProjectCard from '../components/ProjectCard';
import EmployeeSearch from '../components/EmployeeSearch';
import SkillsManager from '../components/SkillsManager';
import AvailabilityManager from '../components/AvailabilityManager';

export default function ManagerDashboard() {
  const { userProfile } = useAuth();
  const { projects, loading: projectsLoading, updateProjectStatus } = useProjects();
  const { 
    employees, 
    allEmployees,
    loading: employeesLoading, 
    filterEmployees, 
    resetFilters, 
    getSkillSuggestions 
  } = useEmployees();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isTeamManagementModalOpen, setIsTeamManagementModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const loading = projectsLoading || employeesLoading;

  // Calculate statistics
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const projectsInReview = projects.filter(p => p.status === 'review').length;
  const overdueProjects = projects.filter(p => new Date() > p.deadline && p.status !== 'completed').length;
  const totalEmployees = allEmployees.length;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float-up"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float-down"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float-rotate"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-blue-600 animate-float-rotate" />
              <span className="text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
                Manager Dashboard
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 animate-float-up">
              Welcome back, <span className="gradient-text">{userProfile?.name || 'Manager'}</span>!
            </h1>
            <p className="text-gray-600 mt-2 animate-float-down">
              Here's your team overview and project management hub
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="modern-btn px-4 py-2 font-medium flex items-center space-x-2 animate-pulse-glow"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="modern-card p-6 group animate-float-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg group-hover:shadow-md transition-all duration-300">
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
        <div className="mb-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 animate-float-up">Recent Projects</h2>
            {projects.length > 6 && (
              <button className="text-blue-600 hover:text-blue-700 font-medium animate-float-down">
                View All Projects
              </button>
            )}
          </div>
          
          {projects.length === 0 ? (
            <div className="modern-card p-12 text-center animate-float-up">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-600 mb-6">Create your first project to get started with team management.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="modern-btn px-6 py-3 font-medium animate-pulse-glow"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-float-up">
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
                <div className="mt-8 modern-card p-6 animate-float-down">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-2 animate-pulse" />
                    Projects Pending Review ({projectsInReview})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects
                      .filter(p => p.status === 'review')
                      .map((project) => (
                        <div key={project.id} className="border border-purple-200 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
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
                              className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                            >
                              Approve & Complete
                            </button>
                            <button
                              onClick={() => updateProjectStatus(project.id, 'in-progress', Math.max(project.progress - 10, 0))}
                              className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                            >
                              Request Changes
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {/* Team Overview */}
          <div className="lg:col-span-2">
            {/* Employee Search and Filter */}
            <div className="mb-6 animate-float-up">
              <EmployeeSearch
                employees={allEmployees}
                onFilter={filterEmployees}
                onReset={resetFilters}
                skillSuggestions={getSkillSuggestions()}
              />
            </div>

            {/* Team Members */}
            <div className="modern-card p-6 animate-float-down">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Team Overview
                  {employees.length !== allEmployees.length && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Filtered: {employees.length} of {allEmployees.length})
                    </span>
                  )}
                </h2>
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
                    
                    const getAvailabilityColor = (availability: string) => {
                      switch (availability) {
                        case 'available': return 'bg-green-100 text-green-800';
                        case 'limited': return 'bg-yellow-100 text-yellow-800';
                        case 'unavailable': return 'bg-red-100 text-red-800';
                        default: return 'bg-gray-100 text-gray-800';
                      }
                    };
                    
                    return (
                      <div 
                        key={employee.uid} 
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white/90"
                        onClick={() => setSelectedEmployee(selectedEmployee === employee.uid ? null : employee.uid)}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-pulse-glow">
                            <span className="text-blue-600 font-semibold text-sm">
                              {employee.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                            <p className="text-sm text-gray-600">{employee.email}</p>
                            {employee.department && (
                              <p className="text-xs text-gray-500">{employee.department}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(employee.availability)} animate-pulse`}>
                              {employee.availability}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                          <div className="text-center">
                            <span className="block font-medium text-gray-900">{activeProjects.length}</span>
                            <span className="text-gray-600">Active</span>
                          </div>
                          <div className="text-center">
                            <span className="block font-medium text-gray-900">{employeeProjects.length}</span>
                            <span className="text-gray-600">Total</span>
                          </div>
                          <div className="text-center">
                            <span className="block font-medium text-gray-900">{employee.skills.length}</span>
                            <span className="text-gray-600">Skills</span>
                          </div>
                        </div>
                        
                        {/* Top Skills Preview */}
                        {employee.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {employee.skills.slice(0, 3).map((skill, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 text-xs rounded-md flex items-center hover:shadow-sm transition-all duration-300"
                              >
                                <Star className="h-3 w-3 mr-1 animate-pulse" />
                                {skill.name}
                              </span>
                            ))}
                            {employee.skills.length > 3 && (
                              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                                +{employee.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Expanded Details */}
                        {selectedEmployee === employee.uid && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 animate-float-down">
                            <SkillsManager
                              skills={employee.skills}
                              onAddSkill={async () => {}}
                              onRemoveSkill={async () => {}}
                              skillSuggestions={[]}
                              isEditable={false}
                            />
                            <AvailabilityManager
                              availability={employee.availability}
                              availabilityNotes={employee.availabilityNotes}
                              onUpdateAvailability={async () => {}}
                              isEditable={false}
                            />
                          </div>
                        )}
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
            <div className="modern-card p-6 animate-float-up sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full text-left p-3 hover:bg-blue-50 rounded-lg transition-all duration-300 flex items-center space-x-3 border border-transparent hover:border-blue-200 hover:shadow-md group"
                >
                  <Plus className="h-5 w-5 text-blue-600 group-hover:animate-pulse" />
                  <span className="text-gray-700">Create Project</span>
                </button>
                <button 
                  onClick={() => setIsReportsModalOpen(true)}
                  className="w-full text-left p-3 hover:bg-purple-50 rounded-lg transition-all duration-300 flex items-center space-x-3 border border-transparent hover:border-purple-200 hover:shadow-md group"
                >
                  <BarChart3 className="h-5 w-5 text-purple-600 group-hover:animate-pulse" />
                  <span className="text-gray-700">View Reports</span>
                </button>
                <button 
                  onClick={() => setIsTeamManagementModalOpen(true)}
                  className="w-full text-left p-3 hover:bg-green-50 rounded-lg transition-all duration-300 flex items-center space-x-3 border border-transparent hover:border-green-200 hover:shadow-md group"
                >
                  <Users className="h-5 w-5 text-green-600 group-hover:animate-pulse" />
                  <span className="text-gray-700">Manage Team</span>
                </button>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="modern-card p-6 animate-float-down">
              <h3 className="font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming deadlines</p>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((project) => {
                    const daysLeft = Math.ceil((project.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysLeft < 0;
                    const isCompleted = project.status === 'completed';
                    
                    return (
                      <div key={project.id} className={`p-3 rounded-lg ${
                        isCompleted ? 'bg-green-50' :
                        isOverdue ? 'bg-red-50' : 
                        daysLeft <= 3 ? 'bg-yellow-50' : 'bg-blue-50'
                      } hover:shadow-md transition-all duration-300`}>
                        <p className={`text-sm font-medium ${
                          isCompleted ? 'text-green-900' :
                          isOverdue ? 'text-red-900' : 
                          daysLeft <= 3 ? 'text-yellow-900' : 'text-blue-900'
                        }`}>
                          {project.title}
                        </p>
                        <p className={`text-xs ${
                          isCompleted ? 'text-green-700' :
                          isOverdue ? 'text-red-700' : 
                          daysLeft <= 3 ? 'text-yellow-700' : 'text-blue-700'
                        }`}>
                          {isCompleted ? 'Completed' :
                           isOverdue ? `Overdue by ${Math.abs(daysLeft)} days` : 
                           `${daysLeft} days left`}
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
          employees={allEmployees}
        />

        {/* Reports Modal */}
        <ReportsModal
          isOpen={isReportsModalOpen}
          onClose={() => setIsReportsModalOpen(false)}
        />

        {/* Team Management Modal */}
        <TeamManagementModal
          isOpen={isTeamManagementModalOpen}
          onClose={() => setIsTeamManagementModalOpen(false)}
        />
      </div>
    </div>
  );
}