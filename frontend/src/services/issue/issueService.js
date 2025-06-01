import api from '../../api/config/axiosConfig';
import { API_ENDPOINTS } from '../../api/endpoints/index';

export const issueService = {
  // Get issues for a board
  getByBoard: async (boardId, params = {}) => {
    const response = await api.get(API_ENDPOINTS.ISSUES.LIST(boardId), { params });
    return response.data;
  },

  // Get backlog issues for a project
  getBacklog: async (projectId, params = {}) => {
    const response = await api.get(API_ENDPOINTS.ISSUES.BACKLOG(projectId), { params });
    return response.data;
  },

  // Get issues for a sprint
  getBySprint: async (sprintId, params = {}) => {
    const response = await api.get(API_ENDPOINTS.ISSUES.BY_SPRINT(sprintId), { params });
    return response.data;
  },

  // Get issue by ID
  getById: async (id) => {
    const response = await api.get(API_ENDPOINTS.ISSUES.DETAIL(id));
    return response.data;
  },

  // Create new issue
  create: async (boardId, data) => {
    const response = await api.post(API_ENDPOINTS.ISSUES.CREATE(boardId), data);
    return response.data;
  },

  // Update issue
  update: async (id, data) => {
    const response = await api.put(API_ENDPOINTS.ISSUES.UPDATE(id), data);
    return response.data;
  },

  // Update issue status
  updateStatus: async (issueId, status, blockedReason = null) => {
    const data = { status };
    if (status === 'Blocked' && blockedReason) {
      data.blockedReason = blockedReason;
    }
    const response = await api.patch(`/issues/${issueId}/status`, data);
    return response.data;
  },

  // Delete issue
  delete: async (id) => {
    const response = await api.delete(API_ENDPOINTS.ISSUES.DELETE(id));
    return response.data;
  },

  // Comment operations
  comments: {
    getAll: async (issueId) => {
      const response = await api.get(API_ENDPOINTS.ISSUES.COMMENTS.LIST(issueId));
      return response.data;
    },
    create: async (issueId, data) => {
      const response = await api.post(API_ENDPOINTS.ISSUES.COMMENTS.CREATE(issueId), data);
      return response.data;
    },
    update: async (id, data) => {
      const response = await api.put(API_ENDPOINTS.ISSUES.COMMENTS.UPDATE(id), data);
      return response.data;
    },
    delete: async (id) => {
      const response = await api.delete(API_ENDPOINTS.ISSUES.COMMENTS.DELETE(id));
      return response.data;
    }
  },

  // Time log operations
  timeLogs: {
    getAll: async (issueId) => {
      const response = await api.get(API_ENDPOINTS.ISSUES.TIME_LOGS.LIST(issueId));
      return response.data;
    },
    create: async (issueId, data) => {
      const response = await api.post(API_ENDPOINTS.ISSUES.TIME_LOGS.CREATE(issueId), data);
      return response.data;
    },
    update: async (id, data) => {
      const response = await api.put(API_ENDPOINTS.ISSUES.TIME_LOGS.UPDATE(id), data);
      return response.data;
    },
    delete: async (id) => {
      const response = await api.delete(API_ENDPOINTS.ISSUES.TIME_LOGS.DELETE(id));
      return response.data;
    }
  }
};
