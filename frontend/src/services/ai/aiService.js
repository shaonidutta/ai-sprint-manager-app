import axiosInstance from '../../api/config/axiosConfig';
import { API_ENDPOINTS } from '../../api/endpoints';

export const aiService = {
  // Get AI quota for project
  getQuota: async (projectId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.AI.QUOTA(projectId));
    return response.data;
  },

  // Sprint Planning AI
  sprintPlanning: async (projectId, data) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AI.SPRINT_PLANNING(projectId), data);
    return response.data;
  },

  // Scope Creep Detection AI
  scopeCreepDetection: async (projectId, data) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AI.SCOPE_CREEP(projectId), data);
    return response.data;
  },

  // Risk Assessment AI
  riskAssessment: async (projectId, data) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AI.RISK_ASSESSMENT(projectId), data);
    return response.data;
  },

  // Retrospective AI
  retrospective: async (projectId, data) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AI.RETROSPECTIVE(projectId), data);
    return response.data;
  },

  // Get AI insights for dashboard
  getDashboardInsights: async () => {
    const response = await axiosInstance.get('/dashboard/ai-insights');
    return response.data;
  }
};
