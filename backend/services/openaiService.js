const OpenAI = require('openai');
const logger = require('../config/logger');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateRiskHeatmap(teamWorkloadData, projectContext) {
    const prompt = this.buildRiskHeatmapPrompt(teamWorkloadData, projectContext);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert project manager and data analyst specializing in team workload analysis and risk assessment. Analyze team data and provide actionable insights in valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      });

      return this.parseHeatmapResponse(response.choices[0].message.content);
    } catch (error) {
      logger.error('OpenAI API error:', error);
      // Fallback to rule-based analysis if OpenAI fails
      return this.generateFallbackHeatmap(teamWorkloadData);
    }
  }

  buildRiskHeatmapPrompt(teamData, context) {
    return `
Analyze the following team workload data and generate a comprehensive risk heatmap for project management:

PROJECT CONTEXT:
- Total Issues: ${context.totalIssues}
- Active Sprint: ${context.activeSprint}
- Team Size: ${teamData.length}

TEAM WORKLOAD DATA:
${JSON.stringify(teamData, null, 2)}

ANALYSIS REQUIREMENTS:
1. Calculate risk level for each team member (Low/Medium/High/Critical)
2. Identify specific risk factors:
   - Workload overallocation (>100% capacity)
   - Skill mismatches (based on role vs issue types)
   - Bottleneck potential (high-priority issues, blockers)
   - Dependency risks
3. Generate workload distribution analysis
4. Identify critical issues that could become blockers
5. Provide actionable mitigation suggestions

RISK CALCULATION LOGIC:
- Workload >120% = Critical Risk
- Workload >100% = High Risk
- Workload >80% = Medium Risk
- Workload ≤80% = Low Risk

Additional risk factors to consider:
- Number of blocked issues (each blocked issue adds 10 risk points)
- High-priority issue concentration (>3 high-priority issues = risk factor)
- Role-based capacity expectations
- Issue complexity distribution

IMPORTANT: Return response as valid JSON with this exact structure:
{
  "teamMembers": [
    {
      "id": "user_id",
      "name": "Full Name",
      "role": "Developer",
      "riskLevel": "High",
      "riskScore": 85,
      "workload": {
        "assigned": 45,
        "capacity": 40,
        "percentage": 112,
        "available": -5
      },
      "riskFactors": ["Overloaded by 12%", "3 high-priority tasks", "2 blocked issues"],
      "suggestions": ["Redistribute 5 story points to other team members", "Prioritize unblocking issues"],
      "issueBreakdown": {
        "total": 8,
        "inProgress": 3,
        "blocked": 2,
        "highPriority": 3
      }
    }
  ],
  "summary": {
    "overallRisk": "Medium",
    "overloadedMembers": 2,
    "criticalIssues": 3,
    "totalCapacityUtilization": 87,
    "recommendations": [
      "Rebalance workload between team members",
      "Address 2 blocked issues immediately",
      "Consider extending sprint timeline"
    ],
    "riskDistribution": {
      "Critical": 1,
      "High": 2,
      "Medium": 1,
      "Low": 2
    }
  },
  "criticalIssues": [
    {
      "id": "issue_id",
      "title": "Issue Title",
      "assignee": "Team Member",
      "riskFactors": ["Blocking other tasks", "Overloaded assignee"],
      "priority": "P1",
      "status": "Blocked"
    }
  ]
}

Ensure all numeric values are realistic and all arrays contain relevant items. Focus on practical, actionable insights.
    `;
  }

  parseHeatmapResponse(responseContent) {
    try {
      const parsed = JSON.parse(responseContent);
      
      // Validate required structure
      if (!parsed.teamMembers || !parsed.summary) {
        throw new Error('Invalid response structure');
      }
      
      return parsed;
    } catch (error) {
      logger.error('Failed to parse OpenAI response:', error);
      throw new Error('Invalid response format from AI service');
    }
  }

  // Fallback rule-based analysis if OpenAI fails
  generateFallbackHeatmap(teamData) {
    logger.info('Using fallback risk analysis due to OpenAI failure');
    
    const teamMembers = teamData.map(member => {
      const utilizationPercentage = member.estimated_capacity > 0 
        ? Math.round((member.active_story_points / member.estimated_capacity) * 100)
        : 0;
      
      let riskLevel = 'Low';
      let riskScore = 30;
      
      // Calculate risk based on workload
      if (utilizationPercentage > 120) {
        riskLevel = 'Critical';
        riskScore = 95;
      } else if (utilizationPercentage > 100) {
        riskLevel = 'High';
        riskScore = 80;
      } else if (utilizationPercentage > 80) {
        riskLevel = 'Medium';
        riskScore = 60;
      }

      // Add risk factors for blocked issues and high priority tasks
      if (member.blocked_issues > 0) riskScore += member.blocked_issues * 10;
      if (member.high_priority_issues > 3) riskScore += 15;

      // Recalculate risk level based on adjusted score
      if (riskScore > 90) riskLevel = 'Critical';
      else if (riskScore > 70) riskLevel = 'High';
      else if (riskScore > 50) riskLevel = 'Medium';

      const riskFactors = [];
      if (utilizationPercentage > 100) riskFactors.push(`Overloaded by ${utilizationPercentage - 100}%`);
      if (member.blocked_issues > 0) riskFactors.push(`${member.blocked_issues} blocked issues`);
      if (member.high_priority_issues > 2) riskFactors.push(`${member.high_priority_issues} high-priority tasks`);
      if (riskFactors.length === 0) riskFactors.push('No significant risk factors');

      const suggestions = [];
      if (utilizationPercentage > 100) {
        suggestions.push('Redistribute some tasks to other team members');
      }
      if (member.blocked_issues > 0) {
        suggestions.push('Prioritize unblocking issues');
      }
      if (suggestions.length === 0) {
        suggestions.push('Continue current workload');
      }

      return {
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        role: member.role,
        riskLevel,
        riskScore: Math.min(riskScore, 100),
        workload: {
          assigned: member.active_story_points,
          capacity: member.estimated_capacity,
          percentage: utilizationPercentage,
          available: member.estimated_capacity - member.active_story_points
        },
        riskFactors,
        suggestions,
        issueBreakdown: {
          total: member.total_issues,
          inProgress: member.in_progress_issues,
          blocked: member.blocked_issues,
          highPriority: member.high_priority_issues
        }
      };
    });

    const overloadedCount = teamMembers.filter(m => m.workload.percentage > 100).length;
    const criticalIssuesCount = teamMembers.reduce((sum, m) => sum + m.issueBreakdown.blocked, 0);
    const avgUtilization = teamMembers.length > 0 
      ? Math.round(teamMembers.reduce((sum, m) => sum + m.workload.percentage, 0) / teamMembers.length)
      : 0;

    let overallRisk = 'Low';
    if (overloadedCount > teamMembers.length / 2) overallRisk = 'Critical';
    else if (overloadedCount > 0 || criticalIssuesCount > 2) overallRisk = 'High';
    else if (avgUtilization > 80) overallRisk = 'Medium';

    const recommendations = [];
    if (overloadedCount > 0) recommendations.push('Rebalance workload between team members');
    if (criticalIssuesCount > 0) recommendations.push(`Address ${criticalIssuesCount} blocked issues immediately`);
    if (avgUtilization > 90) recommendations.push('Consider extending sprint timeline or reducing scope');
    if (recommendations.length === 0) recommendations.push('Team workload appears balanced');

    const riskDistribution = {
      Critical: teamMembers.filter(m => m.riskLevel === 'Critical').length,
      High: teamMembers.filter(m => m.riskLevel === 'High').length,
      Medium: teamMembers.filter(m => m.riskLevel === 'Medium').length,
      Low: teamMembers.filter(m => m.riskLevel === 'Low').length
    };

    return {
      teamMembers,
      summary: {
        overallRisk,
        overloadedMembers: overloadedCount,
        criticalIssues: criticalIssuesCount,
        totalCapacityUtilization: avgUtilization,
        recommendations,
        riskDistribution
      },
      criticalIssues: [] // Would need additional query to get actual critical issues
    };
  }
}

module.exports = new OpenAIService();
