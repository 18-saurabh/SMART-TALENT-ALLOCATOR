import React, { useState, useEffect } from 'react';
import { X, Users, Search, Star, Plus, Minus, Sparkles, CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useEmployees } from '../hooks/useEmployees';
import { geminiService, EmployeeRecommendation } from '../services/geminiService';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamManagementModal({ isOpen, onClose }: TeamManagementModalProps) {
  const { projects, updateProject } = useProjects();
  const { allEmployees } = useEmployees();
  const [selectedProject, setSelectedProject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<EmployeeRecommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  
  // Filter employees based on search term
  const filteredEmployees = allEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.skills.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Generate recommendations when project is selected
  useEffect(() => {
    const generateRecommendations = async () => {
      if (!selectedProjectData || allEmployees.length === 0) {
        setRecommendations([]);
        return;
      }

      setRecommendationsLoading(true);
      try {
        // Extract skills from project tags and description
        const projectSkills = [
          ...selectedProjectData.tags,
          // Simple keyword extraction from description
          ...selectedProjectData.description.toLowerCase().match(/\b(react|javascript|python|node|angular|vue|typescript|java|php|css|html|sql|mongodb|postgresql|aws|docker|kubernetes|git|agile|scrum)\b/g) || []
        ];

        const projectRequirements = {
          title: selectedProjectData.title,
          description: selectedProjectData.description,
          requiredSkills: [...new Set(projectSkills)], // Remove duplicates
          priority: selectedProjectData.priority,
          budget: selectedProjectData.budget
        };

        // Get employees not currently assigned to this project
        const availableEmployees = allEmployees.filter(emp => 
          !selectedProjectData.assignedEmployees.includes(emp.uid)
        );

        if (availableEmployees.length > 0) {
          const recs = await geminiService.generateEmployeeRecommendations(
            projectRequirements,
            availableEmployees
          );
          
          setRecommendations(recs);
          setShowRecommendations(true);
        }
      } catch (error) {
        console.error('Error generating recommendations:', error);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    generateRecommendations();
  }, [selectedProject, selectedProjectData, allEmployees]);

  const handleAddEmployee = async (employeeId: string) => {
    if (!selectedProjectData) return;

    setLoading(true);
    try {
      const employee = allEmployees.find(emp => emp.uid === employeeId);
      if (!employee) return;

      const updatedAssignedEmployees = [...selectedProjectData.assignedEmployees, employeeId];
      const updatedAssignedEmployeeNames = [...selectedProjectData.assignedEmployeeNames, employee.name];

      await updateProject(selectedProjectData.id, {
        assignedEmployees: updatedAssignedEmployees,
        assignedEmployeeNames: updatedAssignedEmployeeNames
      });

      // Remove from recommendations
      setRecommendations(prev => prev.filter(rec => rec.employee.uid !== employeeId));
    } catch (error) {
      console.error('Error adding employee to project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    if (!selectedProjectData) return;

    setLoading(true);
    try {
      const updatedAssignedEmployees = selectedProjectData.assignedEmployees.filter(id => id !== employeeId);
      const employee = allEmployees.find(emp => emp.uid === employeeId);
      const updatedAssignedEmployeeNames = selectedProjectData.assignedEmployeeNames.filter(name => name !== employee?.name);

      await updateProject(selectedProjectData.id, {
        assignedEmployees: updatedAssignedEmployees,
        assignedEmployeeNames: updatedAssignedEmployeeNames
      });
    } catch (error) {
      console.error('Error removing employee from project:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'limited': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'unavailable': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Project Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project to Manage
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a project...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title} ({project.assignedEmployees.length} members)
                </option>
              ))}
            </select>
          </div>

          {selectedProjectData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Current Team */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Current Team ({selectedProjectData.assignedEmployees.length})
                  </h3>
                  
                  {selectedProjectData.assignedEmployees.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No team members assigned</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedProjectData.assignedEmployees.map(employeeId => {
                        const employee = allEmployees.find(emp => emp.uid === employeeId);
                        if (!employee) return null;

                        return (
                          <div key={employeeId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-600">
                                  {employee.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{employee.name}</p>
                                <p className="text-xs text-gray-500">{employee.email}</p>
                                <div className="flex items-center space-x-1 mt-1">
                                  {getAvailabilityIcon(employee.availability)}
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(employee.availability)}`}>
                                    {employee.availability}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveEmployee(employeeId)}
                              disabled={loading}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors duration-200"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Available Employees & Recommendations */}
              <div className="lg:col-span-2">
                {/* AI Recommendations */}
                {showRecommendations && recommendations.length > 0 && (
                  <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
                      {recommendationsLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.slice(0, 4).map((rec) => (
                        <div key={rec.employee.uid} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
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
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-700 mb-1">Matching Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {rec.skillMatches.slice(0, 3).map((skill, index) => (
                                  <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md flex items-center">
                                    <Star className="h-3 w-3 mr-1" />
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(rec.employee.availability)}`}>
                              {rec.employee.availability}
                            </span>
                            <button
                              onClick={() => handleAddEmployee(rec.employee.uid)}
                              disabled={loading}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-xs"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Available Employees */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Available Employees</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search employees..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {filteredEmployees
                      .filter(emp => !selectedProjectData.assignedEmployees.includes(emp.uid))
                      .map((employee) => (
                        <div key={employee.uid} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-gray-600">
                                  {employee.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{employee.name}</h4>
                                <p className="text-xs text-gray-500">{employee.email}</p>
                                {employee.department && (
                                  <p className="text-xs text-gray-400">{employee.department}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddEmployee(employee.uid)}
                              disabled={loading}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-200"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-1">
                              {getAvailabilityIcon(employee.availability)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(employee.availability)}`}>
                                {employee.availability}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">{employee.skills.length} skills</span>
                          </div>

                          {employee.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {employee.skills.slice(0, 3).map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                  {skill.name}
                                </span>
                              ))}
                              {employee.skills.length > 3 && (
                                <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md">
                                  +{employee.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {filteredEmployees.filter(emp => !selectedProjectData.assignedEmployees.includes(emp.uid)).length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No available employees found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!selectedProject && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Project</h3>
              <p className="text-gray-600">Choose a project from the dropdown above to manage its team members</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}