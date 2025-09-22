import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, CheckCircle, Clock, Star, Award } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';

interface PerformanceMetrics {
  totalProjects: number;
  completedProjects: number;
  averageProgress: number;
  onTimeDelivery: number;
  productivityScore: number;
}

export default function PerformanceCard() {
  const { projects } = useProjects();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    // Calculate performance metrics
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const averageProgress = totalProjects > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
      : 0;

    // Calculate on-time delivery rate (simulated)
    const projectsWithDeadlines = projects.filter(p => p.status === 'completed');
    const onTimeProjects = projectsWithDeadlines.filter(p => {
      // Simulate completion date (in real app, this would come from backend)
      const estimatedCompletionDate = new Date(p.deadline);
      estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() - Math.floor(Math.random() * 3));
      return estimatedCompletionDate <= p.deadline;
    });
    const onTimeDelivery = projectsWithDeadlines.length > 0 
      ? Math.round((onTimeProjects.length / projectsWithDeadlines.length) * 100)
      : 100;

    // Calculate productivity score (composite metric)
    const productivityScore = Math.round(
      (averageProgress * 0.4) + 
      (onTimeDelivery * 0.3) + 
      ((completedProjects / Math.max(totalProjects, 1)) * 100 * 0.3)
    );

    setMetrics({
      totalProjects,
      completedProjects,
      averageProgress,
      onTimeDelivery,
      productivityScore
    });
  }, [projects]);

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

  if (!metrics) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-card p-6 group animate-float-up hover:shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-purple-600 animate-float-up" />
          <h2 className="text-xl font-semibold text-gray-900">My Performance</h2>
        </div>
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-xl font-bold ${getScoreColor(metrics.productivityScore)} animate-pulse-glow shadow-lg border-2`}>
          {metrics.productivityScore}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2 animate-float-up">Overall Performance Level</p>
        <p className="text-lg font-semibold gradient-text animate-float-down">{getPerformanceLevel(metrics.productivityScore)}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg hover:shadow-lg transition-all duration-300 group border border-blue-200 hover:border-blue-300">
          <Target className="h-6 w-6 text-blue-600 mx-auto mb-2 group-hover:animate-pulse" />
          <p className="text-2xl font-bold text-blue-600">{metrics.totalProjects}</p>
          <p className="text-xs text-blue-700">Total Projects</p>
        </div>

        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg hover:shadow-lg transition-all duration-300 group border border-green-200 hover:border-green-300">
          <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2 group-hover:animate-pulse" />
          <p className="text-2xl font-bold text-green-600">{metrics.completedProjects}</p>
          <p className="text-xs text-green-700">Completed</p>
        </div>

        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:shadow-lg transition-all duration-300 group border border-purple-200 hover:border-purple-300">
          <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2 group-hover:animate-pulse" />
          <p className="text-2xl font-bold text-purple-600">{metrics.averageProgress}%</p>
          <p className="text-xs text-purple-700">Avg Progress</p>
        </div>

        <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg hover:shadow-lg transition-all duration-300 group border border-yellow-200 hover:border-yellow-300">
          <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2 group-hover:animate-pulse" />
          <p className="text-2xl font-bold text-yellow-600">{metrics.onTimeDelivery}%</p>
          <p className="text-xs text-yellow-700">On Time</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 animate-float-up">
        <div className="flex items-center space-x-2 mb-2">
          <Award className="h-5 w-5 text-purple-600 animate-pulse-glow" />
          <h3 className="font-semibold text-gray-900">Recent Achievement</h3>
        </div>
        <p className="text-sm text-gray-700">
          {metrics.completedProjects > 0 
            ? `Completed ${metrics.completedProjects} project${metrics.completedProjects > 1 ? 's' : ''} this month`
            : 'Keep working on your current projects to earn achievements!'
          }
        </p>
      </div>
    </div>
  );
}