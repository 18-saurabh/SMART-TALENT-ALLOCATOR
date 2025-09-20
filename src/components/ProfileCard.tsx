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
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
        <Link
          to="/employee-profile?tab=edit"
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Edit3 className="h-4 w-4" />
          <span>Edit</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-blue-600">
            {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{userProfile?.name}</h3>
          <p className="text-gray-600 capitalize">{userProfile?.role}</p>
          <p className="text-gray-500 text-sm">{userProfile?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Briefcase className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Department</p>
            <p className="text-gray-900">{currentEmployee?.department || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <MapPin className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Position</p>
            <p className="text-gray-900">{currentEmployee?.position || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <User className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Skills</p>
            <p className="text-gray-900">{currentEmployee?.skills.length || 0} listed</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Availability</p>
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
            className="flex-1 text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Edit Profile
          </Link>
          <Link
            to="/employee-profile?tab=skills"
            className="flex-1 text-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Manage Skills
          </Link>
        </div>
      </div>
    </div>
  );
}