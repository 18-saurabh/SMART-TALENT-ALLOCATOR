import React from 'react';
import { Clock, CheckCircle, AlertCircle, Target, Calendar } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';

export default function ActivityFeed() {
  const { projects } = useProjects();

  // Generate activity items from projects
  const activityItems = projects
    .map(project => {
      const isOverdue = new Date() > project.deadline;
      const isCompleted = project.status === 'completed';
      
      return {
        id: project.id,
        title: project.title,
        status: project.status,
        progress: project.progress,
        deadline: project.deadline,
        isOverdue: isOverdue && !isCompleted,
        isCompleted,
        updatedAt: project.updatedAt || project.createdAt
      };
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 8);

  const getStatusIcon = (status: string, isCompleted: boolean, isOverdue: boolean) => {
    if (isCompleted) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (isOverdue) return <AlertCircle className="h-5 w-5 text-red-600" />;
    
    switch (status) {
      case 'in-progress': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'review': return <Target className="h-5 w-5 text-purple-600" />;
      case 'on-hold': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string, isCompleted: boolean, isOverdue: boolean) => {
    if (isCompleted) return 'Completed';
    if (isOverdue) return 'Overdue';
    
    switch (status) {
      case 'in-progress': return 'In Progress';
      case 'review': return 'Under Review';
      case 'on-hold': return 'On Hold';
      case 'planning': return 'Planning';
      default: return status.replace('-', ' ').toUpperCase();
    }
  };

  const getActivityColor = (status: string, isCompleted: boolean, isOverdue: boolean) => {
    if (isCompleted) return 'bg-green-50 border-green-200';
    if (isOverdue) return 'bg-red-50 border-red-200';
    
    switch (status) {
      case 'in-progress': return 'bg-blue-50 border-blue-200';
      case 'review': return 'bg-purple-50 border-purple-200';
      case 'on-hold': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        <span className="text-sm text-gray-500">Last 30 days</span>
      </div>
      
      {activityItems.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400 mt-1">Your project activities will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activityItems.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 ${getActivityColor(item.status, item.isCompleted, item.isOverdue)}`}
            >
              <div className="flex-shrink-0">
                {getStatusIcon(item.status, item.isCompleted, item.isOverdue)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm text-gray-600">
                    {getStatusText(item.status, item.isCompleted, item.isOverdue)} • {item.progress}% complete
                  </p>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.isCompleted ? 'bg-green-500' :
                        item.isOverdue ? 'bg-red-500' :
                        item.status === 'in-progress' ? 'bg-blue-500' :
                        item.status === 'review' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{item.deadline.toLocaleDateString()}</span>
                </div>
                {item.isCompleted && (
                  <p className="text-xs text-green-600 mt-1">Completed</p>
                )}
                {item.isOverdue && (
                  <p className="text-xs text-red-600 mt-1">Overdue</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}