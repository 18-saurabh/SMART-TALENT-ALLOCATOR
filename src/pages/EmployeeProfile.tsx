import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmployees } from '../hooks/useEmployees';
import { User, Mail, Calendar, MapPin, Briefcase } from 'lucide-react';
import SkillsManager from '../components/SkillsManager';
import AvailabilityManager from '../components/AvailabilityManager';

export default function EmployeeProfile() {
  const { userProfile } = useAuth();
  const { 
    getCurrentEmployee, 
    addSkill, 
    removeSkill, 
    updateAvailability, 
    getSkillSuggestions,
    loading 
  } = useEmployees();

  const currentEmployee = getCurrentEmployee();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!currentEmployee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load your employee profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your skills and availability to help with better project allocation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-blue-600">
                    {currentEmployee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{currentEmployee.name}</h2>
                <p className="text-gray-600 capitalize">{currentEmployee.role}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{currentEmployee.email}</span>
                </div>

                {currentEmployee.department && (
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{currentEmployee.department}</span>
                  </div>
                )}

                {currentEmployee.position && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{currentEmployee.position}</span>
                  </div>
                )}

                {currentEmployee.joinedAt && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">
                      Joined {currentEmployee.joinedAt.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Profile last updated
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {currentEmployee.lastUpdated 
                      ? currentEmployee.lastUpdated.toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills and Availability */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <SkillsManager
                skills={currentEmployee.skills}
                onAddSkill={addSkill}
                onRemoveSkill={removeSkill}
                skillSuggestions={getSkillSuggestions()}
                isEditable={true}
              />
            </div>

            {/* Availability Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <AvailabilityManager
                availability={currentEmployee.availability}
                availabilityNotes={currentEmployee.availabilityNotes}
                onUpdateAvailability={updateAvailability}
                isEditable={true}
              />
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{currentEmployee.skills.length}</p>
                  <p className="text-sm text-blue-700">Skills Listed</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {currentEmployee.skills.filter(s => s.level === 'expert' || s.level === 'advanced').length}
                  </p>
                  <p className="text-sm text-green-700">Advanced+ Skills</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}