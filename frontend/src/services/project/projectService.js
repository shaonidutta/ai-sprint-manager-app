import api from '../../api/config/axiosConfig';
import { API_ENDPOINTS } from '../api/endpoints';

export const projectService = {
  // Get all projects for current user
  getAll: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.PROJECTS.BASE, { params });
    return response.data;
  },

  // Get project by ID
  getById: async (projectId) => {
    const response = await api.get(API_ENDPOINTS.PROJECTS.DETAIL(projectId));
    return response.data;
  },

  // Create new project
  create: async (data) => {
    const response = await api.post(API_ENDPOINTS.PROJECTS.BASE, data);
    return response.data;
  },

  // Update project
  update: async (projectId, data) => {
    const response = await api.put(API_ENDPOINTS.PROJECTS.DETAIL(projectId), data);
    return response.data;
  },

  // Delete project
  delete: async (projectId) => {
    const response = await api.delete(API_ENDPOINTS.PROJECTS.DETAIL(projectId));
    return response.data;
  },

  // Team management
  team: {
    // Get team members
    getMembers: async (projectId) => {
      const response = await api.get(API_ENDPOINTS.PROJECTS.MEMBERS.LIST(projectId));
      return response.data;
    },

    // Add team member
    addMember: async (projectId, data) => {
      const response = await api.post(API_ENDPOINTS.PROJECTS.MEMBERS.ADD(projectId), data);
      return response.data;
    },

    // Update member role
    updateMemberRole: async (projectId, userId, role) => {
      const response = await api.put(API_ENDPOINTS.PROJECTS.MEMBERS.UPDATE(projectId, userId), { role });
      return response.data;
    },

    // Remove team member
    removeMember: async (projectId, userId) => {
      const response = await api.delete(API_ENDPOINTS.PROJECTS.MEMBERS.REMOVE(projectId, userId));
      return response.data;
    }
  },

  // Board management
  boards: {
    // Get project boards
    getBoards: async (projectId) => {
      const response = await api.get(API_ENDPOINTS.BOARDS.LIST(projectId));
      return response.data;
    },

    // Create board
    createBoard: async (projectId, data) => {
      const response = await api.post(API_ENDPOINTS.BOARDS.CREATE(projectId), data);
      return response.data;
    }
  },

  // Project statistics
  getStats: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/stats`);
    return response.data;
  },

  // Project activity
  getActivity: async (projectId, params = {}) => {
    const response = await api.get(`/activities/project/${projectId}`, { params });
    return response.data;
  },

  // Search projects
  search: async (query, params = {}) => {
    const searchParams = { ...params, search: query };
    const response = await api.get(API_ENDPOINTS.PROJECTS.BASE, { params: searchParams });
    return response.data;
  }
};
