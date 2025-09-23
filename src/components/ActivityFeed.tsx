import React from 'react';
import { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Target, Calendar, ChevronLeft, ChevronRight, MoreHorizontal, Filter } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200 rounded-b-xl">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
            <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalItems}</span> activities
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px bg-white" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {getVisiblePages().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-400">
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium transition-all duration-200 ${
                      currentPage === page
                        ? 'z-10 bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default function ActivityFeed() {
  const { projects } = useProjects();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Show 5 activities per page
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Generate activity items from projects
  let activityItems = projects
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

  // Apply status filter
  if (statusFilter !== 'all') {
    activityItems = activityItems.filter(item => {
      if (statusFilter === 'completed') return item.isCompleted;
      if (statusFilter === 'overdue') return item.isOverdue;
      if (statusFilter === 'active') return !item.isCompleted && !item.isOverdue;
      return item.status === statusFilter;
    });
  }

  // Calculate pagination
  const totalPages = Math.ceil(activityItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = activityItems.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

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
    <div className="modern-card p-6 animate-float-up hover:shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 animate-float-up">Recent Activity</h2>
          <p className="text-sm text-gray-500 mt-1">
            {activityItems.length} total activit{activityItems.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
            >
              <option value="all">All Activities</option>
              <option value="completed">Completed</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Under Review</option>
            </select>
          </div>
          <span className="text-sm text-gray-500 animate-pulse">
            Page {currentPage} of {totalPages || 1}
          </span>
        </div>
      </div>
      
      {currentActivities.length === 0 && statusFilter !== 'all' ? (
        <div className="text-center py-12 animate-float-down">
          <Filter className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities found</h3>
          <p className="text-gray-500 mb-4">No activities match the selected filter</p>
          <button
            onClick={() => setStatusFilter('all')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Show All Activities
          </button>
        </div>
      ) : activityItems.length === 0 ? (
        <div className="text-center py-8 animate-float-down">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent activity</h3>
          <p className="text-sm text-gray-400 mt-1">Your project activities will appear here</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 animate-float-up">
            {currentActivities.map((item, index) => (
              <div 
                key={item.id} 
                className={`flex items-center space-x-4 p-4 border rounded-xl hover:shadow-lg transition-all duration-300 ${getActivityColor(item.status, item.isCompleted, item.isOverdue)} backdrop-blur-sm`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(item.status, item.isCompleted, item.isOverdue)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate animate-float-up">{item.title}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-600 animate-float-down">
                      {getStatusText(item.status, item.isCompleted, item.isOverdue)} • {item.progress}% complete
                    </p>
                    <div className="w-20 bg-gray-200 rounded-full h-2 shadow-inner">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 shadow-sm ${
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
                  <div className="flex items-center space-x-1 text-sm text-gray-500 animate-float-up">
                    <Calendar className="h-4 w-4" />
                    <span>{item.deadline.toLocaleDateString()}</span>
                  </div>
                  {item.isCompleted && (
                    <p className="text-xs text-green-600 mt-1 animate-pulse-glow">Completed</p>
                  )}
                  {item.isOverdue && (
                    <p className="text-xs text-red-600 mt-1 animate-pulse-glow">Overdue</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={activityItems.length}
            itemsPerPage={itemsPerPage}
          />
        </>
      )}
    </div>
  );
}