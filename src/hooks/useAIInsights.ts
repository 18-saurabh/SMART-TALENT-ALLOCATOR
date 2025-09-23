import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmployees } from './useEmployees';
import { useProjects } from './useProjects';
import { 
  aiInsightsService, 
  EmployeeInsightsResponse, 
  ManagerInsightsResponse,
  PerformanceRecord,
  LearningHistory,
  GoalProgress
} from '../services/aiInsightsService';

export function useAIInsights() {
  const { userProfile } = useAuth();
  const { getCurrentEmployee, allEmployees } = useEmployees();
  const { projects } = useProjects();
  
  const [employeeInsights, setEmployeeInsights] = useState<EmployeeInsightsResponse | null>(null);
  const [managerInsights, setManagerInsights] = useState<ManagerInsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Generate mock performance records for demo
  const generateMockPerformanceRecords = (employeeId: string): PerformanceRecord[] => {
    const records: PerformanceRecord[] = [];
    const now = new Date();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      const baseScore = 3.5 + Math.random() * 1.5; // 3.5 to 5.0
      const feedbacks = [
        'Great communication skills and team collaboration',
        'Shows initiative in problem-solving',
        'Delivers quality work on time',
        'Could improve on technical documentation',
        'Excellent attention to detail',
        'Strong analytical thinking'
      ];
      
      records.push({
        date,
        score: Math.round(baseScore * 10) / 10,
        feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
        source: ['peer', 'manager', 'self'][Math.floor(Math.random() * 3)] as 'peer' | 'manager' | 'self'
      });
    }
    
    return records.reverse(); // Chronological order
  };

  // Generate mock learning history
  const generateMockLearningHistory = (): LearningHistory[] => {
    const courses = [
      'React Advanced Patterns',
      'Leadership Fundamentals',
      'Data Analysis with Python',
      'Agile Project Management',
      'UI/UX Design Principles'
    ];
    
    return courses.slice(0, 2 + Math.floor(Math.random() * 3)).map(course => ({
      course,
      completedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000), // Last 6 months
      score: 80 + Math.random() * 20 // 80-100
    }));
  };

  // Generate mock goal progress
  const generateMockGoalProgress = (): GoalProgress[] => {
    const goals = [
      'Complete React certification',
      'Lead a team project',
      'Improve code review skills',
      'Mentor junior developer',
      'Learn new technology stack'
    ];
    
    return goals.slice(0, 2 + Math.floor(Math.random() * 2)).map(goal => {
      const progress = Math.floor(Math.random() * 100);
      const status = progress >= 100 ? 'completed' : 
                    progress >= 75 ? 'on-track' : 
                    progress >= 50 ? 'at-risk' : 'overdue';
      
      return {
        goal,
        progress,
        deadline: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000), // Next 3 months
        status: status as 'on-track' | 'at-risk' | 'completed' | 'overdue'
      };
    });
  };

  const refreshEmployeeInsights = async (forceRefresh = false) => {
    if (!userProfile || userProfile.role !== 'employee') return;
    
    const currentEmployee = getCurrentEmployee();
    if (!currentEmployee) return;

    setLoading(true);
    setError(null);
    
    try {
      const performanceRecords = generateMockPerformanceRecords(currentEmployee.uid);
      const learningHistory = generateMockLearningHistory();
      const goalProgress = generateMockGoalProgress();
      const employeeProjects = projects.filter(p => p.assignedEmployees.includes(currentEmployee.uid));
      
      const insights = await aiInsightsService.getEmployeeInsightsWithCache(
        currentEmployee,
        performanceRecords,
        employeeProjects,
        forceRefresh
      );
      
      setEmployeeInsights(insights);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to generate insights. Please try again.');
      console.error('Error refreshing employee insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshManagerInsights = async (forceRefresh = false) => {
    if (!userProfile || userProfile.role !== 'manager') return;

    setLoading(true);
    setError(null);
    
    try {
      // Generate performance records for all employees
      const performanceRecords = new Map<string, PerformanceRecord[]>();
      allEmployees.forEach(emp => {
        performanceRecords.set(emp.uid, generateMockPerformanceRecords(emp.uid));
      });
      
      const insights = await aiInsightsService.getManagerInsightsWithCache(
        userProfile.uid,
        allEmployees,
        performanceRecords,
        projects,
        forceRefresh
      );
      
      setManagerInsights(insights);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to generate team insights. Please try again.');
      console.error('Error refreshing manager insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const recordFeedback = async (
    insightId: string,
    action: 'helpful' | 'not_helpful' | 'disagree' | 'accept',
    feedback?: string
  ) => {
    if (!userProfile) return;
    
    try {
      await aiInsightsService.recordFeedback(
        insightId,
        userProfile.uid,
        userProfile.role,
        action,
        feedback
      );
    } catch (err) {
      console.error('Error recording feedback:', err);
    }
  };

  // Auto-refresh insights on component mount
  useEffect(() => {
    if (userProfile?.role === 'employee') {
      refreshEmployeeInsights();
    } else if (userProfile?.role === 'manager') {
      refreshManagerInsights();
    }
  }, [userProfile?.role]);

  return {
    employeeInsights,
    managerInsights,
    loading,
    error,
    lastRefresh,
    refreshEmployeeInsights,
    refreshManagerInsights,
    recordFeedback
  };
}