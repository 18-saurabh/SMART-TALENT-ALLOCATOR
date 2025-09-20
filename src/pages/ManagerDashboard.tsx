import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Target, TrendingUp, Calendar, Plus, UserCheck, AlertCircle } from 'lucide-react';

export default function ManagerDashboard() {
  const { userProfile } = useAuth();

  const stats = [
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Team Members",
      value: "12",
      change: "+2 this month"
    },
    {
      icon: <Target className="h-6 w-6 text-green-600" />,
      title: "Active Projects",
      value: "8",
      change: "3 completing this week"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      title: "Team Efficiency",
      value: "87%",
      change: "+5% this month"
    },
    {
      icon: <Calendar className="h-6 w-6 text-orange-600" />,
      title: "Upcoming Deadlines",
      value: "4",
      change: "Next 7 days"
    }
  ];

  const teamMembers = [
    {
      name: "Alice Johnson",
      role: "Frontend Developer",
      status: "Available",
      currentProject: "Website Redesign",
      utilization: 85
    },
    {
      name: "Bob Smith",
      role: "Backend Developer",
      status: "Busy",
      currentProject: "API Development",
      utilization: 95
    },
    {
      name: "Carol Davis",
      role: "UI/UX Designer",
      status: "Available",
      currentProject: "Mobile App Design",
      utilization: 70
    },
    {
      name: "David Wilson",
      role: "Data Analyst",
      status: "On Leave",
      currentProject: "Analytics Dashboard",
      utilization: 0
    }
  ];

  const projects = [
    {
      name: "Website Redesign",
      team: ["Alice Johnson", "Carol Davis"],
      progress: 75,
      deadline: "Dec 15, 2024",
      status: "On Track"
    },
    {
      name: "Mobile App Development",
      team: ["Bob Smith", "Alice Johnson"],
      progress: 90,
      deadline: "Dec 20, 2024",
      status: "Ahead"
    },
    {
      name: "Data Analytics Platform",
      team: ["David Wilson", "Bob Smith"],
      progress: 45,
      deadline: "Jan 15, 2025",
      status: "At Risk"
    }
  ];

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
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span>Assign Tasks</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  {stat.icon}
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-green-600">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Overview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Team Members */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Team Overview</h2>
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        member.status === 'Available' ? 'bg-green-100 text-green-800' :
                        member.status === 'Busy' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Current: {member.currentProject}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Utilization</span>
                      <span className="text-sm font-medium">{member.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          member.utilization > 90 ? 'bg-red-500' :
                          member.utilization > 70 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${member.utilization}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Status</h2>
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <div className="flex items-center space-x-2">
                        {project.status === 'At Risk' && <AlertCircle className="h-4 w-4 text-red-500" />}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'On Track' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'Ahead' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Team: {project.team.join(', ')}
                    </p>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Due: {project.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3">
                  <Plus className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Create Project</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Assign Tasks</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">View Analytics</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <span className="text-gray-700">Schedule Review</span>
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Notifications</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">New project request</p>
                  <p className="text-xs text-blue-700">2 hours ago</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Task completed</p>
                  <p className="text-xs text-green-700">4 hours ago</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900">Deadline approaching</p>
                  <p className="text-xs text-yellow-700">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}