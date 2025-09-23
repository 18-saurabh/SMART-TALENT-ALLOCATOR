import React, { useState } from 'react';
import { Brain, RefreshCw, ThumbsUp, ThumbsDown, Info, Clock, Star, TrendingUp, AlertCircle, CheckCircle, Target } from 'lucide-react';
import { useAIInsights } from '../hooks/useAIInsights';
import { EmployeeInsight, InsightAction } from '../services/aiInsightsService';

interface AIInsightsCardProps {
  className?: string;
}

export default function AIInsightsCard({ className = '' }: AIInsightsCardProps) {
  const { 
    employeeInsights, 
    loading, 
    error, 
    lastRefresh, 
    refreshEmployeeInsights, 
    recordFeedback 
  } = useAIInsights();
  
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<number>>(new Set());

  const handleRefresh = () => {
    refreshEmployeeInsights(true);
  };

  const handleFeedback = async (insightIndex: number, action: 'helpful' | 'not_helpful') => {
    if (!employeeInsights) return;
    
    const insightId = `employee_insight_${insightIndex}_${employeeInsights.generated_at}`;
    await recordFeedback(insightId, action);
    setFeedbackGiven(prev => new Set([...prev, insightIndex]));
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'Strength': return <Star className="h-5 w-5 text-green-600" />;
      case 'Gap': return <TrendingUp className="h-5 w-5 text-orange-600" />;
      case 'NextStep': return <Target className="h-5 w-5 text-blue-600" />;
      case 'Mentor': return <CheckCircle className="h-5 w-5 text-purple-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'Strength': return 'bg-green-50 border-green-200';
      case 'Gap': return 'bg-orange-50 border-orange-200';
      case 'NextStep': return 'bg-blue-50 border-blue-200';
      case 'Mentor': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const executeAction = (action: InsightAction) => {
    // In a real implementation, these would trigger actual workflows
    switch (action.type) {
      case 'learning':
        console.log('Opening learning resource:', action.label);
        break;
      case 'meeting':
        console.log('Scheduling meeting:', action.label);
        break;
      case 'task':
        console.log('Creating task:', action.label);
        break;
      case 'mentor':
        console.log('Finding mentor for:', action.label);
        break;
      case 'course':
        console.log('Enrolling in course:', action.label);
        break;
    }
  };

  if (error) {
    return (
      <div className={`modern-card p-6 ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
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
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
          {employeeInsights && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(employeeInsights.confidence_score)}`}>
              {employeeInsights.confidence_score}% confidence
            </span>
          )}
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
            title="Refresh insights"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Generating AI insights...</p>
        </div>
      ) : employeeInsights ? (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
            <p className="text-gray-700">{employeeInsights.summary}</p>
          </div>

          {/* Insights */}
          <div className="space-y-4">
            {employeeInsights.insights.map((insight, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all duration-200 ${getInsightColor(insight.type)} hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h5 className="font-medium text-gray-900">{insight.type}</h5>
                      <p className="text-sm text-gray-700">{insight.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                      {insight.confidence}%
                    </span>
                    <button
                      onClick={() => setExpandedInsight(expandedInsight === index ? null : index)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                      title="Why this suggestion?"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedInsight === index && (
                  <div className="mt-4 pt-4 border-t border-current border-opacity-20 animate-float-down">
                    <div className="mb-3">
                      <h6 className="text-sm font-medium text-gray-700 mb-1">Why this suggestion?</h6>
                      <p className="text-sm text-gray-600">{insight.rationale}</p>
                    </div>

                    {/* Actions */}
                    {insight.actions && insight.actions.length > 0 && (
                      <div className="mb-4">
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Recommended Actions</h6>
                        <div className="space-y-2">
                          {insight.actions.map((action, actionIndex) => (
                            <div key={actionIndex} className="flex items-center justify-between p-2 bg-white bg-opacity-50 rounded-md">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{action.label}</p>
                                {action.meta.est_time && (
                                  <p className="text-xs text-gray-500">Estimated time: {action.meta.est_time}</p>
                                )}
                              </div>
                              <button
                                onClick={() => executeAction(action)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors duration-200"
                              >
                                Start Action
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    {!feedbackGiven.has(index) && (
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">Was this helpful?</span>
                        <button
                          onClick={() => handleFeedback(index, 'helpful')}
                          className="flex items-center space-x-1 px-2 py-1 text-green-600 hover:bg-green-100 rounded-md transition-colors duration-200"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span className="text-xs">Yes</span>
                        </button>
                        <button
                          onClick={() => handleFeedback(index, 'not_helpful')}
                          className="flex items-center space-x-1 px-2 py-1 text-red-600 hover:bg-red-100 rounded-md transition-colors duration-200"
                        >
                          <ThumbsDown className="h-3 w-3" />
                          <span className="text-xs">No</span>
                        </button>
                      </div>
                    )}

                    {feedbackGiven.has(index) && (
                      <div className="text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Thank you for your feedback!
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
            Generated by AI • Last updated {new Date(employeeInsights.generated_at).toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No insights available</h4>
          <p className="text-gray-500 mb-4">Click refresh to generate AI-powered insights about your performance and development opportunities.</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            Generate Insights
          </button>
        </div>
      )}
    </div>
  );
}