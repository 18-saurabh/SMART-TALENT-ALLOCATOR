import React, { useState } from 'react';
import { Plus, X, Star, Trash2, Edit3, Check, AlertTriangle } from 'lucide-react';
import { Skill } from '../hooks/useEmployees';

interface SkillsManagerProps {
  skills: Skill[];
  onAddSkill: (skill: Skill) => Promise<void>;
  onRemoveSkill: (skillName: string) => Promise<void>;
  skillSuggestions: string[];
  isEditable?: boolean;
}

export default function SkillsManager({ 
  skills, 
  onAddSkill, 
  onRemoveSkill, 
  skillSuggestions,
  isEditable = true 
}: SkillsManagerProps) {
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [skillToDelete, setSkillToDelete] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState<Skill>({
    name: '',
    level: 'beginner',
    yearsOfExperience: 0
  });
  const [editingSkillData, setEditingSkillData] = useState<Skill>({
    name: '',
    level: 'beginner',
    yearsOfExperience: 0
  });
  const [loading, setLoading] = useState(false);

  const skillLevels: Array<{ value: Skill['level']; label: string; color: string }> = [
    { value: 'beginner', label: 'Beginner', color: 'bg-gray-100 text-gray-800' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
    { value: 'advanced', label: 'Advanced', color: 'bg-green-100 text-green-800' },
    { value: 'expert', label: 'Expert', color: 'bg-purple-100 text-purple-800' }
  ];

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;

    setLoading(true);
    try {
      await onAddSkill(newSkill);
      setNewSkill({ name: '', level: 'beginner', yearsOfExperience: 0 });
      setIsAddingSkill(false);
    } catch (error) {
      console.error('Error adding skill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill.name);
    setEditingSkillData({ ...skill });
  };

  const handleSaveEdit = async () => {
    if (!editingSkillData.name.trim() || !editingSkill) return;

    setLoading(true);
    try {
      // If the skill name changed, we need to remove the old one and add the new one
      if (editingSkill !== editingSkillData.name) {
        await onRemoveSkill(editingSkill);
      }
      await onAddSkill(editingSkillData);
      setEditingSkill(null);
      setEditingSkillData({ name: '', level: 'beginner', yearsOfExperience: 0 });
    } catch (error) {
      console.error('Error updating skill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSkill(null);
    setEditingSkillData({ name: '', level: 'beginner', yearsOfExperience: 0 });
  };

  const handleDeleteSkill = async (skillName: string) => {
    setLoading(true);
    try {
      await onRemoveSkill(skillName);
      setSkillToDelete(null);
    } catch (error) {
      console.error('Error removing skill:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: Skill['level']) => {
    return skillLevels.find(l => l.value === level)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStarCount = (level: Skill['level']) => {
    switch (level) {
      case 'beginner': return 1;
      case 'intermediate': return 2;
      case 'advanced': return 3;
      case 'expert': return 4;
      default: return 1;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
        {isEditable && (
          <button
            onClick={() => setIsAddingSkill(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Skill</span>
          </button>
        )}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {skills.map((skill, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
            {editingSkill === skill.name ? (
              // Edit Mode
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={editingSkillData.name}
                    onChange={(e) => setEditingSkillData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    placeholder="Skill name"
                  />
                </div>
                
                <div>
                  <select
                    value={editingSkillData.level}
                    onChange={(e) => setEditingSkillData(prev => ({ ...prev, level: e.target.value as Skill['level'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  >
                    {skillLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={editingSkillData.yearsOfExperience || ''}
                    onChange={(e) => setEditingSkillData(prev => ({ 
                      ...prev, 
                      yearsOfExperience: e.target.value ? parseInt(e.target.value) : 0 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    placeholder="Years of experience"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={loading || !editingSkillData.name.trim()}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{skill.name}</h4>
                  {isEditable && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditSkill(skill)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSkillToDelete(skill.name)}
                        disabled={loading}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                    {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(4)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < getStarCount(skill.level)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {skill.yearsOfExperience && skill.yearsOfExperience > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {skill.yearsOfExperience} year{skill.yearsOfExperience !== 1 ? 's' : ''} experience
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No skills added yet</h3>
          <p className="text-gray-500 mb-4">
            Start building your profile by adding your first skill
          </p>
          {isEditable && (
            <button
              onClick={() => setIsAddingSkill(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add Your First Skill</span>
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {skillToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Skill</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>"{skillToDelete}"</strong> from your skills?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSkillToDelete(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteSkill(skillToDelete)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Deleting...' : 'Delete Skill'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {isAddingSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Skill</h3>
              <button
                onClick={() => setIsAddingSkill(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSkill.name}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., React, Python, Project Management"
                  list="skill-suggestions"
                />
                <datalist id="skill-suggestions">
                  {skillSuggestions.map((suggestion, index) => (
                    <option key={index} value={suggestion} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proficiency Level
                </label>
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, level: e.target.value as Skill['level'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {skillLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={newSkill.yearsOfExperience || ''}
                  onChange={(e) => setNewSkill(prev => ({ 
                    ...prev, 
                    yearsOfExperience: e.target.value ? parseInt(e.target.value) : 0 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingSkill(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newSkill.name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Adding...' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}