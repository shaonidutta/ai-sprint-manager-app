const { validationResult } = require('express-validator');
const { AppError } = require('../utils/errors');

/**
 * Middleware to handle validation errors from express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Extract error messages
    const errorMessages = errors.array().map(error => {
      // Handle different error formats
      if (error.type === 'field') {
        return `${error.path}: ${error.msg}`;
      }
      return error.msg;
    });

    // Create a detailed error message
    const message = `Validation failed: ${errorMessages.join(', ')}`;
    
    // Return validation error
    return next(new AppError(message, 400));
  }
  
  next();
};

/**
 * Middleware to validate request body exists
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRequestBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new AppError('Request body is required', 400));
  }
  next();
};

/**
 * Middleware to validate required fields exist in request body
 * @param {Array} requiredFields - Array of required field names
 * @returns {Function} Express middleware function
 */
const validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
    }
    
    next();
  };
};

/**
 * Middleware to validate numeric parameters
 * @param {Array} numericParams - Array of parameter names that should be numeric
 * @returns {Function} Express middleware function
 */
const validateNumericParams = (numericParams) => {
  return (req, res, next) => {
    const invalidParams = [];
    
    numericParams.forEach(param => {
      const value = req.params[param];
      if (value && (isNaN(value) || parseInt(value) <= 0)) {
        invalidParams.push(param);
      }
    });
    
    if (invalidParams.length > 0) {
      return next(new AppError(`Invalid numeric parameters: ${invalidParams.join(', ')}`, 400));
    }
    
    next();
  };
};

/**
 * Middleware to sanitize string inputs
 * @param {Array} stringFields - Array of field names to sanitize
 * @returns {Function} Express middleware function
 */
const sanitizeStringInputs = (stringFields) => {
  return (req, res, next) => {
    stringFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        // Trim whitespace and remove potentially harmful characters
        req.body[field] = req.body[field].trim();
        
        // Remove HTML tags (basic sanitization)
        req.body[field] = req.body[field].replace(/<[^>]*>/g, '');
      }
    });
    
    next();
  };
};

/**
 * Middleware to validate email format
 * @param {String} emailField - Name of the email field to validate
 * @returns {Function} Express middleware function
 */
const validateEmail = (emailField = 'email') => {
  return (req, res, next) => {
    const email = req.body[emailField];
    
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return next(new AppError(`Invalid email format for ${emailField}`, 400));
      }
    }
    
    next();
  };
};

/**
 * Middleware to validate date format
 * @param {Array} dateFields - Array of date field names to validate
 * @returns {Function} Express middleware function
 */
const validateDates = (dateFields) => {
  return (req, res, next) => {
    const invalidDates = [];
    
    dateFields.forEach(field => {
      const dateValue = req.body[field];
      if (dateValue) {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
          invalidDates.push(field);
        }
      }
    });
    
    if (invalidDates.length > 0) {
      return next(new AppError(`Invalid date format for fields: ${invalidDates.join(', ')}`, 400));
    }
    
    next();
  };
};

/**
 * Middleware to validate enum values
 * @param {Object} enumValidations - Object with field names as keys and allowed values as arrays
 * @returns {Function} Express middleware function
 */
const validateEnums = (enumValidations) => {
  return (req, res, next) => {
    const invalidEnums = [];
    
    Object.keys(enumValidations).forEach(field => {
      const value = req.body[field];
      const allowedValues = enumValidations[field];
      
      if (value && !allowedValues.includes(value)) {
        invalidEnums.push(`${field} must be one of: ${allowedValues.join(', ')}`);
      }
    });
    
    if (invalidEnums.length > 0) {
      return next(new AppError(`Invalid enum values: ${invalidEnums.join('; ')}`, 400));
    }
    
    next();
  };
};

module.exports = {
  handleValidationErrors,
  validateRequestBody,
  validateRequiredFields,
  validateNumericParams,
  sanitizeStringInputs,
  validateEmail,
  validateDates,
  validateEnums
};
