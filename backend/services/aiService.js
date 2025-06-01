const OpenAI = require('openai');
const database = require('../config/database');
const logger = require('../config/logger');
const { AppError } = require('../utils/errors');

class AIService {
  constructor() {
    this.openai = null;
    this.isInitialized = false;
    this.quotaLimit = parseInt(process.env.AI_QUOTA_LIMIT) || 50;
    this.quotaResetDays = parseInt(process.env.AI_QUOTA_RESET_DAYS) || 30;
  }

  async initialize() {
    try {
      if (!process.env.OPENAI_API_KEY) {
        logger.warn('OpenAI API key not configured, AI features will be disabled');
        return;
      }

      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Test the connection
      await this.openai.models.list();
      this.isInitialized = true;
      logger.info('AI service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI service:', error);
      this.isInitialized = false;
    }
  }

  isReady() {
    return this.isInitialized && this.openai !== null;
  }

  async checkQuota(projectId) {
    try {
      const query = `
        SELECT ai_requests_count, ai_requests_reset_date 
        FROM projects 
        WHERE id = ?
      `;
      
      const rows = await database.query(query, [projectId]);
      if (rows.length === 0) {
        throw new AppError('Project not found', 404);
      }

      const project = rows[0];
      const today = new Date();
      const resetDate = new Date(project.ai_requests_reset_date);
      
      // Check if quota period has expired
      const daysDiff = Math.floor((today - resetDate) / (1000 * 60 * 60 * 24));
      if (daysDiff >= this.quotaResetDays) {
        // Reset quota
        await database.query(
          'UPDATE projects SET ai_requests_count = 0, ai_requests_reset_date = CURDATE() WHERE id = ?',
          [projectId]
        );
        return { remaining: this.quotaLimit, resetDate: today };
      }

      const remaining = Math.max(0, this.quotaLimit - project.ai_requests_count);
      return { remaining, resetDate };
    } catch (error) {
      logger.error('Error checking AI quota:', error);
      throw error;
    }
  }

  async incrementQuota(projectId) {
    try {
      await database.query(
        'UPDATE projects SET ai_requests_count = ai_requests_count + 1 WHERE id = ?',
        [projectId]
      );
    } catch (error) {
      logger.error('Error incrementing AI quota:', error);
      throw error;
    }
  }

  async logAIRequest(userId, projectId, feature, requestData, responseData) {
    try {
      const query = `
        INSERT INTO ai_requests (user_id, project_id, feature, request_data, response_data)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const values = [
        userId,
        projectId,
        feature,
        JSON.stringify(requestData),
        JSON.stringify(responseData)
      ];
      
      await database.query(query, values);
    } catch (error) {
      logger.error('Error logging AI request:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  async generateCompletion(prompt, options = {}) {
    if (!this.isReady()) {
      throw new AppError('AI service not available', 503);
    }

    try {
      const {
        model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
        temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.3
      } = options;

      const response = await this.openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      logger.error('Error generating AI completion:', error);
      throw new AppError('AI request failed', 500);
    }
  }

  // Sprint Planning AI
  async generateSprintPlan(projectId, userId, sprintData) {
    try {
      const quota = await this.checkQuota(projectId);
      if (quota.remaining <= 0) {
        throw new AppError('AI quota exceeded for this project', 429);
      }

      const prompt = this.buildSprintPlanningPrompt(sprintData);
      const response = await this.generateCompletion(prompt);
      
      await this.incrementQuota(projectId);
      await this.logAIRequest(userId, projectId, 'sprint_planning', sprintData, { response });

      return this.parseSprintPlanResponse(response);
    } catch (error) {
      logger.error('Error generating sprint plan:', error);
      throw error;
    }
  }

  buildSprintPlanningPrompt(sprintData) {
    const { issues, sprintGoal, capacity, duration } = sprintData;
    
    return `
As an AI assistant for agile project management, help plan a sprint with the following details:

Sprint Goal: ${sprintGoal || 'Not specified'}
Sprint Duration: ${duration || 2} weeks
Team Capacity: ${capacity || 'Not specified'} story points

Available Issues:
${issues.map(issue => `- ${issue.title} (${issue.issue_type}, ${issue.priority}, ${issue.story_points || 'No estimate'} points)`).join('\n')}

Please provide:
1. Recommended issues to include in this sprint
2. Priority order for the selected issues
3. Risk assessment for the sprint
4. Suggestions for achieving the sprint goal
5. Capacity utilization analysis

Format your response as JSON with the following structure:
{
  "recommended_issues": [list of issue IDs],
  "priority_order": [ordered list of issue IDs],
  "risks": [list of identified risks],
  "suggestions": [list of suggestions],
  "capacity_analysis": "analysis text"
}
`;
  }

  // Scope Creep Detection
  async detectScopeCreep(projectId, userId, sprintData) {
    try {
      const quota = await this.checkQuota(projectId);
      if (quota.remaining <= 0) {
        throw new AppError('AI quota exceeded for this project', 429);
      }

      const prompt = this.buildScopeCreepPrompt(sprintData);
      const response = await this.generateCompletion(prompt);
      
      await this.incrementQuota(projectId);
      await this.logAIRequest(userId, projectId, 'scope_creep_detection', sprintData, { response });

      return this.parseScopeCreepResponse(response);
    } catch (error) {
      logger.error('Error detecting scope creep:', error);
      throw error;
    }
  }

  buildScopeCreepPrompt(sprintData) {
    const { originalIssues, currentIssues, sprintGoal } = sprintData;
    
    return `
Analyze the following sprint for scope creep:

Original Sprint Goal: ${sprintGoal}

Original Issues (at sprint start):
${originalIssues.map(issue => `- ${issue.title} (${issue.story_points || 0} points)`).join('\n')}

Current Issues (now):
${currentIssues.map(issue => `- ${issue.title} (${issue.story_points || 0} points, Status: ${issue.status})`).join('\n')}

Analyze for scope creep and provide:
1. Scope creep severity (Low/Medium/High)
2. Added work not in original plan
3. Impact on sprint goal
4. Recommendations to address scope creep

Format as JSON:
{
  "severity": "Low|Medium|High",
  "scope_creep_detected": true/false,
  "added_work": [list of new work items],
  "impact_analysis": "text",
  "recommendations": [list of recommendations]
}
`;
  }

  // Risk Assessment
  async assessRisks(projectId, userId, projectData) {
    try {
      const quota = await this.checkQuota(projectId);
      if (quota.remaining <= 0) {
        throw new AppError('AI quota exceeded for this project', 429);
      }

      const prompt = this.buildRiskAssessmentPrompt(projectData);
      const response = await this.generateCompletion(prompt);
      
      await this.incrementQuota(projectId);
      await this.logAIRequest(userId, projectId, 'risk_assessment', projectData, { response });

      return this.parseRiskAssessmentResponse(response);
    } catch (error) {
      logger.error('Error assessing risks:', error);
      throw error;
    }
  }

  buildRiskAssessmentPrompt(projectData) {
    const { issues, sprints, teamSize, blockedIssues } = projectData;
    
    return `
Assess risks for this project:

Team Size: ${teamSize || 'Unknown'}
Total Issues: ${issues.length}
Active Sprints: ${sprints.filter(s => s.status === 'Active').length}
Blocked Issues: ${blockedIssues.length}

Recent Issues:
${issues.slice(0, 10).map(issue => `- ${issue.title} (${issue.status}, ${issue.priority})`).join('\n')}

Blocked Issues:
${blockedIssues.map(issue => `- ${issue.title}: ${issue.blocked_reason}`).join('\n')}

Identify and assess risks:
1. Technical risks
2. Resource risks  
3. Timeline risks
4. Quality risks

Format as JSON:
{
  "overall_risk_level": "Low|Medium|High",
  "risks": [
    {
      "category": "Technical|Resource|Timeline|Quality",
      "description": "risk description",
      "impact": "Low|Medium|High",
      "probability": "Low|Medium|High",
      "mitigation": "mitigation strategy"
    }
  ],
  "recommendations": [list of recommendations]
}
`;
  }

  // Response parsers
  parseSprintPlanResponse(response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      logger.error('Error parsing sprint plan response:', error);
      return { error: 'Failed to parse AI response', raw_response: response };
    }
  }

  parseScopeCreepResponse(response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      logger.error('Error parsing scope creep response:', error);
      return { error: 'Failed to parse AI response', raw_response: response };
    }
  }

  parseRiskAssessmentResponse(response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      logger.error('Error parsing risk assessment response:', error);
      return { error: 'Failed to parse AI response', raw_response: response };
    }
  }

  // Retrospective Insights
  async generateRetrospectiveInsights(projectId, userId, retrospectiveData) {
    try {
      const quota = await this.checkQuota(projectId);
      if (quota.remaining <= 0) {
        throw new AppError('AI quota exceeded for this project', 429);
      }

      const prompt = this.buildRetrospectivePrompt(retrospectiveData);
      const response = await this.generateCompletion(prompt);

      await this.incrementQuota(projectId);
      await this.logAIRequest(userId, projectId, 'retrospective_insights', retrospectiveData, { response });

      return this.parseRetrospectiveResponse(response);
    } catch (error) {
      logger.error('Error generating retrospective insights:', error);
      throw error;
    }
  }

  buildRetrospectivePrompt(retrospectiveData) {
    const { sprintData, teamFeedback, metrics } = retrospectiveData;

    return `
Generate insights for sprint retrospective:

Sprint Summary:
- Goal: ${sprintData.goal}
- Planned Points: ${sprintData.plannedPoints}
- Completed Points: ${sprintData.completedPoints}
- Issues Completed: ${sprintData.completedIssues}/${sprintData.totalIssues}

Team Feedback:
What went well: ${teamFeedback.wentWell || 'No feedback provided'}
What could be improved: ${teamFeedback.improvements || 'No feedback provided'}
Action items from last retrospective: ${teamFeedback.previousActions || 'None'}

Metrics:
- Velocity: ${metrics.velocity || 'Unknown'}
- Cycle Time: ${metrics.cycleTime || 'Unknown'}
- Burndown: ${metrics.burndownTrend || 'Unknown'}

Provide insights and recommendations:
1. Sprint performance analysis
2. Team productivity insights
3. Process improvement suggestions
4. Action items for next sprint

Format as JSON:
{
  "performance_analysis": "analysis text",
  "productivity_insights": [list of insights],
  "improvement_suggestions": [list of suggestions],
  "action_items": [list of action items],
  "overall_rating": "Excellent|Good|Average|Poor"
}
`;
  }

  parseRetrospectiveResponse(response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      logger.error('Error parsing retrospective response:', error);
      return { error: 'Failed to parse AI response', raw_response: response };
    }
  }
}

// Create singleton instance
const aiService = new AIService();

module.exports = aiService;
