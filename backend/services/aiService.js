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
      logger.info(`[checkQuota] Starting quota check for project ${projectId}`);
      const query = `
        SELECT ai_requests_count, ai_requests_reset_date
        FROM projects
        WHERE id = ?
      `;

      logger.info(`[checkQuota] Executing database query`);
      const rows = await database.query(query, [projectId]);
      logger.info(`[checkQuota] Database query result: ${JSON.stringify(rows)}`);

      if (rows.length === 0) {
        logger.warn(`[checkQuota] Project ${projectId} not found`);
        throw new AppError('Project not found', 404);
      }

      const project = rows[0];
      const today = new Date();
      const resetDate = new Date(project.ai_requests_reset_date);
      logger.info(`[checkQuota] Project data: ${JSON.stringify(project)}, today: ${today}, resetDate: ${resetDate}`);

      // Check if quota period has expired
      const daysDiff = Math.floor((today - resetDate) / (1000 * 60 * 60 * 24));
      logger.info(`[checkQuota] Days difference: ${daysDiff}, quotaResetDays: ${this.quotaResetDays}`);

      if (daysDiff >= this.quotaResetDays) {
        logger.info(`[checkQuota] Quota period expired, resetting quota`);
        // Reset quota
        await database.query(
          'UPDATE projects SET ai_requests_count = 0, ai_requests_reset_date = CURDATE() WHERE id = ?',
          [projectId]
        );
        logger.info(`[checkQuota] Quota reset completed`);
        return { remaining: this.quotaLimit, resetDate: today };
      }

      const remaining = Math.max(0, this.quotaLimit - project.ai_requests_count);
      logger.info(`[checkQuota] Quota calculation: remaining=${remaining}, limit=${this.quotaLimit}, used=${project.ai_requests_count}`);
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
      // Allow passed options to override environment defaults
      const model = options.model || process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
      const maxTokens = options.maxTokens || parseInt(process.env.OPENAI_MAX_TOKENS) || 500;
      const temperature = options.temperature || parseFloat(process.env.OPENAI_TEMPERATURE) || 0.3;

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

  // Build sprint creation prompt for tasks list
  buildSprintCreationPrompt(sprintCreationData) {
    const {
      boardId, startDate, endDate, totalStoryPoints, tasksList,
      teamMembers, createdBy, reporterId
    } = sprintCreationData;

    return `You are an expert Agile Project Manager and Sprint Planning specialist. Analyze the provided tasks and create a comprehensive sprint plan with intelligent task processing.

## SPRINT CONTEXT
- Board ID: ${boardId}
- Sprint Duration: ${startDate} to ${endDate}
- Total Story Points Budget: ${totalStoryPoints}
- Team Size: ${teamMembers.length} members

## TEAM MEMBERS & ROLES
${teamMembers.map(m => `- ${m.first_name} ${m.last_name} (ID: ${m.id}) - ${m.role}`).join('\n')}

## TASKS TO PROCESS
${tasksList.map((task, index) => `${index + 1}. ${task}`).join('\n')}

## CRITICAL INSTRUCTIONS

### 1. PRIORITY MAPPING (MUST FOLLOW EXACTLY)
- Tasks with "Critical" or "High" → P1 (Highest Priority)
- Tasks with "Medium" → P2 (Medium Priority)
- Tasks with "Low" → P4 (Lowest Priority)
- No priority specified → Assign P1/P2/P3/P4 based on business impact and task nature.

### 2. TASK ENHANCEMENT
For each task:
- **Improve Title**: Make it clear, actionable, professional (remove priority indicators)
- **Create Detailed Description**: Include acceptance criteria, technical requirements, definition of done
- **Assign Type**: Story (features), Task (technical work), Bug (fixes), Epic (large features)

### 3. STORY POINTS DISTRIBUTION
- Use Fibonacci: 1, 2, 3, 5, 8, 13
- Distribute total ${totalStoryPoints} points based on complexity
- Consider dependencies, technical difficulty, scope
- Use 4-6 hours per story point for estimates

### 4. TEAM ASSIGNMENT
- Match tasks to team member expertise and roles
- Distribute workload evenly
- Consider specializations (Admin, Developer, Project Manager)

## OUTPUT FORMAT
Return ONLY valid JSON (no markdown, no code blocks, no explanations):

{
  "board_id": ${boardId},
  "name": "Descriptive Sprint Name (3-5 words)",
  "goal": "Clear sprint goal describing main objectives (1-2 sentences)",
  "start_date": "${startDate}",
  "end_date": "${endDate}",
  "capacity_story_points": ${totalStoryPoints},
  "status": "Active",
  "created_by": ${createdBy},
  "issues": [
    {
      "board_id": ${boardId},
      "title": "Enhanced professional task title",
      "description": "Concise description with acceptance criteria and technical requirements (max 150 chars)",
      "issue_type": "Story",
      "status": "To Do",
      "priority": "[AI to assign P1, P2, P3, or P4 based on instructions]",
      "story_points": 8,
      "original_estimate": 32,
      "assignee_id": ${teamMembers[0]?.id || null},
      "reporter_id": ${reporterId}
    }
  ]
}

CRITICAL:
- Return ONLY JSON (no markdown blocks)
- Use ONLY P1, P2, P3 priorities
- Keep descriptions under 150 characters
- Create meaningful titles`;
  }

  buildSprintPlanningPrompt(sprintData) {
    const { issues, sprintGoal, capacity, duration, teamMembers } = sprintData;

    return `
You are an expert Agile coach and sprint planning assistant. Analyze the following sprint planning data and provide comprehensive, intelligent recommendations.

SPRINT CONTEXT:
- Sprint Goal: ${sprintGoal || 'Not specified'}
- Sprint Duration: ${duration || 2} weeks
- Team Capacity: ${capacity || 'Not specified'} story points
- Team Size: ${teamMembers?.length || 'Unknown'} members

AVAILABLE BACKLOG ISSUES:
${issues.map((issue, index) => `
${index + 1}. ID: ${issue.id}
   Title: ${issue.title}
   Type: ${issue.issue_type || 'Story'}
   Current Priority: ${issue.priority || 'P3'}
   Story Points: ${issue.story_points || 'Not estimated'}
   Description: ${issue.description ? issue.description.substring(0, 100) + '...' : 'No description'}
   Assignee: ${issue.assignee_first_name ? `${issue.assignee_first_name} ${issue.assignee_last_name}` : 'Unassigned'}
`).join('\n')}

ANALYSIS REQUIREMENTS:
1. **Issue Selection**: Select optimal issues that align with sprint goal and fit within capacity
2. **Story Point Estimation**: Assign story points (1,2,3,5,8,13) to unestimated issues based on complexity
3. **Priority Assignment**: Assign priority levels (P1=Critical, P2=High, P3=Medium, P4=Low) based on:
   - Sprint goal alignment
   - Business value
   - Technical dependencies
   - Risk factors
4. **Capacity Optimization**: Ensure total story points don't exceed team capacity
5. **Risk Assessment**: Identify potential blockers and dependencies
6. **Recommendations**: Provide actionable suggestions for sprint success

FORMAT YOUR RESPONSE AS VALID JSON:
{
  "selected_issues": [
    {
      "id": issue_id,
      "title": "issue title",
      "issue_type": "Story|Bug|Task|Epic",
      "assigned_priority": "P1|P2|P3|P4",
      "assigned_story_points": number,
      "selection_reason": "why this issue was selected",
      "sprint_goal_alignment": "High|Medium|Low"
    }
  ],
  "priority_order": [
    {
      "id": issue_id,
      "priority_rank": number,
      "rationale": "why this priority order"
    }
  ],
  "capacity_analysis": {
    "total_selected_points": number,
    "team_capacity": number,
    "utilization_percentage": number,
    "buffer_points": number,
    "recommendation": "analysis text"
  },
  "risks": [
    {
      "category": "Technical|Resource|Timeline|Dependency",
      "description": "risk description",
      "impact": "High|Medium|Low",
      "mitigation": "suggested mitigation"
    }
  ],
  "suggestions": [
    {
      "category": "Planning|Execution|Team|Process",
      "suggestion": "actionable suggestion",
      "priority": "High|Medium|Low"
    }
  ],
  "excluded_issues": [
    {
      "id": issue_id,
      "reason": "why this issue was not selected"
    }
  ],
  "sprint_feasibility": {
    "confidence_score": number_between_0_and_1,
    "success_probability": "High|Medium|Low",
    "key_success_factors": ["factor1", "factor2"],
    "potential_challenges": ["challenge1", "challenge2"]
  }
}

IMPORTANT: Ensure the response is valid JSON and all selected issues have realistic story point estimates.
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
    const { originalScope, currentIssues, sprintGoal, currentStoryPoints, currentIssueCount, sprintDuration } = sprintData;

    return `
You are a sprint management expert analyzing scope creep in an Agile sprint.

SPRINT CONTEXT:
- Sprint Goal: ${sprintGoal}
- Sprint Duration: ${sprintDuration || 'Unknown'} days
- Current Total Issues: ${currentIssueCount}
- Current Total Story Points: ${currentStoryPoints}

ORIGINAL SCOPE DESCRIPTION:
${originalScope}

CURRENT SPRINT STATE:
Issues in Sprint:
${currentIssues.map(issue => `  - ${issue.title} (${issue.story_points || 0} points, Status: ${issue.status})`).join('\n')}

ANALYSIS REQUIRED:
Based on the original scope description and current sprint state, analyze:
1. Does the current work align with the original scope description?
2. Are there signs of scope expansion beyond the original plan?
3. What is the severity of any scope creep detected?
4. What specific risks does this pose to sprint success?

Provide analysis in JSON format:
{
  "scope_creep_detected": true/false,
  "severity": "None|Low|Medium|High|Critical",
  "scope_creep_score": 0-100,
  "analysis": {
    "alignment_with_goal": "analysis of how current work aligns with sprint goal",
    "scope_expansion_indicators": "specific indicators of scope expansion",
    "impact_assessment": "impact on sprint success and timeline"
  },
  "recommendations": [
    "specific actionable recommendations to address scope creep"
  ],
  "risk_factors": [
    "identified risk factors that could affect sprint completion"
  ]
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
    // Ensure arrays are available, default to empty arrays if not
    const issues = Array.isArray(projectData.issues) ? projectData.issues : [];
    const sprints = Array.isArray(projectData.sprints) ? projectData.sprints : [];
    const blockedIssues = Array.isArray(projectData.blockedIssues) ? projectData.blockedIssues : [];
    const teamSize = projectData.teamSize;
    
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
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith("```json")) {
        cleanResponse = cleanResponse.substring(7); // Remove ```json\n
      }
      if (cleanResponse.endsWith("```")) {
        cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3);
      }
      return JSON.parse(cleanResponse.trim());
    } catch (error) {
      logger.error('Error parsing scope creep response:', { error: error.message, rawResponse: response });
      return { error: 'Failed to parse AI response', raw_response: response };
    }
  }

  parseRiskAssessmentResponse(response) {
    try {
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith("```json")) {
        cleanResponse = cleanResponse.substring(7); // Remove ```json\n
      }
      if (cleanResponse.endsWith("```")) {
        cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3);
      }
      return JSON.parse(cleanResponse.trim());
    } catch (error) {
      logger.error('Error parsing risk assessment response:', { error: error.message, rawResponse: response });
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
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith("```json")) {
        cleanResponse = cleanResponse.substring(7); // Remove ```json\n
      }
      if (cleanResponse.endsWith("```")) {
        cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3);
      }
      return JSON.parse(cleanResponse.trim());
    } catch (error) {
      logger.error('Error parsing retrospective response:', { error: error.message, rawResponse: response });
      return { error: 'Failed to parse AI response', raw_response: response };
    }
  }

  // Generate sprint creation plan from tasks list
  async generateSprintCreationPlan(projectId, userId, sprintCreationData) {
    try {
      // Check quota before processing
      const quota = await this.checkQuota(projectId);
      if (quota.remaining <= 0) {
        throw new AppError('AI quota exceeded for this project', 429);
      }

      const prompt = this.buildSprintCreationPrompt(sprintCreationData);

      // Use higher token limit for sprint creation to accommodate full JSON response
      const response = await this.generateCompletion(prompt, {
        maxTokens: 6000, // Increased for detailed descriptions and better model
        temperature: 0.1  // Very low temperature for consistent, structured output
      });

      // Update quota and log activity
      await this.incrementQuota(projectId);
      await this.logAIRequest(userId, projectId, 'sprint_creation_plan', sprintCreationData, { response });

      // Parse and validate the response
      const parsed = this.parseSprintCreationResponse(response);
      return parsed;
    } catch (error) {
      logger.error('Error generating sprint creation plan:', error);

      // Handle specific error types
      if (error.code === 'insufficient_quota') {
        throw new AppError('OpenAI API quota exceeded', 429);
      }

      if (error.code === 'model_overloaded') {
        throw new AppError('AI service temporarily unavailable', 503);
      }

      throw error;
    }
  }

  // Parse sprint creation response
  parseSprintCreationResponse(response) {
    try {
      // Clean up response - remove markdown code blocks if present
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Check if response appears to be truncated
      if (!cleanedResponse.trim().endsWith('}')) {
        logger.warn('AI response appears to be truncated:', {
          responseLength: cleanedResponse.length,
          lastChars: cleanedResponse.slice(-50)
        });
        return {
          error: 'AI response was truncated',
          raw_response: response,
          details: 'The AI response was cut off before completion. This usually indicates the response exceeded the token limit.'
        };
      }

      const parsed = JSON.parse(cleanedResponse);

      // Validate required sprint fields
      const requiredSprintFields = [
        'board_id', 'name', 'goal', 'start_date', 'end_date',
        'capacity_story_points', 'status', 'created_by', 'issues'
      ];

      for (const field of requiredSprintFields) {
        if (parsed[field] === undefined) {
          throw new Error(`Missing required sprint field: ${field}`);
        }
      }

      // Validate issues array
      if (!Array.isArray(parsed.issues) || parsed.issues.length === 0) {
        throw new Error('Issues must be a non-empty array');
      }

      // Validate each issue
      const requiredIssueFields = [
        'board_id', 'title', 'description', 'issue_type',
        'status', 'priority', 'reporter_id'
      ];

      parsed.issues.forEach((issue, index) => {
        for (const field of requiredIssueFields) {
          if (issue[field] === undefined) {
            throw new Error(`Missing required field '${field}' in issue ${index + 1}`);
          }
        }

        // Validate enums
        if (!['Story', 'Task', 'Bug', 'Epic'].includes(issue.issue_type)) {
          throw new Error(`Invalid issue_type '${issue.issue_type}' in issue ${index + 1}`);
        }

        if (!['P1', 'P2', 'P3'].includes(issue.priority)) {
          throw new Error(`Invalid priority '${issue.priority}' in issue ${index + 1}. Only P1, P2, P3 are allowed.`);
        }

        // Validate story points
        if (issue.story_points && (issue.story_points < 0 || issue.story_points > 21)) {
          throw new Error(`Invalid story_points '${issue.story_points}' in issue ${index + 1}`);
        }
      });

      return parsed;
    } catch (error) {
      logger.error('Error parsing sprint creation response:', error);
      return {
        error: 'Failed to parse AI response',
        raw_response: response,
        details: error.message
      };
    }
  }
}

// Create singleton instance
const aiService = new AIService();

module.exports = aiService;
