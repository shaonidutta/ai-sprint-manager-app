const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const skillsController = require('../controllers/skillsController');
const authMiddleware = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// Validation schemas
const projectIdSchema = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer')
];

const userIdSchema = [
  param('user_id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
];

const skillIdSchema = [
  param('skill_id')
    .isInt({ min: 1 })
    .withMessage('Skill ID must be a positive integer')
];

const addSkillSchema = [
  body('user_id')
    .isInt({ min: 1 })
    .withMessage('User ID is required and must be positive'),
  body('skill_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Skill name is required and must be 100 characters or less'),
  body('proficiency_level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    .withMessage('Proficiency level must be one of: Beginner, Intermediate, Advanced, Expert'),
  body('years_experience')
    .optional()
    .isFloat({ min: 0, max: 99.9 })
    .withMessage('Years of experience must be between 0 and 99.9')
];

const updateSkillSchema = [
  body('proficiency_level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
    .withMessage('Proficiency level must be one of: Beginner, Intermediate, Advanced, Expert'),
  body('years_experience')
    .optional()
    .isFloat({ min: 0, max: 99.9 })
    .withMessage('Years of experience must be between 0 and 99.9')
];

/**
 * @route   GET /api/v1/projects/:id/skills
 * @desc    Get all skills for a project
 * @access  Private (Project members)
 */
router.get('/projects/:id/skills',
  authMiddleware.authenticate,
  projectIdSchema,
  handleValidationErrors,
  skillsController.getProjectSkills
);

/**
 * @route   GET /api/v1/projects/:id/skills/stats
 * @desc    Get skill statistics for a project
 * @access  Private (Project members)
 */
router.get('/projects/:id/skills/stats',
  authMiddleware.authenticate,
  projectIdSchema,
  handleValidationErrors,
  skillsController.getProjectSkillStats
);

/**
 * @route   GET /api/v1/projects/:id/users/:user_id/skills
 * @desc    Get skills for a specific user in a project
 * @access  Private (Project members)
 */
router.get('/projects/:id/users/:user_id/skills',
  authMiddleware.authenticate,
  [...projectIdSchema, ...userIdSchema],
  handleValidationErrors,
  skillsController.getUserProjectSkills
);

/**
 * @route   POST /api/v1/projects/:id/skills
 * @desc    Add skill to team member
 * @access  Private (Admin/Project Manager only)
 */
router.post('/projects/:id/skills',
  authMiddleware.authenticate,
  [...projectIdSchema, ...addSkillSchema],
  handleValidationErrors,
  skillsController.addTeamMemberSkill
);

/**
 * @route   PUT /api/v1/skills/:skill_id
 * @desc    Update skill proficiency and experience
 * @access  Private (Skill owner or Admin/Project Manager)
 */
router.put('/skills/:skill_id',
  authMiddleware.authenticate,
  [...skillIdSchema, ...updateSkillSchema],
  handleValidationErrors,
  skillsController.updateSkillProficiency
);

/**
 * @route   DELETE /api/v1/skills/:skill_id
 * @desc    Remove skill from team member
 * @access  Private (Skill owner or Admin/Project Manager)
 */
router.delete('/skills/:skill_id',
  authMiddleware.authenticate,
  skillIdSchema,
  handleValidationErrors,
  skillsController.removeTeamMemberSkill
);

module.exports = router;
