import React, { useState } from 'react';
import { Search, Filter, X, Users, Star, Clock } from 'lucide-react';
import { Employee } from '../hooks/useEmployees';

interface EmployeeSearchProps {
  employees: Employee[];
  onFilter: (filters: {
    skills?: string[];
    availability?: Employee['availability'][];
    department?: string;
    searchTerm?: string;
  }) => void;
  onReset: () => void;
  skillSuggestions: string[];
}

export default function EmployeeSearch({ 
  employees, 
  onFilter, 
  onReset, 
  skillSuggestions 
}: EmployeeSearchProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: '',
    skills: [] as string[],
    availability: [] as Employee['availability'][],
    department: ''
  });

  const availabilityOptions = [
    { value: 'available', label: 'Available', color: 'text-green-600' },
    { value: 'limited', label: 'Limited', color: 'text-yellow-600' },
    { value: 'unavailable', label: 'Unavailable', color: 'text-red-600' }
  ];

  const handleSearchChange = (searchTerm: string) => {
    const newFilters = { ...filters, searchTerm };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    
    const newFilters = { ...filters, skills: newSkills };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleAvailabilityToggle = (availability: Employee['availability']) => {
    const newAvailability = filters.availability.includes(availability)
      ? filters.availability.filter(a => a !== availability)
      : [...filters.availability, availability];
    
    const newFilters = { ...filters, availability: newAvailability };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleDepartmentChange = (department: string) => {
    const newFilters = { ...filters, department };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      searchTerm: '',
      skills: [],
      availability: [],
      department: ''
    };
    setFilters(resetFilters);
    onReset();
  };

  const hasActiveFilters = filters.searchTerm || filters.skills.length > 0 || 
                          filters.availability.length > 0 || filters.department;

  const getSkillCount = (skillName: string) => {
    return employees.filter(emp => 
      emp.skills.some(skill => 
        skill.name.toLowerCase().includes(skillName.toLowerCase())
      )
    ).length;
  };

  return (
    <div className="modern-card p-6 animate-float-up hover:shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center animate-float-up">
          <Users className="h-5 w-5 mr-2" />
          Team Search & Filter
        </h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:shadow-md transition-all duration-300 border border-gray-300"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isFilterOpen ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600 shadow-md border border-blue-200' : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:shadow-md border border-gray-300'
            }`}
          >
            <Filter className={`h-4 w-4 ${isFilterOpen ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4 animate-float-down">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={filters.searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name, email, department, or position..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90"
        />
      </div>

      {/* Advanced Filters */}
      {isFilterOpen && (
        <div className="space-y-4 pt-4 border-t border-gray-200 animate-float-up">
          {/* Skills Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {skillSuggestions.slice(0, 12).map((skill) => {
                const count = getSkillCount(skill);
                const isSelected = filters.skills.includes(skill);
                
                return (
                  <button
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-1 hover:shadow-md ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border border-blue-700'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300'
                    }`}
                  >
                    <span>{skill}</span>
                    <span className={`text-xs ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Availability
            </label>
            <div className="flex flex-wrap gap-2">
              {availabilityOptions.map((option) => {
                const isSelected = filters.availability.includes(option.value as Employee['availability']);
                const count = employees.filter(emp => emp.availability === option.value).length;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleAvailabilityToggle(option.value as Employee['availability'])}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-1 hover:shadow-md ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border border-blue-700'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border border-gray-300'
                    }`}
                  >
                    <Clock className={`h-3 w-3 ${isSelected ? 'animate-pulse' : ''}`} />
                    <span>{option.label}</span>
                    <span className={`text-xs ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <input
              type="text"
              value={filters.department}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              placeholder="Filter by department..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90"
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 animate-float-up">
          <div className="flex flex-wrap gap-2">
            {filters.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 text-xs rounded-full border border-blue-200 hover:shadow-md transition-all duration-300"
              >
                <Star className="h-3 w-3 mr-1 animate-pulse" />
                {skill}
                <button
                  onClick={() => handleSkillToggle(skill)}
                  className="ml-1 hover:text-blue-600 transition-colors duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.availability.map((availability) => (
              <span
                key={availability}
                className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs rounded-full border border-green-200 hover:shadow-md transition-all duration-300"
              >
                <Clock className="h-3 w-3 mr-1 animate-pulse" />
                {availability}
                <button
                  onClick={() => handleAvailabilityToggle(availability)}
                  className="ml-1 hover:text-green-600 transition-colors duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}