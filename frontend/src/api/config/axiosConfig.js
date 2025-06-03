import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

// Add a request interceptor to add the token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development (disabled for drag-drop debugging)
    // if (import.meta.env.DEV) {
    //   console.log('API Request:', {
    //     method: config.method?.toUpperCase(),
    //     url: config.url,
    //     data: config.data,
    //   });
    // }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh and session expiry
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    // Log responses in development (disabled for drag-drop debugging)
    // if (import.meta.env.DEV) {
    //   console.log('API Response:', {
    //     status: response.status,
    //     url: response.config.url,
    //     data: response.data,
    //   });
    // }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If token refresh is in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken
        }, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });

        const accessToken = response.data.data?.access_token || response.data.data?.token;
        if (!accessToken) {
          throw new Error('No access token in refresh response');
        }

        localStorage.setItem('token', accessToken);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Process queued requests
        processQueue(null, accessToken);
        
        // Update the original request authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        delete axiosInstance.defaults.headers.common['Authorization'];
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';

    return Promise.reject({
      ...error,
      message: errorMessage,
      status: error.response?.status,
    });
  }
);

export default axiosInstance; 