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
      errors.sprintId = 'Sprint selection is required';
    }

    if (!data.originalScope || data.originalScope.trim().length === 0) {
      errors.originalScope = 'Original scope description is required';
    } else if (data.originalScope.trim().length > 1000) {
      errors.originalScope = 'Original scope description must be less than 1000 characters';
    }

    // Remove strict currentIssues validation - it's fetched automatically from the selected sprint
    // The backend will handle cases where sprints have no issues

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
        console.log('🔍 INVESTIGATION: formatAIResponse called with type:', type);
        console.log('🔍 INVESTIGATION: formatAIResponse raw response:', response);
        console.log('🔍 INVESTIGATION: response.scope_analysis:', response.scope_analysis);
        console.log('🔍 INVESTIGATION: response.data:', response.data);
        console.log('🔍 INVESTIGATION: response.data?.scope_analysis:', response.data?.scope_analysis);

        // Handle multiple nested response structures
        const scopeAnalysis = response.scope_analysis || response.data?.scope_analysis || response;
        console.log('🔍 INVESTIGATION: Extracted scopeAnalysis:', scopeAnalysis);
        console.log('🔍 INVESTIGATION: scopeAnalysis type:', typeof scopeAnalysis);
        console.log('🔍 INVESTIGATION: scopeAnalysis keys:', Object.keys(scopeAnalysis || {}));

        // Extract individual fields with logging
        const creepDetected = scopeAnalysis.scope_creep_detected || false;
        const creepPercentage = scopeAnalysis.scope_creep_score || 0;
        const severity = scopeAnalysis.severity || 'None';
        const recommendations = scopeAnalysis.recommendations || [];
        const riskFactors = scopeAnalysis.risk_factors || [];
        const analysis = scopeAnalysis.analysis || {};
        const sprintInfo = response.sprint_info || response.data?.sprint_info || null;

        console.log('🔍 INVESTIGATION: Field extraction results:');
        console.log('  - creepDetected:', creepDetected);
        console.log('  - creepPercentage:', creepPercentage);
        console.log('  - severity:', severity);
        console.log('  - recommendations:', recommendations);
        console.log('  - riskFactors:', riskFactors);
        console.log('  - analysis:', analysis);
        console.log('  - sprintInfo:', sprintInfo);

        const affectedAreas = analysis ? [
          {
            title: 'Goal Alignment',
            content: analysis.alignment_with_goal
          },
          {
            title: 'Scope Expansion Indicators',
            content: analysis.scope_expansion_indicators
          },
          {
            title: 'Impact Assessment',
            content: analysis.impact_assessment
          }
        ].filter(item => item.content) : [];

        console.log('🔍 INVESTIGATION: affectedAreas:', affectedAreas);

        const formattedResult = {
          ...baseFormat,
          creepDetected,
          creepPercentage,
          severity,
          affectedAreas,
          recommendations,
          riskFactors,
          analysis,
          sprintInfo
        };

        return formattedResult;

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
  getRiskLevelColor: (level) => {
    const colors = {
      Low: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      High: 'bg-red-100 text-red-800'
    };
    return colors[level] || colors.Medium;
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

  // Get scope creep severity color
  getScopeCreepSeverityColor: (severity) => {
    const colors = {
      'None': 'text-green-700 bg-green-100 border-green-200',
      'Low': 'text-green-700 bg-green-100 border-green-200',
      'Medium': 'text-yellow-700 bg-yellow-100 border-yellow-200',
      'High': 'text-orange-700 bg-orange-100 border-orange-200',
      'Critical': 'text-red-700 bg-red-100 border-red-200'
    };
    return colors[severity] || colors.Medium;
  },

  // Get scope creep percentage color
  getScopeCreepPercentageColor: (percentage) => {
    if (percentage >= 80) return 'text-red-600 bg-red-100';
    if (percentage >= 60) return 'text-orange-600 bg-orange-100';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 20) return 'text-blue-600 bg-blue-100';
    return 'text-green-600 bg-green-100';
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
  formatDashboardInsights: (data) => {
    return {
      generatedAt: new Date(data.generatedAt).toLocaleString(),
      projectInsights: data.projectInsights?.map(insight => ({
        ...insight,
        lastUpdated: new Date(insight.lastUpdated).toLocaleString(),
      })) || [],
      recommendations: data.recommendations || [],
      trends: data.trends || {},
    };
  },

  // Format sprint planning data
  formatSprintPlanningData: (data) => {
    const { suggestions } = data;
    return {
      suggestedStoryPoints: suggestions.totalStoryPoints,
      suggestedDuration: 14, // Default 2-week sprint
      recommendedIssues: suggestions.recommendedIssues.map(issue => ({
        id: issue.issueId,
        title: issue.title,
        storyPoints: issue.storyPoints,
        priority: issue.priority,
        reasoning: issue.reasoning
      })),
      risks: suggestions.risks || [],
      alternatives: suggestions.alternatives || []
    };
  },

  // Format scope creep data
  formatScopeCreepData: (data) => {
    return {
      riskLevel: data.scopeIncreased ? 'High' : 'Low',
      riskScore: data.percentageIncrease || 0,
      detectedPatterns: data.addedIssues.map(issue => 
        `Added: ${issue.title} (${issue.storyPoints} points) on ${new Date(issue.addedDate).toLocaleDateString()}`
      ),
      recommendations: data.recommendations || []
    };
  },

  // Format risk assessment data
  formatRiskAssessmentData: (data) => {
    return {
      overallRisk: data.overallRisk,
      confidence: Math.round((1 - data.risks.length / 10) * 100), // Simple confidence calculation
      riskFactors: data.risks.map(risk => `${risk.category}: ${risk.description}`),
      mitigationStrategies: data.risks.map(risk => risk.mitigation)
    };
  },

  // Format retrospective data
  formatRetrospectiveData: (data) => {
    return {
      sprintPerformance: Math.round((data.sprintSummary.completedStoryPoints / data.sprintSummary.plannedStoryPoints) * 100),
      teamCollaboration: 85, // Example static value, should be calculated based on actual metrics
      successes: data.insights
        .filter(insight => insight.category === 'Success')
        .map(insight => insight.insight),
      challenges: data.insights
        .filter(insight => insight.category === 'Challenge')
        .map(insight => insight.insight),
      improvements: data.improvements.map(imp => imp.suggestion)
    };
  },
};
