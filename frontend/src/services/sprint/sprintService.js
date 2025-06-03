import api from '../../api/config/axiosConfig';
import { API_ENDPOINTS } from '../../api/endpoints/index';
import { boardService } from '../board/boardService';

export const sprintService = {
  // Get sprints for a board
  getByBoard: async (boardId, params = {}) => {
    const response = await api.get(API_ENDPOINTS.SPRINTS.LIST(boardId), { params });
    return response.data;
  },

  // Create new sprint
  create: async (boardId, data) => {
    const response = await api.post(API_ENDPOINTS.SPRINTS.CREATE(boardId), data);
    return response.data;
  },

  // Get sprint by ID
  getById: async (sprintId) => {
    const response = await api.get(`/sprints/${sprintId}`);
    return response.data;
  },

  // Update sprint
  update: async (sprintId, data) => {
    const response = await api.put(`/sprints/${sprintId}`, data);
    return response.data;
  },

  // Delete sprint
  delete: async (sprintId) => {
    const response = await api.delete(`/sprints/${sprintId}`);
    return response.data;
  },

  // Start sprint
  start: async (sprintId) => {
    const response = await api.post(API_ENDPOINTS.SPRINTS.START(sprintId));
    return response.data;
  },

  // Complete sprint
  complete: async (sprintId, data) => {
    const response = await api.post(API_ENDPOINTS.SPRINTS.COMPLETE(sprintId), data);
    return response.data;
  },

  // Get sprint burndown data
  getBurndown: async (sprintId) => {
    const response = await api.get(`/sprints/${sprintId}/burndown`);
    return response.data;
  },

  // Get sprint issues
  getIssues: async (sprintId) => {
    const response = await api.get(API_ENDPOINTS.ISSUES.BY_SPRINT(sprintId));
    return response.data;
  },

  // Get all sprints for a project (across all boards)
  getByProject: async (projectId, params = {}) => {
    try {
      // First get boards for the project
      const boardsResponse = await boardService.getBoards(projectId);
      // Ensure we are accessing the array of boards, typically nested in response.data.boards
      const boardsArray = (boardsResponse && boardsResponse.data && Array.isArray(boardsResponse.data.boards)) ? boardsResponse.data.boards : [];

      // Then get sprints for each board
      const allSprints = [];
      for (const board of boardsArray) {
        try {
          const sprintsResponse = await boardService.getBoardSprints(board.id, params);
          // Ensure we are accessing the array of sprints, typically nested in response.data.sprints
          const sprintsArray = (sprintsResponse && sprintsResponse.data && Array.isArray(sprintsResponse.data.sprints)) ? sprintsResponse.data.sprints : [];
          // Add board info to each sprint for context
          sprintsArray.forEach(sprint => {
            sprint.boardName = board.name;
            sprint.boardId = board.id;
          });
          allSprints.push(...sprintsArray);
        } catch (err) {
          console.error(`Error fetching sprints for board ${board.id}:`, err);
        }
      }

      return { data: allSprints };
    } catch (err) {
      console.error('Error fetching sprints for project:', err);
      throw err;
    }
  },

  // Get sprint report
  getReport: async (sprintId) => {
    const response = await api.get(`/sprints/${sprintId}/report`);
    return response.data;
  },

  // Get sprint status (for scope creep)
  getStatus: async (sprintId) => {
    // Ensure API_ENDPOINTS.SPRINTS.STATUS(sprintId) is defined
    // e.g., in endpoints/index.js: STATUS: (sprintId) => `/sprints/${sprintId}/status`,
    const response = await api.get(API_ENDPOINTS.SPRINTS.STATUS(sprintId));
    return response.data;
  },

  // Add issues to sprint
  addIssues: async (sprintId, issueIds) => {
    const response = await api.post(API_ENDPOINTS.SPRINTS.ADD_ISSUES(sprintId), { issueIds });
    return response.data;
  },

  // Remove issue from sprint
  removeIssue: async (sprintId, issueId) => {
    const response = await api.delete(API_ENDPOINTS.SPRINTS.REMOVE_ISSUE(sprintId, issueId));
    return response.data;
  },

  // Get sprints for a project (alias for getByProject with proper response format)
  getProjectSprints: async (projectId, params = {}) => {
    try {
      const response = await sprintService.getByProject(projectId, params);
      return {
        data: {
          sprints: response.data || []
        }
      };
    } catch (error) {
      console.error('Error fetching project sprints:', error);
      throw error;
    }
  }
};
