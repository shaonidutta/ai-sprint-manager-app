const UserActivity = require('../models/UserActivity');
const logger = require('../config/logger');

// Activity types
const ACTIVITY_TYPES = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  EMAIL_VERIFIED: 'email_verified',
  PASSWORD_CHANGED: 'password_changed',
  PASSWORD_RESET: 'password_reset',
  AVATAR_UPLOADED: 'avatar_uploaded',
  AVATAR_DELETED: 'avatar_deleted',
  PROFILE_UPDATED: 'profile_updated',

  // Projects
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_DELETED: 'project_deleted',
  PROJECT_VIEWED: 'project_viewed',

  // Team Management
  TEAM_MEMBER_ADDED: 'team_member_added',
  TEAM_MEMBER_REMOVED: 'team_member_removed',
  TEAM_MEMBER_ROLE_CHANGED: 'team_member_role_changed',
  TEAM_MEMBER_INVITED: 'team_member_invited',

  // Boards
  BOARD_CREATED: 'board_created',
  BOARD_UPDATED: 'board_updated',
  BOARD_DELETED: 'board_deleted',
  BOARD_VIEWED: 'board_viewed',

  // Issues
  ISSUE_CREATED: 'issue_created',
  ISSUE_UPDATED: 'issue_updated',
  ISSUE_DELETED: 'issue_deleted',
  ISSUE_STATUS_CHANGED: 'issue_status_changed',
  ISSUE_ASSIGNED: 'issue_assigned',
  ISSUE_VIEWED: 'issue_viewed',

  // Comments
  COMMENT_CREATED: 'comment_created',
  COMMENT_UPDATED: 'comment_updated',
  COMMENT_DELETED: 'comment_deleted',

  // Time Tracking
  TIME_LOGGED: 'time_logged',
  TIME_UPDATED: 'time_updated',
  TIME_DELETED: 'time_deleted',

  // Sprints
  SPRINT_CREATED: 'sprint_created',
  SPRINT_UPDATED: 'sprint_updated',
  SPRINT_DELETED: 'sprint_deleted',
  SPRINT_STARTED: 'sprint_started',
  SPRINT_COMPLETED: 'sprint_completed',
  SPRINT_VIEWED: 'sprint_viewed',

  // AI Features
  AI_REQUEST_MADE: 'ai_request_made',
  AI_SPRINT_PLANNING: 'ai_sprint_planning',
  AI_SCOPE_CREEP_DETECTION: 'ai_scope_creep_detection',
  AI_RISK_ASSESSMENT: 'ai_risk_assessment',
  AI_RETROSPECTIVE_INSIGHTS: 'ai_retrospective_insights'
};

// Resource types
const RESOURCE_TYPES = {
  USER: 'user',
  PROJECT: 'project',
  BOARD: 'board',
  ISSUE: 'issue',
  COMMENT: 'comment',
  TIME_LOG: 'time_log',
  SPRINT: 'sprint',
  AI_REQUEST: 'ai_request'
};

// Helper function to extract IP address
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         'unknown';
};

// Helper function to extract user agent
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'unknown';
};

// Main activity logging function
const logActivity = async (userId, action, options = {}) => {
  try {
    const {
      resourceType = null,
      resourceId = null,
      details = {},
      ipAddress = null,
      userAgent = null,
      req = null
    } = options;

    const activityData = {
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: ipAddress || (req ? getClientIP(req) : null),
      user_agent: userAgent || (req ? getUserAgent(req) : null)
    };

    await UserActivity.create(activityData);
    
    logger.debug('Activity logged:', {
      userId,
      action,
      resourceType,
      resourceId
    });
  } catch (error) {
    logger.error('Failed to log activity:', error);
    // Don't throw error to avoid breaking the main flow
  }
};

// Middleware to automatically log activities
const activityLogger = (action, options = {}) => {
  return async (req, res, next) => {
    // Store original res.json to intercept successful responses
    const originalJson = res.json;
    
    res.json = function(data) {
      // Only log if the response is successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Extract user ID from request
        const userId = req.user?.id;
        
        if (userId) {
          // Extract resource information from request or response
          const resourceId = options.getResourceId ? 
            options.getResourceId(req, data) : 
            (req.params.id || data?.data?.id || null);
          
          const details = options.getDetails ? 
            options.getDetails(req, data) : 
            {};

          // Log the activity asynchronously
          setImmediate(() => {
            logActivity(userId, action, {
              resourceType: options.resourceType,
              resourceId,
              details,
              req
            });
          });
        }
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Specific activity loggers for common actions
const logLogin = (req, userId) => {
  return logActivity(userId, ACTIVITY_TYPES.LOGIN, {
    details: { email: req.body.email },
    req
  });
};

const logLogout = (req, userId) => {
  return logActivity(userId, ACTIVITY_TYPES.LOGOUT, { req });
};

const logRegister = (req, userId) => {
  return logActivity(userId, ACTIVITY_TYPES.REGISTER, {
    details: { 
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name
    },
    req
  });
};

const logProjectCreated = (req, userId, projectId, projectData) => {
  return logActivity(userId, ACTIVITY_TYPES.PROJECT_CREATED, {
    resourceType: RESOURCE_TYPES.PROJECT,
    resourceId: projectId,
    details: {
      name: projectData.name,
      project_key: projectData.project_key
    },
    req
  });
};

const logIssueStatusChanged = (req, userId, issueId, oldStatus, newStatus) => {
  return logActivity(userId, ACTIVITY_TYPES.ISSUE_STATUS_CHANGED, {
    resourceType: RESOURCE_TYPES.ISSUE,
    resourceId: issueId,
    details: {
      old_status: oldStatus,
      new_status: newStatus
    },
    req
  });
};

const logSprintStarted = (req, userId, sprintId, sprintData) => {
  return logActivity(userId, ACTIVITY_TYPES.SPRINT_STARTED, {
    resourceType: RESOURCE_TYPES.SPRINT,
    resourceId: sprintId,
    details: {
      name: sprintData.name,
      start_date: sprintData.start_date,
      end_date: sprintData.end_date
    },
    req
  });
};

const logAIRequest = (req, userId, feature, projectId, requestData) => {
  return logActivity(userId, ACTIVITY_TYPES.AI_REQUEST_MADE, {
    resourceType: RESOURCE_TYPES.AI_REQUEST,
    resourceId: projectId,
    details: {
      feature,
      request_summary: requestData
    },
    req
  });
};

module.exports = {
  ACTIVITY_TYPES,
  RESOURCE_TYPES,
  logActivity,
  activityLogger,
  logLogin,
  logLogout,
  logRegister,
  logProjectCreated,
  logIssueStatusChanged,
  logSprintStarted,
  logAIRequest,
  getClientIP,
  getUserAgent
};
