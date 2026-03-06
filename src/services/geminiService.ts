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
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
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
      position: emp.position || 'Not specified',
      totalSkills: emp.skills.length,
      expertSkills: emp.skills.filter(s => s.level === 'expert' || s.level === 'advanced').map(s => s.name)
    }));

    const requiredSkillsList = projectRequirements.requiredSkills.length > 0
      ? projectRequirements.requiredSkills.join(', ')
      : 'General software development skills';

    return `You are a senior engineering manager and talent placement expert. Your job is to match the best employees to a project based on skills, availability, and fit.

PROJECT REQUIREMENTS:
- Title: ${projectRequirements.title}
- Description: ${projectRequirements.description}
- Required Skills: ${requiredSkillsList}
- Priority: ${projectRequirements.priority.toUpperCase()}
- Budget: ${projectRequirements.budget ? `₹${projectRequirements.budget.toLocaleString()}` : 'Not specified'}

CANDIDATE POOL (${employees.length} employees):
${JSON.stringify(employeeData, null, 2)}

SCORING CRITERIA (0-100):
- Skill coverage: How many required skills does this person have? (40 points max)
- Skill depth: Do they have expert/advanced level in key required skills? (25 points max)
- Availability: available=25pts, limited=12pts, unavailable=0pts
- Department and role relevance: (10 points max)

REASONS GUIDELINES — for each recommended employee, write 3 specific, evidence-based reasons:
- Reference actual skill names and their proficiency levels
- Mention their availability status and what that means for the project
- Note any expert/advanced skills that directly match the project
- Mention department/role fit if relevant
- Be concise but specific (e.g., "Expert-level React matches the frontend requirements" not just "Good skills")

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "recommendations": [
    {
      "employeeId": "employee_uid",
      "score": 87,
      "reasons": [
        "Expert-level React and TypeScript directly cover the core frontend stack required",
        "Currently available with no active blockers — can start immediately on ${projectRequirements.priority} priority work",
        "Advanced JavaScript skills complement the team's technical needs for this project"
      ],
      "skillMatches": ["React", "TypeScript"],
      "availabilityStatus": "excellent"
    }
  ]
}

Score thresholds: 90-100 = Perfect fit | 80-89 = Excellent | 70-79 = Good | 60-69 = Acceptable | <60 = Poor fit
availabilityStatus values: "excellent" (available), "good" (minor constraints), "limited" (limited), "unavailable" (not available)

Include ALL employees in the response, sorted by score descending.`;
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
            availabilityStatus: (rec.availabilityStatus || 'good') as 'excellent' | 'good' | 'limited' | 'unavailable'
          });
        }
      }

      return recommendations.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error parsing AI recommendations:', error);
      return this.generateFallbackRecommendations(
        {
          title: 'Unknown Project',
          description: 'Project details unavailable',
          requiredSkills: [],
          priority: 'medium'
        } as ProjectRequirements,
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
        availabilityStatus: (employee.availability === 'available' ? 'excellent' :
                           employee.availability === 'limited' ? 'limited' : 'unavailable') as 'excellent' | 'good' | 'limited' | 'unavailable'
      };
    }).sort((a, b) => b.score - a.score);
  }
}

export const geminiService = new GeminiService();
export type { EmployeeRecommendation, ProjectRequirements };