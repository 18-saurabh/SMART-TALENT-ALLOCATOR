import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Calendar, MapPin, Briefcase, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmployees } from '../hooks/useEmployees';

export default function ProfileCard() {
  const { userProfile } = useAuth();
  const { getCurrentEmployee } = useEmployees();
  
  const currentEmployee = getCurrentEmployee();

  return (
    <div className="modern-card p-6 group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-blue-600 animate-float-up" />
          <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
        </div>
        <Link
          to="/employee-profile?tab=edit"
          className="modern-btn text-sm flex items-center space-x-2"
        >
          <Edit3 className="h-4 w-4" />
          <span>Edit</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-pulse-glow">
          <span className="text-2xl font-bold text-blue-600">
            {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{userProfile?.name}</h3>
          <p className="text-blue-600 capitalize font-medium">{userProfile?.role}</p>
          <p className="text-gray-500 text-sm">{userProfile?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:shadow-md transition-all duration-300 group">
          <Briefcase className="h-5 w-5 text-blue-500 group-hover:animate-pulse" />
          <div>
            <p className="text-sm font-medium text-blue-700">Department</p>
            <p className="text-gray-900">{currentEmployee?.department || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all duration-300 group">
          <MapPin className="h-5 w-5 text-purple-500 group-hover:animate-pulse" />
          <div>
            <p className="text-sm font-medium text-purple-700">Position</p>
            <p className="text-gray-900">{currentEmployee?.position || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:shadow-md transition-all duration-300 group">
          <User className="h-5 w-5 text-green-500 group-hover:animate-pulse" />
          <div>
            <p className="text-sm font-medium text-green-700">Skills</p>
            <p className="text-gray-900">{currentEmployee?.skills.length || 0} listed</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg hover:shadow-md transition-all duration-300 group">
          <Calendar className="h-5 w-5 text-yellow-500 group-hover:animate-pulse" />
          <div>
            <p className="text-sm font-medium text-yellow-700">Availability</p>
            <p className={`capitalize font-medium ${
              currentEmployee?.availability === 'available' ? 'text-green-600' :
              currentEmployee?.availability === 'limited' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {currentEmployee?.availability || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <Link
            to="/employee-profile?tab=edit"
            className="flex-1 text-center py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Edit Profile
          </Link>
          <Link
            to="/employee-profile?tab=skills"
            className="flex-1 text-center py-2 px-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Manage Skills
          </Link>
        </div>
      </div>
    </div>
  );
}