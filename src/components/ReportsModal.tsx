import React, { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, Users, IndianRupee, Calendar, Filter, Download, PieChart, Activity, FileSpreadsheet, FileText } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useEmployees } from '../hooks/useEmployees';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportsModal({ isOpen, onClose }: ReportsModalProps) {
  const { projects } = useProjects();
  const { allEmployees } = useEmployees();
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Initialize date range to current month
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setDateRange({
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    });
  }, []);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showExportMenu && !target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  // Filter projects based on selected filters
  const filteredProjects = projects.filter(project => {
    const projectDate = project.createdAt;
    const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;

    if (startDate && projectDate < startDate) return false;
    if (endDate && projectDate > endDate) return false;
    if (selectedProject && project.id !== selectedProject) return false;
    if (selectedEmployee && !project.assignedEmployees.includes(selectedEmployee)) return false;

    return true;
  });

  // Calculate metrics
  const totalProjects = filteredProjects.length;
  const completedProjects = filteredProjects.filter(p => p.status === 'completed').length;
  const inProgressProjects = filteredProjects.filter(p => p.status === 'in-progress').length;
  const overdueProjects = filteredProjects.filter(p => new Date() > p.deadline && p.status !== 'completed').length;
  
  const totalBudget = filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const averageProgress = totalProjects > 0 
    ? Math.round(filteredProjects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
    : 0;

  // Employee performance metrics
  const employeeMetrics = allEmployees.map(employee => {
    const employeeProjects = filteredProjects.filter(p => 
      p.assignedEmployees.includes(employee.uid)
    );
    const completedCount = employeeProjects.filter(p => p.status === 'completed').length;
    const avgProgress = employeeProjects.length > 0
      ? Math.round(employeeProjects.reduce((sum, p) => sum + p.progress, 0) / employeeProjects.length)
      : 0;

    return {
      employee,
      projectCount: employeeProjects.length,
      completedCount,
      avgProgress,
      efficiency: employeeProjects.length > 0 ? Math.round((completedCount / employeeProjects.length) * 100) : 0
    };
  }).filter(metric => metric.projectCount > 0);

  // Project status distribution
  const statusDistribution = [
    { status: 'Completed', count: completedProjects, color: 'bg-green-500' },
    { status: 'In Progress', count: inProgressProjects, color: 'bg-blue-500' },
    { status: 'Planning', count: filteredProjects.filter(p => p.status === 'planning').length, color: 'bg-gray-500' },
    { status: 'Review', count: filteredProjects.filter(p => p.status === 'review').length, color: 'bg-purple-500' },
    { status: 'On Hold', count: filteredProjects.filter(p => p.status === 'on-hold').length, color: 'bg-red-500' }
  ];

  const handleExportCSV = () => {
    const csvRows = [];

    // Add header
    csvRows.push(['Project Report - Generated on ' + new Date().toLocaleDateString()]);
    csvRows.push([]);

    // Add summary section
    csvRows.push(['Summary']);
    csvRows.push(['Total Projects', totalProjects]);
    csvRows.push(['Completed Projects', completedProjects]);
    csvRows.push(['In Progress Projects', inProgressProjects]);
    csvRows.push(['Overdue Projects', overdueProjects]);
    csvRows.push(['Total Budget', '₹' + totalBudget.toLocaleString('en-IN')]);
    csvRows.push(['Average Progress', averageProgress + '%']);
    csvRows.push([]);

    // Add employee metrics section
    if (employeeMetrics.length > 0) {
      csvRows.push(['Employee Performance']);
      csvRows.push(['Name', 'Projects', 'Completed', 'Avg Progress', 'Efficiency']);
      employeeMetrics.forEach(metric => {
        csvRows.push([
          metric.employee.name,
          metric.projectCount,
          metric.completedCount,
          metric.avgProgress + '%',
          metric.efficiency + '%'
        ]);
      });
      csvRows.push([]);
    }

    // Add project details section
    csvRows.push(['Project Details']);
    csvRows.push(['Project Name', 'Status', 'Priority', 'Progress', 'Budget', 'Team Size', 'Deadline', 'Created At']);
    filteredProjects.forEach(project => {
      csvRows.push([
        project.title,
        project.status,
        project.priority,
        project.progress + '%',
        project.budget ? '₹' + project.budget.toLocaleString('en-IN') : 'N/A',
        project.assignedEmployees.length,
        project.deadline.toLocaleDateString(),
        project.createdAt.toLocaleDateString()
      ]);
    });

    // Convert to CSV string
    const csvContent = csvRows.map(row =>
      row.map(cell =>
        typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))
          ? `"${cell.replace(/"/g, '""')}"`
          : cell
      ).join(',')
    ).join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    // Create Excel-compatible HTML table
    let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4B6AFF; color: white; font-weight: bold; }
          .summary-header { background-color: #E8EDFF; font-weight: bold; padding: 10px; }
          .section-title { background-color: #F3F4F6; font-weight: bold; padding: 10px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Project Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>

        <div class="section-title">Summary</div>
        <table>
          <tr><th>Metric</th><th>Value</th></tr>
          <tr><td>Total Projects</td><td>${totalProjects}</td></tr>
          <tr><td>Completed Projects</td><td>${completedProjects}</td></tr>
          <tr><td>In Progress Projects</td><td>${inProgressProjects}</td></tr>
          <tr><td>Overdue Projects</td><td>${overdueProjects}</td></tr>
          <tr><td>Total Budget</td><td>₹${totalBudget.toLocaleString('en-IN')}</td></tr>
          <tr><td>Average Progress</td><td>${averageProgress}%</td></tr>
        </table>

        ${employeeMetrics.length > 0 ? `
        <div class="section-title" style="margin-top: 30px;">Employee Performance</div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Projects</th>
              <th>Completed</th>
              <th>Avg Progress</th>
              <th>Efficiency</th>
            </tr>
          </thead>
          <tbody>
            ${employeeMetrics.map(metric => `
              <tr>
                <td>${metric.employee.name}</td>
                <td>${metric.projectCount}</td>
                <td>${metric.completedCount}</td>
                <td>${metric.avgProgress}%</td>
                <td>${metric.efficiency}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        <div class="section-title" style="margin-top: 30px;">Project Details</div>
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Progress</th>
              <th>Budget</th>
              <th>Team Size</th>
              <th>Deadline</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            ${filteredProjects.map(project => `
              <tr>
                <td>${project.title}</td>
                <td>${project.status}</td>
                <td>${project.priority}</td>
                <td>${project.progress}%</td>
                <td>${project.budget ? '₹' + project.budget.toLocaleString('en-IN') : 'N/A'}</td>
                <td>${project.assignedEmployees.length}</td>
                <td>${project.deadline.toLocaleDateString()}</td>
                <td>${project.createdAt.toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Download as Excel file
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-report-${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Project Reports</h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative export-menu-container">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={handleExportExcel}
                    className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 transition-colors duration-200 text-left rounded-t-lg"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">Export as Excel</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 transition-colors duration-200 text-left border-t border-gray-100 rounded-b-lg"
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Export as CSV</span>
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Projects</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Employees</option>
                  {allEmployees.map(employee => (
                    <option key={employee.uid} value={employee.uid}>{employee.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{totalProjects}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Projects</h3>
              <p className="text-xs text-gray-500 mt-1">{completedProjects} completed</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{averageProgress}%</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Average Progress</h3>
              <p className="text-xs text-gray-500 mt-1">Across all projects</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">₹{totalBudget.toLocaleString('en-IN')}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Budget</h3>
              <p className="text-xs text-gray-500 mt-1">Allocated funds</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{overdueProjects}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Overdue Projects</h3>
              <p className="text-xs text-gray-500 mt-1">Need attention</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Project Status Distribution */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <PieChart className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Project Status Distribution</h3>
              </div>
              <div className="space-y-3">
                {statusDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                      <span className="text-sm font-medium text-gray-700">{item.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900">{item.count}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${totalProjects > 0 ? (item.count / totalProjects) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Performance */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Employee Performance</h3>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {employeeMetrics.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No employee data available</p>
                ) : (
                  employeeMetrics
                    .sort((a, b) => b.efficiency - a.efficiency)
                    .map((metric, index) => (
                      <div key={metric.employee.uid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">
                              {metric.employee.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{metric.employee.name}</p>
                            <p className="text-xs text-gray-500">
                              {metric.projectCount} projects • {metric.completedCount} completed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{metric.efficiency}%</p>
                          <p className="text-xs text-gray-500">Efficiency</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Project Details Table */}
          <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Project</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Progress</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Budget</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Team</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        No projects found matching the selected filters
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project) => (
                      <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{project.title}</p>
                            <p className="text-xs text-gray-500">{project.priority.toUpperCase()}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'review' ? 'bg-purple-100 text-purple-800' :
                            project.status === 'on-hold' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {project.budget ? `₹${project.budget.toLocaleString('en-IN')}` : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span className="text-xs">{project.assignedEmployees.length}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs ${
                            new Date() > project.deadline && project.status !== 'completed'
                              ? 'text-red-600 font-medium'
                              : 'text-gray-600'
                          }`}>
                            {project.deadline.toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}