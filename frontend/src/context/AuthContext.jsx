import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/config/axiosConfig';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('[AuthContext] Initial load:', { hasToken: !!token });
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      console.log('[AuthContext] Fetching user profile');
      const response = await axiosInstance.get('/auth/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const userData = response.data.data.user;
      console.log('[AuthContext] User profile fetched:', userData);
      setUser(userData);
    } catch (err) {
      console.error('[AuthContext] Error fetching user:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      console.log('[AuthContext] Starting registration');
      const response = await axiosInstance.post('/auth/register', userData);
      const { user } = response.data.data;
      
      // Store credentials for after verification
      localStorage.setItem('tempEmail', userData.email);
      localStorage.setItem('tempPassword', userData.password);
      
      console.log('[AuthContext] Registration successful, proceeding to OTP verification');
      
      // Send OTP automatically after registration
      try {
        await sendOTP(user.email);
        return { success: true, redirectTo: '/verify-otp', email: user.email };
      } catch (otpError) {
        console.error('[AuthContext] Failed to send OTP after registration:', otpError);
        throw otpError;
      }
    } catch (error) {
      console.error('[AuthContext] Registration failed:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('[AuthContext] Attempting login for:', email);
      
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { user, tokens } = response.data.data;
      
      if (user.email_verified) {
        console.log('[AuthContext] Login successful for verified user');
        
        // Store tokens in both localStorage and set in axios defaults
        localStorage.setItem('token', tokens.access_token);
        localStorage.setItem('refreshToken', tokens.refresh_token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${tokens.access_token}`;
        
        setUser(user);
        return { success: true, redirectTo: '/dashboard' };
      } else {
        console.log('[AuthContext] Unverified email, initiating OTP verification');
        localStorage.setItem('tempEmail', email);
        localStorage.setItem('tempPassword', password);
        
        try {
          await sendOTP(email);
          localStorage.setItem('pendingVerificationEmail', email);
          return { success: true, redirectTo: '/verify-otp', email };
        } catch (otpError) {
          console.error('[AuthContext] Failed to send OTP:', otpError);
          setError('Failed to send verification code. Please try again.');
          throw otpError;
        }
      }
    } catch (err) {
      console.error('[AuthContext] Login failed:', err);
      const errorMessage = err.response?.data?.error?.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to invalidate refresh token
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('[AuthContext] Logout API call failed:', error);
    } finally {
      // Clear all tokens and state
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete axiosInstance.defaults.headers.common['Authorization'];
      setUser(null);
      return { success: true, redirectTo: '/login' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      await axiosInstance.post('/auth/forgot-password', { email });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'An error occurred');
      throw err;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setError(null);
      await axiosInstance.post('/auth/reset-password', { token, password });
      return { success: true, redirectTo: '/login' };
    } catch (err) {
      setError(err.response?.data?.error?.message || 'An error occurred');
      throw err;
    }
  };

  // Send OTP for email verification
  const sendOTP = async (email) => {
    try {
      const response = await axiosInstance.post('/auth/send-otp', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Verify OTP
  const verifyOTP = async (email, otp) => {
    try {
      console.log('[AuthContext] Starting OTP verification flow for:', email);
      
      // First verify the OTP
      const response = await axiosInstance.post('/auth/verify-otp', { email, otp });
      console.log('[AuthContext] OTP verification successful, user:', response.data.data.user);

      // Get stored credentials
      const tempEmail = localStorage.getItem('tempEmail');
      const tempPassword = localStorage.getItem('tempPassword');

      if (!tempEmail || !tempPassword) {
        console.error('[AuthContext] Missing temporary credentials for auto-login');
        throw new Error('Missing login credentials');
      }

      // Add a small delay to ensure backend state is updated
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('[AuthContext] Attempting automatic login after OTP verification');
      const loginResponse = await axiosInstance.post('/auth/login', { 
        email: tempEmail,
        password: tempPassword
      });
      
      const { tokens, user: loggedInUser } = loginResponse.data.data;
      console.log('[AuthContext] Auto-login successful, received tokens');

      // Store tokens in localStorage and set axios defaults
      localStorage.setItem('token', tokens.access_token);
      localStorage.setItem('refreshToken', tokens.refresh_token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${tokens.access_token}`;
      
      // Set user state
      setUser(loggedInUser);
      
      // Clean up temporary storage
      localStorage.removeItem('tempEmail');
      localStorage.removeItem('tempPassword');
      localStorage.removeItem('pendingVerificationEmail');

      console.log('[AuthContext] Authentication completed successfully');
      return { success: true, redirectTo: '/dashboard' };
    } catch (error) {
      console.error('[AuthContext] Error during OTP verification/auto-login:', error);
      throw error;
    }
  };

  // Get OTP status (for cooldown)
  const getOTPStatus = async (email) => {
    try {
      const response = await axiosInstance.get('/auth/otp-status', { params: { email } });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    sendOTP,
    verifyOTP,
    getOTPStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
