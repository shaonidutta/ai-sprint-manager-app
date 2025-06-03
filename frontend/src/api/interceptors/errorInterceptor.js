// Global toast instance - will be set by the app
let globalToast = null;

export const setGlobalToast = (toast) => {
  globalToast = toast;
};

export const setupErrorInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle specific error cases
      let errorMessage;
      let shouldShowToast = true;

      switch (error.response?.status) {
        case 400:
          errorMessage = error.response.data.message || 'Invalid request';
          break;
        case 401:
          // Don't show toast for auth errors as they're handled by redirect
          shouldShowToast = false;
          errorMessage = 'Authentication required';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action';
          break;
        case 404:
          errorMessage = 'The requested resource was not found';
          break;
        case 422:
          // Don't show toast for validation errors as they're handled in forms
          shouldShowToast = false;
          errorMessage = 'Validation error';
          error.validationErrors = error.response.data.errors;
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later';
          break;
        default:
          errorMessage = error.response?.data?.message || 'An unexpected error occurred';
      }

      // Show toast for appropriate errors
      if (shouldShowToast && globalToast && errorMessage) {
        globalToast.error(errorMessage);
      }

      error.message = errorMessage;

      return Promise.reject({
        ...error,
        isAxiosError: true,
        status: error.response?.status,
      });
    }
  );
};