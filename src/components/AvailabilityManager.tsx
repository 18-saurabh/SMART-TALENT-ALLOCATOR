import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Employee } from '../hooks/useEmployees';

interface AvailabilityManagerProps {
  availability: Employee['availability'];
  availabilityNotes?: string;
  onUpdateAvailability: (availability: Employee['availability'], notes?: string) => Promise<void>;
  isEditable?: boolean;
}

export default function AvailabilityManager({ 
  availability, 
  availabilityNotes, 
  onUpdateAvailability,
  isEditable = true 
}: AvailabilityManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState(availability);
  const [notes, setNotes] = useState(availabilityNotes || '');
  const [loading, setLoading] = useState(false);

  const availabilityOptions = [
    {
      value: 'available' as const,
      label: 'Available',
      description: 'Ready to take on new projects',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      value: 'limited' as const,
      label: 'Limited Availability',
      description: 'Can take on some work with constraints',
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    {
      value: 'unavailable' as const,
      label: 'Unavailable',
      description: 'Not available for new assignments',
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      color: 'bg-red-100 text-red-800 border-red-200'
    }
  ];

  const currentOption = availabilityOptions.find(opt => opt.value === availability);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdateAvailability(selectedAvailability, notes);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedAvailability(availability);
    setNotes(availabilityNotes || '');
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
          {isEditable && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Clock className="h-4 w-4" />
              <span>Update</span>
            </button>
          )}
        </div>

        <div className={`p-4 rounded-lg border ${currentOption?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
          <div className="flex items-center space-x-3 mb-2">
            {currentOption?.icon}
            <span className="font-medium">{currentOption?.label}</span>
          </div>
          <p className="text-sm opacity-90 mb-2">{currentOption?.description}</p>
          {availabilityNotes && (
            <div className="mt-3 pt-3 border-t border-current border-opacity-20">
              <p className="text-sm font-medium mb-1">Notes:</p>
              <p className="text-sm opacity-90">{availabilityNotes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Update Availability</h3>
      </div>

      <div className="space-y-3">
        {availabilityOptions.map((option) => (
          <label
            key={option.value}
            className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedAvailability === option.value
                ? option.color
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="availability"
              value={option.value}
              checked={selectedAvailability === option.value}
              onChange={(e) => setSelectedAvailability(e.target.value as Employee['availability'])}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {option.icon}
                <span className="font-medium">{option.label}</span>
              </div>
              <p className="text-sm opacity-90">{option.description}</p>
            </div>
          </label>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          placeholder="Add any specific details about your availability, working hours, or constraints..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}