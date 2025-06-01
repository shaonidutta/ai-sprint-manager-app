import api from '../../api/config/axiosConfig';
import { API_ENDPOINTS } from '../api/endpoints';

export const kanbanService = {
  // Get enhanced kanban view with columns and WIP limits
  getKanbanView: async (boardId, params = {}) => {
    const response = await api.get(`/kanban/board/${boardId}`, { params });
    return response.data;
  },

  // Update issue position (drag and drop)
  updateIssuePosition: async (boardId, data) => {
    const response = await api.put(`/kanban/board/${boardId}/issue-position`, data);
    return response.data;
  },

  // Get board columns configuration
  getBoardColumns: async (boardId) => {
    const response = await api.get(`/kanban/board/${boardId}/columns`);
    return response.data;
  },

  // Update board columns configuration
  updateBoardColumns: async (boardId, columns) => {
    const response = await api.put(`/kanban/board/${boardId}/columns`, { columns });
    return response.data;
  },

  // Get kanban view with swimlanes
  getKanbanViewWithSwimlanes: async (boardId, swimlane, sprintId = null) => {
    const params = { swimlane };
    if (sprintId) params.sprintId = sprintId;
    
    const response = await api.get(`/kanban/board/${boardId}`, { params });
    return response.data;
  }
};
