import React, { useState } from 'react';
import { Brain, RefreshCw, Users, AlertTriangle, TrendingUp, CheckCircle, Calendar, MessageSquare, BookOpen, UserPlus, Info, Clock } from 'lucide-react';
import { useAIInsights } from '../hooks/useAIInsights';
import { ManagerInsight, InsightAction } from '../services/aiInsightsService';

interface TeamAIInsightsCardProps {
  className?: string;
}

export default function TeamAIInsightsCard({ className = '' }: TeamAIInsightsCardProps) {
  const { 
    managerInsights, 
    loading, 
    error, 
    lastRefresh, 
    refreshManagerInsights, 
    recordFeedback 
  } = useAIInsights();
  
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());

  const handleRefresh = () => {
    refreshManagerInsights(true);
  };

  const handleFeedback = async (employeeId: string, action: 'helpful' | 'not_helpful') => {
    if (!managerInsights) return;
    
    const insightId = `manager_insight_${employeeId}_${managerInsights.generated_at}`;
    await recordFeedback(insightId, action);
    setFeedbackGiven(prev => new Set([...prev, employeeId]));
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'Attrition Risk': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'Performance Drop': return <TrendingUp className="h-5 w-5 text-orange-600 transform rotate-180" />;
      case 'Skill Gap': return <BookOpen className="h-5 w-5 text-yellow-600" />;
      case 'High Performer': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Development Ready': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'Attrition Risk': return 'bg-red-50 border-red-200';
      case 'Performance Drop': return 'bg-orange-50 border-orange-200';
      case 'Skill Gap': return 'bg-yellow-50 border-yellow-200';
      case 'High Performer': return 'bg-green-50 border-green-200';
      case 'Development Ready': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'mentor': return <UserPlus className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const executeAction = (action: InsightAction, employeeName: string) => {
    // In a real implementation, these would trigger actual workflows
    switch (action.type) {
      case 'meeting':
        console.log(`Scheduling ${action.meta.suggested_length} meeting with ${employeeName}`);
        break;
      case 'task':
        console.log(`Creating task for ${employeeName}: ${action.label}`);
        break;
      case 'course':
        console.log(`Recommending course to ${employeeName}: ${action.label}`);
        break;
      case 'mentor':
        console.log(`Finding mentor for ${employeeName}`);
        break;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (error) {
    return (
      <div className={`modern-card p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Team AI Insights</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`modern-card p-6 group animate-float-up hover:shadow-2xl ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-purple-600 animate-pulse-glow" />
          <h3 className="text-lg font-semibold text-gray-900">Team AI Insights</h3>
        </div>
        <div className="flex items-center space-x-2">
          {lastRefresh && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{lastRefresh.toLocaleTimeString()}</span>
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
            title="Refresh team insights"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Analyzing team performance...</p>
        </div>
      ) : managerInsights ? (
        <div className="space-y-6">
          {/* Team Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Team Overview</h4>
            <p className="text-gray-700 mb-2">{managerInsights.summary}</p>
            <p className="text-sm text-gray-600">{managerInsights.team_trends}</p>
          </div>

          {/* Employee Insights */}
          {managerInsights.insights.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Team Members Needing Attention</h4>
              <div className="space-y-3">
                {managerInsights.insights.map((insight) => (
                  <div
                    key={insight.employeeId}
                    className={`border rounded-lg p-4 transition-all duration-200 ${getReasonColor(insight.reason)} hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getReasonIcon(insight.reason)}
                        <div>
                          <h5 className="font-medium text-gray-900">{insight.employeeName}</h5>
                          <p className="text-sm text-gray-700">{insight.detail}</p>
                          <span className="inline-block px-2 py-1 bg-white bg-opacity-50 text-xs font-medium rounded-full mt-1">
                            {insight.reason}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-white bg-opacity-50 text-xs font-medium rounded-full">
                          {insight.confidence}% confidence
                        </span>
                        <button
                          onClick={() => setExpandedEmployee(expandedEmployee === insight.employeeId ? null : insight.employeeId)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                          title="View actions"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded actions */}
                    {expandedEmployee === insight.employeeId && (
                      <div className="mt-4 pt-4 border-t border-current border-opacity-20 animate-float-down">
                        <h6 className="text-sm font-medium text-gray-700 mb-3">Recommended Actions</h6>
                        <div className="space-y-2">
                          {insight.actions.map((action, actionIndex) => (
                            <div key={actionIndex} className="flex items-center justify-between p-3 bg-white bg-opacity-50 rounded-md">
                              <div className="flex items-center space-x-2">
                                {getActionIcon(action.type)}
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{action.label}</p>
                                  {action.meta.suggested_length && (
                                    <p className="text-xs text-gray-500">Duration: {action.meta.suggested_length}</p>
                                  )}
                                  {action.meta.priority && (
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                                      action.meta.priority === 'high' ? 'bg-red-100 text-red-700' :
                                      action.meta.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {action.meta.priority} priority
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => executeAction(action, insight.employeeName)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors duration-200"
                              >
                                Start Action
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Feedback */}
                        {!feedbackGiven.has(insight.employeeId) && (
                          <div className="flex items-center space-x-3 mt-4 pt-3 border-t border-current border-opacity-20">
                            <span className="text-sm text-gray-600">Was this insight helpful?</span>
                            <button
                              onClick={() => handleFeedback(insight.employeeId, 'helpful')}
                              className="px-2 py-1 text-green-600 hover:bg-green-100 rounded-md transition-colors duration-200 text-xs"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => handleFeedback(insight.employeeId, 'not_helpful')}
                              className="px-2 py-1 text-red-600 hover:bg-red-100 rounded-md transition-colors duration-200 text-xs"
                            >
                              No
                            </button>
                          </div>
                        )}

                        {feedbackGiven.has(insight.employeeId) && (
                          <div className="text-sm text-gray-500 mt-4 pt-3 border-t border-current border-opacity-20">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Thank you for your feedback!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Actions */}
          {managerInsights.team_actions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Recommended Team Actions</h4>
              <div className="space-y-3">
                {managerInsights.team_actions.map((action, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900 capitalize">{action.type}</h5>
                        <p className="text-sm text-gray-700">{action.detail}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(action.impact)}`}>
                          {action.impact} impact
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          {action.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
            Generated by AI • Last updated {new Date(managerInsights.generated_at).toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No team insights available</h4>
          <p className="text-gray-500 mb-4">Click refresh to generate AI-powered insights about your team's performance and development opportunities.</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            Generate Team Insights
          </button>
        </div>
      )}
    </div>
  );
}