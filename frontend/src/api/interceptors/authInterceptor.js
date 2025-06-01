import axios from 'axios';
import { API_ENDPOINTS } from '../endpoints/index';

export const setupAuthInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          const response = await axios.post(
            API_ENDPOINTS.AUTH.REFRESH_TOKEN,
            { refreshToken }
          );
          const { token } = response.data;

          localStorage.setItem('token', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;

          return axiosInstance(originalRequest);
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );
}; 