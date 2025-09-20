import React, { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, Target, CheckCircle, Clock, Star, Award, Calendar } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';

interface PerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PerformanceMetrics {
  totalProjects: number;
  completedProjects: number;
  averageProgress: number;
  onTimeDelivery: number;
  skillUtilization: number;
  productivityScore: number;
  recentAchievements: string[];
  monthlyProgress: { month: string; completed: number; total: number }[];
}

export default function PerformanceModal({ isOpen, onClose }: PerformanceModalProps) {
  const { projects } = useProjects();
  const { userProfile } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    if (isOpen) {
      calculatePerformanceMetrics();
    }
  }, [isOpen, projects, selectedPeriod]);

  const calculatePerformanceMetrics = () => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const now = new Date();
      let filteredProjects = projects;

      // Filter projects based on selected period
      if (selectedPeriod === 'month') {
        filteredProjects = projects.filter(p => {
          const projectDate = p.createdAt;
          return projectDate.getMonth() === now.getMonth() && 
                 projectDate.getFullYear() === now.getFullYear();
        });
      } else if (selectedPeriod === 'quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        filteredProjects = projects.filter(p => {
          const projectDate = p.createdAt;
          const projectQuarter = Math.floor(projectDate.getMonth() / 3);
          return projectQuarter === currentQuarter && 
                 projectDate.getFullYear() === now.getFullYear();
        });
      }

      const totalProjects = filteredProjects.length;
      const completedProjects = filteredProjects.filter(p => p.status === 'completed').length;
      const averageProgress = totalProjects > 0 
        ? Math.round(filteredProjects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
        : 0;

      // Calculate on-time delivery rate
      const projectsWithDeadlines = filteredProjects.filter(p => p.status === 'completed');
      const onTimeProjects = projectsWithDeadlines.filter(p => {
        // Simulate completion date (in real app, this would come from backend)
        const estimatedCompletionDate = new Date(p.deadline);
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() - Math.floor(Math.random() * 5));
        return estimatedCompletionDate <= p.deadline;
      });
      const onTimeDelivery = projectsWithDeadlines.length > 0 
        ? Math.round((onTimeProjects.length / projectsWithDeadlines.length) * 100)
        : 100;

      // Calculate skill utilization (simulated)
      const skillUtilization = Math.min(100, Math.max(60, 75 + Math.floor(Math.random() * 20)));

      // Calculate productivity score (composite metric)
      const productivityScore = Math.round(
        (averageProgress * 0.3) + 
        (onTimeDelivery * 0.3) + 
        (skillUtilization * 0.2) + 
        ((completedProjects / Math.max(totalProjects, 1)) * 100 * 0.2)
      );

      // Generate recent achievements
      const achievements = [];
      if (completedProjects > 0) {
        achievements.push(`Completed ${completedProjects} project${completedProjects > 1 ? 's' : ''} this ${selectedPeriod}`);
      }
      if (averageProgress > 80) {
        achievements.push('Maintained high project progress rate');
      }
      if (onTimeDelivery >= 90) {
        achievements.push('Excellent on-time delivery record');
      }
      if (productivityScore > 85) {
        achievements.push('Outstanding productivity performance');
      }

      // Generate monthly progress data
      const monthlyProgress = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthProjects = projects.filter(p => {
          const projectDate = p.createdAt;
          return projectDate.getMonth() === date.getMonth() && 
                 projectDate.getFullYear() === date.getFullYear();
        });
        
        monthlyProgress.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          completed: monthProjects.filter(p => p.status === 'completed').length,
          total: monthProjects.length
        });
      }

      setMetrics({
        totalProjects,
        completedProjects,
        averageProgress,
        onTimeDelivery,
        skillUtilization,
        productivityScore,
        recentAchievements: achievements,
        monthlyProgress
      });
      
      setLoading(false);
    }, 1000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    if (score >= 60) return 'Below Average';
    return 'Needs Improvement';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">My Performance</h2>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'month' | 'quarter' | 'year')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-4 text-gray-600">Calculating performance metrics...</p>
          </div>
        ) : metrics ? (
          <div className="p-6">
            {/* Overall Performance Score */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Overall Performance Score</h3>
                  <p className="text-gray-600">Based on project completion, quality, and efficiency</p>
                </div>
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreColor(metrics.productivityScore)}`}>
                    {metrics.productivityScore}
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-2">
                    {getPerformanceLevel(metrics.productivityScore)}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{metrics.totalProjects}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Total Projects</h3>
                <p className="text-xs text-gray-500 mt-1">{metrics.completedProjects} completed</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{metrics.averageProgress}%</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Average Progress</h3>
                <p className="text-xs text-gray-500 mt-1">Across all projects</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{metrics.onTimeDelivery}%</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">On-Time Delivery</h3>
                <p className="text-xs text-gray-500 mt-1">Meeting deadlines</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{metrics.skillUtilization}%</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Skill Utilization</h3>
                <p className="text-xs text-gray-500 mt-1">Skills being used</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Progress Chart */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Monthly Progress
                </h3>
                <div className="space-y-4">
                  {metrics.monthlyProgress.map((month, index) => {
                    const completionRate = month.total > 0 ? (month.completed / month.total) * 100 : 0;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700 w-8">{month.month}</span>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900">{month.completed}/{month.total}</span>
                          <p className="text-xs text-gray-500">projects</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-600" />
                  Recent Achievements
                </h3>
                <div className="space-y-3">
                  {metrics.recentAchievements.length > 0 ? (
                    metrics.recentAchievements.map((achievement, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Award className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{achievement}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No achievements yet</p>
                      <p className="text-sm text-gray-400 mt-1">Complete projects to earn achievements</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Strengths</h4>
                  <div className="space-y-2">
                    {metrics.onTimeDelivery >= 80 && (
                      <div className="flex items-center space-x-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Excellent deadline management</span>
                      </div>
                    )}
                    {metrics.averageProgress >= 75 && (
                      <div className="flex items-center space-x-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Consistent project progress</span>
                      </div>
                    )}
                    {metrics.skillUtilization >= 80 && (
                      <div className="flex items-center space-x-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Good skill utilization</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Areas for Improvement</h4>
                  <div className="space-y-2">
                    {metrics.onTimeDelivery < 80 && (
                      <div className="flex items-center space-x-2 text-orange-700">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Focus on meeting deadlines</span>
                      </div>
                    )}
                    {metrics.averageProgress < 75 && (
                      <div className="flex items-center space-x-2 text-orange-700">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Improve project completion rate</span>
                      </div>
                    )}
                    {metrics.skillUtilization < 80 && (
                      <div className="flex items-center space-x-2 text-orange-700">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Utilize more of your skills</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Unable to load performance data</p>
          </div>
        )}
      </div>
    </div>
  );
}