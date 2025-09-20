import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Tag, IndianRupee, Sparkles, Star, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useProjects, Employee } from '../hooks/useProjects';
import { geminiService, EmployeeRecommendation } from '../services/geminiService';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
}

export default function CreateProjectModal({ isOpen, onClose, employees }: CreateProjectModalProps) {
  const { createProject } = useProjects();
  const [loading, setLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<EmployeeRecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    deadline: '',
    assignedEmployees: [] as string[],
    budget: '',
    tags: '',
    requiredSkills: ''
  });

  // Generate recommendations when project details change
  useEffect(() => {
    const generateRecommendations = async () => {
      if (!formData.title || !formData.description || employees.length === 0) {
        setRecommendations([]);
        return;
      }

      setRecommendationsLoading(true);
      try {
        const requiredSkills = formData.requiredSkills
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill);

        const projectRequirements = {
          title: formData.title,
          description: formData.description,
          requiredSkills,
          priority: formData.priority,
          budget: formData.budget ? parseFloat(formData.budget) : undefined
        };

        const recs = await geminiService.generateEmployeeRecommendations(
          projectRequirements,
          employees
        );
        
        setRecommendations(recs);
        if (recs.length > 0) {
          setShowRecommendations(true);
        }
      } catch (error) {
        console.error('Error generating recommendations:', error);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    const debounceTimer = setTimeout(generateRecommendations, 1000);
    return () => clearTimeout(debounceTimer);
  }, [formData.title, formData.description, formData.requiredSkills, formData.priority, formData.budget, employees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const assignedEmployeeNames = employees
        .filter(emp => formData.assignedEmployees.includes(emp.uid))
        .map(emp => emp.name);

      await createProject({
        title: formData.title,
        description: formData.description,
        status: 'planning',
        priority: formData.priority,
        progress: 0,
        managerId: '',
        managerName: '',
        assignedEmployees: formData.assignedEmployees,
        assignedEmployeeNames,
        deadline: new Date(formData.deadline),
        budget: formData.budget ? parseFloat(formData.budget) : null,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        deadline: '',
        assignedEmployees: [],
        budget: '',
        tags: '',
        requiredSkills: ''
      });
      setRecommendations([]);
      setShowRecommendations(false);
      
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedEmployees: prev.assignedEmployees.includes(employeeId)
        ? prev.assignedEmployees.filter(id => id !== employeeId)
        : [...prev.assignedEmployees, employeeId]
    }));
  };

  const getAvailabilityIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'limited': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'unavailable': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="flex">
          {/* Form Section */}
          <div className="flex-1 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter project title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Describe the project goals and requirements"
                />
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </label>
                <input
                  type="text"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiredSkills: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter required skills separated by commas (e.g., React, Node.js, Python)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Adding required skills will help generate better employee recommendations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <IndianRupee className="inline h-4 w-4 mr-1" />
                  Budget (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter project budget in INR"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="inline h-4 w-4 mr-1" />
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter tags separated by commas (e.g., frontend, urgent, client-work)"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>

          {/* Recommendations Section */}
          <div className="w-96 border-l border-gray-200 bg-gray-50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                  AI Recommendations
                </h3>
                {recommendationsLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                )}
              </div>

              {!showRecommendations && !recommendationsLoading && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Fill in project details to get AI-powered employee recommendations
                  </p>
                </div>
              )}

              {recommendationsLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
                  <p className="text-gray-500 text-sm">Generating recommendations...</p>
                </div>
              )}

              {showRecommendations && recommendations.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.employee.uid}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        formData.assignedEmployees.includes(rec.employee.uid)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => handleEmployeeToggle(rec.employee.uid)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{rec.employee.name}</h4>
                          <p className="text-xs text-gray-500">{rec.employee.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getAvailabilityIcon(rec.availabilityStatus)}
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(rec.score)}`}>
                            {rec.score}%
                          </span>
                        </div>
                      </div>

                      {rec.skillMatches.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-gray-700 mb-1">Matching Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {rec.skillMatches.slice(0, 3).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md flex items-center">
                                <Star className="h-3 w-3 mr-1" />
                                {skill}
                              </span>
                            ))}
                            {rec.skillMatches.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                +{rec.skillMatches.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {rec.reasons.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Why recommended:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {rec.reasons.slice(0, 2).map((reason, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.assignedEmployees.includes(rec.employee.uid)}
                            onChange={() => handleEmployeeToggle(rec.employee.uid)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Assign to project</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showRecommendations && recommendations.length === 0 && !recommendationsLoading && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No suitable employees found for this project
                  </p>
                </div>
              )}

              {/* Manual Assignment Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">All Employees</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {employees
                    .filter(emp => !recommendations.some(rec => rec.employee.uid === emp.uid))
                    .map((employee) => (
                      <label key={employee.uid} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.assignedEmployees.includes(employee.uid)}
                          onChange={() => handleEmployeeToggle(employee.uid)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                          <p className="text-xs text-gray-500">{employee.email}</p>
                        </div>
                      </label>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}