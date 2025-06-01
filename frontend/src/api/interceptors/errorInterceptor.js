export const setupErrorInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Log errors in development
      if (import.meta.env.DEV) {
        console.error('API Error:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url,
          method: error.config?.method,
        });
      }

      // Handle specific error cases
      switch (error.response?.status) {
        case 400:
          error.message = error.response.data.message || 'Invalid request';
          break;
        case 403:
          error.message = 'You do not have permission to perform this action';
          break;
        case 404:
          error.message = 'The requested resource was not found';
          break;
        case 422:
          error.message = 'Validation error';
          error.validationErrors = error.response.data.errors;
          break;
        case 429:
          error.message = 'Too many requests. Please try again later';
          break;
        case 500:
          error.message = 'Internal server error. Please try again later';
          break;
        default:
          error.message = error.response?.data?.message || 'An unexpected error occurred';
      }

      return Promise.reject({
        ...error,
        isAxiosError: true,
        status: error.response?.status,
      });
    }
  );
}; 