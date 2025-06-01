import api from '../../api/config/axiosConfig';
import { API_ENDPOINTS } from '../api/endpoints';

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
  getById: async (issueId) => {
    const response = await api.get(API_ENDPOINTS.ISSUES.DETAIL(issueId));
    return response.data;
  },

  // Create new issue
  create: async (boardId, data) => {
    const response = await api.post(API_ENDPOINTS.ISSUES.CREATE(boardId), data);
    return response.data;
  },

  // Update issue
  update: async (issueId, data) => {
    const response = await api.put(API_ENDPOINTS.ISSUES.UPDATE(issueId), data);
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
  delete: async (issueId) => {
    const response = await api.delete(API_ENDPOINTS.ISSUES.DELETE(issueId));
    return response.data;
  },

  // Comment operations
  comments: {
    // Get issue comments
    getByIssue: async (issueId, params = {}) => {
      const response = await api.get(API_ENDPOINTS.ISSUES.COMMENTS.LIST(issueId), { params });
      return response.data;
    },

    // Create comment
    create: async (issueId, content) => {
      const response = await api.post(API_ENDPOINTS.ISSUES.COMMENTS.CREATE(issueId), { content });
      return response.data;
    },

    // Update comment
    update: async (commentId, content) => {
      const response = await api.put(API_ENDPOINTS.ISSUES.COMMENTS.UPDATE(commentId), { content });
      return response.data;
    },

    // Delete comment
    delete: async (commentId) => {
      const response = await api.delete(API_ENDPOINTS.ISSUES.COMMENTS.DELETE(commentId));
      return response.data;
    }
  },

  // Time log operations
  timeLogs: {
    // Get issue time logs
    getByIssue: async (issueId, params = {}) => {
      const response = await api.get(API_ENDPOINTS.ISSUES.TIME_LOGS.LIST(issueId), { params });
      return response.data;
    },

    // Log time
    create: async (issueId, data) => {
      const response = await api.post(API_ENDPOINTS.ISSUES.TIME_LOGS.CREATE(issueId), data);
      return response.data;
    },

    // Update time log
    update: async (timeLogId, data) => {
      const response = await api.put(API_ENDPOINTS.ISSUES.TIME_LOGS.UPDATE(timeLogId), data);
      return response.data;
    },

    // Delete time log
    delete: async (timeLogId) => {
      const response = await api.delete(API_ENDPOINTS.ISSUES.TIME_LOGS.DELETE(timeLogId));
      return response.data;
    }
  }
};
