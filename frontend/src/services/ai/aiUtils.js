export const aiUtils = {
  // Format AI quota data
  formatQuotaData: (quota) => {
    const maxRequests = 10; // As per PRD
    const used = quota.requestsUsed || 0;
    const remaining = Math.max(0, maxRequests - used);
    const percentage = Math.round((used / maxRequests) * 100);

    return {
      used,
      remaining,
      total: maxRequests,
      percentage,
      isExceeded: used >= maxRequests,
      resetDate: quota.resetDate ? new Date(quota.resetDate).toLocaleDateString() : null,
      daysUntilReset: quota.resetDate ? aiUtils.getDaysUntilReset(quota.resetDate) : null
    };
  },

  // Calculate days until quota reset
  getDaysUntilReset: (resetDate) => {
    const now = new Date();
    const reset = new Date(resetDate);
    const diffTime = reset - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  },

  // Get quota status color
  getQuotaStatusColor: (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-orange-600 bg-orange-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  },

  // Validate sprint planning data
  validateSprintPlanningData: (data) => {
    const errors = {};

    if (!data.sprintGoal || data.sprintGoal.trim().length === 0) {
      errors.sprintGoal = 'Sprint goal is required';
    }

    if (!data.teamCapacity || data.teamCapacity <= 0) {
      errors.teamCapacity = 'Team capacity must be greater than 0';
    }

    if (!data.sprintDuration || data.sprintDuration <= 0 || data.sprintDuration > 4) {
      errors.sprintDuration = 'Sprint duration must be between 1 and 4 weeks';
    }

    if (!data.backlogItems || !Array.isArray(data.backlogItems) || data.backlogItems.length === 0) {
      errors.backlogItems = 'At least one backlog item is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Validate scope creep data
  validateScopeCreepData: (data) => {
    const errors = {};

    if (!data.sprintId) {
      errors.sprintId = 'Sprint ID is required';
    }

    if (!data.originalScope || data.originalScope.trim().length === 0) {
      errors.originalScope = 'Original scope description is required';
    }

    if (!data.currentIssues || !Array.isArray(data.currentIssues) || data.currentIssues.length === 0) {
      errors.currentIssues = 'Current issues list is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Validate risk assessment data
  validateRiskAssessmentData: (data) => {
    const errors = {};

    if (!data.projectContext || data.projectContext.trim().length === 0) {
      errors.projectContext = 'Project context is required';
    }

    if (!data.currentSprint || !data.currentSprint.sprintId) {
      errors.currentSprint = 'Current sprint information is required';
    }

    if (!data.teamMetrics) {
      errors.teamMetrics = 'Team metrics are required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Validate retrospective data
  validateRetrospectiveData: (data) => {
    const errors = {};

    if (!data.sprintId) {
      errors.sprintId = 'Sprint ID is required';
    }

    if (!data.sprintMetrics) {
      errors.sprintMetrics = 'Sprint metrics are required';
    }

    if (!data.teamFeedback || !Array.isArray(data.teamFeedback)) {
      errors.teamFeedback = 'Team feedback is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Format AI response for display
  formatAIResponse: (response, type) => {
    const baseFormat = {
      ...response,
      timestamp: new Date(response.timestamp).toLocaleString(),
      type
    };

    switch (type) {
      case 'sprint-planning':
        return {
          ...baseFormat,
          recommendations: response.recommendations || [],
          estimatedVelocity: response.estimatedVelocity || 0,
          riskFactors: response.riskFactors || []
        };

      case 'scope-creep':
        return {
          ...baseFormat,
          creepDetected: response.creepDetected || false,
          creepPercentage: response.creepPercentage || 0,
          affectedAreas: response.affectedAreas || [],
          recommendations: response.recommendations || []
        };

      case 'risk-assessment':
        return {
          ...baseFormat,
          riskLevel: response.riskLevel || 'Low',
          riskScore: response.riskScore || 0,
          identifiedRisks: response.identifiedRisks || [],
          mitigationStrategies: response.mitigationStrategies || []
        };

      case 'retrospective':
        return {
          ...baseFormat,
          whatWentWell: response.whatWentWell || [],
          whatCouldImprove: response.whatCouldImprove || [],
          actionItems: response.actionItems || [],
          teamMorale: response.teamMorale || 'Neutral'
        };

      default:
        return baseFormat;
    }
  },

  // Get risk level color
  getRiskLevelColor: (riskLevel) => {
    const colors = {
      'Low': 'text-green-600 bg-green-100',
      'Medium': 'text-yellow-600 bg-yellow-100',
      'High': 'text-orange-600 bg-orange-100',
      'Critical': 'text-red-600 bg-red-100'
    };
    return colors[riskLevel] || 'text-gray-600 bg-gray-100';
  },

  // Get team morale color
  getTeamMoraleColor: (morale) => {
    const colors = {
      'Very High': 'text-green-600 bg-green-100',
      'High': 'text-green-600 bg-green-100',
      'Neutral': 'text-yellow-600 bg-yellow-100',
      'Low': 'text-orange-600 bg-orange-100',
      'Very Low': 'text-red-600 bg-red-100'
    };
    return colors[morale] || 'text-gray-600 bg-gray-100';
  },

  // Generate AI request summary
  generateRequestSummary: (type, data) => {
    switch (type) {
      case 'sprint-planning':
        return `Sprint planning for ${data.sprintDuration}-week sprint with ${data.teamCapacity} story points capacity`;
      
      case 'scope-creep':
        return `Scope creep analysis for sprint with ${data.currentIssues?.length || 0} issues`;
      
      case 'risk-assessment':
        return `Risk assessment for project with current sprint analysis`;
      
      case 'retrospective':
        return `Sprint retrospective analysis with team feedback`;
      
      default:
        return 'AI analysis request';
    }
  },

  // Check if AI feature is available
  isFeatureAvailable: (quota, featureType) => {
    const formattedQuota = aiUtils.formatQuotaData(quota);
    
    if (formattedQuota.isExceeded) {
      return {
        available: false,
        reason: 'Monthly quota exceeded',
        resetDate: formattedQuota.resetDate
      };
    }

    return {
      available: true,
      remaining: formattedQuota.remaining
    };
  },

  // Format AI insights for dashboard
  formatDashboardInsights: (insights) => {
    return {
      ...insights,
      generatedAt: new Date(insights.generatedAt).toLocaleString(),
      projectInsights: insights.projectInsights?.map(insight => ({
        ...insight,
        lastUpdated: new Date(insight.lastUpdated).toLocaleDateString()
      })) || [],
      recommendations: insights.recommendations || [],
      trends: insights.trends || {}
    };
  }
};
