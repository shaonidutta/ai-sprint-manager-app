export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/profile'
  },
  USERS: {
    PROFILE: '/auth/me',
    UPDATE_PROFILE: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    DETAIL: (id) => `/projects/${id}`,
    UPDATE: (id) => `/projects/${id}`,
    DELETE: (id) => `/projects/${id}`,
    STATS: (id) => `/projects/${id}/stats`,
    MEMBERS: {
      LIST: (id) => `/projects/${id}/team`,
      ADD: (id) => `/projects/${id}/team`,
      UPDATE: (id, userId) => `/projects/${id}/team/${userId}`,
      REMOVE: (id, userId) => `/projects/${id}/team/${userId}`
    },
    SKILLS: {
      LIST: (id) => `/projects/${id}/skills`,
      STATS: (id) => `/projects/${id}/skills/stats`,
      USER_SKILLS: (id, userId) => `/projects/${id}/users/${userId}/skills`,
      ADD: (id) => `/projects/${id}/skills`,
      UPDATE: (skillId) => `/skills/${skillId}`,
      DELETE: (skillId) => `/skills/${skillId}`
    }
  },
  BOARDS: {
    LIST: (projectId) => `/projects/${projectId}/boards`,
    DETAIL: (id) => `/boards/${id}`,
    UPDATE: (id) => `/boards/${id}`,
    DELETE: (id) => `/boards/${id}`
  },
  SPRINTS: {
    LIST: (boardId) => `/boards/${boardId}/sprints`,
    CREATE: (boardId) => `/boards/${boardId}/sprints`,
    DETAIL: (id) => `/sprints/${id}`,
    UPDATE: (id) => `/sprints/${id}`,
    DELETE: (id) => `/sprints/${id}`,
    START: (id) => `/sprints/${id}/start`,
    COMPLETE: (id) => `/sprints/${id}/complete`,
    BURNDOWN: (id) => `/sprints/${id}/burndown`,
    STATUS: (id) => `/sprints/${id}/status`, // Added for scope creep status
    ADD_ISSUES: (id) => `/sprints/${id}/issues`,
    REMOVE_ISSUE: (id, issueId) => `/sprints/${id}/issues/${issueId}`
  },
  ISSUES: {
    LIST: (boardId) => `/boards/${boardId}/issues`,
    BACKLOG: (projectId) => `/projects/${projectId}/issues/backlog`,
    BY_SPRINT: (sprintId) => `/sprints/${sprintId}/issues`,
    DETAIL: (id) => `/issues/${id}`,
    CREATE: (boardId) => `/boards/${boardId}/issues`,
    UPDATE: (id) => `/issues/${id}`,
    DELETE: (id) => `/issues/${id}`,
    COMMENTS: {
      LIST: (issueId) => `/issues/${issueId}/comments`,
      CREATE: (issueId) => `/issues/${issueId}/comments`,
      UPDATE: (id) => `/comments/${id}`,
      DELETE: (id) => `/comments/${id}`
    },
    TIME_LOGS: {
      LIST: (issueId) => `/issues/${issueId}/time-logs`,
      CREATE: (issueId) => `/issues/${issueId}/time-logs`,
      UPDATE: (id) => `/time-logs/${id}`,
      DELETE: (id) => `/time-logs/${id}`
    }
  },
  AI: {
    SPRINT_PLANNING: (projectId) => `/ai/projects/${projectId}/sprint-plan`,
    SCOPE_CREEP: (projectId) => `/ai/projects/${projectId}/scope-creep`,
    RISK_ASSESSMENT: (projectId) => `/ai/projects/${projectId}/risk-assessment`,
    RETROSPECTIVE: (projectId) => `/ai/projects/${projectId}/retrospective`,
    QUOTA: (projectId) => `/ai/projects/${projectId}/quota`,
    GENERATE_SPRINT_PLAN: (projectId) => `/ai/projects/${projectId}/generate-sprint-plan`,
    CREATE_SPRINT_FROM_PLAN: (projectId) => `/ai/projects/${projectId}/create-sprint`
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ACTIVITY: '/dashboard/activity',
    AI_INSIGHTS: '/dashboard/ai-insights'
  }
};