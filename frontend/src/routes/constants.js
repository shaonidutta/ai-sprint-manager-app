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
  AI_FEATURES: (projectId) => `/projects/${projectId}/ai-features`,
  AI_SPRINT_PLANNING: (projectId) => `/projects/${projectId}/ai-features/sprint-planning`,
  AI_RISK_ASSESSMENT: (projectId) => `/projects/${projectId}/ai-features/risk-assessment`,
  AI_INSIGHTS: (projectId) => `/projects/${projectId}/ai-features/insights`,
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
  ROUTES.AI_FEATURES,
  ROUTES.AI_SPRINT_PLANNING,
  ROUTES.AI_RISK_ASSESSMENT,
  ROUTES.AI_INSIGHTS,
]; 