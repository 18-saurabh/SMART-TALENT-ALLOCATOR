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
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
          <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalItems}</span> activities
        </p>

        <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px bg-white">

          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-2 border border-gray-300 bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 transition-all duration-200 rounded-l-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 border border-gray-300 text-gray-400">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-2 border text-sm font-medium transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-blue-600 border-blue-600 text-white'
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
            className="px-2 py-2 border border-gray-300 bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 transition-all duration-200 rounded-r-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

        </nav>
      </div>
    </div>
  );
}

export default function ActivityFeed() {

  const { projects } = useProjects();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());


  if (statusFilter !== 'all') {
    activityItems = activityItems.filter(item => {
      if (statusFilter === 'completed') return item.isCompleted;
      if (statusFilter === 'overdue') return item.isOverdue;
      if (statusFilter === 'active') return !item.isCompleted && !item.isOverdue;
      return item.status === statusFilter;
    });
  }

  const totalPages = Math.ceil(activityItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentActivities = activityItems.slice(startIndex, startIndex + itemsPerPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const getStatusIcon = (status: string, isCompleted: boolean, isOverdue: boolean) => {

    if (isCompleted) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (isOverdue) return <AlertCircle className="h-5 w-5 text-red-600" />;

    switch (status) {
      case 'in-progress': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'review': return <Target className="h-5 w-5 text-purple-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }

  };

  const getStatusText = (status: string, isCompleted: boolean, isOverdue: boolean) => {

    if (isCompleted) return 'Completed';
    if (isOverdue) return 'Overdue';

    switch (status) {
      case 'in-progress': return 'In Progress';
      case 'review': return 'Under Review';
      default: return status;
    }

  };

  const getActivityColor = (status: string, isCompleted: boolean, isOverdue: boolean) => {

    if (isCompleted) return 'bg-green-50 border-green-200';
    if (isOverdue) return 'bg-red-50 border-red-200';

    switch (status) {
      case 'in-progress': return 'bg-blue-50 border-blue-200';
      case 'review': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }

  };

  return (
    <div className="modern-card p-6 hover:shadow-2xl transition-all duration-300">

      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
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
              className="pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200"
            >
              <option value="all">All Activities</option>
              <option value="completed">Completed</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Under Review</option>
            </select>

          </div>

          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages || 1}
          </span>

        </div>

      </div>


      <div className="space-y-4">

        {currentActivities.map((item) => (

          <div
            key={item.id}
            className={`flex items-center space-x-4 p-4 border rounded-xl hover:shadow-lg transition-all duration-300 ${getActivityColor(item.status, item.isCompleted, item.isOverdue)}`}
          >

            <div>{getStatusIcon(item.status, item.isCompleted, item.isOverdue)}</div>

            <div className="flex-1">

              <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>

              <div className="flex items-center space-x-4 mt-1">

                <p className="text-sm text-gray-600">
                  {getStatusText(item.status, item.isCompleted, item.isOverdue)} • {item.progress}% complete
                </p>

                <div className="w-20 bg-gray-200 rounded-full h-2">

                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  />

                </div>

              </div>

            </div>

            <div className="text-right">

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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={activityItems.length}
        itemsPerPage={itemsPerPage}
      />

    </div>
  );
}