const express = require('express');
const router = express.Router();

// Import controllers
const projectController = require('../controllers/projectController');
const teamController = require('../controllers/teamController');
const BoardController = require('../controllers/boardController');

// Import validators
const { 
  validateRequest, 
  validateParams, 
  validateQuery 
} = require('../validators/projectValidator');
const {
  createProjectSchema,
  updateProjectSchema,
  projectSearchSchema,
  projectIdSchema,
  inviteTeamMemberSchema,
  updateTeamMemberRoleSchema,
  userIdSchema,
  projectUserIdSchema
} = require('../validators/projectValidator');

// Import middleware
const authMiddleware = require('../middleware/auth');

/**
 * @route   POST /api/v1/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/',
  authMiddleware.authenticate,
  validateRequest(createProjectSchema),
  projectController.createProject
);

/**
 * @route   GET /api/v1/projects
 * @desc    Get projects for current user
 * @access  Private
 */
router.get('/',
  authMiddleware.authenticate,
  validateQuery(projectSearchSchema),
  projectController.getProjects
);

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get('/:id',
  authMiddleware.authenticate,
  validateParams(projectIdSchema),
  projectController.getProjectById
);

/**
 * @route   PUT /api/v1/projects/:id
 * @desc    Update project
 * @access  Private (Admin/Project Manager only)
 */
router.put('/:id',
  authMiddleware.authenticate,
  validateParams(projectIdSchema),
  validateRequest(updateProjectSchema),
  projectController.updateProject
);

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Delete project (soft delete)
 * @access  Private (Owner only)
 */
router.delete('/:id',
  authMiddleware.authenticate,
  validateParams(projectIdSchema),
  projectController.deleteProject
);

// Team Management Routes

/**
 * @route   GET /api/v1/projects/:id/team
 * @desc    Get team members for a project
 * @access  Private
 */
router.get('/:id/team',
  authMiddleware.authenticate,
  validateParams(projectIdSchema),
  teamController.getTeamMembers
);

/**
 * @route   POST /api/v1/projects/:id/team
 * @desc    Invite team member to project
 * @access  Private (Admin/Project Manager only)
 */
router.post('/:id/team',
  authMiddleware.authenticate,
  validateParams(projectIdSchema),
  validateRequest(inviteTeamMemberSchema),
  teamController.inviteTeamMember
);

/**
 * @route   DELETE /api/v1/projects/:id/team/:user_id
 * @desc    Remove team member from project
 * @access  Private (Admin/Project Manager only)
 */
router.delete('/:id/team/:user_id',
  authMiddleware.authenticate,
  validateParams(projectUserIdSchema),
  teamController.removeTeamMember
);

/**
 * @route   PUT /api/v1/projects/:id/team/:user_id
 * @desc    Update team member role
 * @access  Private (Admin only)
 */
router.put('/:id/team/:user_id',
  authMiddleware.authenticate,
  validateParams(projectUserIdSchema),
  validateRequest(updateTeamMemberRoleSchema),
  teamController.updateTeamMemberRole
);

// Board Management Routes

/**
 * @route   GET /api/v1/projects/:id/boards
 * @desc    Get boards for a project
 * @access  Private
 */
router.get('/:id/boards',
  authMiddleware.authenticate,
  validateParams(projectIdSchema),
  BoardController.getProjectBoards
);

/**
 * @route   POST /api/v1/projects/:id/boards
 * @desc    Create new board for project
 * @access  Private (Admin/Manager only)
 */
router.post('/:id/boards',
  authMiddleware.authenticate,
  validateParams(projectIdSchema),
  BoardController.createBoard
);

module.exports = router;
