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
      } catch (err) {
        console.error('Failed to generate completion recommendations:', err);
      }
      return;
    }

    if (project.status === 'in-progress') {
      setAiLoading(true);
      setError(null);
      try {
        await generateStatusChangeAISuggestions(project, 'in-progress');
      } catch (err) {
        console.error('Failed to generate status suggestions:', err);
      }
    } else {
      setError(null);
      setAiLoading(true);
      try {
        await generateStatusChangeAISuggestions(project, project.status);
      } catch (err) {
        console.error('Failed to generate status suggestions:', err);
      }
    }
  };

  const generateCompletionRecommendations = async (project: any) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        const setupMessage = 'Gemini API key not found. To enable AI features:\n' +
          '1. Create a .env.local file in your project root\n' +
          '2. Add: VITE_GEMINI_API_KEY=your_api_key_here\n' +
          '3. Get your API key from: https://makersuite.google.com/app/apikey\n' +
          '4. Restart your development server';
        setError(setupMessage);
        console.warn('Missing VITE_GEMINI_API_KEY:', setupMessage);
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

      const isManager = userProfile?.role === 'manager';

      const deadlineStr = project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A';
      let prompt = '';

      if (isManager) {
        prompt = `You are a senior project management advisor. A project has just been completed. Provide specific, insightful post-completion recommendations tailored to this project.

**Project Details:**
- **Project Name:** ${project.title}
- **Description:** ${project.description || 'Not provided'}
- **Priority Level:** ${project.priority}
- **Final Progress:** ${project.progress}%
- **Team Size:** ${project.assignedEmployees?.length || 0} members
- **Original Deadline:** ${deadlineStr}

As a **Manager**, generate a structured post-completion report using exactly these sections. Format using markdown: ## for section headers with emojis, **bold** for key terms, - for bullet points.

## 🎯 Immediate Next Steps
Provide 3–4 specific, time-bound actions to take this week (documentation, stakeholder sign-off, knowledge handoff).

## 🏆 Team Recognition & Acknowledgement
Concrete, meaningful ways to recognize each team member's contributions and celebrate the milestone publicly.

## 📚 Lessons Learned
Top 3–4 key takeaways that should be formally documented in a retrospective for future teams to reference.

## 🔄 Resource Reallocation Strategy
Specific recommendations for reassigning team members, identifying skill gaps revealed, and planning next engagements.

## 📊 Success Metrics & Stakeholder Reporting
How to quantify outcomes (delivered features, time-to-delivery, budget adherence) and present results to stakeholders.

---
Be direct and specific to "${project.title}". Avoid generic advice.`;
      } else {
        prompt = `You are a career development coach. A project you contributed to has just been completed. Provide structured, practical recommendations to maximize your professional growth.

**Project Details:**
- **Project Name:** ${project.title}
- **Description:** ${project.description || 'Not provided'}
- **Priority Level:** ${project.priority}
- **Final Progress:** ${project.progress}%
- **Original Deadline:** ${deadlineStr}

As a **Team Member**, generate a structured growth plan using exactly these sections. Format using markdown: ## for section headers with emojis, **bold** for key terms, - for bullet points.

## 💡 Knowledge Transfer Actions
3–4 specific ways to share your learnings with teammates (documentation, tech talks, pair programming, retrospective contributions).

## 🚀 Skills You've Strengthened
Reflect on the concrete technical and soft skills you developed through this project and how they position you going forward.

## 🔭 Career Growth Opportunities
Specific project types, technologies, or roles that naturally follow from the skills and experience you gained here.

## 🗣️ Getting Impactful Feedback
Exact questions to ask your manager and peers to extract meaningful, growth-focused feedback right after project completion.

## 🗂️ Portfolio & Professional Recognition
Specific steps to showcase this achievement on your resume, LinkedIn, or internal recognition channels.

---
Be specific to "${project.title}". Provide actionable advice that directly applies to this project's context.`;
      }

      console.log('Sending prompt to Gemini API...');
      const result = await model.generateContent(prompt);
      const suggestions = result.response?.text();

      if (!suggestions) {
        throw new Error('No response received from AI model');
      }

      console.log('AI suggestions received successfully');
      setAiSuggestions(formatAISuggestions(suggestions));
      setError(null);
    } catch (err: any) {
      console.error('Error generating recommendations:', err);
      let errorMessage = 'Failed to generate recommendations. ';
      
      if (err?.message?.includes('API key')) {
        errorMessage += 'API key issue - check your .env.local setup';
      } else if (err?.message?.includes('PERMISSION_DENIED')) {
        errorMessage += 'API permission denied - verify your API key is valid';
      } else if (err?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage += 'API quota exceeded - try again later';
      } else {
        errorMessage += err?.message || 'Please try again';
      }
      
      setError(errorMessage);
    } finally {
      setAiLoading(false);
    }
  };

  const generateStatusChangeAISuggestions = async (project: any, status: ProjectStatus) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        const setupMessage = 'Gemini API key not found. To enable AI features:\n' +
          '1. Create a .env.local file in your project root\n' +
          '2. Add: VITE_GEMINI_API_KEY=your_api_key_here\n' +
          '3. Get your API key from: https://makersuite.google.com/app/apikey\n' +
          '4. Restart your development server';
        setError(setupMessage);
        console.warn('Missing VITE_GEMINI_API_KEY:', setupMessage);
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

      const assignedEmployees = allEmployees.filter(emp =>
        project.assignedEmployees.includes(emp.uid)
      );

      const isManager = userProfile?.role === 'manager';
      
      const teamInfo = assignedEmployees.length > 0
        ? assignedEmployees.map(emp => `${emp.name} (Availability: ${emp.availability})`).join(', ')
        : 'Team members to be assigned';

      const deadlineStr = project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A';
      let prompt = '';

      if (isManager) {
        prompt = `You are a senior project management advisor. Analyze this active project and provide targeted, actionable recommendations based on its current state.

**Project Status Report:**
- **Project Name:** ${project.title}
- **Description:** ${project.description || 'Not provided'}
- **Current Status:** ${status}
- **Completion Progress:** ${project.progress}%
- **Priority:** ${project.priority}
- **Deadline:** ${deadlineStr}
- **Team:** ${teamInfo}

As a **Manager**, generate a structured action plan using exactly these sections. Format using markdown: ## for section headers with emojis, **bold** for key terms, - for bullet points.

## 📋 Priority Actions This Week
The 3–4 most critical management actions to take right now, given the ${status} status and ${project.progress}% completion.

## 👥 Team Optimization
Specific recommendations to improve workload distribution and maximize team output based on the current team composition.

## ⚠️ Risk Assessment
The top 2–3 risks to address immediately given the current timeline and status, with concrete mitigation steps for each.

## 📅 Timeline & Milestone Management
Targeted tactics to stay on track or recover schedule to meet the ${deadlineStr} deadline.

## 📈 Key Metrics to Monitor
The 3–4 specific KPIs and checkpoints that will signal project health over the next week.

---
Ground all recommendations in the actual project context. Be specific to "${project.title}" at ${project.progress}% completion.`;
      } else {
        prompt = `You are a project success coach. Analyze this active project and provide targeted, practical advice to help you succeed as a contributing team member.

**Your Project Context:**
- **Project Name:** ${project.title}
- **Description:** ${project.description || 'Not provided'}
- **Current Status:** ${status}
- **Completion Progress:** ${project.progress}%
- **Priority:** ${project.priority}
- **Deadline:** ${deadlineStr}
- **Your Team:** ${teamInfo}

As a **Team Member**, generate a structured action plan using exactly these sections. Format using markdown: ## for section headers with emojis, **bold** for key terms, - for bullet points.

## 🎯 Your Top Priorities Right Now
The 3–4 most important tasks to focus on this week, given the project is at ${project.progress}% in ${status} status.

## 🛠️ Applying Your Skills Effectively
How to best leverage your skills for the current phase of "${project.title}" and deliver maximum impact.

## ⏱️ Meeting the Deadline
Concrete time management strategies to ensure your deliverables are complete before ${deadlineStr}.

## 🤝 Team Collaboration Tips
Specific ways to coordinate effectively with your teammates at this stage of the project.

## ✅ Quality & Delivery Standards
How to ensure your work meets quality expectations and minimizes rework at the ${status} stage.

---
Be specific to "${project.title}" at ${project.progress}% completion with a ${deadlineStr} deadline.`;
      }

      console.log('Sending prompt to Gemini API...');
      const result = await model.generateContent(prompt);
      const suggestions = result.response?.text();

      if (!suggestions) {
        throw new Error('No response received from AI model');
      }

      console.log('AI suggestions received successfully');
      setAiSuggestions(formatAISuggestions(suggestions));
      setError(null);
    } catch (err: any) {
      console.error('Error generating AI suggestions:', err);
      let errorMessage = 'Failed to generate AI suggestions. ';
      
      if (err?.message?.includes('API key')) {
        errorMessage += 'API key issue - check your .env.local setup';
      } else if (err?.message?.includes('PERMISSION_DENIED')) {
        errorMessage += 'API permission denied - verify your API key is valid';
      } else if (err?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage += 'API quota exceeded - try again later';
      } else {
        errorMessage += err?.message || 'Please try again';
      }
      
      setError(errorMessage);
    } finally {
      setAiLoading(false);
    }
  };

  const formatAISuggestions = (text: string): string => {
    const formatInline = (str: string): string =>
      str
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="italic text-gray-600">$1</em>')
        .replace(/`(.+?)`/g, '<code class="bg-blue-50 text-blue-700 px-1 py-0.5 rounded text-xs font-mono">$1</code>');

    const lines = text.split('\n');
    let html = '';
    let inList = false;
    let listType: 'ul' | 'ol' | null = null;

    const closeList = () => {
      if (inList) {
        html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
        listType = null;
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('## ')) {
        closeList();
        html += `<h2 class="text-sm font-bold text-blue-700 mt-5 mb-2 pb-1 border-b border-blue-100 flex items-center gap-1">${formatInline(trimmed.slice(3))}</h2>`;
      } else if (trimmed.startsWith('### ')) {
        closeList();
        html += `<h3 class="text-sm font-semibold text-gray-800 mt-3 mb-1">${formatInline(trimmed.slice(4))}</h3>`;
      } else if (trimmed.startsWith('# ')) {
        closeList();
        html += `<h1 class="text-base font-bold text-gray-900 mb-3">${formatInline(trimmed.slice(2))}</h1>`;
      } else if (/^[-*] /.test(trimmed)) {
        if (!inList || listType !== 'ul') {
          closeList();
          html += '<ul class="my-1.5 space-y-1">';
          inList = true;
          listType = 'ul';
        }
        html += `<li class="flex items-start gap-2 text-gray-700 text-sm"><span class="text-blue-500 mt-1 flex-shrink-0 text-xs">●</span><span>${formatInline(trimmed.slice(2))}</span></li>`;
      } else if (/^\d+\. /.test(trimmed)) {
        if (!inList || listType !== 'ol') {
          closeList();
          html += '<ol class="my-1.5 space-y-1 list-none">';
          inList = true;
          listType = 'ol';
        }
        const m = trimmed.match(/^(\d+)\. (.+)$/);
        if (m) {
          html += `<li class="flex items-start gap-2 text-gray-700 text-sm"><span class="text-blue-600 font-bold w-5 flex-shrink-0">${m[1]}.</span><span>${formatInline(m[2])}</span></li>`;
        }
      } else if (trimmed === '---' || trimmed === '***') {
        closeList();
        html += '<hr class="my-3 border-gray-200"/>';
      } else if (trimmed === '') {
        closeList();
        html += '<div class="h-1"></div>';
      } else {
        closeList();
        html += `<p class="text-gray-700 text-sm mb-1">${formatInline(trimmed)}</p>`;
      }
    }

    closeList();
    return html;
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
            <Calendar className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
              Project Planning
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="gradient-text">Project Planner</span>
              </h1>
              <p className="text-gray-600 mt-2">
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
                <RefreshCw className="h-12 w-12 text-blue-600 mb-4" />
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
                  className="mt-3 text-left max-h-80 overflow-y-auto pr-2 border-t border-gray-100 pt-3"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
                  dangerouslySetInnerHTML={{ __html: aiSuggestions }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Brain className="h-16 w-16 text-blue-600" />
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 text-red-700">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm whitespace-pre-wrap">{error}</div>
          </div>
        )}

        <div className="mb-6 modern-card p-6">
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
