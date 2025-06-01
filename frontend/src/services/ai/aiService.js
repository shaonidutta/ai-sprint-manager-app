import axiosInstance from '../../api/config/axiosConfig';
import { API_ENDPOINTS } from '../../api/endpoints';

class AIService {
  validateProjectId(projectId) {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
  }

  async getSprintPlanningInsights(projectId) {
    this.validateProjectId(projectId);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AI.SPRINT_PLANNING(projectId));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getScopeCreepAnalysis(projectId) {
    this.validateProjectId(projectId);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AI.SCOPE_CREEP(projectId));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRiskAssessment(projectId) {
    this.validateProjectId(projectId);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AI.RISK_ASSESSMENT(projectId));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRetrospectiveInsights(projectId) {
    this.validateProjectId(projectId);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AI.RETROSPECTIVE(projectId));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAIQuota(projectId) {
    this.validateProjectId(projectId);
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AI.QUOTA(projectId));
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDashboardInsights() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.DASHBOARD.AI_INSIGHTS);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with an error
      const errorData = error.response.data;
      return new Error(errorData.error?.message || 'Server error occurred');
    } else if (error.request) {
      // Request was made but no response received
      return new Error('No response received from server');
    } else {
      // Error in request setup
      return error;
    }
  }
}

export const aiService = new AIService();
