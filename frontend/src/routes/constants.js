export const ROUTES = {
  // Auth Routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_OTP: '/verify-otp',

  // Main Routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  TEAMS: '/teams',

  // Project Routes
  PROJECTS: '/projects',
  PROJECT_DETAILS: '/projects/:projectId',
  PROJECT_SETTINGS: '/projects/:projectId/settings',
  PROJECT_TEAM: '/projects/:projectId/team',

  // Board Routes
  BOARDS: '/boards',
  BOARD_DETAILS: '/boards/:boardId',
  BOARD_SETTINGS: '/boards/:boardId/settings',

  // Sprint Routes
  SPRINTS: '/sprints',
  SPRINT_DETAILS: '/sprints/:sprintId',
  SPRINT_PLANNING: '/sprints/:sprintId/planning',
  SPRINT_RETROSPECTIVE: '/sprints/:sprintId/retro',

  // AI Features Routes
  AI_DASHBOARD: (projectId) => `/ai/dashboard/${projectId}`,
  AI_SPRINT_PLANNING: (projectId) => `/ai/sprint-planning/${projectId}`,
  AI_SCOPE_CREEP: (projectId) => `/ai/scope-creep/${projectId}`,
  AI_RISK_ASSESSMENT: (projectId) => `/ai/risk-assessment/${projectId}`,
  AI_RETROSPECTIVE: (projectId) => `/ai/retrospective/${projectId}`,
};

// Helper function to replace route parameters
export const replaceRouteParams = (route, params) => {
  let url = route;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });
  return url;
};

// Navigation guards
export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_OTP,
];

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PROFILE,
  ROUTES.SETTINGS,
  ROUTES.TEAMS,
  ROUTES.PROJECTS,
  ROUTES.PROJECT_DETAILS,
  ROUTES.PROJECT_SETTINGS,
  ROUTES.PROJECT_TEAM,
  ROUTES.BOARDS,
  ROUTES.BOARD_DETAILS,
  ROUTES.BOARD_SETTINGS,
  ROUTES.SPRINTS,
  ROUTES.SPRINT_DETAILS,
  ROUTES.SPRINT_PLANNING,
  ROUTES.SPRINT_RETROSPECTIVE,
  ROUTES.AI_DASHBOARD,
  ROUTES.AI_SPRINT_PLANNING,
  ROUTES.AI_SCOPE_CREEP,
  ROUTES.AI_RISK_ASSESSMENT,
  ROUTES.AI_RETROSPECTIVE,
]; 