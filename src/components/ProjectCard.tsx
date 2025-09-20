import React from 'react';
import { Calendar, Users, Tag, IndianRupee, Clock, AlertCircle } from 'lucide-react';
import { Project } from '../hooks/useProjects';

interface ProjectCardProps {
  project: Project;
  isManager: boolean;
  onStatusUpdate?: (projectId: string, status: Project['status'], progress?: number) => void;
}

export default function ProjectCard({ project, isManager, onStatusUpdate }: ProjectCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'on-hold': return 'bg-red-100 text-red-800';
      case 'planning': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = new Date() > project.deadline;
  const isCompleted = project.status === 'completed';
  const daysUntilDeadline = Math.ceil((project.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const handleStatusChange = (newStatus: Project['status']) => {
    if (onStatusUpdate) {
      let newProgress = project.progress;
      if (newStatus === 'completed') newProgress = 100;
      else if (newStatus === 'in-progress' && project.progress === 0) newProgress = 10;
      
      onStatusUpdate(project.id, newStatus, newProgress);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{project.title}</h3>
          <div className="flex items-center space-x-2 ml-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
              {project.priority.toUpperCase()}
            </span>
            {isOverdue && !isCompleted && (
              <AlertCircle className="h-5 w-5 text-red-500" title="Overdue" />
            )}
            {isCompleted && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                COMPLETED
              </span>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{project.description}</p>
        
        {/* Status and Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status.replace('-', ' ').toUpperCase()}
            </span>
            <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                project.progress === 100 ? 'bg-green-500' :
                project.progress > 75 ? 'bg-blue-500' :
                project.progress > 50 ? 'bg-yellow-500' :
                project.progress > 25 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Team */}
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {project.assignedEmployeeNames.length > 0 
              ? project.assignedEmployeeNames.join(', ')
              : 'No team assigned'
            }
          </span>
        </div>

        {/* Deadline */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className={`text-sm ${isOverdue && !isCompleted ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
            {project.deadline.toLocaleDateString()}
            {daysUntilDeadline >= 0 && !isOverdue && !isCompleted && (
              <span className="ml-2 text-xs text-gray-500">
                ({daysUntilDeadline} days left)
              </span>
            )}
            {isOverdue && !isCompleted && (
              <span className="ml-2 text-xs text-red-500 font-medium">
                (Overdue)
              </span>
            )}
            {isCompleted && (
              <span className="ml-2 text-xs text-green-600 font-medium">
                (Completed on time)
              </span>
            )}
          </span>
        </div>

        {/* Budget */}
        {project.budget && (
          <div className="flex items-center space-x-2">
            <IndianRupee className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              ₹{project.budget.toLocaleString('en-IN')}
            </span>
          </div>
        )}

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex items-start space-x-2">
            <Tag className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {project.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Manager Info (for employees) */}
        {!isManager && (
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Manager: {project.managerName}
            </span>
          </div>
        )}
      </div>

      {/* Actions for Employees */}
      {!isManager && (
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-2">
            {project.status !== 'completed' && (
              <>
                {project.status === 'planning' && (
                  <button
                    onClick={() => handleStatusChange('in-progress')}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Start Work
                  </button>
                )}
                {project.status === 'in-progress' && (
                  <button
                    onClick={() => handleStatusChange('review')}
                    className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors duration-200"
                  >
                    Submit for Review
                  </button>
                )}
               {project.status === 'review' && (
                 <button
                   onClick={() => handleStatusChange('in-progress')}
                   className="px-3 py-1 bg-orange-600 text-white text-xs rounded-md hover:bg-orange-700 transition-colors duration-200"
                 >
                   Continue Work
                 </button>
               )}
             </>
           )}
         </div>
       </div>
       )}

       {/* Actions for Managers */}
       {isManager && project.status === 'review' && (
         <div className="px-6 pb-6">
           <div className="flex flex-wrap gap-2">
             <button
               onClick={() => handleStatusChange('completed')}
               className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors duration-200"
             >
               Mark Complete
             </button>
             <button
               onClick={() => handleStatusChange('in-progress')}
               className="px-3 py-1 bg-orange-600 text-white text-xs rounded-md hover:bg-orange-700 transition-colors duration-200"
             >
               Request Changes
             </button>
           </div>
         </div>
       )}

       {/* Actions for Managers - Other statuses */}
       {isManager && project.status !== 'review' && project.status !== 'completed' && (
         <div className="px-6 pb-6">
           <div className="flex flex-wrap gap-2">
             <button
               onClick={() => handleStatusChange('in-progress')}
               className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors duration-200"
             >
               Start Project
             </button>
             <button
               onClick={() => handleStatusChange('on-hold')}
               className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors duration-200"
             >
               Put On Hold
             </button>
           </div>
         </div>
       )}
     </div>
   );
 }