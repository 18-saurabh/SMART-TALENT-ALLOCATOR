import { GoogleGenerativeAI } from '@google/generative-ai';
import { Employee } from '../hooks/useEmployees';

interface ProjectRequirements {
  title: string;
  description: string;
  requiredSkills: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget?: number;
}

interface EmployeeRecommendation {
  employee: Employee;
  score: number;
  reasons: string[];
  skillMatches: string[];
  availabilityStatus: 'excellent' | 'good' | 'limited' | 'unavailable';
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  }

  async generateEmployeeRecommendations(
    projectRequirements: ProjectRequirements,
    employees: Employee[]
  ): Promise<EmployeeRecommendation[]> {
    try {
      const prompt = this.buildRecommendationPrompt(projectRequirements, employees);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseRecommendations(text, employees);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to basic skill matching
      return this.generateFallbackRecommendations(projectRequirements, employees);
    }
  }

  private buildRecommendationPrompt(
    projectRequirements: ProjectRequirements,
    employees: Employee[]
  ): string {
    const employeeData = employees.map(emp => ({
      id: emp.uid,
      name: emp.name,
      skills: emp.skills.map(s => `${s.name} (${s.level})`),
      availability: emp.availability,
      department: emp.department || 'Not specified',
      position: emp.position || 'Not specified'
    }));

    return `
You are an AI assistant helping a manager assign the best employees to a project. 
Analyze the project requirements and employee data to provide recommendations.

PROJECT DETAILS:
- Title: ${projectRequirements.title}
- Description: ${projectRequirements.description}
- Required Skills: ${projectRequirements.requiredSkills.join(', ')}
- Priority: ${projectRequirements.priority}
- Budget: ${projectRequirements.budget ? `₹${projectRequirements.budget.toLocaleString()}` : 'Not specified'}

AVAILABLE EMPLOYEES:
${JSON.stringify(employeeData, null, 2)}

Please analyze each employee and provide recommendations based on:
1. Skill matching (exact matches and related skills)
2. Availability status
3. Experience level
4. Department relevance

Return your analysis in the following JSON format:
{
  "recommendations": [
    {
      "employeeId": "employee_uid",
      "score": 85,
      "reasons": ["Strong React skills", "Available immediately", "Previous similar project experience"],
      "skillMatches": ["React", "JavaScript"],
      "availabilityStatus": "excellent"
    }
  ]
}

Score should be 0-100 where:
- 90-100: Perfect match
- 80-89: Excellent match
- 70-79: Good match
- 60-69: Fair match
- Below 60: Poor match

AvailabilityStatus should be:
- "excellent": Available
- "good": Available with minor constraints
- "limited": Limited availability
- "unavailable": Not available
`;
  }

  private parseRecommendations(
    aiResponse: string,
    employees: Employee[]
  ): EmployeeRecommendation[] {
    try {
      // Extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const recommendations: EmployeeRecommendation[] = [];

      for (const rec of parsed.recommendations || []) {
        const employee = employees.find(emp => emp.uid === rec.employeeId);
        if (employee) {
          recommendations.push({
            employee,
            score: rec.score || 0,
            reasons: rec.reasons || [],
            skillMatches: rec.skillMatches || [],
            availabilityStatus: rec.availabilityStatus || 'good'
          });
        }
      }

      return recommendations.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error parsing AI recommendations:', error);
      return this.generateFallbackRecommendations(
        { requiredSkills: [] } as ProjectRequirements,
        employees
      );
    }
  }

  private generateFallbackRecommendations(
    projectRequirements: ProjectRequirements,
    employees: Employee[]
  ): EmployeeRecommendation[] {
    return employees.map(employee => {
      const skillMatches = employee.skills
        .filter(skill => 
          projectRequirements.requiredSkills.some(reqSkill =>
            skill.name.toLowerCase().includes(reqSkill.toLowerCase()) ||
            reqSkill.toLowerCase().includes(skill.name.toLowerCase())
          )
        )
        .map(skill => skill.name);

      const availabilityScore = employee.availability === 'available' ? 30 :
                               employee.availability === 'limited' ? 15 : 0;
      
      const skillScore = (skillMatches.length / Math.max(projectRequirements.requiredSkills.length, 1)) * 70;
      
      const score = Math.min(100, skillScore + availabilityScore);

      const reasons = [];
      if (skillMatches.length > 0) {
        reasons.push(`Matches ${skillMatches.length} required skills`);
      }
      if (employee.availability === 'available') {
        reasons.push('Available for immediate assignment');
      }
      if (employee.skills.some(s => s.level === 'expert' || s.level === 'advanced')) {
        reasons.push('Has advanced/expert level skills');
      }

      return {
        employee,
        score: Math.round(score),
        reasons,
        skillMatches,
        availabilityStatus: employee.availability === 'available' ? 'excellent' :
                           employee.availability === 'limited' ? 'limited' : 'unavailable'
      };
    }).sort((a, b) => b.score - a.score);
  }
}

export const geminiService = new GeminiService();
export type { EmployeeRecommendation, ProjectRequirements };