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
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
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
    const recentPerformance = performanceRecords.slice(-6);
    const recentProjects = projectHistory.slice(-5);
    const skillsList = employee.skills.map(s => `${s.name} (${s.level})`).join(', ');
    const expertSkills = employee.skills.filter(s => s.level === 'expert' || s.level === 'advanced').map(s => s.name);
    const avgScore = recentPerformance.length > 0
      ? (recentPerformance.reduce((sum, r) => sum + r.score, 0) / recentPerformance.length).toFixed(1)
      : 'N/A';
    const completedProjects = projectHistory.filter(p => p.status === 'completed').length;
    const inProgressProjects = projectHistory.filter(p => p.status === 'in-progress').length;

    return `You are a senior career development coach and performance analyst. Analyze this employee's profile and generate specific, data-driven career insights.

EMPLOYEE PROFILE:
- Name: ${employee.name}
- Role: ${employee.role}
- Department: ${employee.department || 'Not specified'}
- Current Availability: ${employee.availability}
- Total Skills: ${employee.skills.length} (Expert/Advanced: ${expertSkills.join(', ') || 'none listed'})
- All Skills: ${skillsList || 'No skills listed'}

PERFORMANCE DATA:
- Average Score: ${avgScore}/5 (based on ${recentPerformance.length} records)
- Recent Performance Records:
${recentPerformance.length > 0
  ? recentPerformance.map(p => `  • ${p.date.toLocaleDateString()}: ${p.score}/5 — "${p.feedback}" [${p.source} review]`).join('\n')
  : '  • No performance records available'}

PROJECT HISTORY:
- Completed: ${completedProjects} projects | In Progress: ${inProgressProjects} projects
${recentProjects.length > 0
  ? recentProjects.map(p => `  • ${p.title} — ${p.status} (${p.progress}% complete, ${p.priority} priority)`).join('\n')
  : '  • No project history available'}

LEARNING HISTORY:
${learningHistory.length > 0
  ? learningHistory.map(l => `  • ${l.course} — completed ${l.completedAt.toLocaleDateString()}`).join('\n')
  : '  • No learning history recorded'}

GOAL PROGRESS:
${goalProgress.length > 0
  ? goalProgress.map(g => `  • ${g.goal}: ${g.progress}% complete (${g.status})`).join('\n')
  : '  • No goals recorded'}

Generate insights in this exact JSON format (return ONLY valid JSON, no markdown, no extra text):
{
  "summary": "One sentence (max 140 chars) naming ${employee.name}'s key strength and the single most important growth opportunity right now",
  "insights": [
    {
      "type": "Strength",
      "detail": "1-2 sentences describing a concrete strength with specific evidence from the data above (name actual skills, scores, or projects)",
      "rationale": "Explain specifically which data points (performance scores, project outcomes, skill levels) demonstrate this strength",
      "confidence": 85,
      "actions": []
    },
    {
      "type": "Gap",
      "detail": "1-2 sentences identifying a specific skill gap or growth area, grounded in the data (what's missing vs. what would unlock the next career level?)",
      "rationale": "Cite the specific evidence (missing skills, performance patterns, project gaps) that points to this development area",
      "confidence": 78,
      "actions": [
        {
          "type": "learning",
          "label": "Specific learning action with a named skill or resource (max 12 words)",
          "meta": { "est_time": "3-4 weeks", "priority": "high" }
        }
      ]
    },
    {
      "type": "NextStep",
      "detail": "1-2 sentences describing the single most impactful action ${employee.name} should take in the next 2 weeks to accelerate growth",
      "rationale": "Explain why this specific next step is the highest-leverage action given the current data and career stage",
      "confidence": 82,
      "actions": [
        {
          "type": "task",
          "label": "Concrete, named task — specific enough to start immediately (max 12 words)",
          "meta": { "est_time": "1-2 weeks", "priority": "high" }
        }
      ]
    }
  ],
  "confidence_score": 83
}

Critical rules:
1. Provide EXACTLY 3 insights in this order: Strength, Gap, NextStep
2. Every insight must reference specific data from the profile above — no generic advice
3. "detail" should be 1-2 sentences max, direct and meaningful
4. "rationale" must cite specific evidence (actual scores, project names, skill levels)
5. Action labels must be concrete and actionable, not vague
6. Summary must be under 140 characters`;
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
      const expertSkills = emp.skills.filter(s => s.level === 'expert' || s.level === 'advanced').map(s => s.name);
      const trend = records.length >= 2
        ? (records[records.length - 1].score > records[records.length - 2].score ? 'improving' : 'declining')
        : 'stable';

      return {
        name: emp.name,
        id: emp.uid,
        department: emp.department || 'Unspecified',
        role: emp.role,
        totalSkills: emp.skills.length,
        expertSkills,
        availability: emp.availability,
        recentScore,
        avgScore: Math.round(avgScore * 10) / 10,
        performanceTrend: trend,
        totalProjects: empProjects.length,
        completedProjects: empProjects.filter(p => p.status === 'completed').length,
        inProgressProjects: empProjects.filter(p => p.status === 'in-progress').length,
        recentFeedback: records.slice(-2).map(r => `"${r.feedback}" [${r.source}]`).join('; ')
      };
    });

    const teamSize = employees.length;
    const availableCount = employees.filter(e => e.availability === 'available').length;
    const avgTeamScore = teamData.length > 0
      ? (teamData.reduce((sum, e) => sum + e.avgScore, 0) / teamData.length).toFixed(1)
      : 'N/A';

    return `You are a director-level management consultant specializing in engineering team performance. Analyze this team and provide specific, evidence-based insights a manager can act on today.

TEAM SUMMARY:
- Team Size: ${teamSize} members | Available Now: ${availableCount}/${teamSize}
- Team Average Performance Score: ${avgTeamScore}/5

DETAILED TEAM DATA:
${teamData.map(emp => `
▸ ${emp.name} (${emp.role} — ${emp.department})
  Availability: ${emp.availability} | Skills: ${emp.totalSkills} total (Expert/Advanced: ${emp.expertSkills.join(', ') || 'none'})
  Performance: Recent ${emp.recentScore}/5 | Average ${emp.avgScore}/5 | Trend: ${emp.performanceTrend}
  Projects: ${emp.completedProjects} completed / ${emp.inProgressProjects} active / ${emp.totalProjects} total
  Recent Feedback: ${emp.recentFeedback || 'No feedback recorded'}`).join('\n')}

ACTIVE & RECENT PROJECTS:
${projectHistory.slice(-10).map(p => `  • ${p.title} [${p.status}] — Team: ${p.assignedEmployeeNames.join(', ') || 'Unassigned'}`).join('\n')}

Generate manager insights in this exact JSON format (return ONLY valid JSON, no markdown, no extra text):
{
  "summary": "2 sentences max: the team's most important strength right now, and the single most urgent issue requiring manager attention",
  "team_trends": "2-3 sentences: observable performance and availability patterns across the team, based on the data above",
  "insights": [
    {
      "employeeId": "employee_uid_here",
      "employeeName": "Full Name",
      "reason": "Performance Drop",
      "detail": "1-2 sentences: specific observation about this employee, referencing their actual scores, trend, or feedback from the data above",
      "confidence": 78,
      "actions": [
        {
          "type": "meeting",
          "label": "Specific action the manager should take — concrete and named (max 10 words)",
          "meta": { "suggested_length": "30m", "priority": "high" }
        }
      ]
    }
  ],
  "team_actions": [
    {
      "type": "training",
      "detail": "Specific team-level action with clear rationale — what to do, who it affects, and why now",
      "impact": "high",
      "confidence": 85
    }
  ]
}

Critical rules:
1. Identify 3-5 employees who need the most manager attention (mix of concerns and high performers)
2. Use ONLY these reason tags: "Attrition Risk", "Skill Gap", "Performance Drop", "High Performer", "Development Ready"
3. Every "detail" must reference specific data from this employee's record — no generic statements
4. Action labels must be specific enough to act on immediately — not just "have a conversation"
5. Provide 2-3 team_actions covering different areas (training, hiring, recognition, process)
6. Prioritize insights by urgency — most critical employees first`;
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