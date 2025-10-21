import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmployees } from '../hooks/useEmployees';
import { useProjects } from '../hooks/useProjects';
import { Calendar, Clock, Brain, RefreshCw, AlertCircle, CheckCircle, Target, Sparkles, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

type ProjectStatus = 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold';

export default function Planner() {
  const { userProfile } = useAuth();
  const { allEmployees, getCurrentEmployee } = useEmployees();
  const { projects } = useProjects();

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const projectsPerPage = 6;

  const dropZoneRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  const availableProjects = userProfile?.role === 'manager'
    ? projects
    : projects.filter(p => {
        const currentEmp = getCurrentEmployee();
        return currentEmp && p.assignedEmployees.includes(currentEmp.uid);
      });

  const totalPages = Math.ceil(availableProjects.length / projectsPerPage);
  const paginatedProjects = availableProjects.slice(
    currentPage * projectsPerPage,
    (currentPage + 1) * projectsPerPage
  );

  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.setData('projectId', projectId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrag = (e: React.DragEvent) => {
    const scrollThreshold = 100;
    const scrollSpeed = 10;

    if (e.clientY < scrollThreshold) {
      if (!scrollIntervalRef.current) {
        scrollIntervalRef.current = window.setInterval(() => {
          window.scrollBy(0, -scrollSpeed);
        }, 16);
      }
    } else if (e.clientY > window.innerHeight - scrollThreshold) {
      if (!scrollIntervalRef.current) {
        scrollIntervalRef.current = window.setInterval(() => {
          window.scrollBy(0, scrollSpeed);
        }, 16);
      }
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }
  };

  const handleDragEnd = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    const projectId = e.dataTransfer.getData('projectId');
    if (!projectId) return;

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (dropZoneRef.current) {
      dropZoneRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (project.status === 'completed') {
      setError('This project is already completed.');
      setAiLoading(true);

      try {
        await generateCompletionRecommendations(project);
      } finally {
        setAiLoading(false);
      }
      return;
    }

    if (project.status === 'in-progress') {
      setAiLoading(true);
      setError(null);
      try {
        await generateStatusChangeAISuggestions(project, 'in-progress');
      } finally {
        setAiLoading(false);
      }
    } else {
      setError(null);
      setAiLoading(true);
      try {
        await generateStatusChangeAISuggestions(project, project.status);
      } finally {
        setAiLoading(false);
      }
    }
  };

  const generateCompletionRecommendations = async (project: any) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      const isManager = userProfile?.role === 'manager';

      const prompt = `
The project "${project.title}" is already completed. The user is asking for recommendations.

${isManager ? `
As a manager, provide recommendations on:
1. **Next Steps**: What should be done after project completion (documentation, retrospective, handover)
2. **Team Recognition**: How to acknowledge team achievements
3. **Lessons Learned**: Key takeaways for future projects
4. **Resource Reallocation**: How to redeploy team members to new projects
5. **Success Metrics**: How to measure and report project success

Format the response with bold headings using ** for each section.
` : `
As an employee who worked on this completed project, provide recommendations on:
1. **Knowledge Transfer**: How to document and share learnings with the team
2. **Skill Development**: New skills gained and areas for further improvement
3. **Next Opportunities**: Types of projects that would build on this experience
4. **Feedback Request**: What feedback to seek from managers and peers
5. **Portfolio Building**: How to showcase this project achievement

Format the response with bold headings using ** for each section.
`}

Keep suggestions concise, actionable, and formatted with clear bold headings.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestions = response.text();

      setAiSuggestions(formatAISuggestions(suggestions));
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError('Failed to generate recommendations. Please try again.');
    }
  };

  const generateStatusChangeAISuggestions = async (project: any, status: ProjectStatus) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      const assignedEmployees = allEmployees.filter(emp =>
        project.assignedEmployees.includes(emp.uid)
      );

      const isManager = userProfile?.role === 'manager';

      const prompt = `
Project "${project.title}" is currently in "${status}" status.

PROJECT DETAILS:
- Description: ${project.description}
- Priority: ${project.priority}
- Progress: ${project.progress}%
- Deadline: ${project.deadline}

TEAM MEMBERS:
${assignedEmployees.map(emp => `
- ${emp.name}:
  * Availability: ${emp.availability}
  * Skills: ${emp.skills.map(s => `${s.name} (${s.level})`).join(', ')}
`).join('')}

${isManager ? `
As a manager, provide specific actionable suggestions to improve efficiency:
1. **Resource Optimization**: How to better allocate team members and resources
2. **Timeline Management**: Strategies to meet deadlines and manage priorities
3. **Risk Mitigation**: Potential risks and how to address them proactively
4. **Team Coordination**: Ways to improve communication and collaboration
5. **Performance Tracking**: Key metrics to monitor project health

Format the response with bold headings using ** for each section.
` : `
As an employee working on this project, provide suggestions on:
1. **Task Prioritization**: Which tasks to focus on first for maximum impact
2. **Skill Application**: How to best apply your skills to deliver quality work
3. **Time Management**: Strategies to complete tasks efficiently within deadlines
4. **Collaboration Tips**: How to work effectively with team members
5. **Quality Assurance**: Best practices to ensure high-quality deliverables

Format the response with bold headings using ** for each section.
`}

Keep suggestions concise, practical, and formatted with clear bold headings.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const suggestions = response.text();

      setAiSuggestions(formatAISuggestions(suggestions));
    } catch (err) {
      console.error('Error generating AI suggestions:', err);
      setError('Failed to generate AI suggestions. Please try again.');
    }
  };

  const formatAISuggestions = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8 px-4 sm:px-6 lg:px-8">
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

        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-6 modern-card p-8 border-2 border-dashed transition-all duration-300 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 scale-[1.02]'
              : 'border-gray-300 bg-gradient-to-br from-blue-50 to-cyan-50'
          }`}
        >
          <div className="text-center">
            {aiLoading ? (
              <div className="flex flex-col items-center">
                <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <p className="text-lg font-semibold text-gray-900">Generating AI Suggestions...</p>
                <p className="text-sm text-gray-600 mt-2">Please wait while we analyze the project</p>
              </div>
            ) : aiSuggestions ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900">AI Suggestions</h3>
                  </div>
                  <button
                    onClick={() => setAiSuggestions('')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <AlertCircle className="h-5 w-5" />
                  </button>
                </div>
                <div
                  className="prose prose-sm max-w-none text-left text-gray-700"
                  dangerouslySetInnerHTML={{ __html: aiSuggestions }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Brain className="h-16 w-16 text-blue-600 animate-float-up" />
                  <ArrowDown className="h-8 w-8 text-blue-400 absolute -bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Drop Project Here for AI Suggestions</h3>
                <p className="text-gray-600 max-w-md">
                  Drag any project from the list below and drop it here to get personalized AI recommendations based on your role
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>Completed projects: Get next steps</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>Ongoing projects: Get efficiency tips</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700 animate-float-down">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-6 modern-card p-6 animate-float-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              All Projects
            </h3>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {availableProjects.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No projects available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedProjects.map((project) => (
                <div
                  key={project.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, project.id)}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  className="p-4 rounded-lg border-2 transition-all duration-200 cursor-move border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                >
                  <h4 className="font-medium text-gray-900 mb-2">{project.title}</h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                    <Clock className="h-3 w-3" />
                    <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
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
                    <span className="text-xs font-medium text-gray-600">{project.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
