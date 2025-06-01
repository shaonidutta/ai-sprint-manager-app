import axiosInstance from './config/axiosConfig';
import { setupAuthInterceptor } from './interceptors/authInterceptor';
import { setupErrorInterceptor } from './interceptors/errorInterceptor';
import { API_ENDPOINTS } from './endpoints/index';

// Setup interceptors
setupAuthInterceptor(axiosInstance);
setupErrorInterceptor(axiosInstance);

// API service methods
export const api = {
  auth: {
    login: (data) => axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, data),
    register: (data) => axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, data),
    logout: (refreshToken) => axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken }),
    verifyEmail: (token) => axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token }),
    forgotPassword: (email) => axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
    resetPassword: (token, password) => axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),
    getProfile: () => axiosInstance.get(API_ENDPOINTS.AUTH.ME),
  },

  users: {
    updateProfile: (data) => axiosInstance.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, data),
    changePassword: (data) => axiosInstance.put(API_ENDPOINTS.USERS.CHANGE_PASSWORD, data),
  },

  projects: {
    getAll: (params) => axiosInstance.get(API_ENDPOINTS.PROJECTS.LIST, { params }),
    getById: (id) => axiosInstance.get(API_ENDPOINTS.PROJECTS.DETAIL(id)),
    create: (data) => axiosInstance.post(API_ENDPOINTS.PROJECTS.CREATE, data),
    update: (id, data) => axiosInstance.put(API_ENDPOINTS.PROJECTS.UPDATE(id), data),
    delete: (id) => axiosInstance.delete(API_ENDPOINTS.PROJECTS.DELETE(id)),

    // Team member management methods
    getTeamMembers: (projectId) => axiosInstance.get(API_ENDPOINTS.PROJECTS.MEMBERS.LIST(projectId)),
    addTeamMember: (projectId, data) => axiosInstance.post(API_ENDPOINTS.PROJECTS.MEMBERS.ADD(projectId), data),
    updateTeamMember: (projectId, userId, data) => axiosInstance.put(API_ENDPOINTS.PROJECTS.MEMBERS.UPDATE(projectId, userId), data),
    removeTeamMember: (projectId, userId) => axiosInstance.delete(API_ENDPOINTS.PROJECTS.MEMBERS.REMOVE(projectId, userId)),

    // Legacy methods for backward compatibility
    members: {
      getAll: (projectId) => axiosInstance.get(API_ENDPOINTS.PROJECTS.MEMBERS.LIST(projectId)),
      add: (projectId, data) => axiosInstance.post(API_ENDPOINTS.PROJECTS.MEMBERS.ADD(projectId), data),
      update: (projectId, userId, data) => axiosInstance.put(API_ENDPOINTS.PROJECTS.MEMBERS.UPDATE(projectId, userId), data),
      remove: (projectId, userId) => axiosInstance.delete(API_ENDPOINTS.PROJECTS.MEMBERS.REMOVE(projectId, userId)),
    },
  },

  boards: {
    getAll: (projectId) => axiosInstance.get(API_ENDPOINTS.BOARDS.LIST(projectId)),
    getById: (id) => axiosInstance.get(API_ENDPOINTS.BOARDS.DETAIL(id)),
    create: (projectId, data) => axiosInstance.post(API_ENDPOINTS.BOARDS.CREATE(projectId), data),
    update: (id, data) => axiosInstance.put(API_ENDPOINTS.BOARDS.UPDATE(id), data),
    delete: (id) => axiosInstance.delete(API_ENDPOINTS.BOARDS.DELETE(id)),
  },

  sprints: {
    getAll: (boardId) => axiosInstance.get(API_ENDPOINTS.SPRINTS.LIST(boardId)),
    create: (boardId, data) => axiosInstance.post(API_ENDPOINTS.SPRINTS.CREATE(boardId), data),
    start: (id) => axiosInstance.put(API_ENDPOINTS.SPRINTS.START(id)),
    complete: (id, data) => axiosInstance.put(API_ENDPOINTS.SPRINTS.COMPLETE(id), data),
    addIssues: (id, data) => axiosInstance.post(API_ENDPOINTS.SPRINTS.ADD_ISSUES(id), data),
    removeIssue: (sprintId, issueId) => axiosInstance.delete(API_ENDPOINTS.SPRINTS.REMOVE_ISSUE(sprintId, issueId)),
  },

  issues: {
    getAll: (boardId) => axiosInstance.get(API_ENDPOINTS.ISSUES.LIST(boardId)),
    getBacklog: (projectId) => axiosInstance.get(API_ENDPOINTS.ISSUES.BACKLOG(projectId)),
    getBySprint: (sprintId) => axiosInstance.get(API_ENDPOINTS.ISSUES.BY_SPRINT(sprintId)),
    getById: (id) => axiosInstance.get(API_ENDPOINTS.ISSUES.DETAIL(id)),
    create: (boardId, data) => axiosInstance.post(API_ENDPOINTS.ISSUES.CREATE(boardId), data),
    update: (id, data) => axiosInstance.put(API_ENDPOINTS.ISSUES.UPDATE(id), data),
    delete: (id) => axiosInstance.delete(API_ENDPOINTS.ISSUES.DELETE(id)),

    comments: {
      getAll: (issueId) => axiosInstance.get(API_ENDPOINTS.ISSUES.COMMENTS.LIST(issueId)),
      create: (issueId, data) => axiosInstance.post(API_ENDPOINTS.ISSUES.COMMENTS.CREATE(issueId), data),
      update: (id, data) => axiosInstance.put(API_ENDPOINTS.ISSUES.COMMENTS.UPDATE(id), data),
      delete: (id) => axiosInstance.delete(API_ENDPOINTS.ISSUES.COMMENTS.DELETE(id)),
    },

    timeLogs: {
      getAll: (issueId) => axiosInstance.get(API_ENDPOINTS.ISSUES.TIME_LOGS.LIST(issueId)),
      create: (issueId, data) => axiosInstance.post(API_ENDPOINTS.ISSUES.TIME_LOGS.CREATE(issueId), data),
      update: (id, data) => axiosInstance.put(API_ENDPOINTS.ISSUES.TIME_LOGS.UPDATE(id), data),
      delete: (id) => axiosInstance.delete(API_ENDPOINTS.ISSUES.TIME_LOGS.DELETE(id)),
    },
  },

  ai: {
    sprintPlanning: (projectId, data) => axiosInstance.post(API_ENDPOINTS.AI.SPRINT_PLANNING(projectId), data),
    scopeCreep: (projectId, data) => axiosInstance.post(API_ENDPOINTS.AI.SCOPE_CREEP(projectId), data),
    riskAssessment: (projectId, data) => axiosInstance.post(API_ENDPOINTS.AI.RISK_ASSESSMENT(projectId), data),
    retrospective: (projectId, data) => axiosInstance.post(API_ENDPOINTS.AI.RETROSPECTIVE(projectId), data),
    getQuota: (projectId) => axiosInstance.get(API_ENDPOINTS.AI.QUOTA(projectId)),
  },

  dashboard: {
    getStats: () => axiosInstance.get(API_ENDPOINTS.DASHBOARD.STATS),
    getActivity: (params) => axiosInstance.get(API_ENDPOINTS.DASHBOARD.ACTIVITY, { params }),
    getAIInsights: () => axiosInstance.get(API_ENDPOINTS.DASHBOARD.AI_INSIGHTS),
  },
};

export default api; 