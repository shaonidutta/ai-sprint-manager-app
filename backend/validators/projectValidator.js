const Joi = require('joi');

// Project creation validation schema
const createProjectSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.min': 'Project name must be at least 1 character long',
      'string.max': 'Project name must not exceed 255 characters',
      'string.empty': 'Project name is required',
      'any.required': 'Project name is required'
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Project description must not exceed 1000 characters'
    })
});

// Project update validation schema
const updateProjectSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.min': 'Project name must be at least 1 character long',
      'string.max': 'Project name must not exceed 255 characters'
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('', null)
    .messages({
      'string.max': 'Project description must not exceed 1000 characters'
    })
});

// Team member invitation validation schema
const inviteTeamMemberSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .max(255)
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'string.max': 'Email must not exceed 255 characters',
      'any.required': 'Email is required'
    }),

  role: Joi.string()
    .valid('Admin', 'Project Manager', 'Developer')
    .default('Developer')
    .messages({
      'any.only': 'Role must be one of: Admin, Project Manager, Developer'
    })
});

// Team member role update validation schema
const updateTeamMemberRoleSchema = Joi.object({
  role: Joi.string()
    .valid('Admin', 'Project Manager', 'Developer')
    .required()
    .messages({
      'any.only': 'Role must be one of: Admin, Project Manager, Developer',
      'string.empty': 'Role is required',
      'any.required': 'Role is required'
    })
});

// Project search and filtering validation schema
const projectSearchSchema = Joi.object({
  search: Joi.string()
    .trim()
    .max(255)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Search term must not exceed 255 characters'
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100'
    }),

  sort_by: Joi.string()
    .valid('name', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: name, created_at, updated_at'
    }),

  sort_order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Project ID parameter validation
const projectIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Project ID must be a number',
      'number.integer': 'Project ID must be an integer',
      'number.positive': 'Project ID must be positive',
      'any.required': 'Project ID is required'
    })
});

// Project key parameter validation
const projectKeySchema = Joi.object({
  project_key: Joi.string()
    .trim()
    .min(1)
    .max(10)
    .pattern(/^[A-Z0-9]+$/)
    .required()
    .messages({
      'string.min': 'Project key must be at least 1 character long',
      'string.max': 'Project key must not exceed 10 characters',
      'string.pattern.base': 'Project key must contain only uppercase letters and numbers',
      'string.empty': 'Project key is required',
      'any.required': 'Project key is required'
    })
});

// User ID parameter validation for team operations
const userIdSchema = Joi.object({
  user_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be positive',
      'any.required': 'User ID is required'
    })
});

// Combined project ID and user ID parameter validation
const projectUserIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Project ID must be a number',
      'number.integer': 'Project ID must be an integer',
      'number.positive': 'Project ID must be positive',
      'any.required': 'Project ID is required'
    }),
  user_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be positive',
      'any.required': 'User ID is required'
    })
});

// Validation middleware factory
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all validation errors
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Validation middleware for URL parameters
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Parameter validation failed',
        errors
      });
    }

    // Replace req.params with validated data
    req.params = value;
    next();
  };
};

// Validation middleware for query parameters
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Query parameter validation failed',
        errors
      });
    }

    // Replace req.query with validated data
    req.query = value;
    next();
  };
};

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  inviteTeamMemberSchema,
  updateTeamMemberRoleSchema,
  projectSearchSchema,
  projectIdSchema,
  projectKeySchema,
  userIdSchema,
  projectUserIdSchema,
  validateRequest,
  validateParams,
  validateQuery
};
