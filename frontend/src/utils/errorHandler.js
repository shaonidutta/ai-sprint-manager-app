// Centralized Error Handling Utility

export class APIError extends Error {
  constructor(message, status, code, details = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class NetworkError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

export const errorHandler = {
  // Handle API response errors
  handleAPIError: (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.message || data?.error || 'An error occurred';
      const code = data?.code || 'UNKNOWN_ERROR';
      const details = data?.details || null;
      
      throw new APIError(message, status, code, details);
    } else if (error.request) {
      // Network error - no response received
      throw new NetworkError('Network error - please check your connection', error);
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  },

  // Handle validation errors
  handleValidationError: (errors) => {
    const message = 'Validation failed';
    throw new ValidationError(message, errors);
  },

  // Format error for display
  formatErrorMessage: (error) => {
    if (error instanceof APIError) {
      switch (error.status) {
        case 400:
          return error.message || 'Invalid request. Please check your input.';
        case 401:
          return 'Authentication required. Please log in again.';
        case 403:
          return 'Access denied. You don\'t have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return error.message || 'Conflict. The resource already exists or is in use.';
        case 422:
          return error.message || 'Invalid data provided.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Server error. Please try again later.';
        case 503:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return error.message || 'An unexpected error occurred.';
      }
    } else if (error instanceof ValidationError) {
      return error.message;
    } else if (error instanceof NetworkError) {
      return 'Connection failed. Please check your internet connection and try again.';
    } else {
      return error.message || 'An unexpected error occurred.';
    }
  },

  // Get error details for debugging
  getErrorDetails: (error) => {
    const details = {
      message: error.message,
      type: error.name || 'Error',
      timestamp: new Date().toISOString()
    };

    if (error instanceof APIError) {
      details.status = error.status;
      details.code = error.code;
      details.apiDetails = error.details;
    } else if (error instanceof ValidationError) {
      details.validationErrors = error.errors;
    } else if (error instanceof NetworkError) {
      details.networkError = true;
      details.originalError = error.originalError?.message;
    }

    return details;
  },

  // Log error for monitoring
  logError: (error, context = {}) => {
    const errorDetails = errorHandler.getErrorDetails(error);
    const logData = {
      ...errorDetails,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Details');
      console.error('Error:', error);
      console.table(logData);
      console.groupEnd();
    }

    // In production, you would send this to your error monitoring service
    // Example: Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Send to error monitoring service
      // errorMonitoringService.captureError(error, logData);
    }

    return logData;
  },

  // Handle specific error types
  handleAuthError: (error) => {
    if (error instanceof APIError && error.status === 401) {
      // Clear auth tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login
      window.location.href = '/login';
      
      return 'Session expired. Please log in again.';
    }
    
    return errorHandler.formatErrorMessage(error);
  },

  handleQuotaError: (error) => {
    if (error instanceof APIError && error.code === 'AI_QUOTA_EXCEEDED') {
      return 'AI quota exceeded for this month. Quota will reset on the 1st of next month.';
    }
    
    return errorHandler.formatErrorMessage(error);
  },

  handleFileUploadError: (error) => {
    if (error instanceof APIError) {
      switch (error.code) {
        case 'FILE_TOO_LARGE':
          return 'File is too large. Maximum size is 5MB.';
        case 'INVALID_FILE_TYPE':
          return 'Invalid file type. Please upload an image file (JPEG, PNG, GIF, or WebP).';
        case 'UPLOAD_FAILED':
          return 'File upload failed. Please try again.';
        default:
          return errorHandler.formatErrorMessage(error);
      }
    }
    
    return errorHandler.formatErrorMessage(error);
  },

  // Retry mechanism for failed requests
  withRetry: async (fn, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (error instanceof APIError && 
            error.status >= 400 && 
            error.status < 500 && 
            error.status !== 429) {
          throw error;
        }
        
        // Don't retry on validation errors
        if (error instanceof ValidationError) {
          throw error;
        }
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff
        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw lastError;
  },

  // Create error boundary handler for React components
  createErrorBoundaryHandler: (componentName) => {
    return (error, errorInfo) => {
      const context = {
        component: componentName,
        componentStack: errorInfo.componentStack
      };
      
      errorHandler.logError(error, context);
      
      // You could also send this to an error reporting service
      return {
        hasError: true,
        error: errorHandler.formatErrorMessage(error),
        details: errorHandler.getErrorDetails(error)
      };
    };
  }
};

// Export utility functions
export const {
  handleAPIError,
  handleValidationError,
  formatErrorMessage,
  getErrorDetails,
  logError,
  handleAuthError,
  handleQuotaError,
  handleFileUploadError,
  withRetry,
  createErrorBoundaryHandler
} = errorHandler;

export default errorHandler;
