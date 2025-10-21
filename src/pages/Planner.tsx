import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmployees } from '../hooks/useEmployees';
import { useProjects } from '../hooks/useProjects';
import { Calendar, Clock, Users, Target, Brain, RefreshCw, AlertCircle, CheckCircle, Plus, Trash2, Save, Sparkles, TrendingUp, BarChart3, CreditCard as Edit2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface PlanTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  assigneeName: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  estimatedHours: number;
}

interface ProjectPlan {
  id: string;
  projectId: string;
  projectName: string;
  startDate: string;
  endDate: string;
  tasks: PlanTask[];
  createdAt: string;
  createdBy: string;
  aiSuggestions?: string;
}

export default function Planner() {
  const { userProfile, currentUser } = useAuth();
  const { allEmployees, getCurrentEmployee } = useEmployees();
  const { projects } = useProjects();

  const [plans, setPlans] = useState<ProjectPlan[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [currentPlan, setCurrentPlan] = useState<ProjectPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const availableProjects = userProfile?.role === 'manager'
    ? projects
    : projects.filter(p => {
        const currentEmp = getCurrentEmployee();
        return currentEmp && p.assignedEmployees.includes(currentEmp.uid);
      });

  useEffect(() => {
    if (selectedProject) {
      const existingPlan = plans.find(p => p.projectId === selectedProject);
      if (existingPlan) {
        setCurrentPlan(existingPlan);
        setIsEditing(false);
      } else {
        createNewPlan(selectedProject);
      }
    }
  }, [selectedProject]);

  const createNewPlan = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || !currentUser) return;

    const newPlan: ProjectPlan = {
      id: `plan_${Date.now()}`,
      projectId,
      projectName: project.title,
      startDate: new Date().toISOString().split('T')[0],
      endDate: project.deadline,
      tasks: [],
      createdAt: new Date().toISOString(),
      createdBy: currentUser.uid,
      aiSuggestions: ''
    };

    setCurrentPlan(newPlan);
    setIsEditing(true);
  };

  const addTask = () => {
    if (!currentPlan) return;

    const newTask: PlanTask = {
      id: `task_${Date.now()}`,
      title: '',
      description: '',
      assignee: '',
      assigneeName: '',
      dueDate: currentPlan.endDate,
      priority: 'medium',
      status: 'todo',
      estimatedHours: 8
    };

    setCurrentPlan({
      ...currentPlan,
      tasks: [...currentPlan.tasks, newTask]
    });
  };

  const updateTask = (taskId: string, updates: Partial<PlanTask>) => {
    if (!currentPlan) return;

    setCurrentPlan({
      ...currentPlan,
      tasks: currentPlan.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    });
  };

  const deleteTask = (taskId: string) => {
    if (!currentPlan) return;

    setCurrentPlan({
      ...currentPlan,
      tasks: currentPlan.tasks.filter(task => task.id !== taskId)
    });
  };

  const savePlan = () => {
    if (!currentPlan) return;

    const existingIndex = plans.findIndex(p => p.id === currentPlan.id);
    if (existingIndex >= 0) {
      const newPlans = [...plans];
      newPlans[existingIndex] = currentPlan;
      setPlans(newPlans);
    } else {
      setPlans([...plans, currentPlan]);
    }

    setIsEditing(false);
    setError(null);
  };

  const generateAISuggestions = async () => {
    if (!currentPlan) return;

    setAiLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      const project = projects.find(p => p.id === currentPlan.projectId);
      const assignedEmployees = allEmployees.filter(emp =>
        project?.assignedEmployees.includes(emp.uid)
      );

      const prompt = `
You are a project planning assistant. Analyze this project and provide planning suggestions.

PROJECT DETAILS:
- Name: ${currentPlan.projectName}
- Start Date: ${currentPlan.startDate}
- End Date: ${currentPlan.endDate}
- Status: ${project?.status}
- Priority: ${project?.priority}
- Progress: ${project?.progress}%

TEAM MEMBERS:
${assignedEmployees.map(emp => `
- ${emp.name}:
  * Availability: ${emp.availability}
  * Skills: ${emp.skills.map(s => `${s.name} (${s.level})`).join(', ')}
`).join('')}

CURRENT TASKS:
${currentPlan.tasks.map(task => `
- ${task.title || 'Untitled'}
  * Assignee: ${task.assigneeName || 'Unassigned'}
  * Due: ${task.dueDate}
  * Priority: ${task.priority}
  * Status: ${task.status}
  * Estimated Hours: ${task.estimatedHours}h
`).join('')}

Please provide:
1. Task breakdown suggestions (if tasks are missing or incomplete)
2. Resource allocation recommendations
3. Timeline optimization tips
4. Risk identification and mitigation
5. Best practices for this type of project

Keep suggestions concise, actionable, and specific to the Indian work culture. Format as a clear numbered list.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestions = response.text();

      setAiSuggestions(suggestions);
      setCurrentPlan({
        ...currentPlan,
        aiSuggestions: suggestions
      });
    } catch (err) {
      console.error('Error generating AI suggestions:', err);
      setError('Failed to generate AI suggestions. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-6 w-6 text-blue-600 animate-float-rotate" />
            <span className="text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
              Project Planning
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 animate-float-up">
                <span className="gradient-text">Project Planner</span>
              </h1>
              <p className="text-gray-600 mt-2 animate-float-down">
                {userProfile?.role === 'manager'
                  ? 'Create and manage project plans with AI-powered suggestions'
                  : 'View and contribute to project plans'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="modern-card p-6 animate-float-up">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Select Project
              </h3>

              {availableProjects.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No projects available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedProject === project.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900 mb-1">{project.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {plans.length > 0 && (
              <div className="modern-card p-6 mt-6 animate-float-down">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                  Saved Plans
                </h3>
                <div className="space-y-2">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => {
                        setSelectedProject(plan.projectId);
                        setCurrentPlan(plan);
                      }}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                    >
                      <p className="font-medium text-gray-900 text-sm">{plan.projectName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {plan.tasks.length} tasks • Created {new Date(plan.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {!currentPlan ? (
              <div className="modern-card p-12 text-center animate-float-up">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Plan Selected</h3>
                <p className="text-gray-500">Select a project from the list to create or view a plan</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="modern-card p-6 animate-float-up">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{currentPlan.projectName}</h2>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(currentPlan.startDate).toLocaleDateString()} - {new Date(currentPlan.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>{currentPlan.tasks.filter(t => t.status === 'completed').length}/{currentPlan.tasks.length} completed</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={generateAISuggestions}
                        disabled={aiLoading}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                      >
                        {aiLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4" />
                            <span>AI Suggestions</span>
                          </>
                        )}
                      </button>
                      {userProfile?.role === 'manager' && (
                        <>
                          {isEditing ? (
                            <button
                              onClick={savePlan}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                              <Save className="h-4 w-4" />
                              <span>Save</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                              <Edit2 className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  {aiSuggestions && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg animate-float-down">
                      <div className="flex items-center space-x-2 mb-3">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">AI Planning Suggestions</h3>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-line">
                        {aiSuggestions}
                      </div>
                    </div>
                  )}

                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                    {isEditing && userProfile?.role === 'manager' && (
                      <button
                        onClick={addTask}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Task</span>
                      </button>
                    )}
                  </div>

                  {currentPlan.tasks.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No tasks added yet</p>
                      {isEditing && userProfile?.role === 'manager' && (
                        <button
                          onClick={addTask}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          Add First Task
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentPlan.tasks.map((task) => (
                        <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                          {isEditing && userProfile?.role === 'manager' ? (
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <input
                                  type="text"
                                  value={task.title}
                                  onChange={(e) => updateTask(task.id, { title: e.target.value })}
                                  placeholder="Task title"
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <textarea
                                value={task.description}
                                onChange={(e) => updateTask(task.id, { description: e.target.value })}
                                placeholder="Task description"
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                                  <select
                                    value={task.assignee}
                                    onChange={(e) => {
                                      const emp = allEmployees.find(emp => emp.uid === e.target.value);
                                      updateTask(task.id, {
                                        assignee: e.target.value,
                                        assigneeName: emp?.name || ''
                                      });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="">Select assignee</option>
                                    {allEmployees.map(emp => (
                                      <option key={emp.uid} value={emp.uid}>{emp.name}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                  <input
                                    type="date"
                                    value={task.dueDate}
                                    onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                  <select
                                    value={task.priority}
                                    onChange={(e) => updateTask(task.id, { priority: e.target.value as PlanTask['priority'] })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                  <select
                                    value={task.status}
                                    onChange={(e) => updateTask(task.id, { status: e.target.value as PlanTask['status'] })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="todo">To Do</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                                  <input
                                    type="number"
                                    value={task.estimatedHours}
                                    onChange={(e) => updateTask(task.id, { estimatedHours: parseInt(e.target.value) || 0 })}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{task.title || 'Untitled Task'}</h4>
                                  {task.description && (
                                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                                    {task.status}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-3">
                                {task.assigneeName && (
                                  <div className="flex items-center space-x-1">
                                    <Users className="h-4 w-4" />
                                    <span>{task.assigneeName}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>{task.estimatedHours}h</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
