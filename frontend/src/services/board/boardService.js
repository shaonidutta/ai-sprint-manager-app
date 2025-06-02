import api from '../../api/config/axiosConfig';
import { API_ENDPOINTS } from '../../api/endpoints/index';

export const boardService = {
  // Get all boards for a project
  getBoards: async (projectId) => {
    const response = await api.get(API_ENDPOINTS.BOARDS.LIST(projectId));
    return response.data;
  },

  // Get single board details
  getBoard: async (boardId) => {
    const response = await api.get(API_ENDPOINTS.BOARDS.DETAIL(boardId));
    return response.data;
  },



  // Update board
  updateBoard: async (boardId, data) => {
    const response = await api.put(API_ENDPOINTS.BOARDS.UPDATE(boardId), data);
    return response.data;
  },

  // Delete board
  deleteBoard: async (boardId) => {
    const response = await api.delete(API_ENDPOINTS.BOARDS.DELETE(boardId));
    return response.data;
  },

  // Get board issues
  getBoardIssues: async (boardId, params) => {
    const response = await api.get(API_ENDPOINTS.ISSUES.LIST(boardId), { params });
    return response.data;
  },

  // Get board sprints
  getBoardSprints: async (boardId, params) => {
    const response = await api.get(API_ENDPOINTS.SPRINTS.LIST(boardId), { params });
    return response.data;
  }
}; 