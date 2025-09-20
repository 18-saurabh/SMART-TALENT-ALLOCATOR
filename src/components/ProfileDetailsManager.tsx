import React, { useState } from 'react';
import { User, Mail, Briefcase, MapPin, Calendar, Save, Edit3, X } from 'lucide-react';
import { Employee } from '../hooks/useEmployees';

interface ProfileDetailsManagerProps {
  employee: Employee;
  onUpdateProfile: (updates: Partial<Employee>) => Promise<void>;
  isEditable?: boolean;
}

export default function ProfileDetailsManager({ 
  employee, 
  onUpdateProfile,
  isEditable = true 
}: ProfileDetailsManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: employee.name || '',
    email: employee.email || '',
    department: employee.department || '',
    position: employee.position || ''
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      department: employee.department || '',
      position: employee.position || ''
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Profile Details</h3>
          {isEditable && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Full Name</p>
                <p className="text-gray-900">{employee.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Email Address</p>
                <p className="text-gray-900">{employee.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Department</p>
                <p className="text-gray-900">{employee.department || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Position</p>
                <p className="text-gray-900">{employee.position || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {employee.joinedAt && (
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-700">Member Since</p>
              <p className="text-blue-900">{employee.joinedAt.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Profile Completion Tips</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {!employee.department && <li>• Add your department for better project matching</li>}
            {!employee.position && <li>• Specify your position/role for clearer team organization</li>}
            {employee.skills.length === 0 && <li>• Add your skills to get matched with relevant projects</li>}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Edit Profile Details</h3>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email address"
                disabled
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Engineering, Marketing, Sales"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position/Role
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Senior Developer, Project Manager"
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Why update your profile?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Helps managers assign you to relevant projects</li>
            <li>• Improves team collaboration and communication</li>
            <li>• Enables better resource planning and allocation</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !formData.name.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}