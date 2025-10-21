import { GoogleGenerativeAI } from '@google/generative-ai';
import { Employee } from '../hooks/useEmployees';
import { Project } from '../hooks/useProjects';

interface PerformanceRecord {
  date: Date;
  score: number;
  feedback: string;
  source: 'peer' | 'manager' | 'self';
}

interface LearningHistory {
  course: string;
  completedAt: Date;
  score?: number;
}

interface GoalProgress {
  goal: string;
  progress: number;
  deadline: Date;
  status: 'on-track' | 'at-risk' | 'completed' | 'overdue';
}

interface InsightAction {
  type: 'learning' | 'meeting' | 'task' | 'mentor' | 'course';
  label: string;
  meta: {
    est_time?: string;
    suggested_length?: string;
    priority?: 'low' | 'medium' | 'high';
    url?: string;
  };
}

interface EmployeeInsight {
  type: 'Strength' | 'Gap' | 'NextStep' | 'Mentor';
  detail: string;
  rationale: string;
  confidence: number;
  actions?: InsightAction[];
}

interface EmployeeInsightsResponse {
  summary: string;
  insights: EmployeeInsight[];
  generated_at: string;
  model_meta: {
    model: string;
    version: string;
  };
  confidence_score: number;
}

interface ManagerInsight {
  employeeId: string;
  employeeName: string;
  reason: 'Attrition Risk' | 'Skill Gap' | 'Performance Drop' | 'High Performer' | 'Development Ready';
  detail: string;
  confidence: number;
  actions: InsightAction[];
}

interface ManagerInsightsResponse {
  summary: string;
  team_trends: string;
  insights: ManagerInsight[];
  team_actions: {
    type: 'hiring' | 'training' | 'reassign' | 'recognition';
    detail: string;
    impact: 'low' | 'medium' | 'high';
    confidence: number;
  }[];
  generated_at: string;
  model_meta: {
    model: string;
    version: string;
  };
}

interface InsightAuditLog {
  id: string;
  userId: string;
  userRole: 'employee' | 'manager';
  insightType: 'employee' | 'manager';
  targetEmployeeId?: string;
  modelInputs: any;
  modelResponse: any;
  userAction?: 'refresh' | 'disagree' | 'accept' | 'helpful' | 'not_helpful';
  feedback?: string;
  timestamp: Date;
}

class AIInsightsService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private auditLogs: InsightAuditLog[] = [];

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  }

  async generateEmployeeInsights(
    employee: Employee,
    performanceRecords: PerformanceRecord[],
    projectHistory: Project[],
    learningHistory: LearningHistory[] = [],
    goalProgress: GoalProgress[] = []
  ): Promise<EmployeeInsightsResponse> {
    try {
      const prompt = this.buildEmployeePrompt(employee, performanceRecords, projectHistory, learningHistory, goalProgress);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const insights = this.parseEmployeeInsights(text, employee);
      
      // Log the interaction
      this.logInsight({
        id: this.generateId(),
        userId: employee.uid,
        userRole: 'employee',
        insightType: 'employee',
        modelInputs: { employee, performanceRecords, projectHistory, learningHistory, goalProgress },
        modelResponse: insights,
        timestamp: new Date()
      });

      return insights;
    } catch (error) {
      console.error('Error generating employee insights:', error);
      return this.getFallbackEmployeeInsights(employee);
    }
  }

  async generateManagerInsights(
    managerId: string,
    employees: Employee[],
    performanceRecords: Map<string, PerformanceRecord[]>,
    projectHistory: Project[]
  ): Promise<ManagerInsightsResponse> {
    try {
      const prompt = this.buildManagerPrompt(employees, performanceRecords, projectHistory);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const insights = this.parseManagerInsights(text, employees);
      
      // Log the interaction
      this.logInsight({
        id: this.generateId(),
        userId: managerId,
        userRole: 'manager',
        insightType: 'manager',
        modelInputs: { employees, performanceRecords: Array.from(performanceRecords.entries()), projectHistory },
        modelResponse: insights,
        timestamp: new Date()
      });

      return insights;
    } catch (error) {
      console.error('Error generating manager insights:', error);
      return this.getFallbackManagerInsights(employees);
    }
  }

  private buildEmployeePrompt(
    employee: Employee,
    performanceRecords: PerformanceRecord[],
    projectHistory: Project[],
    learningHistory: LearningHistory[],
    goalProgress: GoalProgress[]
  ): string {
    const recentPerformance = performanceRecords.slice(-6); // Last 6 records
    const recentProjects = projectHistory.slice(-5); // Last 5 projects
    const skillsList = employee.skills.map(s => `${s.name} (${s.level})`).join(', ');

    return `
You are an AI career coach analyzing an employee's profile to provide supportive, actionable insights.

EMPLOYEE PROFILE:
- Name: ${employee.name}
- Role: ${employee.role}
- Department: ${employee.department || 'Not specified'}
- Skills: ${skillsList}
- Availability: ${employee.availability}

RECENT PERFORMANCE (last 6 records):
${recentPerformance.map(p => `- ${p.date.toLocaleDateString()}: Score ${p.score}/5, Feedback: "${p.feedback}" (${p.source})`).join('\n')}

RECENT PROJECTS:
${recentProjects.map(p => `- ${p.title}: ${p.status}, Progress: ${p.progress}%, Priority: ${p.priority}`).join('\n')}

LEARNING HISTORY:
${learningHistory.map(l => `- ${l.course} (completed ${l.completedAt.toLocaleDateString()})`).join('\n')}

GOAL PROGRESS:
${goalProgress.map(g => `- ${g.goal}: ${g.progress}% (${g.status})`).join('\n')}

Please provide insights in the following JSON format:
{
  "summary": "One-line summary (max 140 characters) highlighting main strength + top opportunity",
  "insights": [
    {
      "type": "Strength",
      "detail": "Specific strength with evidence",
      "rationale": "Brief explanation of why this is a strength",
      "confidence": 85,
      "actions": []
    },
    {
      "type": "Gap",
      "detail": "Specific skill gap or development area",
      "rationale": "Evidence from data showing this gap",
      "confidence": 78,
      "actions": [
        {
          "type": "learning",
          "label": "Specific actionable step (max 12 words)",
          "meta": {
            "est_time": "2 weeks",
            "priority": "high"
          }
        }
      ]
    },
    {
      "type": "NextStep",
      "detail": "Immediate actionable next step",
      "rationale": "Why this step will help career growth",
      "confidence": 82,
      "actions": [
        {
          "type": "task",
          "label": "Specific task (max 12 words)",
          "meta": {
            "est_time": "1 week"
          }
        }
      ]
    }
  ],
  "confidence_score": 83
}

Requirements:
1. Provide exactly 3 insights: 1 Strength, 1 Gap, 1 NextStep
2. Keep summary under 140 characters
3. Be supportive and career-focused in tone
4. Include confidence scores (0-100)
5. Provide specific, actionable recommendations
6. Base rationale on actual data provided
`;
  }

  private buildManagerPrompt(
    employees: Employee[],
    performanceRecords: Map<string, PerformanceRecord[]>,
    projectHistory: Project[]
  ): string {
    const teamData = employees.map(emp => {
      const records = performanceRecords.get(emp.uid) || [];
      const recentScore = records.length > 0 ? records[records.length - 1].score : 0;
      const avgScore = records.length > 0 ? records.reduce((sum, r) => sum + r.score, 0) / records.length : 0;
      const empProjects = projectHistory.filter(p => p.assignedEmployees.includes(emp.uid));
      
      return {
        name: emp.name,
        id: emp.uid,
        skills: emp.skills.length,
        availability: emp.availability,
        recentScore,
        avgScore: Math.round(avgScore * 10) / 10,
        projectCount: empProjects.length,
        completedProjects: empProjects.filter(p => p.status === 'completed').length
      };
    });

    return `
You are an AI management assistant analyzing team performance to provide actionable insights for a manager.

TEAM OVERVIEW:
${teamData.map(emp => `
- ${emp.name} (${emp.id}):
  * Skills: ${emp.skills} listed
  * Availability: ${emp.availability}
  * Recent Performance: ${emp.recentScore}/5
  * Average Performance: ${emp.avgScore}/5
  * Projects: ${emp.completedProjects}/${emp.projectCount} completed
`).join('')}

RECENT PROJECTS:
${projectHistory.slice(-10).map(p => `- ${p.title}: ${p.status}, Team: ${p.assignedEmployeeNames.join(', ')}`).join('\n')}

Please provide insights in the following JSON format:
{
  "summary": "2-line team summary highlighting key trends",
  "team_trends": "Brief analysis of overall team performance patterns",
  "insights": [
    {
      "employeeId": "employee_uid",
      "employeeName": "Employee Name",
      "reason": "Performance Drop",
      "detail": "Specific observation with data",
      "confidence": 78,
      "actions": [
        {
          "type": "meeting",
          "label": "Schedule 1:1 check-in",
          "meta": {
            "suggested_length": "30m",
            "priority": "high"
          }
        }
      ]
    }
  ],
  "team_actions": [
    {
      "type": "training",
      "detail": "Specific team-level recommendation",
      "impact": "medium",
      "confidence": 85
    }
  ]
}

Requirements:
1. Identify up to 5 employees needing attention
2. Use reason tags: "Attrition Risk", "Skill Gap", "Performance Drop", "High Performer", "Development Ready"
3. Provide specific, actionable manager actions
4. Include confidence scores (0-100)
5. Be concise and decision-oriented
6. Base insights on actual performance data
`;
  }

  private parseEmployeeInsights(aiResponse: string, employee: Employee): EmployeeInsightsResponse {
    try {
      // First try to find JSON within markdown code blocks
      let jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      
      // If no code block found, try to find JSON in the response
      if (!jsonMatch) {
        jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      }
      
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      // Use the captured group if it exists (from code block), otherwise use the full match
      const jsonString = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonString);
      
      return {
        summary: parsed.summary || `${employee.name} is performing well with opportunities for growth`,
        insights: parsed.insights || [],
        generated_at: new Date().toISOString(),
        model_meta: {
          model: 'gemini',
          version: 'v1'
        },
        confidence_score: parsed.confidence_score || 75
      };
    } catch (error) {
      console.error('Error parsing employee insights:', error);
      return this.getFallbackEmployeeInsights(employee);
    }
  }

  private parseManagerInsights(aiResponse: string, employees: Employee[]): ManagerInsightsResponse {
    try {
      // First try to find JSON within markdown code blocks
      let jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      
      // If no code block found, try to find JSON in the response
      if (!jsonMatch) {
        jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      }
      
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      // Use the captured group if it exists (from code block), otherwise use the full match
      const jsonString = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonString);
      
      return {
        summary: parsed.summary || 'Team performance is stable with some areas for attention',
        team_trends: parsed.team_trends || 'Overall team performance is consistent',
        insights: parsed.insights || [],
        team_actions: parsed.team_actions || [],
        generated_at: new Date().toISOString(),
        model_meta: {
          model: 'gemini',
          version: 'v1'
        }
      };
    } catch (error) {
      console.error('Error parsing manager insights:', error);
      return this.getFallbackManagerInsights(employees);
    }
  }

  private getFallbackEmployeeInsights(employee: Employee): EmployeeInsightsResponse {
    return {
      summary: `${employee.name} has ${employee.skills.length} skills and is ${employee.availability}`,
      insights: [
        {
          type: 'Strength',
          detail: `Has ${employee.skills.length} documented skills`,
          rationale: 'Profile shows diverse skill set',
          confidence: 60,
          actions: []
        },
        {
          type: 'Gap',
          detail: 'Insufficient performance data for detailed analysis',
          rationale: 'Need more performance records to generate insights',
          confidence: 50,
          actions: [
            {
              type: 'task',
              label: 'Request performance feedback from manager',
              meta: { est_time: '1 week' }
            }
          ]
        },
        {
          type: 'NextStep',
          detail: 'Update profile with recent project experience',
          rationale: 'More complete profile enables better insights',
          confidence: 70,
          actions: [
            {
              type: 'task',
              label: 'Add recent projects to profile',
              meta: { est_time: '30 minutes' }
            }
          ]
        }
      ],
      generated_at: new Date().toISOString(),
      model_meta: { model: 'fallback', version: 'v1' },
      confidence_score: 60
    };
  }

  private getFallbackManagerInsights(employees: Employee[]): ManagerInsightsResponse {
    return {
      summary: `Team of ${employees.length} members with mixed availability levels`,
      team_trends: 'Limited data available for comprehensive team analysis',
      insights: employees.slice(0, 3).map(emp => ({
        employeeId: emp.uid,
        employeeName: emp.name,
        reason: 'Development Ready' as const,
        detail: `${emp.name} has ${emp.skills.length} skills and is ${emp.availability}`,
        confidence: 50,
        actions: [
          {
            type: 'meeting' as const,
            label: 'Schedule development discussion',
            meta: { suggested_length: '30m', priority: 'medium' as const }
          }
        ]
      })),
      team_actions: [
        {
          type: 'training',
          detail: 'Consider team skill development workshop',
          impact: 'medium',
          confidence: 60
        }
      ],
      generated_at: new Date().toISOString(),
      model_meta: { model: 'fallback', version: 'v1' }
    };
  }

  private logInsight(log: InsightAuditLog): void {
    // In a real implementation, this would send to a secure logging service
    this.auditLogs.push(log);
    console.log('AI Insight logged:', {
      id: log.id,
      userId: log.userId,
      userRole: log.userRole,
      insightType: log.insightType,
      timestamp: log.timestamp
    });
  }

  async recordFeedback(
    insightId: string,
    userId: string,
    userRole: 'employee' | 'manager',
    action: 'helpful' | 'not_helpful' | 'disagree' | 'accept',
    feedback?: string
  ): Promise<void> {
    const log = this.auditLogs.find(l => l.id === insightId);
    if (log) {
      log.userAction = action;
      log.feedback = feedback;
    }
    
    // In a real implementation, this would be sent to a feedback collection service
    console.log('Feedback recorded:', { insightId, userId, userRole, action, feedback });
  }

  private generateId(): string {
    return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cache management
  private cache = new Map<string, { data: any; timestamp: number }>();
  private CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

  private getCachedInsights(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedInsights(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getEmployeeInsightsWithCache(
    employee: Employee,
    performanceRecords: PerformanceRecord[],
    projectHistory: Project[],
    forceRefresh = false
  ): Promise<EmployeeInsightsResponse> {
    const cacheKey = `employee_${employee.uid}`;
    
    if (!forceRefresh) {
      const cached = this.getCachedInsights(cacheKey);
      if (cached) return cached;
    }

    const insights = await this.generateEmployeeInsights(employee, performanceRecords, projectHistory);
    this.setCachedInsights(cacheKey, insights);
    return insights;
  }

  async getManagerInsightsWithCache(
    managerId: string,
    employees: Employee[],
    performanceRecords: Map<string, PerformanceRecord[]>,
    projectHistory: Project[],
    forceRefresh = false
  ): Promise<ManagerInsightsResponse> {
    const cacheKey = `manager_${managerId}`;
    
    if (!forceRefresh) {
      const cached = this.getCachedInsights(cacheKey);
      if (cached) return cached;
    }

    const insights = await this.generateManagerInsights(managerId, employees, performanceRecords, projectHistory);
    this.setCachedInsights(cacheKey, insights);
    return insights;
  }
}

export const aiInsightsService = new AIInsightsService();
export type { 
  EmployeeInsightsResponse, 
  ManagerInsightsResponse, 
  EmployeeInsight, 
  ManagerInsight, 
  InsightAction,
  PerformanceRecord,
  LearningHistory,
  GoalProgress
};