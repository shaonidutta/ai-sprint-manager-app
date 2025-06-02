import api from '../../api/config/axiosConfig';
import { API_ENDPOINTS } from '../../api/endpoints/index';

export const aiService = {
  // Get AI quota for a project
  getQuota: async (projectId) => {
    const response = await api.get(API_ENDPOINTS.AI.QUOTA(projectId));
    return response.data;
  },

  // Get sprint planning insights
  getSprintPlanningInsights: async (projectId, data) => {
    const response = await api.post(API_ENDPOINTS.AI.SPRINT_PLANNING(projectId), data);
    return response.data;
  },

  // Get scope creep analysis
  getScopeCreepAnalysis: async (projectId, data) => {
    const response = await api.post(API_ENDPOINTS.AI.SCOPE_CREEP(projectId), data);
    return response.data;
  },

  // Scope creep detection (alias for getScopeCreepAnalysis)
  scopeCreepDetection: async (projectId, data) => {
    const response = await api.post(API_ENDPOINTS.AI.SCOPE_CREEP(projectId), data);
    return response.data;
  },

  // Get risk assessment
  getRiskAssessment: async (projectId, data) => {
    const response = await api.post(API_ENDPOINTS.AI.RISK_ASSESSMENT(projectId), {
      ...data,
      includeHeatmap: data.includeHeatmap || false
    });
    return response.data;
  },

  // Risk assessment (alias for getRiskAssessment)
  riskAssessment: async (projectId, data) => {
    const response = await api.post(API_ENDPOINTS.AI.RISK_ASSESSMENT(projectId), {
      ...data,
      includeHeatmap: data.includeHeatmap || false
    });
    return response.data;
  },

  // Get retrospective insights
  getRetrospectiveInsights: async (projectId, data) => {
    const response = await api.post(API_ENDPOINTS.AI.RETROSPECTIVE(projectId), data);
    return response.data;
  },

  // Retrospective (alias for getRetrospectiveInsights)
  retrospective: async (projectId, data) => {
    const response = await api.post(API_ENDPOINTS.AI.RETROSPECTIVE(projectId), data);
    return response.data;
  },

  // Generate sprint creation plan
  generateSprintCreationPlan: async (projectId, requestData) => {
    const response = await api.post(API_ENDPOINTS.AI.GENERATE_SPRINT_PLAN(projectId), requestData, {
      timeout: 0 // No timeout for this specific request
    });
    return response.data;
  },

  // Create sprint from AI-generated plan
  createSprintFromPlan: async (projectId, sprintPlanData) => {
    const response = await api.post(API_ENDPOINTS.AI.CREATE_SPRINT_FROM_PLAN(projectId), sprintPlanData);
    return response.data;
  }
};
