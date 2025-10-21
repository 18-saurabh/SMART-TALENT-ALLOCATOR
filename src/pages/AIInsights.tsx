import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmployees } from '../hooks/useEmployees';
import { useProjects } from '../hooks/useProjects';
import {
  Lightbulb,
  TrendingUp,
  Star,
  Users,
  BookOpen,
  IndianRupee,
  Target,
  Award,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Brain,
  Sparkles
} from 'lucide-react';

interface SkillRecommendation {
  name: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
}

interface TrendingSkill {
  skill: string;
  roles: string[];
  payBoost: string;
  demandScore: number;
  marketTrend: 'rising' | 'stable' | 'declining';
}

interface LearningPlan {
  step: string;
  duration: string;
  priority: number;
  resources: string[];
}

interface Course {
  title: string;
  provider: string;
  duration: string;
  rating: number;
  price: string;
  url?: string;
}

interface SkillGap {
  skill: string;
  gapScore: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  affectedEmployees: number;
  impact: string;
}

interface EmployeeUpskill {
  id: string;
  name: string;
  recommendation: string;
  payBoost: string;
  currentSkills: string[];
  targetSkills: string[];
}

interface EmployeeInsights {
  performanceSummary: string;
  performanceTrend: 'improving' | 'stable' | 'declining';
  skillRecommendations: SkillRecommendation[];
  trendingSkills: TrendingSkill[];
  learningPlan: LearningPlan[];
  courses: Course[];
  careerGrowthScore: number;
  nextPromotion: {
    role: string;
    timeframe: string;
    requiredSkills: string[];
  };
}

interface ManagerInsights {
  teamOverview: string;
  teamPerformanceTrend: 'improving' | 'stable' | 'declining';
  skillGaps: SkillGap[];
  trendingSkills: TrendingSkill[];
  employeesToUpskill: EmployeeUpskill[];
  teamStrengths: string[];
  recommendedActions: {
    action: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
    timeline: string;
  }[];
}

export default function AIInsights() {
  const { userProfile } = useAuth();
  const { getCurrentEmployee, allEmployees } = useEmployees();
  const { projects } = useProjects();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeInsights, setEmployeeInsights] = useState<EmployeeInsights | null>(null);
  const [managerInsights, setManagerInsights] = useState<ManagerInsights | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    generateInsights();
  }, [userProfile]);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (userProfile?.role === 'employee') {
        setEmployeeInsights(generateEmployeeInsights());
      } else if (userProfile?.role === 'manager') {
        setManagerInsights(generateManagerInsights());
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateEmployeeInsights = (): EmployeeInsights => {
    const currentEmployee = getCurrentEmployee();
    const employeeProjects = projects.filter(p => 
      currentEmployee && p.assignedEmployees.includes(currentEmployee.uid)
    );
    
    const completedProjects = employeeProjects.filter(p => p.status === 'completed').length;
    const totalProjects = employeeProjects.length;
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

    return {
      performanceSummary: `You've completed ${completedProjects} out of ${totalProjects} projects with a ${Math.round(completionRate)}% success rate. Your performance trend shows consistent growth with strong technical execution.`,
      performanceTrend: completionRate > 80 ? 'improving' : completionRate > 60 ? 'stable' : 'declining',
      skillRecommendations: [
        {
          name: 'React Advanced Patterns',
          reason: 'High demand in your current projects and ₹2-3 LPA salary increase potential',
          priority: 'high',
          estimatedTime: '4-6 weeks'
        },
        {
          name: 'Cloud Architecture (AWS)',
          reason: 'Critical for senior roles, ₹3-4 LPA average salary boost',
          priority: 'high',
          estimatedTime: '8-10 weeks'
        },
        {
          name: 'Leadership & Communication',
          reason: 'Essential for career progression to senior positions',
          priority: 'medium',
          estimatedTime: '6-8 weeks'
        }
      ],
      trendingSkills: [
        {
          skill: 'AI/ML Integration',
          roles: ['Senior Developer', 'Tech Lead', 'AI Engineer'],
          payBoost: '₹4-6 LPA',
          demandScore: 95,
          marketTrend: 'rising'
        },
        {
          skill: 'Kubernetes',
          roles: ['DevOps Engineer', 'Cloud Architect', 'Senior Developer'],
          payBoost: '₹3-5 LPA',
          demandScore: 88,
          marketTrend: 'rising'
        },
        {
          skill: 'TypeScript',
          roles: ['Frontend Developer', 'Full Stack Developer'],
          payBoost: '₹2-3 LPA',
          demandScore: 82,
          marketTrend: 'stable'
        }
      ],
      learningPlan: [
        {
          step: 'Complete React Advanced Patterns course',
          duration: '4 weeks',
          priority: 1,
          resources: ['React Documentation', 'Advanced React Course', 'Practice Projects']
        },
        {
          step: 'Get AWS Cloud Practitioner certification',
          duration: '6 weeks',
          priority: 2,
          resources: ['AWS Training', 'Practice Labs', 'Certification Exam']
        },
        {
          step: 'Build a portfolio project showcasing new skills',
          duration: '3 weeks',
          priority: 3,
          resources: ['GitHub', 'Personal Website', 'Case Study Documentation']
        }
      ],
      courses: [
        {
          title: 'Advanced React Patterns & Performance',
          provider: 'Frontend Masters',
          duration: '6 hours',
          rating: 4.8,
          price: '₹3,200/month'
        },
        {
          title: 'AWS Solutions Architect',
          provider: 'A Cloud Guru',
          duration: '20 hours',
          rating: 4.7,
          price: '₹4,000/month'
        },
        {
          title: 'Leadership for Tech Professionals',
          provider: 'LinkedIn Learning',
          duration: '4 hours',
          rating: 4.6,
          price: '₹2,500/month'
        }
      ],
      careerGrowthScore: 78,
      nextPromotion: {
        role: 'Senior Developer',
        timeframe: '8-12 months',
        requiredSkills: ['Advanced React', 'Cloud Architecture', 'Team Leadership']
      }
    };
  };

  const generateManagerInsights = (): ManagerInsights => {
    const teamSize = allEmployees.length;
    const teamProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const teamCompletionRate = teamProjects > 0 ? (completedProjects / teamProjects) * 100 : 0;

    return {
      teamOverview: `Your team of ${teamSize} members has completed ${completedProjects} out of ${teamProjects} projects (${Math.round(teamCompletionRate)}% completion rate). Team performance is trending upward with strong collaboration.`,
      teamPerformanceTrend: teamCompletionRate > 80 ? 'improving' : teamCompletionRate > 60 ? 'stable' : 'declining',
      skillGaps: [
        {
          skill: 'Cloud Architecture',
          gapScore: 85,
          priority: 'critical',
          affectedEmployees: Math.floor(teamSize * 0.7),
          impact: 'Blocking senior project assignments and client requirements'
        },
        {
          skill: 'AI/ML Integration',
          gapScore: 92,
          priority: 'high',
          affectedEmployees: Math.floor(teamSize * 0.8),
          impact: 'Missing opportunities in AI-driven projects'
        },
        {
          skill: 'DevOps & CI/CD',
          gapScore: 65,
          priority: 'medium',
          affectedEmployees: Math.floor(teamSize * 0.5),
          impact: 'Slower deployment cycles and reduced efficiency'
        }
      ],
      trendingSkills: [
        {
          skill: 'AI/ML Integration',
          roles: ['Senior Developer', 'Tech Lead', 'AI Specialist'],
          payBoost: '₹5-7 LPA',
          demandScore: 96,
          marketTrend: 'rising'
        },
        {
          skill: 'Cloud Native Development',
          roles: ['Cloud Architect', 'DevOps Engineer', 'Senior Developer'],
          payBoost: '₹4-6 LPA',
          demandScore: 89,
          marketTrend: 'rising'
        },
        {
          skill: 'Cybersecurity',
          roles: ['Security Engineer', 'DevSecOps', 'Architect'],
          payBoost: '₹4-6 LPA',
          demandScore: 87,
          marketTrend: 'rising'
        }
      ],
      employeesToUpskill: allEmployees.slice(0, 3).map((emp, index) => ({
        id: emp.uid,
        name: emp.name,
        recommendation: ['Cloud Architecture certification', 'AI/ML fundamentals', 'Advanced React patterns'][index] || 'Full-stack development',
        payBoost: ['₹3-4 LPA', '₹4-6 LPA', '₹2-3 LPA'][index] || '₹3-4 LPA',
        currentSkills: emp.skills.map(s => s.name),
        targetSkills: [
          ['AWS', 'Azure', 'Kubernetes'],
          ['Python', 'TensorFlow', 'Machine Learning'],
          ['React', 'Node.js', 'TypeScript']
        ][index] || ['JavaScript', 'React', 'Node.js']
      })),
      teamStrengths: [
        'Strong frontend development capabilities',
        'Excellent project completion rate',
        'Good collaboration and communication',
        'Adaptable to new technologies'
      ],
      recommendedActions: [
        {
          action: 'Implement AI/ML training program for the team',
          priority: 'high',
          impact: 'Enable team to take on high-value AI projects',
          timeline: '3-4 months'
        },
        {
          action: 'Cloud architecture certification track',
          priority: 'high',
          impact: 'Qualify for enterprise cloud projects',
          timeline: '2-3 months'
        },
        {
          action: 'Establish mentorship program',
          priority: 'medium',
          impact: 'Accelerate skill development and knowledge sharing',
          timeline: '1-2 months'
        }
      ]
    };
  };

  const handleRefresh = () => {
    generateInsights();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMarketTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Please sign in to view AI insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float-up"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float-down"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float-rotate"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="h-6 w-6 text-purple-600 animate-float-rotate" />
            <span className="text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
              AI-Powered Insights
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 animate-float-up">
                <span className="gradient-text">AI Insights</span> Dashboard
              </h1>
              <p className="text-gray-600 mt-2 animate-float-down">
                {userProfile.role === 'employee' 
                  ? 'Personalized career growth and skill recommendations'
                  : 'Team performance insights and skill gap analysis'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {lastRefresh && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>Updated {lastRefresh.toLocaleTimeString()}</span>
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
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating AI insights...</p>
            <p className="text-sm text-gray-500 mt-2">Analyzing performance data and market trends</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Tab Navigation */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'overview', label: 'Overview', icon: BarChart3 },
                      { id: 'skills', label: 'Skills', icon: Star },
                      ...(userProfile.role === 'employee' ? [{ id: 'career', label: 'Career Growth', icon: TrendingUp }] : []),
                      { id: 'actions', label: 'Recommended Actions', icon: Target }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600 animate-pulse-glow'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="modern-card p-6 animate-float-up">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Performance Overview
                    </h2>
                    
                    {userProfile.role === 'employee' && employeeInsights && (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            {getTrendIcon(employeeInsights.performanceTrend)}
                            <span className="font-medium text-gray-900">Performance Summary</span>
                          </div>
                          <p className="text-gray-700">{employeeInsights.performanceSummary}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2">Career Growth Score</h3>
                            <div className="flex items-center space-x-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-3">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${employeeInsights.careerGrowthScore}%` }}
                                />
                              </div>
                              <span className="text-lg font-bold text-gray-900">{employeeInsights.careerGrowthScore}/100</span>
                            </div>
                          </div>
                          
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2">Next Promotion</h3>
                            <p className="text-sm text-gray-600">{employeeInsights.nextPromotion.role}</p>
                            <p className="text-xs text-gray-500">Target: {employeeInsights.nextPromotion.timeframe}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {userProfile.role === 'manager' && managerInsights && (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            {getTrendIcon(managerInsights.teamPerformanceTrend)}
                            <span className="font-medium text-gray-900">Team Overview</span>
                          </div>
                          <p className="text-gray-700">{managerInsights.teamOverview}</p>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 mb-3">Team Strengths</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {managerInsights.teamStrengths.map((strength, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-700">{strength}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'skills' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-600" />
                      {userProfile.role === 'employee' ? 'Skill Recommendations' : 'Team Skill Analysis'}
                    </h2>
                    
                    {userProfile.role === 'employee' && employeeInsights && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3">Recommended Skills to Acquire</h3>
                          <div className="space-y-3">
                            {employeeInsights.skillRecommendations.map((skill, index) => (
                              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-gray-900">{skill.name}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(skill.priority)}`}>
                                    {skill.priority}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{skill.reason}</p>
                                <p className="text-xs text-gray-500">Estimated time: {skill.estimatedTime}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {userProfile.role === 'manager' && managerInsights && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3">Critical Skill Gaps</h3>
                          <div className="space-y-3">
                            {managerInsights.skillGaps.map((gap, index) => (
                              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-gray-900">{gap.skill}</h4>
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(gap.priority)}`}>
                                      {gap.priority}
                                    </span>
                                    <span className="text-sm font-bold text-red-600">{gap.gapScore}% gap</span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{gap.impact}</p>
                                <p className="text-xs text-gray-500">Affects {gap.affectedEmployees} team members</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trending Skills Section */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                        Market Trending Skills
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(userProfile.role === 'employee' ? employeeInsights?.trendingSkills : managerInsights?.trendingSkills)?.map((trend, index) => (
                          <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{trend.skill}</h4>
                              <div className="flex items-center space-x-1">
                                <TrendingUp className={`h-4 w-4 ${getMarketTrendColor(trend.marketTrend)}`} />
                                <span className="text-sm font-bold text-green-600">{trend.demandScore}/100</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Roles: {trend.roles.join(', ')}
                            </p>
                            <div className="flex items-center space-x-2">
                              <IndianRupee className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700">
                                Pay boost: {trend.payBoost}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'career' && userProfile.role === 'employee' && employeeInsights && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                      Career Growth Plan
                    </h2>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-purple-600" />
                        Next Career Milestone
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Target Role</p>
                          <p className="font-medium text-gray-900">{employeeInsights.nextPromotion.role}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Timeframe</p>
                          <p className="font-medium text-gray-900">{employeeInsights.nextPromotion.timeframe}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Required Skills</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {employeeInsights.nextPromotion.requiredSkills.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Learning Plan</h3>
                      <div className="space-y-3">
                        {employeeInsights.learningPlan.map((step, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-600">{step.priority}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">{step.step}</h4>
                                <p className="text-sm text-gray-600 mb-2">Duration: {step.duration}</p>
                                <div className="flex flex-wrap gap-1">
                                  {step.resources.map((resource, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                      {resource}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'actions' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-green-600" />
                      Recommended Actions
                    </h2>
                    
                    {userProfile.role === 'employee' && employeeInsights && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3">Immediate Next Steps</h3>
                          <div className="space-y-3">
                            {employeeInsights.learningPlan.slice(0, 3).map((step, index) => (
                              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-gray-900">{step.step}</h4>
                                  <span className="text-sm text-gray-500">{step.duration}</span>
                                </div>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm">
                                  Start Learning
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {userProfile.role === 'manager' && managerInsights && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3">Team Development Actions</h3>
                          <div className="space-y-3">
                            {managerInsights.recommendedActions.map((action, index) => (
                              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-gray-900">{action.action}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(action.priority)}`}>
                                    {action.priority}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{action.impact}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Timeline: {action.timeline}</span>
                                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm">
                                    Implement
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium text-gray-900 mb-3">Employees Ready for Upskilling</h3>
                          <div className="space-y-3">
                            {managerInsights.employeesToUpskill.map((employee, index) => (
                              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-gray-900">{employee.name}</h4>
                                  <span className="text-sm font-medium text-green-600">
                                    Potential boost: {employee.payBoost}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{employee.recommendation}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-wrap gap-1">
                                    {employee.targetSkills.slice(0, 3).map((skill, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm">
                                    Assign Training
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Summary */}
              <div className="modern-card p-6 animate-float-up sticky top-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                  Quick Summary
                </h3>
                
                {userProfile.role === 'employee' && employeeInsights && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-blue-600">{employeeInsights.careerGrowthScore}</span>
                      </div>
                      <p className="text-sm text-gray-600">Career Growth Score</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Skills to Learn</span>
                        <span className="font-medium">{employeeInsights.skillRecommendations.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Learning Steps</span>
                        <span className="font-medium">{employeeInsights.learningPlan.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Trending Skills</span>
                        <span className="font-medium">{employeeInsights.trendingSkills.length}</span>
                      </div>
                    </div>
                  </div>
                )}

                {userProfile.role === 'manager' && managerInsights && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-red-600">{managerInsights.skillGaps.length}</div>
                        <p className="text-xs text-gray-600">Skill Gaps</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{managerInsights.employeesToUpskill.length}</div>
                        <p className="text-xs text-gray-600">Ready to Upskill</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Team Actions</span>
                        <span className="font-medium">{managerInsights.recommendedActions.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Trending Skills</span>
                        <span className="font-medium">{managerInsights.trendingSkills.length}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recommended Courses */}
              {userProfile.role === 'employee' && employeeInsights && (
                <div className="modern-card p-6 animate-float-down">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                    Recommended Courses
                  </h3>
                  <div className="space-y-3">
                    {employeeInsights.courses.map((course, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">{course.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{course.provider}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.floor(course.rating)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">{course.rating}</span>
                          </div>
                          <span className="text-xs font-medium text-green-600">{course.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}