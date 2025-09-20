import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Calendar, CheckCircle, Clock, Target, BarChart3 } from 'lucide-react';

export default function EmployeeDashboard() {
  const { userProfile } = useAuth();

  const stats = [
    {
      icon: <Target className="h-6 w-6 text-blue-600" />,
      title: "Active Projects",
      value: "3",
      change: "+1 this week"
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      title: "Completed Tasks",
      value: "24",
      change: "+5 this week"
    },
    {
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      title: "Hours Logged",
      value: "32.5",
      change: "This week"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-purple-600" />,
      title: "Performance Score",
      value: "94%",
      change: "+2% this month"
    }
  ];

  const recentProjects = [
    {
      name: "Website Redesign",
      status: "In Progress",
      progress: 75,
      deadline: "Dec 15, 2024"
    },
    {
      name: "Mobile App Development",
      status: "Review",
      progress: 90,
      deadline: "Dec 20, 2024"
    },
    {
      name: "Data Analytics Dashboard",
      status: "Planning",
      progress: 25,
      deadline: "Jan 10, 2025"
    }
  ];

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
          {/* Projects Overview */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Projects</h2>
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
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

          {/* Profile & Quick Actions */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Log Time</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">View Schedule</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">View Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}